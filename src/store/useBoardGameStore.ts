import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

export interface Game {
  id: string;
  title: string;
  players: string; // e.g., '2-5'
  playTime: number; // minutes
  weight: number; // 1.0 - 5.0
  imageUrl: string;
  totalPlays: number;
}

export interface Player {
  id: string;
  name: string;
  group: 'Family' | 'Friend' | 'User';
  imageUrl?: string;
}

export interface PlayerScore {
  playerId: string;
  score: number;
}

export interface PlayLog {
  id: string;
  gameId: string;
  date: string; // ISO string
  players: PlayerScore[];
  winnerId?: string | null; // Legacy single winner (or fallback)
  winnerIds?: string[]; // Supports multiple joint 1st place winners
  reviewMemo: string;
  imageUrls?: string[]; // New: support for uploaded photographs
}

interface BoardGameState {
  games: Game[];
  players: Player[];
  logs: PlayLog[];
  
  // Actions
  addGame: (game: Omit<Game, 'id' | 'totalPlays'>) => void;
  updateGame: (id: string, game: Partial<Game>) => void;
  deleteGame: (id: string) => void;
  
  addPlayer: (player: Omit<Player, 'id'>) => void;
  updatePlayer: (id: string, player: Partial<Player>) => void;
  deletePlayer: (id: string) => void;
  
  addLog: (log: Omit<PlayLog, 'id'>) => void;
  updateLog: (id: string, logData: Partial<PlayLog>) => void;
  deleteLog: (id: string) => void;
  
  importData: (data: { games: Game[], players: Player[], logs: PlayLog[] }) => void;
}

// Initial dummy data to showcase the app
const initialGames: Game[] = [
  {
    "id": "bgg-real-1",
    "title": "Brass: Birmingham (2018)",
    "players": "2-4",
    "playTime": 120,
    "weight": 3.89,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2018/12/brass-lancashire-1024x1024.jpg?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-2",
    "title": "Pandemic Legacy: Season 1 (2015)",
    "players": "2-4",
    "playTime": 60,
    "weight": 2.84,
    "imageUrl": "https://cdn.arstechnica.net/wp-content/uploads/2016/03/IMG_9737-1-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-3",
    "title": "Gloomhaven (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.9,
    "imageUrl": "https://uploads-ssl.webflow.com/5d64e96a371eb709ccf90df6/61dd41eddf94f997ec5969db_14a04c0a894fc04de4aae62f53a7c2a0_original.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-4",
    "title": "Ark Nova (2021)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3.73,
    "imageUrl": "https://cdn.shoplightspeed.com/shops/636231/files/38772737/1652x1652x2/capstone-games-ark-nova.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-5",
    "title": "Twilight Imperium: Fourth Edition (2017)",
    "players": "3-6",
    "playTime": 480,
    "weight": 4.31,
    "imageUrl": "https://cdn.mos.cms.futurecdn.net/yobCcnonxriPFt5sECrT5o.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-6",
    "title": "Terraforming Mars (2016)",
    "players": "1-5",
    "playTime": 120,
    "weight": 3.26,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2020/06/TheDicetroyers_Terraforming-Mars-All-In-Lifted-Base-02.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-7",
    "title": "Dune: Imperium (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.03,
    "imageUrl": "https://i.etsystatic.com/53579343/r/il/0cc444/7317679828/il_fullxfull.7317679828_n4jn.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-8",
    "title": "Star Wars: Rebellion (2016)",
    "players": "2-4",
    "playTime": 240,
    "weight": 3.75,
    "imageUrl": "https://starwarsunlimited.com/_next/image?url=https://cdn.starwarsunlimited.com/SWH_Button_Two_Player_Starter_Box_c5d05561ac.png&w=384&q=75",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-9",
    "title": "War of the Ring: Second Edition (2011)",
    "players": "2-4",
    "playTime": 180,
    "weight": 4.21,
    "imageUrl": "https://ks.aresgames.eu/wp-content/uploads/2024/12/WOTR030.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-10",
    "title": "Spirit Island (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 4.06,
    "imageUrl": "https://i0.wp.com/gideonsgaming.com/wp-content/uploads/2020/12/scenarios-adversaries-1.png?resize=719,404&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-11",
    "title": "Scythe (2016)",
    "players": "1-5",
    "playTime": 115,
    "weight": 3.44,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2017/10/Scythe-The-Wind-Gambit.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-12",
    "title": "Cascadia (2021)",
    "players": "1-4",
    "playTime": 45,
    "weight": 1.84,
    "imageUrl": "https://www.geekyhobbies.com/wp-content/uploads/2025/10/Cascadia-Box-728x410.jpg.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-13",
    "title": "The Castles of Burgundy (2011)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.99,
    "imageUrl": "https://media.printables.com/media/prints/941234/images/7195899_f7bb400f-4021-4776-a7e5-7a0b3b7a0919_c9c39d5e-ac34-44a4-ab88-05b12c59974d/thumbs/inside/1280x960/jpg/duchy_comparison.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-14",
    "title": "7 Wonders Duel (2015)",
    "players": "2",
    "playTime": 30,
    "weight": 2.23,
    "imageUrl": "https://makerworld.bblmw.com/makerworld/model/UScc66dc3aa8bf35/378235970/instance/2025-08-12_0ffa0484b8309.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-15",
    "title": "Wingspan (2019)",
    "players": "1-5",
    "playTime": 70,
    "weight": 2.45,
    "imageUrl": "https://orionmagazine.org/wp-content/uploads/2023/11/faith-wingspan2-1400x1050.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-16",
    "title": "Concordia (2013)",
    "players": "2-5",
    "playTime": 100,
    "weight": 3.01,
    "imageUrl": "https://www.gaminglib.com/cdn/shop/files/concordia-783073.webp?v=1753954505&width=1200",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-17",
    "title": "Root (2018)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.79,
    "imageUrl": "https://accidentallycoolgames.com/cdn/shop/products/91E7bCmI2HL._AC_SL1500_800x.png?v=1678807108",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-18",
    "title": "Everdell (2018)",
    "players": "1-4",
    "playTime": 80,
    "weight": 2.81,
    "imageUrl": "https://m.media-amazon.com/images/I/719r3B3tFEL.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-19",
    "title": "A Feast for Odin (2016)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.86,
    "imageUrl": "https://imgv2-2-f.scribdassets.com/img/document/516757980/original/78721ba52f/1?v=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-20",
    "title": "Great Western Trail (2016)",
    "players": "2-4",
    "playTime": 150,
    "weight": 3.72,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10168272670030551",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-21",
    "title": "Orléans (2014)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.04,
    "imageUrl": "https://i.pinimg.com/736x/80/fc/5e/80fc5e431f18d1ba23461d9d6e8557da.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-22",
    "title": "Lost Ruins of Arnak (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.89,
    "imageUrl": "https://images-eu.ssl-images-amazon.com/images/I/71CEIxrzSZL._AC_UL495_SR435,495_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-23",
    "title": "Blood Rage (2015)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.88,
    "imageUrl": "https://i.ebayimg.com/images/g/Z~oAAOSwfJFmR6ht/s-l1200.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-24",
    "title": "Eclipse: Second Dawn for the Galaxy (2020)",
    "players": "2-6",
    "playTime": 200,
    "weight": 3.65,
    "imageUrl": "https://thefriendlyboardgamer.wordpress.com/wp-content/uploads/2021/01/pxl_20210123_131008300.jpg?w=1024",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-25",
    "title": "Mage Knight Board Game (2011)",
    "players": "1-4",
    "playTime": 240,
    "weight": 4.35,
    "imageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEioMXqT93nVeZK4EOzXFVjbeUTzPM5tqWIRdvYWPy50zz5Hb610QQtNJpg5LZDoIr-1CmK4t8D5BibHKAskjLXHVbhpHEis8LzVxhWl5bukKyYBwYWTCWH4TrcQ1g5s8QmxILk6v8qtLqs/s1600/DSC04589.JPG",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-26",
    "title": "The Crew: The Quest for Planet Nine (2019)",
    "players": "2-5",
    "playTime": 20,
    "weight": 1.98,
    "imageUrl": "https://bitewinggames.com/wp-content/uploads/2024/06/MostAnticipatedGamesof2024Part2.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-27",
    "title": "Tzolk'in: The Mayan Calendar (2012)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.68,
    "imageUrl": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3433279304891954244",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-28",
    "title": "Mansions of Madness: Second Edition (2016)",
    "players": "1-5",
    "playTime": 180,
    "weight": 2.68,
    "imageUrl": "https://i.ytimg.com/vi/Sci-MctxWJc/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-29",
    "title": "Marvel Champions: The Card Game (2019)",
    "players": "1-4",
    "playTime": 90,
    "weight": 2.95,
    "imageUrl": "https://theboardgamecollection.com/wp-content/uploads/2024/02/6V3OCP1unIEu4Ahh1PvL1Iho43IgWMh72iRd0tN06eo2Sx4EHNUzeuFXAoxX0pdCAxtN0iYVk12K7Mg4CjDxIUmAwJBts5JMrIwhZve6Q3J4VEkPJKXALenhg5kIRwaupXnoyS-xOmQL.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-30",
    "title": "Clank! Legacy: Acquisitions Incorporated (2019)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.76,
    "imageUrl": "https://cannibalhalflinggaming.com/wp-content/uploads/2019/04/acqinc-e1554665305382.jpg?w=672&h=372&crop=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-31",
    "title": "Azul (2017)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.76,
    "imageUrl": "https://www.artofplay.com/cdn/shop/products/azul-gameboard_4bd62a84-3da9-4a72-9189-4a124a58d271.png?v=1636415879&width=1024",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-32",
    "title": "Viticulture Essential Edition (2015)",
    "players": "1-6",
    "playTime": 90,
    "weight": 2.89,
    "imageUrl": "https://tabletopmerchant.com/cdn/shop/files/ViticultureGameplay6_800x.jpg?v=1736975384",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-33",
    "title": "Crokinole (1876)",
    "players": "2-4",
    "playTime": 30,
    "weight": 1.25,
    "imageUrl": "https://i.ytimg.com/vi/P_cB2tyD36g/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-34",
    "title": "Pax Pamir: Second Edition (2019)",
    "players": "1-5",
    "playTime": 120,
    "weight": 3.85,
    "imageUrl": "https://spritesanddice.com/media/images/pax_pamir_close_up.width-1080.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-35",
    "title": "Through the Ages: A New Story of Civilization (2015)",
    "players": "2-4",
    "playTime": 120,
    "weight": 4.45,
    "imageUrl": "https://images.squarespace-cdn.com/content/v1/54dc217de4b05cd95c7305b4/c3149136-6787-4d2d-90ff-cb818cf88afe/Lisa.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-36",
    "title": "The Quacks of Quedlinburg (2018)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.95,
    "imageUrl": "https://opinionatedgamers.com/wp-content/uploads/2018/05/edited6.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-37",
    "title": "Catan (1995)",
    "players": "3-4",
    "playTime": 120,
    "weight": 2.31,
    "imageUrl": "https://makerworld.bblmw.com/makerworld/model/USb16c0c90f5f2d3/design/2025-11-04_32bd97e956b3f.jpg?x-oss-process=image/resize,w_400/format,webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-38",
    "title": "Ticket to Ride (2004)",
    "players": "2-5",
    "playTime": 60,
    "weight": 1.83,
    "imageUrl": "https://www.autostraddle.com/wp-content/uploads/2013/01/photo-31.jpeg?fit=1352,924",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-39",
    "title": "Carcassonne (2000)",
    "players": "2-5",
    "playTime": 45,
    "weight": 1.9,
    "imageUrl": "https://media.karousell.com/media/photos/products/2024/6/19/carcassonne_chinese_editions_1718764175_28691dc7_progressive.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-40",
    "title": "Splendor (2014)",
    "players": "2-4",
    "playTime": 30,
    "weight": 1.78,
    "imageUrl": "https://www.thebigbox.co.za/wp-content/uploads/2016/11/splendor_cover_1024x1024-400x400.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-41",
    "title": "Patchwork (2014)",
    "players": "2",
    "playTime": 30,
    "weight": 1.6,
    "imageUrl": "https://meeplelikeus.b-cdn.net/wp-content/uploads/2016/05/20160514_135822.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-42",
    "title": "Dominion (2008)",
    "players": "2-4",
    "playTime": 30,
    "weight": 2.35,
    "imageUrl": "http://thethoughtfulgamer.com/wp-content/uploads/2017/10/20171016_191135-e1508195850795.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-43",
    "title": "7 Wonders (2010)",
    "players": "2-7",
    "playTime": 30,
    "weight": 2.32,
    "imageUrl": "https://i.etsystatic.com/14639321/r/il/7f3055/7534792967/il_fullxfull.7534792967_drnz.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-44",
    "title": "Agricola (2007)",
    "players": "1-5",
    "playTime": 150,
    "weight": 3.64,
    "imageUrl": "https://i.ebayimg.com/images/g/NMMAAeSwu9xo3WrF/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-45",
    "title": "Race for the Galaxy (2007)",
    "players": "2-4",
    "playTime": 60,
    "weight": 2.99,
    "imageUrl": "https://i.redd.it/race-for-the-galaxy-box-organizer-v0-9q3432a77rgc1.jpg?width=3472&format=pjpg&auto=webp&s=d0bdc61ae5c64a77193f7490a58d99fc9faaa2a4",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-46",
    "title": "Puerto Rico (2002)",
    "players": "3-5",
    "playTime": 150,
    "weight": 3.27,
    "imageUrl": "https://i.ebayimg.com/images/g/SNwAAOSwzjtnYMUD/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-47",
    "title": "Power Grid (2004)",
    "players": "2-6",
    "playTime": 120,
    "weight": 3.26,
    "imageUrl": "https://archive.org/services/img/nintendo-power-issue-184-october-2004/full/pct:200/0/default.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-48",
    "title": "El Grande (1995)",
    "players": "2-5",
    "playTime": 120,
    "weight": 3.05,
    "imageUrl": "https://storage.googleapis.com/ludopedia-imagens-jogo/fdbe6_58791.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-49",
    "title": "Brass: Lancashire (2007)",
    "players": "2-4",
    "playTime": 120,
    "weight": 3.86,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/ESDPSAH06EN_Cover-scaled.webp?crop=center&height=400&v=1770961284&width=300",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-50",
    "title": "Tigris & Euphrates (1997)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.51,
    "imageUrl": "https://i.ebayimg.com/images/g/5t4AAeSwRAJopp3j/s-l300.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-51",
    "title": "Star Wars: Imperial Assault (2014)",
    "players": "1-5",
    "playTime": 120,
    "weight": 2.5,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10231464218322430",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-52",
    "title": "Dune: Imperium – Uprising (2023)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.64,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2024/01/store_diu_cards_900x.webp?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-53",
    "title": "Inis (2016)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.78,
    "imageUrl": "https://flamingdicereviews.files.wordpress.com/2016/12/inis-action-cards.jpg?w=487&h=274",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-54",
    "title": "Cosmic Encounter (2008)",
    "players": "3-6",
    "playTime": 60,
    "weight": 2.92,
    "imageUrl": "https://www.despelvogel.com/wp-content/uploads/2018/08/ce01_42ed_planets-plastics.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-55",
    "title": "Kemet (2012)",
    "players": "2-5",
    "playTime": 120,
    "weight": 3.06,
    "imageUrl": "https://i.ytimg.com/vi/_U-ywSHV8Zk/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-56",
    "title": "Hansa Teutonica (2009)",
    "players": "2-5",
    "playTime": 90,
    "weight": 3.2,
    "imageUrl": "https://juegosdelamesaredonda.com/18475-large_default/hansa-teutonica-new-edition-english.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-57",
    "title": "Ra (1999)",
    "players": "2-5",
    "playTime": 60,
    "weight": 3.34,
    "imageUrl": "https://thegamesarehere.com/cdn/shop/products/ShogunRavensburger1983_10_grande.jpg?v=1627418410",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-58",
    "title": "Scythe: Invaders from Afar (2016)",
    "players": "1-5",
    "playTime": 115,
    "weight": 3.48,
    "imageUrl": "https://m.media-amazon.com/images/I/51nsXWkzcOL._AC_UF894,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-59",
    "title": "Radlands (2021)",
    "players": "2",
    "playTime": 40,
    "weight": 3.62,
    "imageUrl": "https://preview.redd.it/couldnt-fit-the-radlands-expansion-in-the-base-box-since-we-v0-f67hm0gxb88e1.jpg?width=640&crop=smart&auto=webp&s=46ddc821fdcfdca2298fc3e5df126df9fd315a99",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-60",
    "title": "The Resistance: Avalon (2012)",
    "players": "5-10",
    "playTime": 30,
    "weight": 3.76,
    "imageUrl": "https://overhauledgames.com.au/wp-content/uploads/2025/10/Betrayal-at-House-on-the-Hill-3rd-Edition-Board-Game-1-300x300.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-61",
    "title": "Decrypto (2018)",
    "players": "3-8",
    "playTime": 45,
    "weight": 3.9,
    "imageUrl": "https://external-preview.redd.it/most-anticipated-board-games-of-2026-bitewing-games-v0-T07wlQhDyRAqUSrf1NbCqmBpU6-G1nlhtdyVfitTEdo.jpeg?auto=webp&s=91160e0ebf8d6bd47fe263ebfb30c71156e9b753",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-62",
    "title": "Just One (2018)",
    "players": "3-7",
    "playTime": 20,
    "weight": 4.04,
    "imageUrl": "https://i.ytimg.com/vi/l5GmPTMx2Xo/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-63",
    "title": "Wavelength (2019)",
    "players": "4-8",
    "playTime": 45,
    "weight": 4.18,
    "imageUrl": "https://www.huzzahtoys.com/cdn/shop/files/Wavelength_5.jpg?v=1738626993",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-64",
    "title": "Codenames (2015)",
    "players": "2-8",
    "playTime": 15,
    "weight": 4.32,
    "imageUrl": "https://imaginaire.com/en/images/CODENAMES-BASE-GAME-XXL-–-2ND-EDITION-ENGLISH__8594156311360-1.JPG",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-65",
    "title": "Secret Hitler (2016)",
    "players": "5-10",
    "playTime": 45,
    "weight": 4.46,
    "imageUrl": "https://i.etsystatic.com/29390321/r/il/98538d/6173478368/il_340x270.6173478368_crrx.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-66",
    "title": "Deception: Murder in Hong Kong (2014)",
    "players": "4-12",
    "playTime": 20,
    "weight": 1.6,
    "imageUrl": "https://i.ytimg.com/vi/ojhUGtnyecA/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgVChKMA8=&rs=AOn4CLArLRynylq4B1xisAHIZFq0x2AJeg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-67",
    "title": "Lords of Waterdeep (2012)",
    "players": "2-5",
    "playTime": 120,
    "weight": 1.74,
    "imageUrl": "https://spacebiff.com/wp-content/uploads/2012/04/15-fancy-box.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-68",
    "title": "Stone Age (2008)",
    "players": "2-4",
    "playTime": 90,
    "weight": 1.88,
    "imageUrl": "https://media.printables.com/media/prints/374402/images/3150897_5df722cf-d368-4db7-9dde-3f0ed3ef893c/thumbs/inside/1280x960/jpeg/img_0554.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-69",
    "title": "Watergate (2019)",
    "players": "2",
    "playTime": 60,
    "weight": 2.02,
    "imageUrl": "https://preview.redd.it/top-100-board-games-of-all-time-2024-edition-games-75-51-v0-05kf9un2d5vd1.jpg?width=1028&format=pjpg&auto=webp&s=f012cb465ba82738d7b50a9ea7da6c4b24ca461e",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-70",
    "title": "Targi (2012)",
    "players": "2",
    "playTime": 60,
    "weight": 2.16,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2012/07/village.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-71",
    "title": "Five Tribes (2014)",
    "players": "2-4",
    "playTime": 80,
    "weight": 2.3,
    "imageUrl": "https://i.ytimg.com/vi/tBCjDFgHioU/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-72",
    "title": "Troyes (2010)",
    "players": "1-4",
    "playTime": 90,
    "weight": 2.44,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2012/02/last-will.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-73",
    "title": "Keyflower (2012)",
    "players": "2-6",
    "playTime": 120,
    "weight": 2.58,
    "imageUrl": "https://www.donteatthemeeples.com/content/images/2025/08/264c2006-964b-43a5-bed0-1e322be81beb_3000x2000-jpeg.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-74",
    "title": "Grand Austria Hotel (2015)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.72,
    "imageUrl": "https://m.media-amazon.com/images/I/51j5DFkpAwL._AC_UF894,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-75",
    "title": "Lorenzo il Magnifico (2016)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.86,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2022/07/The-Dicetroyers-Lorenzo-il-magnifico-Big-Box-04.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-76",
    "title": "The Gallerist (2015)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3,
    "imageUrl": "https://i.etsystatic.com/47668388/r/il/eafedd/7604152042/il_fullxfull.7604152042_qix4.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-77",
    "title": "Lisboa (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.14,
    "imageUrl": "https://wobgames.net/wp-content/uploads/2020/08/burano-boardgame-430x430.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-78",
    "title": "On Mars (2020)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3.28,
    "imageUrl": "https://tabletopbellhop.com/wp-content/uploads/2020/01/hqdefault1-4.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-79",
    "title": "Kanban EV (2020)",
    "players": "1-4",
    "playTime": 180,
    "weight": 3.42,
    "imageUrl": "https://i.etsystatic.com/22133352/r/il/60f8e0/6334415822/il_fullxfull.6334415822_epro.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-80",
    "title": "Vinhos Deluxe Edition (2016)",
    "players": "1-4",
    "playTime": 135,
    "weight": 3.56,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/pic8923324.jpg?crop=center&height=400&v=1753764546&width=300",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-81",
    "title": "Clans of Caledonia (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.7,
    "imageUrl": "https://cdn.thingiverse.com/assets/2d/75/7d/8d/71/featured_preview_DSC_0696.JPG",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-82",
    "title": "Teotihuacan: City of Gods (2018)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.84,
    "imageUrl": "https://boardanddice.com/wp-content/uploads/2022/01/Teotihuacan-Rozgrywka-10-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-83",
    "title": "Barrage (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.98,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2020/02/TheDicetroyers_Barrage-00a-1.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-84",
    "title": "Nemesis (2018)",
    "players": "1-5",
    "playTime": 180,
    "weight": 4.12,
    "imageUrl": "https://steamforged.com/cdn/shop/products/SFRE3-001-TheBoardGame-Box-Back-Flat.png?v=1743078715&width=750",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-85",
    "title": "Dead of Winter: A Crossroads Game (2014)",
    "players": "2-5",
    "playTime": 120,
    "weight": 4.26,
    "imageUrl": "https://fbi.cults3d.com/uploaders/17767297/illustration-file/34a8c65d-c62c-4364-a247-d70cdf871e50/All-insert-and-accessories.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-86",
    "title": "Sherlock Holmes Consulting Detective (1981)",
    "players": "1-5",
    "playTime": 15,
    "weight": 4.4,
    "imageUrl": "https://i.ytimg.com/vi/WIZGG7wepQQ/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-87",
    "title": "Pandemic (2008)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.54,
    "imageUrl": "https://i.ebayimg.com/images/g/NwsAAeSw~DNpZnBT/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-88",
    "title": "Robinson Crusoe: Adventures on the Cursed Island (2012)",
    "players": "1-4",
    "playTime": 120,
    "weight": 1.68,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/ESDPSAH06EN_Cover-scaled.webp?crop=center&height=400&v=1770961284&width=300",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-89",
    "title": "Eldritch Horror (2013)",
    "players": "1-8",
    "playTime": 240,
    "weight": 1.82,
    "imageUrl": "https://assetsio.gnwcdn.com/eldritch-horror-board-game-gameplay-layout.png?width=140&height=187&fit=crop&quality=85&format=jpg&auto=webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-90",
    "title": "Arkham Horror: The Card Game (2016)",
    "players": "1-2",
    "playTime": 120,
    "weight": 1.96,
    "imageUrl": "https://makeyourpiecegames.com/wp-content/uploads/2021/04/3-3.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-91",
    "title": "Gloomhaven: Jaws of the Lion (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.1,
    "imageUrl": "https://gugimages.s3.us-east-2.amazonaws.com/wp-content/uploads/2022/02/07123723/IMG_3849-900x616.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-92",
    "title": "Aeon's End (2016)",
    "players": "1-4",
    "playTime": 60,
    "weight": 2.24,
    "imageUrl": "https://gamewardbound.com/wp-content/uploads/2025/11/aeons-end-brama-the-breach-mage-elder.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-93",
    "title": "Too Many Bones (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.38,
    "imageUrl": "https://store.aetherworks.com.au/images/TMB-ADD-032.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-94",
    "title": "The Lord of the Rings: Journeys in Middle-Earth (2019)",
    "players": "1-5",
    "playTime": 120,
    "weight": 2.52,
    "imageUrl": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1003400/ss_532a6837953f91e56c37e1e7ffbeece5afe9bf2f.1920x1080.jpg?t=1690823237",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-95",
    "title": "Sleeping Gods (2021)",
    "players": "1-4",
    "playTime": 1200,
    "weight": 2.66,
    "imageUrl": "https://unfilteredgamer.com/wp-content/uploads/2021/03/sg4-1024x574.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-96",
    "title": "Tainted Grail: The Fall of Avalon (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.8,
    "imageUrl": "https://thesolomeeple.com/wp-content/uploads/2019/12/imgp0420.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-97",
    "title": "Oath: Chronicles of Empire and Exile (2021)",
    "players": "1-6",
    "playTime": 120,
    "weight": 2.94,
    "imageUrl": "https://www.gaminglib.com/cdn/shop/products/oath-chronicles-of-empire-and-exile-retail-edition-761329.jpg?v=1700193786&width=1024",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-98",
    "title": "Mombasa (2015)",
    "players": "2-4",
    "playTime": 150,
    "weight": 3.08,
    "imageUrl": "https://i.ytimg.com/vi/LQo8CUl3jZg/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-99",
    "title": "Maracaibo (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.22,
    "imageUrl": "https://cdn.thingiverse.com/assets/d7/31/68/78/c4/large_display_m4.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-100",
    "title": "Nidavellir (2020)",
    "players": "2-5",
    "playTime": 45,
    "weight": 3.36,
    "imageUrl": "https://static.boardgamesindia.com/image/cache/catalog/product/welcome_back_to_the_dungeon_1-300x300h.jpg.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-101",
    "title": "Res Arcana (2019)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.5,
    "imageUrl": "https://spacebiff.com/wp-content/uploads/2019/05/3.-synerdragons.jpg?w=604&h=239",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-102",
    "title": "It's a Wonderful World (2019)",
    "players": "1-5",
    "playTime": 60,
    "weight": 3.64,
    "imageUrl": "https://i.ebayimg.com/images/g/BwoAAOSwWMhoKncR/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-103",
    "title": "Furnace (2020)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.78,
    "imageUrl": "https://cf.geekdo-images.com/ldZPYwRCPg06s_gT1HGdDQ__itemrep/img/Vn8sCpqGgqAXIqGE_UOQ6-Zj5sU=/fit-in/246x300/filters:strip_icc()/pic8745665.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-104",
    "title": "Fantasy Realms (2017)",
    "players": "2-6",
    "playTime": 20,
    "weight": 3.92,
    "imageUrl": "https://www.aresgames.eu/wp/wp-content/uploads/2025/08/940x400-VolfiyrionGuilds.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-105",
    "title": "Space Base (2018)",
    "players": "2-5",
    "playTime": 60,
    "weight": 4.06,
    "imageUrl": "https://tabletopbellhop.com/wp-content/uploads/2022/06/919Nyr-eY9L._AC_SL1500_1-400x438.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-106",
    "title": "Gizmos (2018)",
    "players": "2-4",
    "playTime": 50,
    "weight": 4.2,
    "imageUrl": "https://m.media-amazon.com/images/I/71-bbNlS0uL._AC_UF350,350_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-107",
    "title": "Century: Spice Road (2017)",
    "players": "2-5",
    "playTime": 45,
    "weight": 4.34,
    "imageUrl": "https://down-vn.img.susercontent.com/file/ce050ee42864cd4ced406a5f1c66bd23",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-108",
    "title": "Sagrada (2017)",
    "players": "1-4",
    "playTime": 45,
    "weight": 4.48,
    "imageUrl": "https://cf.geekdo-images.com/PUu9Gi6_uL5wzU8HQURzxA__square275/img/JkaY_5iWEhzXzH-mIOjwkzasC4w=/275x275/filters:no_upscale():strip_icc()/pic9398550.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-109",
    "title": "Calico (2020)",
    "players": "1-4",
    "playTime": 45,
    "weight": 1.62,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2023/09/The-Dicetroyers-Board-Game-Organizer-Insert-Calico-06.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-110",
    "title": "Bärenpark (2017)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.76,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122103322785285160",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-111",
    "title": "Isle of Cats (2019)",
    "players": "3-6",
    "playTime": 90,
    "weight": 1.9,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10221034616908309",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-112",
    "title": "Parks (2019)",
    "players": "1-5",
    "playTime": 60,
    "weight": 2.04,
    "imageUrl": "https://www.teamboardgame.com/wp-content/uploads/2024/02/Parks-2nd-Ed-Base-Camp-1.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-113",
    "title": "Tokaido (2012)",
    "players": "2-5",
    "playTime": 45,
    "weight": 2.18,
    "imageUrl": "https://domigr.com.ua/image/cache/data/tokaido/5th_Anniversary_Edition/01_tokaido_5th_anniversary_edition-376x376.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-114",
    "title": "Takenoko (2011)",
    "players": "2-4",
    "playTime": 45,
    "weight": 2.32,
    "imageUrl": "https://cdn.shoplightspeed.com/shops/638935/files/26760942/1652x2313x2/matagot-takenoko.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-115",
    "title": "Sushi Go Party! (2016)",
    "players": "2-8",
    "playTime": 20,
    "weight": 2.46,
    "imageUrl": "https://www.shutupandsitdown.com/wp-content/uploads/2016/11/pic2281301.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-116",
    "title": "Welcome To... (2018)",
    "players": "1-100",
    "playTime": 25,
    "weight": 2.6,
    "imageUrl": "https://www.cardboardrepublic.com/wp-content/uploads/2016/06/TTA-cover.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-117",
    "title": "Cartographers (2019)",
    "players": "1-100",
    "playTime": 45,
    "weight": 2.74,
    "imageUrl": "https://thunderworksgames.com/cdn/shop/files/CH-Collectors-Filled-1024x1024.jpg?v=1761778405",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-118",
    "title": "That's Pretty Clever! (2018)",
    "players": "1-4",
    "playTime": 30,
    "weight": 2.88,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10217745864264644",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-119",
    "title": "Sprawlopolis (2018)",
    "players": "1-4",
    "playTime": 20,
    "weight": 3.02,
    "imageUrl": "http://www.beyondsolitaire.net/uploads/4/9/4/6/49468733/published/img-2736.jpg?1561592101",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-120",
    "title": "Love Letter (2012)",
    "players": "2-6",
    "playTime": 20,
    "weight": 3.16,
    "imageUrl": "https://i.ebayimg.com/images/g/BBoAAeSwY3Zppgvo/s-l300.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-121",
    "title": "Skull (2011)",
    "players": "3-6",
    "playTime": 45,
    "weight": 3.3,
    "imageUrl": "https://ashdowngaming.co.uk/cdn/shop/products/skull2_700x.jpg?v=1684424741",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-122",
    "title": "Camel Up (2014)",
    "players": "2-8",
    "playTime": 30,
    "weight": 3.44,
    "imageUrl": "https://therewillbe.games/images/member_images/ubarose/images/member_images/David/Camel_Up_02.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-123",
    "title": "The Mind (2018)",
    "players": "2-4",
    "playTime": 20,
    "weight": 3.58,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2018/03/mindcomponents.jpeg?resize=370,494&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-124",
    "title": "Hanabi (2010)",
    "players": "2-5",
    "playTime": 25,
    "weight": 3.72,
    "imageUrl": "https://coopboardgames.com/wp-content/uploads/2016/07/hanabi-card-game-review-1024x607.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-125",
    "title": "Dixit (2008)",
    "players": "3-6",
    "playTime": 30,
    "weight": 3.86,
    "imageUrl": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20width%3D%22400%22%20height%3D%22400%22%3E%0A%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3Ahsl(341%2C%2075%25%2C%2055%25)%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3Ahsl(62%2C%2080%25%2C%2040%25)%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grad)%22%20%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20sans-serif%22%20font-size%3D%22140%22%20font-weight%3D%22800%22%20fill%3D%22white%22%20opacity%3D%220.9%22%20letter-spacing%3D%22-2%22%3EDI%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-126",
    "title": "Mysterium (2015)",
    "players": "2-7",
    "playTime": 42,
    "weight": 4,
    "imageUrl": "https://v.etsystatic.com/video/upload/q_auto/file_vjesln.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-127",
    "title": "Betrayal at House on the Hill (2004)",
    "players": "3-6",
    "playTime": 60,
    "weight": 4.14,
    "imageUrl": "https://i.ytimg.com/vi/4qfYtJA1ULg/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-128",
    "title": "Smash Up (2012)",
    "players": "2-4",
    "playTime": 45,
    "weight": 4.28,
    "imageUrl": "https://i5.walmartimages.com/asr/61e6077c-8c77-4b68-ad60-b59deb3307f6.b07153ac37d938ad97e15901851ccd22.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-129",
    "title": "King of Tokyo (2011)",
    "players": "2-6",
    "playTime": 30,
    "weight": 4.42,
    "imageUrl": "https://www.teamboardgame.com/wp-content/uploads/2022/01/King-of-Tokyo-Monster-Box-2.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-130",
    "title": "Survive: Escape from Atlantis! (1982)",
    "players": "2-4",
    "playTime": 60,
    "weight": 1.56,
    "imageUrl": "https://static.wixstatic.com/media/47acff_005213543524428a8a34d14ba14e4aff~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/47acff_005213543524428a8a34d14ba14e4aff~mv2.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-131",
    "title": "Letters from Whitechapel (2011)",
    "players": "2-6",
    "playTime": 90,
    "weight": 1.7,
    "imageUrl": "https://www.gameology.com.au/cdn/shop/products/0a6a6.jpg?v=1768437513&width=1200",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-132",
    "title": "Fury of Dracula (2015)",
    "players": "3-6",
    "playTime": 180,
    "weight": 1.84,
    "imageUrl": "https://www.orderofgamers.com/wordpress/wp-content/uploads/2016/05/furyofdracula3rded.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-133",
    "title": "Specter Ops (2015)",
    "players": "2-5",
    "playTime": 120,
    "weight": 1.98,
    "imageUrl": "https://cf.geekdo-images.com/OolxfVgT6Tf9OWpWA9NYXA__imagepage/img/JBvQi0w5Q1eqO1qNIzPdGZlnxek=/fit-in/900x600/filters:no_upscale():strip_icc()/pic8393302.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-134",
    "title": "Captain Sonar (2016)",
    "players": "2-8",
    "playTime": 60,
    "weight": 2.12,
    "imageUrl": "https://cdn.waterstones.com/override/v2/large/5060/7564/5060756410671.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-135",
    "title": "Two Rooms and a Boom (2013)",
    "players": "6-30",
    "playTime": 20,
    "weight": 2.26,
    "imageUrl": "https://media.printables.com/media/prints/496345/stls/4041745_dfa5d051-6b8f-4341-ac6a-7595ad4a821b/thumbs/inside/1280x960/png/token_case_preview.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-136",
    "title": "The Search for Planet X (2020)",
    "players": "1-4",
    "playTime": 60,
    "weight": 2.4,
    "imageUrl": "https://i.etsystatic.com/30153557/r/il/ee5cba/5659367916/il_1080xN.5659367916_i21f.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-137",
    "title": "Alchemists (2014)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.54,
    "imageUrl": "https://www.cards2games.com/cdn/shop/files/godzilla-card-game-monsters-raid-again-bp02-booster-box-buy-3-186.webp?v=1767064831&width=416",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-138",
    "title": "Trickerion: Legends of Illusion (2015)",
    "players": "2-4",
    "playTime": 180,
    "weight": 2.68,
    "imageUrl": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3844123900486034705",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-139",
    "title": "Anachrony (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.82,
    "imageUrl": "https://www.meepland.fr/2177-large_default/anachrony-essential-edition-super-meeple-mindclash-games.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-140",
    "title": "Cerebria: The Inside World (2018)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.96,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10106769506776160",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-141",
    "title": "Agricola: All Creatures Big and Small (2012)",
    "players": "2",
    "playTime": 30,
    "weight": 3.1,
    "imageUrl": "https://i.ytimg.com/vi/y07gLPfWnPY/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-142",
    "title": "Fields of Arle (2014)",
    "players": "1-2",
    "playTime": 120,
    "weight": 3.24,
    "imageUrl": "https://i.ytimg.com/vi/30y8lEvlWME/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAjKX4rNFn5DQzRDTOak583B9e0_A",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-143",
    "title": "Le Havre (2008)",
    "players": "1-5",
    "playTime": 150,
    "weight": 3.38,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/en/f/f6/Agricola_game.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-144",
    "title": "Ora et Labora (2011)",
    "players": "1-4",
    "playTime": 180,
    "weight": 3.52,
    "imageUrl": "https://dudetakeyourturn.ca/wp-content/uploads/2018/08/hansa-player-board1-e1534354369423.jpg?w=600",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-145",
    "title": "Caverna: The Cave Farmers (2013)",
    "players": "1-7",
    "playTime": 210,
    "weight": 3.66,
    "imageUrl": "https://i0.wp.com/meepleandthemoose.com/wp-content/uploads/2025/04/Caverna-2.jpg?resize=768,1024&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-146",
    "title": "Airlines Europe (2011)",
    "players": "2-5",
    "playTime": 75,
    "weight": 3.8,
    "imageUrl": "https://mblogthumb-phinf.pstatic.net/20111019_218/lein_13190280061252Ymzy_JPEG/r3.jpg?type=w420",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-147",
    "title": "Thurn and Taxis (2006)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.94,
    "imageUrl": "https://i.etsystatic.com/25500532/r/il/e1415d/3534507496/il_fullxfull.3534507496_19m5.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-148",
    "title": "Yinsh (2003)",
    "players": "2",
    "playTime": 60,
    "weight": 4.08,
    "imageUrl": "https://static.guides.co/pld/x9pwkSj1TpaTp3Kp9OK0_YINSH-Board-Game.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-149",
    "title": "Tzaar (2007)",
    "players": "2",
    "playTime": 60,
    "weight": 4.22,
    "imageUrl": "https://www.dicetower.com/sites/default/files/styles/original_medium/public/bgg_images/pic2490974.png.jpg?itok=aQPYcHI5",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-150",
    "title": "Hive (2001)",
    "players": "2",
    "playTime": 20,
    "weight": 4.36,
    "imageUrl": "https://zulusgames.com/cdn/shop/files/Simple_BG_-_alt_v3.jpg?v=1770930685",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-151",
    "title": "Santorini (2016)",
    "players": "2-3",
    "playTime": 20,
    "weight": 1.5,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0246/2190/8043/t/5/assets/b34c24a67aa7--IMG-3466-resized-a5ef46_700x.jpg?v=1761060954",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-152",
    "title": "Onitama (2014)",
    "players": "2",
    "playTime": 20,
    "weight": 1.64,
    "imageUrl": "https://boardgame.tips/images/the-castles-of-burgundy-special-edition.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-153",
    "title": "Chess (1475)",
    "players": "2",
    "playTime": 90,
    "weight": 1.78,
    "imageUrl": "https://www.sklep-szachy.pl/1471-large_default/chess-checkers-l.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-154",
    "title": "Go (2200 BC)",
    "players": "1-2",
    "playTime": 120,
    "weight": 1.92,
    "imageUrl": "https://cdn11.bigcommerce.com/s-76a6bv74ts/images/stencil/300x300/products/7577/54254/vintage-japanese-go-board-wood-1980s-showa-25s-471-5-1__89712.1766521535.JPG?c=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-155",
    "title": "Tak (2016)",
    "players": "2",
    "playTime": 60,
    "weight": 2.06,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2018/03/Tak-Gameplay.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-156",
    "title": "Backgammon (3000 BC)",
    "players": "2",
    "playTime": 30,
    "weight": 2.2,
    "imageUrl": "https://i.ebayimg.com/images/g/YNQAAeSwtplpo6oc/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-157",
    "title": "Mahjong (1850)",
    "players": "3-4",
    "playTime": 120,
    "weight": 2.34,
    "imageUrl": "https://mahjqueen.com/cdn/shop/files/NeonDaze.jpg?v=1767207378&width=1946",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-158",
    "title": "Shogi (1580)",
    "players": "2",
    "playTime": 60,
    "weight": 2.48,
    "imageUrl": "https://www.aobo-shop.es/73-thickbox_default/shogi-deluxe-set.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-159",
    "title": "Blokus (2000)",
    "players": "2-4",
    "playTime": 20,
    "weight": 2.62,
    "imageUrl": "https://www.shutterstock.com/image-photo/colorful-game-blokus-background-600nw-1456944755.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-160",
    "title": "Ingenious (2004)",
    "players": "1-4",
    "playTime": 45,
    "weight": 2.76,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2020/08/ingenious-colour-blind-friendly.jpg?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-161",
    "title": "Star Realms (2014)",
    "players": "2",
    "playTime": 20,
    "weight": 2.9,
    "imageUrl": "https://i.ytimg.com/vi/g-8nfRT3XGk/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-162",
    "title": "Hero Realms (2016)",
    "players": "2-4",
    "playTime": 30,
    "weight": 3.04,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/TalismanCover.jpg/250px-TalismanCover.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-163",
    "title": "Valley of the Kings (2014)",
    "players": "2-4",
    "playTime": 45,
    "weight": 3.18,
    "imageUrl": "https://i.ebayimg.com/images/g/9ycAAOSwiOdZqv1i/s-l400.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-164",
    "title": "Tyrants of the Underdark (2016)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.32,
    "imageUrl": "https://22games.net/wp-content/uploads/2022/12/Tyrants-of-the-Underdark-1.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-165",
    "title": "Dune (1979)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.46,
    "imageUrl": "https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/18957300/dune_original.jpg?q=50&fit=crop&w=815&dpr=1.5",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-166",
    "title": "Rex: Final Days of an Empire (2012)",
    "players": "3-6",
    "playTime": 180,
    "weight": 3.6,
    "imageUrl": "https://i.ebayimg.com/images/g/3FkAAOSwXgZdU~80/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-167",
    "title": "Twilight Struggle (2005)",
    "players": "2",
    "playTime": 180,
    "weight": 3.74,
    "imageUrl": "https://happygoluckyclonakilty.com/cdn/shop/files/back_4fdde394-d2cc-4dde-ab9a-c6a2dd99f58a_grande.png?v=1722008245",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-168",
    "title": "1960: The Making of the President (2007)",
    "players": "2",
    "playTime": 120,
    "weight": 3.88,
    "imageUrl": "https://m.media-amazon.com/images/I/81JrncqSc8L._AC_UF1000,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-169",
    "title": "Labyrinth: The Awakening, 2010 - ? (2010)",
    "players": "1",
    "playTime": 20,
    "weight": 4.02,
    "imageUrl": "https://img.dungeondice.it/115363-home_default/il-maledetto-dilemma.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-170",
    "title": "Sekigahara: The Unification of Japan (2011)",
    "players": "2",
    "playTime": 180,
    "weight": 4.16,
    "imageUrl": "https://theboardgameschronicle.com/wp-content/uploads/2019/01/157ba-sekigahara_pic_8.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-171",
    "title": "Command & Colors: Ancients (2006)",
    "players": "3-6",
    "playTime": 90,
    "weight": 4.3,
    "imageUrl": "https://kidult.co.uk/acatalog/GMT1608500.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-172",
    "title": "Memoir '44 (2004)",
    "players": "2-8",
    "playTime": 60,
    "weight": 4.44,
    "imageUrl": "https://memoir44fans-uploads.s3.dualstack.eu-west-1.amazonaws.com/original/1X/b93b1b58f2711f0ac836b482a7a1b70717a4cd69.jpeg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-173",
    "title": "Combat Commander: Europe (2006)",
    "players": "2",
    "playTime": 180,
    "weight": 1.58,
    "imageUrl": "https://www.shutupandsitdown.com/wp-content/uploads/2013/05/3ffeffcec20611e2bc75f23c91709c91_1369134287.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-174",
    "title": "Advanced Squad Leader (1985)",
    "players": "2",
    "playTime": 480,
    "weight": 1.72,
    "imageUrl": "https://i.ebayimg.com/images/g/FWgAAeSwc6hpbCTW/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-175",
    "title": "Up Front (1983)",
    "players": "2-3",
    "playTime": 60,
    "weight": 1.86,
    "imageUrl": "https://media-cdn.play.date/media/hardwareproducts/cover/Cover_share_card.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-176",
    "title": "Food Chain Magnate (2015)",
    "players": "2-5",
    "playTime": 240,
    "weight": 2,
    "imageUrl": "https://meeplerex.com/wp-content/uploads/2025/02/5-3-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-177",
    "title": "The Great Zimbabwe (2012)",
    "players": "2-5",
    "playTime": 150,
    "weight": 2.14,
    "imageUrl": "https://vaultedcollection.com/cdn/shop/files/Mega_Menu_-_Cards_-_Storage.jpg?v=1737151073",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-178",
    "title": "Antiquity (2004)",
    "players": "2-4",
    "playTime": 180,
    "weight": 2.28,
    "imageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9K5ysn5YOCNXEWfgw39YSiJXUDYSyTXofnvdF9xgCmPJkjJSHhVgaPkScrrJJLZLzrXgqInMlZZGVmH8RCkgDpwWuGVnQCk2UzWFskx4wmIvXIXd_Cogi4eVT7fswobzTaeZI40XUhPM/s1600/2012-10-21+ixus+002.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-179",
    "title": "Indonesia (2005)",
    "players": "2-5",
    "playTime": 240,
    "weight": 2.42,
    "imageUrl": "https://cf.geekdo-images.com/VHpg-svvRdLCzQdwk8dlIQ__small/img/PthMQwS5TZgFfNwoumGKXfYSGJQ=/fit-in/200x150/filters:strip_icc()/pic311440.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-180",
    "title": "1830: Railways & Robber Barons (1986)",
    "players": "2-7",
    "playTime": 360,
    "weight": 2.56,
    "imageUrl": "https://mblogthumb-phinf.pstatic.net/20160817_116/mocha9_14714421659851Hsgn_JPEG/20160815_130118.jpg?type=w420",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-181",
    "title": "18xx series (various)",
    "players": "1-2",
    "playTime": 30,
    "weight": 2.7,
    "imageUrl": "https://cube4me.com//wp-content/uploads/2024/06/revenue3.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-182",
    "title": "Age of Steam (2002)",
    "players": "1-6",
    "playTime": 120,
    "weight": 2.84,
    "imageUrl": "https://preview.redd.it/initial-steam-reactions-pc-gamer-2005-v0-77lk68yk68hg1.png?auto=webp&s=34adfc2ff168dd71cd80fa0d98424ad721b73756",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-183",
    "title": "Railways of the World (2005)",
    "players": "2-6",
    "playTime": 120,
    "weight": 2.98,
    "imageUrl": "https://www.snowmagazine.com/images/La Plagne Ski Resort Review Callum Jelley00781.jpg?t=1762523524293",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-184",
    "title": "Steam (2009)",
    "players": "3-5",
    "playTime": 90,
    "weight": 3.12,
    "imageUrl": "https://e.snmc.io/lk/o/x/857048d0d6e537bc4706f52625f38569/12808680",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-185",
    "title": "Container (2007)",
    "players": "3-5",
    "playTime": 90,
    "weight": 3.26,
    "imageUrl": "https://www.steelcitycollectibles.com/storage/img/uploads/products/full/pack-chase48500.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-186",
    "title": "Dominant Species (2010)",
    "players": "2-6",
    "playTime": 240,
    "weight": 3.4,
    "imageUrl": "https://cf.geekdo-images.com/GgBeTlRns_2fB6z6UOLc4w__imagepage/img/i9--xQ_myRg0jQ6fuYld-jzCyP0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic821675.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-187",
    "title": "High Frontier 4 All (2020)",
    "players": "1-5",
    "playTime": 240,
    "weight": 3.54,
    "imageUrl": "https://i.etsystatic.com/iap/bbd1c8/6974172695/iap_640x640.6974172695_snldxbfw.jpg?version=0",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-188",
    "title": "Leaving Earth (2015)",
    "players": "1-5",
    "playTime": 180,
    "weight": 3.68,
    "imageUrl": "https://static.wikia.nocookie.net/marveldatabase/images/8/89/X-Men_Vol_7_10_Textless.jpg/revision/latest?cb=20250202202519",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-189",
    "title": "SpaceCorp: 2025-2300AD (2018)",
    "players": "1-4",
    "playTime": 240,
    "weight": 3.82,
    "imageUrl": "https://boardlife.co.kr/wys2/swf_upload/2023/12/26/1703560982675828.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-190",
    "title": "Terra Mystica (2012)",
    "players": "2-5",
    "playTime": 150,
    "weight": 3.96,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2013/11/IMG_3988.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-191",
    "title": "Gaia Project (2017)",
    "players": "1-4",
    "playTime": 150,
    "weight": 4.1,
    "imageUrl": "https://m.media-amazon.com/images/I/81SvUuAVCCL.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-192",
    "title": "Clans (2002)",
    "players": "2-4",
    "playTime": 30,
    "weight": 4.24,
    "imageUrl": "https://i.ytimg.com/vi/D_MumgkWKfk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCx36F_Nw4gl0ve9iyYrLQ4zlRH5w",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-193",
    "title": "Web of Power (2000)",
    "players": "3-5",
    "playTime": 60,
    "weight": 4.38,
    "imageUrl": "https://media.newyorker.com/photos/6977a6404e4d4b703c6e76cd/2:2/w_1600,c_limit/JJ00007-26--square-web.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-194",
    "title": "Iwari (2020)",
    "players": "2-5",
    "playTime": 45,
    "weight": 1.52,
    "imageUrl": "https://bitewinggames.com/wp-content/uploads/2026/01/Gold-Country-Photos-Smaller-22-1024x683.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-195",
    "title": "Chinatown (1999)",
    "players": "3-5",
    "playTime": 60,
    "weight": 1.66,
    "imageUrl": "https://www.tiktok.com/api/img/?itemId=7552300189478964492&location=0&aid=1988",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-196",
    "title": "Bohnanza (1997)",
    "players": "2-7",
    "playTime": 45,
    "weight": 1.8,
    "imageUrl": "https://www.firetoys.co.uk/cdn/shop/files/Screenshot_3.png?v=1747651285&width=1440",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-197",
    "title": "Modern Art (1992)",
    "players": "3-5",
    "playTime": 45,
    "weight": 1.94,
    "imageUrl": "https://cf.geekdo-images.com/imagepagezoom/img/ytHM1kv-jOPFTQDPXhM9e8xd4HQ=/fit-in/1200x900/filters:no_upscale()/pic5494481.png",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-198",
    "title": "Ra (1999)",
    "players": "2-5",
    "playTime": 60,
    "weight": 2.08,
    "imageUrl": "https://ph-test-11.slatic.net/p/092131a2d4b3b1f8923171dac69125a4.jpg",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-199",
    "title": "High Society (1995)",
    "players": "3-5",
    "playTime": 30,
    "weight": 2.22,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=2906271236144062",
    "totalPlays": 0
  },
  {
    "id": "bgg-real-200",
    "title": "For Sale (1997)",
    "players": "3-6",
    "playTime": 30,
    "weight": 2.36,
    "imageUrl": "https://i.ebayimg.com/images/g/rOMAAOSwJJ1lLXzE/s-l400.jpg",
    "totalPlays": 0
  }
];

const initialPlayers: Player[] = [
  { id: 'p1', name: 'Nahyup', group: 'User', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nahyup' },
  { id: 'p2', name: 'Mom', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom' },
  { id: 'p3', name: 'Dad', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dad' },
  { id: 'p4', name: 'Sister', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sister' },
  { id: 'p5', name: 'Brother', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brother' },
];

const customApiStorage: StateStorage = {
  getItem: async (_name: string): Promise<string | null> => {
    try {
      const response = await fetch('/api/data');
      if (!response.ok) return null;
      const data = await response.json();
      // data.json just contains the raw json string without the specific name key
      // but to mimic localStorage zustand expects it to return the whole serialized state
      return data ? JSON.stringify(data) : null;
    } catch (error) {
      console.error('Failed to load from auto-save API', error);
      return null;
    }
  },
  setItem: async (_name: string, value: string): Promise<void> => {
    try {
      // The value here is already a serialized JSON string from Zustand
      await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: value,
      });
    } catch (error) {
      console.error('Failed to auto-save to API', error);
    }
  },
  removeItem: async (_name: string): Promise<void> => {
    // We don't really support 'removing' the file via the client in this setup, 
    // it would just save empty state.
    console.log(_name, 'has been deleted');
  },
};

export const useBoardGameStore = create<BoardGameState>()(
  persist(
    (set) => ({
      games: initialGames,
      players: initialPlayers,
      logs: [],

      addGame: (gameData) => set((state) => ({
        games: [...state.games, { ...gameData, id: crypto.randomUUID(), totalPlays: 0 }]
      })),

      updateGame: (id, gameData) => set((state) => ({
        games: state.games.map(g => g.id === id ? { ...g, ...gameData } : g)
      })),

      deleteGame: (id) => set((state) => ({
        games: state.games.filter(g => g.id !== id),
        logs: state.logs.filter(l => l.gameId !== id) // Cascade delete logs
      })),

      addPlayer: (playerData) => set((state) => ({
        players: [...state.players, { ...playerData, id: crypto.randomUUID() }]
      })),

      updatePlayer: (id, playerData) => set((state) => ({
        players: state.players.map(p => p.id === id ? { ...p, ...playerData } : p)
      })),

      deletePlayer: (id) => set((state) => ({
        players: state.players.filter(p => p.id !== id)
      })),

      addLog: (logData) => set((state) => {
        const newLog = { ...logData, id: crypto.randomUUID() };
        // Increment total plays for the game
        const updatedGames = state.games.map(g => 
          g.id === logData.gameId ? { ...g, totalPlays: g.totalPlays + 1 } : g
        );
        return { logs: [...state.logs, newLog], games: updatedGames };
      }),

      updateLog: (id, logData) => set((state) => {
        const oldLog = state.logs.find(l => l.id === id);
        if (!oldLog) return state;

        const isGameChanged = logData.gameId && logData.gameId !== oldLog.gameId;

        return {
          logs: state.logs.map(l => l.id === id ? { ...l, ...logData } : l),
          // If the game was changed, decrement the old game's play count and increment the new one's.
          games: isGameChanged ? state.games.map(g => {
            if (g.id === oldLog.gameId) return { ...g, totalPlays: Math.max(0, g.totalPlays - 1) };
            if (g.id === logData.gameId) return { ...g, totalPlays: g.totalPlays + 1 };
            return g;
          }) : state.games
        };
      }),

      deleteLog: (id) => set((state) => {
        const logToRemove = state.logs.find(l => l.id === id);
        if (!logToRemove) return state;
        
        // Decrement total plays
        const updatedGames = state.games.map(g => 
          g.id === logToRemove.gameId ? { ...g, totalPlays: Math.max(0, g.totalPlays - 1) } : g
        );
        
        return { 
          logs: state.logs.filter(l => l.id !== id),
          games: updatedGames
        };
      }),
      
      importData: (data) => set(() => {
        return {
          games: data.games || [],
          players: data.players || [],
          logs: data.logs || []
        };
      })
    }),
    {
      name: 'dice-five-storage', // key in local storage/api
      storage: createJSONStorage(() => customApiStorage),
    }
  )
);
