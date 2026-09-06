import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { gunzipSync } from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFilePath = path.resolve(__dirname, 'data.json');
const extraInfoFilePath = path.resolve(__dirname, 'bggExtraInfo.json');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

const BGG_PAGE_CACHE = new Map();
const BGG_PAGE_CACHE_TTL_MS = 30 * 60 * 1000;
const BGG_PAGE_CACHE_NULL_TTL_MS = 60 * 1000;

async function fetchWithTimeout(url, timeoutMs = 6000, headers = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, headers, redirect: 'follow' });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function parseGeekitemPreload(html) {
  if (!html) return null;
  const marker = 'GEEK.geekitemPreload = ';
  const start = html.indexOf(marker);
  if (start === -1) return null;
  let end = html.indexOf('GEEK.geekitemSettings', start);
  if (end === -1) end = html.length;
  const json = html.slice(start + marker.length, end).replace(/;\s*$/, '');
  try {
    const parsed = JSON.parse(json);
    return parsed?.item ?? null;
  } catch {
    return null;
  }
}

function mapBggPreloadToInfo(item) {
  if (!item) return null;

  const min = Number(item.minplayers);
  const max = Number(item.maxplayers);
  const players =
    Number.isFinite(min) && Number.isFinite(max)
      ? min >= max
        ? String(min)
        : `${min}-${max}`
      : undefined;

  const subtitle =
    (item.alternatenames || []).find((n) => /[\uAC00-\uD7A3]/.test(n?.name || ''))?.name || undefined;

  const maxPlayTime = Number(item.maxplaytime);
  const avgWeight = Number(item.stats?.avgweight);
  return {
    title: item.name || undefined,
    subtitle,
    publishedYear: item.yearpublished ? Number(item.yearpublished) : undefined,
    players,
    playTime: Number.isFinite(maxPlayTime) ? maxPlayTime : undefined,
    weight: Number.isFinite(avgWeight) && avgWeight > 0 ? avgWeight : undefined,
    imageUrl: item.imageurl || undefined,
    bggUrl: item.canonical_link || `https://boardgamegeek.com/boardgame/${item.objectid}`
  };
}

async function fetchBggLivePage(bggId) {
  const html = await fetchWithTimeout(
    `https://boardgamegeek.com/boardgame/${bggId}`,
    4000,
    { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125 Safari/537.36' }
  );
  return parseGeekitemPreload(html);
}

async function fetchBggWaybackPreload(bggId) {
  let cdxText = null;
  for (let attempt = 0; attempt < 2 && !cdxText; attempt++) {
    const cdxUrl =
      `https://web.archive.org/cdx/search/cdx?url=boardgamegeek.com/boardgame/${bggId}*` +
      '&output=json&filter=statuscode:200&collapse=digest&fl=timestamp,original&limit=10';
    cdxText = await fetchWithTimeout(cdxUrl, 10000);
  }
  if (!cdxText) return null;

  let rows;
  try {
    rows = JSON.parse(cdxText);
  } catch {
    return null;
  }
  if (!Array.isArray(rows) || rows.length < 2) return null;

  const candidates = rows
    .slice(1)
    .filter(([, original]) => original && original.includes(`/boardgame/${bggId}`))
    .sort((a, b) => (a[0] < b[0] ? -1 : 1));
  if (candidates.length === 0) return null;

  const [timestamp, original] = candidates[candidates.length - 1];
  let raw = null;
  for (let attempt = 0; attempt < 2 && !raw; attempt++) {
    raw = await fetchWithTimeout(
      `https://web.archive.org/web/${timestamp}id_/${original}`,
      15000
    );
  }
  if (!raw) return null;

  const html = raw.charCodeAt(0) === 0x1f && raw.charCodeAt(1) === 0x8b ? gunzipSync(Buffer.from(raw, 'latin1')).toString('utf-8') : raw;
  return parseGeekitemPreload(html);
}

async function fetchBggPageData(bggId) {
  if (!bggId || !/^\d+$/.test(bggId)) return null;

  const cached = BGG_PAGE_CACHE.get(bggId);
  if (cached) {
    const ttlMs = cached.value === null ? BGG_PAGE_CACHE_NULL_TTL_MS : BGG_PAGE_CACHE_TTL_MS;
    if (Date.now() - cached.at < ttlMs) return cached.value;
    BGG_PAGE_CACHE.delete(bggId);
  }

  let item = await fetchBggLivePage(bggId);
  if (!item) item = await fetchBggWaybackPreload(bggId);

  const value = mapBggPreloadToInfo(item);
  BGG_PAGE_CACHE.set(bggId, { value, at: Date.now() });
  return value;
}

export function findGameInDataFile(bggId) {
  if (!bggId || !/^\d+$/.test(bggId)) return null;
  if (!fs.existsSync(dataFilePath)) return null;

  try {
    const parsed = JSON.parse(fs.readFileSync(dataFilePath, 'utf-8'));
    const games = parsed?.state?.games || [];
    const match = games.find(
      (g) => g.bggUrl && (g.bggUrl.includes(`/boardgame/${bggId}`) || g.bggUrl.endsWith(`/${bggId}`))
    );
    if (!match) return null;

    return {
      title: match.title,
      subtitle: match.subtitle || '',
      publishedYear: match.publishedYear,
      players: match.players,
      playTime: match.playTime,
      weight: match.weight,
      imageUrl: match.imageUrl,
      bggUrl: match.bggUrl
    };
  } catch (error) {
    console.error('[bgg-info] Error reading data.json:', error);
    return null;
  }
}

export function findGameInExtraInfo(bggId) {
  if (!bggId || !/^\d+$/.test(bggId)) return null;
  if (!fs.existsSync(extraInfoFilePath)) return null;

  try {
    const entries = JSON.parse(fs.readFileSync(extraInfoFilePath, 'utf-8'));
    const game = entries[bggId];
    if (!game) return null;

    return {
      title: game.title || '',
      subtitle: game.subtitle || '',
      publishedYear: game.publishedYear,
      players: game.players || '',
      playTime: game.playTime ?? game.duration ?? '',
      weight: game.weight,
      imageUrl: game.imageUrl || '',
      bggUrl: game.bggUrl || `https://boardgamegeek.com/boardgame/${bggId}`
    };
  } catch (error) {
    console.error('[bgg-info] Error reading bggExtraInfo.json:', error);
    return null;
  }
}

async function fetchWikidata(bggId) {
  const query = `
    SELECT ?item ?title ?koLabel ?year ?image WHERE {
      ?item wdt:P2339 "${bggId}".
      OPTIONAL { ?item rdfs:label ?title. FILTER(LANG(?title) = "en"). }
      OPTIONAL { ?item rdfs:label ?koLabel. FILTER(LANG(?koLabel) = "ko"). }
      OPTIONAL { ?item wdt:P577 ?date. BIND(YEAR(?date) AS ?year). }
      OPTIONAL { ?item wdt:P18 ?image. }
    } LIMIT 1`;

  const url = `${WIKIDATA_SPARQL_URL}?query=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'BoardGameLog/1.0 (local auto-fill; no token required)'
      }
    });
    if (!res.ok) return null;

    const json = await res.json();
    const row = json?.results?.bindings?.[0];
    if (!row) return null;

    return {
      title: row.title?.value || undefined,
      subtitle: row.koLabel?.value || undefined,
      publishedYear: row.year?.value ? Number(row.year.value) : undefined,
      imageUrl: row.image?.value ? row.image.value.replace(/^http:\/\//, 'https://') : undefined
    };
  } catch (error) {
    console.error('[bgg-info] Error querying Wikidata:', error);
    return null;
  }
}

export async function lookupBggServerInfo(bggId) {
  const local = findGameInDataFile(bggId);
  if (local) return local;

  const extra = findGameInExtraInfo(bggId);
  if (extra) return extra;

  const page = await fetchBggPageData(bggId);
  if (page) return page;

  const wikidata = await fetchWikidata(bggId);
  if (wikidata) return wikidata;

  return null;
}