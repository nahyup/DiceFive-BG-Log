import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFilePath = path.resolve(__dirname, 'data.json');
const extraInfoFilePath = path.resolve(__dirname, 'bggExtraInfo.json');

const WIKIDATA_SPARQL_URL = 'https://query.wikidata.org/sparql';

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

  const wikidata = await fetchWikidata(bggId);
  if (wikidata) return wikidata;

  return null;
}