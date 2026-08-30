import type { Game } from '../store/useBoardGameStore';

/**
 * Pre-configured BGG ID lookup table for board games
 */
const KNOWN_BGG_MAP: Record<string, string> = {
  "ark nova": "342942",
  "아크 노바": "342942",
  "terraforming mars": "167791",
  "테라포밍 마스": "167791",
  "scythe": "169786",
  "사이드": "169786",
  "cascadia": "295947",
  "캐스캐디아": "295947",
  "the castles of burgundy": "179353",
  "버건디의 성": "179353",
  "7 wonders duel": "173346",
  "7 원더스 대결": "173346",
  "wingspan": "266192",
  "윙스팬": "266192",
  "concordia": "124361",
  "콩코르디아": "124361",
  "root": "237182",
  "루트": "237182",
  "great western trail": "193738",
  "그레이트웨스턴트레일": "193738",
  "orléans: big box": "164928",
  "오를레앙 빅박스": "164928",
  "mage knight board game": "96848",
  "메이지 나이트": "96848",
  "the crew: the quest for planet nine": "284083",
  "스페이스 크루": "284083",
  "tzolk'in: the mayan calendar": "126163",
  "촐킨: 마야의 달력": "126163",
  "clank! legacy: acquisitions incorporated": "266507",
  "클랭크! 레거시: 전리품 주식회사": "266507",
  "azul": "230802",
  "아줄": "230802",
  "viticulture essential edition": "183394",
  "비티컬처 에센셜 에디션": "183394",
  "the quacks of quedlinburg": "244521",
  "크베들린부르크의 돌팔이 약장수": "244521",
  "catan": "13",
  "카탄의 개척자": "13",
  "ticket to ride": "9209",
  "티켓 투 라이드": "9209",
  "carcassonne": "822",
  "카르카손": "822",
  "splendor": "148228",
  "스플렌더": "148228",
  "patchwork": "163412",
  "패치워크": "163412",
  "dominion": "36218",
  "도미니언": "36218",
  "7 wonders": "68448",
  "7 원더스": "68448",
  "agricola": "31260",
  "아그리콜라": "31260",
  "race for the galaxy": "24073",
  "레이스 포 더 갤럭시": "24073",
  "puerto rico": "3076",
  "푸에르토리코": "3076",
  "power grid": "2651",
  "파워 그리드": "2651",
  "el grande big box": "171908",
  "엘 그란데 빅 박스": "171908",
  "dune: imperium – uprising": "397598",
  "듄: 임페리움": "397598",
  "hansa teutonica": "43015",
  "한자 토이토니카": "43015",
  "ra": "12",
  "태양신 라": "12",
  "the resistance: avalon": "128882",
  "레지스탕스: 아발론": "128882",
  "stone age": "34635",
  "석기시대": "34635",
  "watergate": "274364",
  "워터게이트": "274364",
  "targi": "118048",
  "타르기": "118048",
  "five tribes: the djinns of naqala": "157354",
  "다섯 부족: 나칼라의 정령들": "157354",
  "troyes": "73439",
  "트루아": "73439",
  "barrage": "257499",
  "버라��": "257499",
  "pandemic": "30549",
  "팬데믹": "30549",
  "nidavellir": "293014",
  "니다벨리르": "293014",
  "res arcana": "262712",
  "레즈 아르카나": "262712",
  "it's a wonderful world": "271324",
  "원더풀 월드": "271324",
  "cartographers": "263918",
  "지도 제작자들": "263918",
  "the search for planet x": "279537",
  "행성 x를 찾아서": "279537",
  "le havre": "35677",
  "르아브르": "35677",
  "caverna: the cave farmers": "102448",
  "카베르나: 동굴 속 농부들": "102448",
  "chess": "171",
  "체스": "171",
  "mahjong": "2093",
  "마작": "2093",
  "chinatown": "47",
  "차이나타운": "47",
  "modern art": "118",
  "모던아트": "118",
  "world wonders": "365258",
  "월드 원더스": "365258",
  "foxy": "359318",
  "폭시": "359318",
  "las vegas": "117959",
  "라스베가스": "117959",
  "the great dalmuti": "929",
  "위대한 달무티": "929",
  "saboteur": "9220",
  "사보타지": "9220",
  "marrakech": "29223",
  "마라케시": "29223",
  "concept": "147151",
  "콘셉트": "147151",
  "coup": "131357",
  "쿠": "131357",
  "krass kariert": "243430",
  "크라스 카리어트": "243430",
  "camel up 2nd": "260605",
  "카멜업": "260605",
  "project l": "260180",
  "프로젝트 l": "260180",
  "bang!": "3955",
  "뱅!": "3955",
  "bohnanza": "11",
  "보난자": "11",
  "river flow": "271693",
  "리버 플로우": "271693",
  "3 chapters": "423517",
  "세 번째 이야기": "423517",
  "century: golem edition": "232832",
  "센추리: 골렘 에디션": "232832",
  "wizard": "1465",
  "위자드": "1465",
  "rummikub six player": "811",
  "루미큐브": "811",
  "majesty: for the realm": "225150",
  "마제스티": "225150",
  "skull king": "150145",
  "스컬킹": "150145",
  "forbidden island": "65244",
  "포비든 아일랜드": "65244",
  "lost temple": "89139",
  "로스트 템플": "89139",
  "roll through the ages: the bronze age": "37380",
  "롤 쓰루 디 에이지스: 청동기 시대": "37380",
  "coffee rush": "370008",
  "커피 러시": "370008",
  "akropolis": "352142",
  "아크로폴리스": "352142",
  "shadow hunters": "24068",
  "섀도우 헌터스": "24068",
  "the adventures of robin hood": "326494",
  "로빈 후드의 모험": "326494",
  "suspects: claire harper takes the stage": "322785",
  "용의자들: 클레어 하퍼의 수사일지": "322785",
  "gingerbread house": "258444",
  "진저브레드 하우스": "258444",
  "the quest for el dorado": "217372",
  "황금의 땅 엘도라도": "217372",
  "i'm the boss!": "115",
  "아임 더 보스!": "115",
  "camel up: the card game": "378848",
  "카멜업: 카드 게임": "378848",
  "blue lagoon": "244331",
  "블루라군": "244331",
  "citadels": "478",
  "시타델": "478",
  "stockpile": "161614",
  "스탁파일": "161614",
  "masters of renaissance: lorenzo il magnifico - the card game": "280453",
  "르네상스의 거장들: 위대한 로렌초 - 카드게임": "280453",
  "flash point: fire rescue": "100901",
  "플래시 포인트: 화재 구조": "100901",
  "libertalia: winds of galecrest": "356033",
  "리버탈리아: 게일크레스트의 바람": "356033",
  "explorers of the woodlands": "344078",
  "우드랜드의 탐험가": "344078",
  "stella quest": "424567",
  "별의 소원": "424567",
  "mystic vale": "194607",
  "미스틱 베일": "194607",
  "san juan": "8217",
  "산 후앙": "8217",
  "paramedics: clear!": "207010",
  "파라메딕스 클리어": "207010",
  "evo": "1159",
  "에보": "1159",
  "saint petersburg": "9217",
  "상트 페테르부르크": "9217",
  "acquire": "5",
  "어콰이어": "5",
  "raiders of the north sea": "170042",
  "북해의 침략자": "170042",
  "carolus magnus": "481",
  "카를로스 마그너스": "481",
  "the taverns of tiefenthal": "269207",
  "티펜탈의 선술집": "269207",
  "architects of the west kingdom": "236457",
  "서쪽 왕국의 건축가": "236457",
  "the wolves": "368058",
  "더 울브즈": "368058",
  "distilled": "295895",
  "디스틸드": "295895",
  "east india companies": "354132",
  "동인도 회사": "354132",
  "faiyum": "318983",
  "파이윰": "318983",
  "obsession": "231733",
  "업세션": "231733",
  "coimbra": "245638",
  "코임브라": "245638",
  "cuba": "30380",
  "쿠바": "30380",
  "marco polo ii: in the service of the khan": "283948",
  "마르코 폴로 2: 위대한 칸의 이름으로": "283948",
  "revive": "332765",
  "리바이브": "332765",
  "the scepter of zavandor": "11762",
  "자반도르의 셉터": "11762",
  "caylus": "18602",
  "케일러스": "18602",
  "carnegie": "310873",
  "카네기": "310873",
  "age of innovation": "383179",
  "혁신의 시대": "383179",
  "on mars": "184267",
  "온 마스": "184267",
  "spooky spells": "377461",
  "스푸키 스펠": "377461",
  "lobo 77": "3337",
  "로보 77": "3337",
  "one night ultimate werewolf: daybreak": "163166",
  "한밤의 늑대인간: 황혼에서 새벽까지": "163166",
  "mascarade": "139030",
  "마스카라드": "139030",
  "the resistance": "41114",
  "레지스탕스": "41114",
  "minivilles 2": "341857",
  "미니빌 2": "341857",
  "micromacro: crime city": "318977",
  "미크로 마크로: 크라임 시티": "318977",
  "micromacro: crime city - full house": "338834",
  "미크로 마크로: 크라임 시티- 풀하우스": "338834",
  "micromacro: crime city - all in": "369274",
  "미크로 마크로: 크라임시티- 올인": "369274",
  "the white castle": "371942",
  "백로성": "371942",
  "faraway": "385761",
  "파러웨이": "385761",
  "haggis": "37628",
  "해기스": "37628",
  "arkham horror: lovecraft letter": "424784",
  "러브크래프트 레터: 아컴호러": "424784",
  "quickshot": "368837",
  "퀵샷 서바이벌": "368837",
  "truck off: the food truck frenzy": "217020",
  "광란의 푸드트럭: 이것은 요식업이 아닌 전쟁": "217020",
  "tichu": "215",
  "티츄": "215",
  "roaring 20s": "427278",
  "파티사우루스 20s": "427278",
  "fishing": "419195",
  "피쉬 앤 트릭": "419195",
  "no thanks!": "12942",
  "노 땡스!": "12942",
  "mighty": "14300",
  "마이티": "14300",
  "cup the crab": "437879",
  "컵 더 크랩": "437879",
  "jalape-no!": "206",
  "할라피-노!": "206",
  "nanatoridori": "387388",
  "가지각새": "387388",
  "jekyll vs hyde": "297129",
  "지킬 vs 하이드": "297129",
  "odin": "406854",
  "오딘": "406854",
  "cockroach salad": "32341",
  "바퀴벌레 샐러드": "32341",
  "the gang": "419266",
  "갱스터": "419266",
  "rebel princess": "381249",
  "프린세스의 반란": "381249",
  "castle combo": "416851",
  "캐슬콤보": "416851",
  "rikka": "410338",
  "여섯불꽃": "410338",
  "once upon a time: the storytelling card game": "1234",
  "옛날 옛적에": "1234",
  "seti: search for extraterrestrial intelligence": "418059",
  "세티: 외계의 지성체를 찾아서": "418059",
  "ticket to ride legacy: legends of the west": "390092",
  "티켓 투 라이드 레거시: 서부개척": "390092",
  "flip 7": "420087",
  "플립 7": "420087",
  "ticket to ride: marklin": "21348",
  "티켓 투 라이드: 마르클린": "21348",
  "ticket to ride: nordic countries": "31618",
  "티켓 투 라이드: 노르딕": "31618",
  "ticket to ride: new york": "249241",
  "티켓 투 라이드: 뉴욕": "249241",
  "skymines": "359438",
  "스카이마인": "359438",
  "taco  cat goat cheese pizza": "253664",
  "타코 헬로키티 포차코 시나모롤 마이멜로디": "253664",
  "hot streak": "446497",
  "핫스트릭": "446497",
  "shackleton base: a journey to the moon": "408180",
  "섀클턴 베이스": "408180",
  "冷たい彼女が目覚める前に (embalming girl)": "326054",
  "차가운 그녀가 눈을 뜨기 전에": "326054",
  "abalone": "526",
  "아발론": "526",
  "clans of caledonia": "216132",
  "클랜 오브 칼레도니아": "216132",
  "ora et labora": "70149",
  "기도하고 일하라": "70149",
  "orloj: the prague astronomical clock": "429405",
  "오를로이: 프라하 천문시계": "429405",
  "gutenberg": "339958",
  "구텐베르크: 활자의 혁명": "339958",
  "tiny towns": "265736",
  "타이니 타운": "265736",
  "muffin time": "286735",
  "머핀 타임": "286735",
  "presages": "428787",
  "프리세이지": "428787",
  "tonton": "260704",
  "통통": "260704",
  "moose match mayhem": "421630",
  "무스 무리 모여라!": "421630",
  "fifty fruity": "431284",
  "피프티 프루티": "431284",
  "luthier: the art of the instrument": "371330",
  "루티어": "371330",
  "pandemic legacy: season 1": "161936",
  "팬데믹 레거시: 시즌1": "161936",
  "miams": "465137",
  "냠냠냠": "465137",
  "doodle puzzle": "428029",
  "두들 퍼즐": "428029",
  "big or bang": "462896",
  "빅 or 뱅 유니콘 유니버스": "462896",
  "bluffit": "450039",
  "블러핏": "450039",
  "hues and cues": "302520",
  "색감과 직감": "302520",
  "biddle": "450700",
  "다이스 챌린저": "450700",
  "wolf street": "436843",
  "울프 스트리트": "436843",
  "abraca who?": "467434",
  "아브라카 후": "467434",
  "magical athlete": "454103",
  "야단법석 달리기": "454103",
  "club unlock": "2310",
  "캐시": "2310",
  "got five!": "453526",
  "알았다오": "453526",
  "quoridor pac-man": "411617",
  "쿼리도 팩맨": "411617",
  "lost ruins of arnak": "312484",
  "아르낙의 잊혀진 유적": "312484"
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
  if (!bggId) {
    const formatted = formatBggUrl(input);
    if (formatted) return { bggUrl: formatted };
    return null;
  }

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

  // 2. Reverse lookup from KNOWN_BGG_MAP
  for (const [titleKey, id] of Object.entries(KNOWN_BGG_MAP)) {
    if (id === bggId) {
      const titleCap = titleKey.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return {
        title: titleCap,
        bggUrl: targetBggUrl
      };
    }
  }

  // 3. Fetch from backend endpoint /api/bgg-info
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

  // 4. Return formatted direct URL fallback
  return {
    bggUrl: targetBggUrl
  };
}
