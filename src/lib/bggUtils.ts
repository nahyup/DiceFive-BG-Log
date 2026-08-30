import type { Game } from '../store/useBoardGameStore';

/**
 * Pre-configured BGG ID lookup table for board games
 */
const KNOWN_BGG_MAP: Record<string, string> = {
  'ark nova': '342942',
  'terraforming mars': '167791',
  'scythe': '169786',
  'cascadia': '295947',
  'the castles of burgundy': '179353',
  '7 wonders duel': '173346',
  'wingspan': '266192',
  'concordia': '124361',
  'root': '237182',
  'great western trail': '193738',
  'orléans': '164928',
  'orleans': '164928',
  'mage knight board game': '96848',
  'mage knight': '96848',
  'the crew: the quest for planet nine': '284083',
  'the crew': '284083',
  "tzolk'in: the mayan calendar": '126163',
  "tzolkin: the mayan calendar": '126163',
  'clank! legacy: acquisitions incorporated': '266507',
  'azul': '230802',
  'viticulture essential edition': '183394',
  'viticulture': '183394',
  'the quacks of quedlinburg': '244521',
  'quacks of quedlinburg': '244521',
  'catan': '13',
  'ticket to ride': '9209',
  'carcassonne': '822',
  'splendor': '148228',
  'patchwork': '163412',
  'dominion': '36218',
  '7 wonders': '68448',
  'agricola': '31260',
  'race for the galaxy': '24073',
  'puerto rico': '3076',
  'power grid': '2651',
  'el grande big box': '36537',
  'el grande': '93',
  'dune: imperium – uprising': '397598',
  'dune: imperium - uprising': '397598',
  'dune: imperium': '316554',
  'hansa teutonica': '43015',
  'ra': '12',
  'the resistance: avalon': '128882',
  'the resistance avalon': '128882',
  'the resistance': '41114',
  'stone age': '34635',
  'watergate': '274364',
  'targi': '118048',
  'five tribes: the djinns of naqala': '157354',
  'five tribes': '157354',
  'troyes': '73439',
  'barrage': '257499',
  'pandemic': '30549',
  'nidavellir': '296575',
  'res arcana': '262712',
  "it's a wonderful world": '271324',
  'its a wonderful world': '271324',
  'cartographers': '263918',
  'the search for planet x': '279537',
  'le havre': '35677',
  'caverna: the cave farmers': '102448',
  'caverna': '102448',
  'chess': '171',
  'mahjong': '2093',
  'chinatown': '181',
  'modern art': '118',
  'world wonders': '392308',
  'foxy': '392942',
  'las vegas': '117959',
  'the great dalmuti': '929',
  'saboteur': '9220',
  'marrakech': '29223',
  'concept': '147151',
  'coup': '131357',
  'krass kariert': '246734',
  'camel up 2nd': '260516',
  'camel up': '153936',
  'project l': '260180',
  'bang!': '3955',
  'bohnanza': '11',
  'river flow': '381014',
  '3 chapters': '423517',
  'century: golem edition': '232832',
  'wizard': '475',
  'rummikub six player': '811',
  'rummikub': '811',
  'majesty: for the realm': '225150',
  'skull king': '150145',
  'forbidden island': '65244',
  'lost temple': '97341',
  'roll through the ages: the bronze age': '37380',
  'coffee rush': '370008',
  'akropolis': '352142',
  'shadow hunters': '24068',
  'the adventures of robin hood': '320186',
  'suspects: claire harper takes the stage': '328643',
  'gingerbread house': '252900',
  'the quest for el dorado': '217372',
  "i'm the boss!": '15',
  'im the boss!': '15',
  'camel up: the card game': '209228',
  'blue lagoon': '244331',
  'citadels': '478',
  'stockpile': '161614',
  'masters of renaissance: lorenzo il magnifico - the card game': '280308',
  'flash point: fire rescue': '108667',
  'libertalia: winds of galecrest': '356033',
  'explorers of the woodlands': '336113',
  'stella quest': '368307',
  'mystic vale': '194607',
  'san juan': '8217',
  'paramedics: clear!': '231652',
  'evo': '1159',
  'saint petersburg': '9217',
  'acquire': '5',
  'raiders of the north sea': '170042',
  'carolus magnus': '481',
  'the taverns of tiefenthal': '269207',
  'architects of the west kingdom': '256858',
  'the wolves': '364467',
  'distilled': '294702',
  'east india companies': '358504',
  'faiyum': '318986',
  'obsession': '231733',
  'coimbra': '247000',
  'cuba': '30380',
  'marco polo ii: in the service of the khan': '280894',
  'revive': '332765',
  'the scepter of zavandor': '11762',
  'caylus': '18602',
  'carnegie': '310870',
  'age of innovation': '383179',
  'on mars': '184267',
  'spooky spells': '377461',
  'lobo 77': '2358',
  'one night ultimate werewolf: daybreak': '163166',
  'mascarade': '139030',
  'minivilles 2': '341857',
  'micromacro: crime city': '318977',
  'micromacro: crime city - full house': '343606',
  'micromacro: crime city - all in': '369274',
  'the white castle': '371942',
  'faraway': '394747',
  'haggis': '37628',
  'arkham horror: lovecraft letter': '225574',
  'quickshot': '338575',
  'truck off: the food truck frenzy': '210080',
  'tichu': '215',
  'roaring 20s': '376483',
  'fishing': '392270',
  'no thanks!': '12942',
  'mighty': '14300',
  'cup the crab': '385627',
  'jalape-no!': '367980',
  'nanatoridori': '376510',
  'jekyll vs hyde': '316165',
  'odin': '372076',
  'cockroach salad': '33160',
  'the gang': '413009',
  'rebel princess': '392264',
  'castle combo': '417724',
  'rikka': '382728',
  'once upon a time: the storytelling card game': '934',
  'seti: search for extraterrestrial intelligence': '418059',
  'ticket to ride legacy: legends of the west': '379036',
  'flip 7': '420138',
  'ticket to ride: marklin': '21348',
  'ticket to ride: nordic countries': '31618',
  'ticket to ride: new york': '249241',
  'skymines': '359438',
  'taco  cat goat cheese pizza': '253664',
  'taco cat goat cheese pizza': '253664',
  'hot streak': '417537',
  'shackleton base: a journey to the moon': '415516',
  '冷たい彼女が目覚める前に (embalming girl)': '348398',
  '차가운 그녀가 눈을 뜨기 전에': '348398',
  'abaone': '1134',
  'abalone': '1134',
  'clans of caledonia': '216132',
  'ora et labora': '70149',
  'orloj: the prague astronomical clock': '383377',
  'gutenberg': '343354',
  'tiny towns': '265736',
  'muffin time': '277028',
  'presages': '345388',
  'tonton': '345389',
  'moose match mayhem': '368742',
  'fifty fruity': '378036',
  'luthier: the art of the instrument': '375374',
  'pandemic legacy: season 1': '161936',
  'miams': '245524',
  'doodle puzzle': '387498',
  'big or bang': '397022',
  'bluffit': '408119',
  'hues and cues': '302520',
  'biddle': '389470',
  'wolf street': '416550',
  'abraca who?': '162624',
  'magical athlete': '8323',
  'club unlock': '391487',
  'got five!': '396820',
  'quoridor pac-man': '412702',
  'lost ruins of arnak': '312484'
};

/**
 * Extracts a numeric BGG ID from a raw ID or URL string.
 * e.g. "342942" -> "342942"
 * e.g. "https://boardgamegeek.com/boardgame/342942/ark-nova" -> "342942"
 */
export function extractBggId(input?: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/boardgame\/(\d+)/i);
  return match && match[1] ? match[1] : null;
}

/**
 * Formats a raw BGG ID or URL string into a standard direct BGG URL.
 * e.g. "342942" -> "https://boardgamegeek.com/boardgame/342942"
 * e.g. "https://boardgamegeek.com/boardgame/342942/ark-nova" -> "https://boardgamegeek.com/boardgame/342942"
 */
export function formatBggUrl(input?: string): string | null {
  const bggId = extractBggId(input);
  if (bggId) {
    return `https://boardgamegeek.com/boardgame/${bggId}`;
  }

  if (input && (input.trim().startsWith('http://') || input.trim().startsWith('https://'))) {
    return input.trim();
  }

  return null;
}

/**
 * Returns the BoardGameGeek (BGG) URL for a game.
 * Formats custom bggUrl (supports numeric ID or full URL), or maps title/subtitle to exact BGG direct URL.
 */
export function getBggUrl(game: Pick<Game, 'title'> & { subtitle?: string; bggUrl?: string }): string {
  // 1. If custom bggUrl is set on the game object (supports numeric ID "342942" or full URL)
  const formatted = formatBggUrl(game.bggUrl);
  if (formatted) {
    return formatted;
  }

  // 2. Check title or subtitle against known BGG mapping dictionary
  const cleanTitle = game.title.replace(/\s*\(\d{4}\)\s*$/, '').trim().toLowerCase();
  const cleanSubtitle = game.subtitle ? game.subtitle.trim().toLowerCase() : '';

  if (KNOWN_BGG_MAP[cleanTitle]) {
    return `https://boardgamegeek.com/boardgame/${KNOWN_BGG_MAP[cleanTitle]}`;
  }
  if (cleanSubtitle && KNOWN_BGG_MAP[cleanSubtitle]) {
    return `https://boardgamegeek.com/boardgame/${KNOWN_BGG_MAP[cleanSubtitle]}`;
  }

  const baseTitle = cleanTitle.split(':')[0].split('–')[0].split('-')[0].trim();
  if (KNOWN_BGG_MAP[baseTitle]) {
    return `https://boardgamegeek.com/boardgame/${KNOWN_BGG_MAP[baseTitle]}`;
  }

  // 3. Fallback search query URL if no direct match exists
  return `https://boardgamegeek.com/geeksearch.php?action=search&objecttype=boardgame&q=${encodeURIComponent(cleanTitle)}`;
}

export interface BggFetchedInfo {
  title?: string;
  subtitle?: string;
  publishedYear?: number;
  players?: string;
  duration?: number | string;
  playTime?: number | string;
  weight?: number;
  imageUrl?: string;
  bggUrl: string;
}

/**
 * Looks up detailed game information using BGG ID or URL.
 * Checks local games list or API endpoint to retrieve full details.
 */
export async function lookupBggInfo(input: string, gamesList: Game[] = []): Promise<BggFetchedInfo | null> {
  const bggId = extractBggId(input);
  if (!bggId) return null;

  const targetBggUrl = `https://boardgamegeek.com/boardgame/${bggId}`;

  // 1. Search existing games in collection
  const matchInList = gamesList.find(g => extractBggId(g.bggUrl) === bggId);
  if (matchInList) {
    const dur = matchInList.duration ?? matchInList.playTime;
    return {
      title: matchInList.title,
      subtitle: matchInList.subtitle,
      publishedYear: matchInList.publishedYear,
      players: matchInList.players,
      duration: dur,
      playTime: dur,
      weight: matchInList.weight,
      imageUrl: matchInList.imageUrl,
      bggUrl: targetBggUrl
    };
  }

  // 2. Fetch from backend endpoint /api/bgg-info
  try {
    const res = await fetch(`/api/bgg-info?id=${bggId}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.game) {
        const dur = data.game.duration ?? data.game.playTime;
        return {
          title: data.game.title,
          subtitle: data.game.subtitle,
          publishedYear: data.game.publishedYear,
          players: data.game.players,
          duration: dur,
          playTime: dur,
          weight: data.game.weight,
          imageUrl: data.game.imageUrl,
          bggUrl: targetBggUrl
        };
      }
    }
  } catch (err) {
    console.warn('Failed to fetch from /api/bgg-info:', err);
  }

  // 3. Reverse lookup from KNOWN_BGG_MAP
  for (const [titleKey, id] of Object.entries(KNOWN_BGG_MAP)) {
    if (id === bggId) {
      const titleCap = titleKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        title: titleCap,
        bggUrl: targetBggUrl
      };
    }
  }

  return {
    bggUrl: targetBggUrl
  };
}
