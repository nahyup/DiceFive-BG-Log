import { create } from 'zustand';
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware';

export type GameStatus = 'Owned' | 'Owned by Friends' | 'Wishlist' | 'Preorder';

export interface Game {
  id: string;
  title: string;
  subtitle?: string; // Optional subtitle (e.g., Korean title)
  players: string; // e.g., '2-5'
  playTime: number; // minutes
  weight: number; // 1.0 - 5.0
  imageUrl: string;
  totalPlays: number;
  publishedYear?: number;
  status?: GameStatus; // Ownership status
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
  winnerIds: string[]; // All 1st-place winners (1 for sole winner, >1 for ties)
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
    "id": "70c4f864-4188-4485-bc5b-0e08ba7cdd9f",
    "title": "Brass: Birmingham (2018)",
    "players": "2-4",
    "playTime": 120,
    "weight": 3.89,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2018/12/brass-lancashire-1024x1024.jpg?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "67deee70-29f9-4550-bc7f-53c4e66cf636",
    "title": "Pandemic Legacy: Season 1 (2015)",
    "players": "2-4",
    "playTime": 60,
    "weight": 2.84,
    "imageUrl": "https://cdn.arstechnica.net/wp-content/uploads/2016/03/IMG_9737-1-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "120ce9aa-3472-4d2e-a576-d237c5abaef5",
    "title": "Gloomhaven (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.9,
    "imageUrl": "https://uploads-ssl.webflow.com/5d64e96a371eb709ccf90df6/61dd41eddf94f997ec5969db_14a04c0a894fc04de4aae62f53a7c2a0_original.jpg",
    "totalPlays": 0
  },
  {
    "id": "da80797e-fafc-4cdb-8f7c-78e51e257840",
    "title": "Ark Nova (2021)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3.73,
    "imageUrl": "https://cdn.shoplightspeed.com/shops/636231/files/38772737/1652x1652x2/capstone-games-ark-nova.jpg",
    "totalPlays": 0
  },
  {
    "id": "23803779-1d53-48f5-a11a-1c6adafc2f07",
    "title": "Twilight Imperium: Fourth Edition (2017)",
    "players": "3-6",
    "playTime": 480,
    "weight": 4.31,
    "imageUrl": "https://cdn.mos.cms.futurecdn.net/yobCcnonxriPFt5sECrT5o.jpg",
    "totalPlays": 0
  },
  {
    "id": "d0c021f4-5a73-42e1-b97d-3d7acd0f90f6",
    "title": "Terraforming Mars (2016)",
    "players": "1-5",
    "playTime": 120,
    "weight": 3.26,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2020/06/TheDicetroyers_Terraforming-Mars-All-In-Lifted-Base-02.jpg",
    "totalPlays": 0
  },
  {
    "id": "0baaf7d7-efc5-4be0-bbe3-306cf27a0138",
    "title": "Dune: Imperium (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.03,
    "imageUrl": "https://i.etsystatic.com/53579343/r/il/0cc444/7317679828/il_fullxfull.7317679828_n4jn.jpg",
    "totalPlays": 0
  },
  {
    "id": "4ffe6bd7-4150-45ff-a0d7-d740368fb909",
    "title": "Star Wars: Rebellion (2016)",
    "players": "2-4",
    "playTime": 240,
    "weight": 3.75,
    "imageUrl": "https://starwarsunlimited.com/_next/image?url=https://cdn.starwarsunlimited.com/SWH_Button_Two_Player_Starter_Box_c5d05561ac.png&w=384&q=75",
    "totalPlays": 0
  },
  {
    "id": "2b1b8908-dec0-4a58-9b58-f6a7c10d763e",
    "title": "War of the Ring: Second Edition (2011)",
    "players": "2-4",
    "playTime": 180,
    "weight": 4.21,
    "imageUrl": "https://ks.aresgames.eu/wp-content/uploads/2024/12/WOTR030.jpg",
    "totalPlays": 0
  },
  {
    "id": "9ca1a5de-0276-4c9b-a4ce-62892f7fb209",
    "title": "Spirit Island (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 4.06,
    "imageUrl": "https://i0.wp.com/gideonsgaming.com/wp-content/uploads/2020/12/scenarios-adversaries-1.png?resize=719,404&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "75b103f0-72cb-4914-be48-4d82d2edc02e",
    "title": "Scythe (2016)",
    "players": "1-5",
    "playTime": 115,
    "weight": 3.44,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2017/10/Scythe-The-Wind-Gambit.jpg",
    "totalPlays": 0
  },
  {
    "id": "14130fcb-a8c4-4e99-83a4-ff0ff6096452",
    "title": "Cascadia (2021)",
    "players": "1-4",
    "playTime": 45,
    "weight": 1.84,
    "imageUrl": "https://www.geekyhobbies.com/wp-content/uploads/2025/10/Cascadia-Box-728x410.jpg.webp",
    "totalPlays": 0
  },
  {
    "id": "14f668cf-4ecd-433f-af6a-1e90a1177721",
    "title": "The Castles of Burgundy (2011)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.99,
    "imageUrl": "https://media.printables.com/media/prints/941234/images/7195899_f7bb400f-4021-4776-a7e5-7a0b3b7a0919_c9c39d5e-ac34-44a4-ab88-05b12c59974d/thumbs/inside/1280x960/jpg/duchy_comparison.webp",
    "totalPlays": 0
  },
  {
    "id": "2db3540f-0551-44cd-b924-064c308e5224",
    "title": "7 Wonders Duel (2015)",
    "players": "2",
    "playTime": 30,
    "weight": 2.23,
    "imageUrl": "https://makerworld.bblmw.com/makerworld/model/UScc66dc3aa8bf35/378235970/instance/2025-08-12_0ffa0484b8309.jpg",
    "totalPlays": 0
  },
  {
    "id": "9b9d362a-6a0b-4bc5-bb0b-f43bb16342d6",
    "title": "Wingspan (2019)",
    "players": "1-5",
    "playTime": 70,
    "weight": 2.45,
    "imageUrl": "https://orionmagazine.org/wp-content/uploads/2023/11/faith-wingspan2-1400x1050.jpg",
    "totalPlays": 0
  },
  {
    "id": "0dd52813-1b31-4008-a642-5701e6fb1fc4",
    "title": "Concordia (2013)",
    "players": "2-5",
    "playTime": 100,
    "weight": 3.01,
    "imageUrl": "https://www.gaminglib.com/cdn/shop/files/concordia-783073.webp?v=1753954505&width=1200",
    "totalPlays": 0
  },
  {
    "id": "561d5262-46d3-463b-893e-ba1b9b27bd4a",
    "title": "Root (2018)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.79,
    "imageUrl": "https://accidentallycoolgames.com/cdn/shop/products/91E7bCmI2HL._AC_SL1500_800x.png?v=1678807108",
    "totalPlays": 0
  },
  {
    "id": "0671cf43-e199-4597-b8b4-020b7f5c1d62",
    "title": "Everdell (2018)",
    "players": "1-4",
    "playTime": 80,
    "weight": 2.81,
    "imageUrl": "https://m.media-amazon.com/images/I/719r3B3tFEL.jpg_BO30,255,255,255_UF750,750_SR1910,1000,0,C_QL100_.jpg",
    "totalPlays": 0
  },
  {
    "id": "ac7cffb2-18f6-4b93-902f-5bea2562a04c",
    "title": "A Feast for Odin (2016)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.86,
    "imageUrl": "https://imgv2-2-f.scribdassets.com/img/document/516757980/original/78721ba52f/1?v=1",
    "totalPlays": 0
  },
  {
    "id": "027b38bf-aad4-48db-9cbf-2da5ba98ded2",
    "title": "Great Western Trail (2016)",
    "players": "2-4",
    "playTime": 150,
    "weight": 3.72,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10168272670030551",
    "totalPlays": 0
  },
  {
    "id": "b5642a64-35f9-4839-b4d7-77fed19a06dc",
    "title": "Orléans (2014)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.04,
    "imageUrl": "https://i.pinimg.com/736x/80/fc/5e/80fc5e431f18d1ba23461d9d6e8557da.jpg",
    "totalPlays": 0
  },
  {
    "id": "30385100-5182-4187-9c07-d1e5e1aa1736",
    "title": "Lost Ruins of Arnak (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.89,
    "imageUrl": "https://images-eu.ssl-images-amazon.com/images/I/71CEIxrzSZL._AC_UL495_SR435,495_.jpg",
    "totalPlays": 0
  },
  {
    "id": "1c8e0fe7-2c58-498a-bafb-ed0750b196a3",
    "title": "Blood Rage (2015)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.88,
    "imageUrl": "https://i.ebayimg.com/images/g/Z~oAAOSwfJFmR6ht/s-l1200.jpg",
    "totalPlays": 0
  },
  {
    "id": "92fef6ea-9320-4a6a-977f-fbf3b36892da",
    "title": "Eclipse: Second Dawn for the Galaxy (2020)",
    "players": "2-6",
    "playTime": 200,
    "weight": 3.65,
    "imageUrl": "https://thefriendlyboardgamer.wordpress.com/wp-content/uploads/2021/01/pxl_20210123_131008300.jpg?w=1024",
    "totalPlays": 0
  },
  {
    "id": "7c1f26f6-0558-4ad8-9908-e65a7e94e3a9",
    "title": "Mage Knight Board Game (2011)",
    "players": "1-4",
    "playTime": 240,
    "weight": 4.35,
    "imageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEioMXqT93nVeZK4EOzXFVjbeUTzPM5tqWIRdvYWPy50zz5Hb610QQtNJpg5LZDoIr-1CmK4t8D5BibHKAskjLXHVbhpHEis8LzVxhWl5bukKyYBwYWTCWH4TrcQ1g5s8QmxILk6v8qtLqs/s1600/DSC04589.JPG",
    "totalPlays": 0
  },
  {
    "id": "7911fafa-ebaa-40fa-b47b-ead0cde6eb35",
    "title": "The Crew: The Quest for Planet Nine (2019)",
    "players": "2-5",
    "playTime": 20,
    "weight": 1.98,
    "imageUrl": "https://bitewinggames.com/wp-content/uploads/2024/06/MostAnticipatedGamesof2024Part2.jpg",
    "totalPlays": 0
  },
  {
    "id": "393fd487-051a-4145-b7a1-04931b55b568",
    "title": "Tzolk'in: The Mayan Calendar (2012)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.68,
    "imageUrl": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3433279304891954244",
    "totalPlays": 0
  },
  {
    "id": "21ff18ea-6387-4e7a-891c-25bba2b66d8f",
    "title": "Mansions of Madness: Second Edition (2016)",
    "players": "1-5",
    "playTime": 180,
    "weight": 2.68,
    "imageUrl": "https://i.ytimg.com/vi/Sci-MctxWJc/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "12a51423-d076-479a-bcad-d2adf0007b46",
    "title": "Marvel Champions: The Card Game (2019)",
    "players": "1-4",
    "playTime": 90,
    "weight": 2.95,
    "imageUrl": "https://theboardgamecollection.com/wp-content/uploads/2024/02/6V3OCP1unIEu4Ahh1PvL1Iho43IgWMh72iRd0tN06eo2Sx4EHNUzeuFXAoxX0pdCAxtN0iYVk12K7Mg4CjDxIUmAwJBts5JMrIwhZve6Q3J4VEkPJKXALenhg5kIRwaupXnoyS-xOmQL.jpg",
    "totalPlays": 0
  },
  {
    "id": "7d9443e2-cd93-4019-9b86-bd145a2e895d",
    "title": "Clank! Legacy: Acquisitions Incorporated (2019)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.76,
    "imageUrl": "https://cannibalhalflinggaming.com/wp-content/uploads/2019/04/acqinc-e1554665305382.jpg?w=672&h=372&crop=1",
    "totalPlays": 0
  },
  {
    "id": "d97e8d3c-d5db-435b-906d-ed8c9bdd3eb2",
    "title": "Azul (2017)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.76,
    "imageUrl": "https://www.artofplay.com/cdn/shop/products/azul-gameboard_4bd62a84-3da9-4a72-9189-4a124a58d271.png?v=1636415879&width=1024",
    "totalPlays": 0
  },
  {
    "id": "ded7454e-671d-4407-99f4-2c140dda0e1a",
    "title": "Viticulture Essential Edition (2015)",
    "players": "1-6",
    "playTime": 90,
    "weight": 2.89,
    "imageUrl": "https://tabletopmerchant.com/cdn/shop/files/ViticultureGameplay6_800x.jpg?v=1736975384",
    "totalPlays": 0
  },
  {
    "id": "7b23d6b5-c40b-45c5-a8c0-330b3301db1a",
    "title": "Crokinole (1876)",
    "players": "2-4",
    "playTime": 30,
    "weight": 1.25,
    "imageUrl": "https://i.ytimg.com/vi/P_cB2tyD36g/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "f90bfa92-f551-4d99-9b66-a15e949f20f0",
    "title": "Pax Pamir: Second Edition (2019)",
    "players": "1-5",
    "playTime": 120,
    "weight": 3.85,
    "imageUrl": "https://spritesanddice.com/media/images/pax_pamir_close_up.width-1080.jpg",
    "totalPlays": 0
  },
  {
    "id": "03025ba5-a83d-4787-a13a-bb4b2487607e",
    "title": "Through the Ages: A New Story of Civilization (2015)",
    "players": "2-4",
    "playTime": 120,
    "weight": 4.45,
    "imageUrl": "https://images.squarespace-cdn.com/content/v1/54dc217de4b05cd95c7305b4/c3149136-6787-4d2d-90ff-cb818cf88afe/Lisa.jpg",
    "totalPlays": 0
  },
  {
    "id": "7c0b7360-573c-4f92-84ad-51490dd4c8fa",
    "title": "The Quacks of Quedlinburg (2018)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.95,
    "imageUrl": "https://opinionatedgamers.com/wp-content/uploads/2018/05/edited6.jpg",
    "totalPlays": 0
  },
  {
    "id": "4c40b3c2-0660-4e8a-a63d-9d21e72da84a",
    "title": "Catan (1995)",
    "players": "3-4",
    "playTime": 120,
    "weight": 2.31,
    "imageUrl": "https://makerworld.bblmw.com/makerworld/model/USb16c0c90f5f2d3/design/2025-11-04_32bd97e956b3f.jpg?x-oss-process=image/resize,w_400/format,webp",
    "totalPlays": 0
  },
  {
    "id": "3e1644ea-750f-41f7-a7a9-c070bde392f2",
    "title": "Ticket to Ride (2004)",
    "players": "2-5",
    "playTime": 60,
    "weight": 1.83,
    "imageUrl": "https://www.autostraddle.com/wp-content/uploads/2013/01/photo-31.jpeg?fit=1352,924",
    "totalPlays": 0
  },
  {
    "id": "63e37a61-420a-446a-8b36-55f062f36e0b",
    "title": "Carcassonne (2000)",
    "players": "2-5",
    "playTime": 45,
    "weight": 1.9,
    "imageUrl": "https://media.karousell.com/media/photos/products/2024/6/19/carcassonne_chinese_editions_1718764175_28691dc7_progressive.jpg",
    "totalPlays": 0
  },
  {
    "id": "376bdad5-d339-47a3-bfa0-5c3e7968a6c7",
    "title": "Splendor (2014)",
    "players": "2-4",
    "playTime": 30,
    "weight": 1.78,
    "imageUrl": "https://www.thebigbox.co.za/wp-content/uploads/2016/11/splendor_cover_1024x1024-400x400.jpg",
    "totalPlays": 0
  },
  {
    "id": "6b0b8b6f-ac90-4c25-8883-be840938fa8a",
    "title": "Patchwork (2014)",
    "players": "2",
    "playTime": 30,
    "weight": 1.6,
    "imageUrl": "https://meeplelikeus.b-cdn.net/wp-content/uploads/2016/05/20160514_135822.jpg",
    "totalPlays": 0
  },
  {
    "id": "d55cdcea-ad6b-4d7e-9a4e-68e8dcdf08b2",
    "title": "Dominion (2008)",
    "players": "2-4",
    "playTime": 30,
    "weight": 2.35,
    "imageUrl": "http://thethoughtfulgamer.com/wp-content/uploads/2017/10/20171016_191135-e1508195850795.jpg",
    "totalPlays": 0
  },
  {
    "id": "32a0b167-5d25-4e1e-b3ec-b4f2c81df539",
    "title": "7 Wonders (2010)",
    "players": "2-7",
    "playTime": 30,
    "weight": 2.32,
    "imageUrl": "https://i.etsystatic.com/14639321/r/il/7f3055/7534792967/il_fullxfull.7534792967_drnz.jpg",
    "totalPlays": 0
  },
  {
    "id": "6ce92127-fa0c-40ff-bfd5-d4427d9e9039",
    "title": "Agricola (2007)",
    "players": "1-5",
    "playTime": 150,
    "weight": 3.64,
    "imageUrl": "https://i.ebayimg.com/images/g/NMMAAeSwu9xo3WrF/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "843aadef-cdd8-4f37-be5b-da232e432c26",
    "title": "Race for the Galaxy (2007)",
    "players": "2-4",
    "playTime": 60,
    "weight": 2.99,
    "imageUrl": "https://i.redd.it/race-for-the-galaxy-box-organizer-v0-9q3432a77rgc1.jpg?width=3472&format=pjpg&auto=webp&s=d0bdc61ae5c64a77193f7490a58d99fc9faaa2a4",
    "totalPlays": 0
  },
  {
    "id": "f2742e47-fbe1-4301-b591-0274f5c583bb",
    "title": "Puerto Rico (2002)",
    "players": "3-5",
    "playTime": 150,
    "weight": 3.27,
    "imageUrl": "https://i.ebayimg.com/images/g/SNwAAOSwzjtnYMUD/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "e8c4357a-0793-449e-9355-7c371556dc47",
    "title": "Power Grid (2004)",
    "players": "2-6",
    "playTime": 120,
    "weight": 3.26,
    "imageUrl": "https://archive.org/services/img/nintendo-power-issue-184-october-2004/full/pct:200/0/default.jpg",
    "totalPlays": 0
  },
  {
    "id": "aa53e890-52a5-478a-9b94-3c11a320a3ed",
    "title": "El Grande (1995)",
    "players": "2-5",
    "playTime": 120,
    "weight": 3.05,
    "imageUrl": "https://storage.googleapis.com/ludopedia-imagens-jogo/fdbe6_58791.jpg",
    "totalPlays": 0
  },
  {
    "id": "ba94cedd-846a-4534-a391-e8da6175a6cd",
    "title": "Brass: Lancashire (2007)",
    "players": "2-4",
    "playTime": 120,
    "weight": 3.86,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/ESDPSAH06EN_Cover-scaled.webp?crop=center&height=400&v=1770961284&width=300",
    "totalPlays": 0
  },
  {
    "id": "371121e3-d95d-4546-83bc-91f41b6c6be7",
    "title": "Tigris & Euphrates (1997)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.51,
    "imageUrl": "https://i.ebayimg.com/images/g/5t4AAeSwRAJopp3j/s-l300.jpg",
    "totalPlays": 0
  },
  {
    "id": "cb25ca43-a9e6-426b-a8f5-7ba7ad5d0ed3",
    "title": "Star Wars: Imperial Assault (2014)",
    "players": "1-5",
    "playTime": 120,
    "weight": 2.5,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10231464218322430",
    "totalPlays": 0
  },
  {
    "id": "6c21b66f-ad65-4f14-a849-a8a1f42f0675",
    "title": "Dune: Imperium – Uprising (2023)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.64,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2024/01/store_diu_cards_900x.webp?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "468ac354-5fac-416b-b682-6bbd47ae00ff",
    "title": "Inis (2016)",
    "players": "2-4",
    "playTime": 90,
    "weight": 2.78,
    "imageUrl": "https://flamingdicereviews.files.wordpress.com/2016/12/inis-action-cards.jpg?w=487&h=274",
    "totalPlays": 0
  },
  {
    "id": "fc169129-45fe-4bcf-aad6-76829c6ecb48",
    "title": "Cosmic Encounter (2008)",
    "players": "3-6",
    "playTime": 60,
    "weight": 2.92,
    "imageUrl": "https://www.despelvogel.com/wp-content/uploads/2018/08/ce01_42ed_planets-plastics.png",
    "totalPlays": 0
  },
  {
    "id": "2e309585-8e3b-4041-b3db-4df637fe6ebc",
    "title": "Kemet (2012)",
    "players": "2-5",
    "playTime": 120,
    "weight": 3.06,
    "imageUrl": "https://i.ytimg.com/vi/_U-ywSHV8Zk/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "48e9f77c-7e36-4777-81d4-d264c7dfd1c9",
    "title": "Hansa Teutonica (2009)",
    "players": "2-5",
    "playTime": 90,
    "weight": 3.2,
    "imageUrl": "https://juegosdelamesaredonda.com/18475-large_default/hansa-teutonica-new-edition-english.jpg",
    "totalPlays": 0
  },
  {
    "id": "c282216c-7b38-4f42-94f2-0bca0f78d13d",
    "title": "Ra (1999)",
    "players": "2-5",
    "playTime": 60,
    "weight": 3.34,
    "imageUrl": "https://thegamesarehere.com/cdn/shop/products/ShogunRavensburger1983_10_grande.jpg?v=1627418410",
    "totalPlays": 0
  },
  {
    "id": "5f311273-ecef-4f42-8f47-1b83fbcace7b",
    "title": "Scythe: Invaders from Afar (2016)",
    "players": "1-5",
    "playTime": 115,
    "weight": 3.48,
    "imageUrl": "https://m.media-amazon.com/images/I/51nsXWkzcOL._AC_UF894,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "4c871913-c91c-4d0f-af81-69e03f54ff98",
    "title": "Radlands (2021)",
    "players": "2",
    "playTime": 40,
    "weight": 3.62,
    "imageUrl": "https://preview.redd.it/couldnt-fit-the-radlands-expansion-in-the-base-box-since-we-v0-f67hm0gxb88e1.jpg?width=640&crop=smart&auto=webp&s=46ddc821fdcfdca2298fc3e5df126df9fd315a99",
    "totalPlays": 0
  },
  {
    "id": "6dcaae7b-6db3-4aee-8e47-6e99c4c4bb33",
    "title": "The Resistance: Avalon (2012)",
    "players": "5-10",
    "playTime": 30,
    "weight": 3.76,
    "imageUrl": "https://overhauledgames.com.au/wp-content/uploads/2025/10/Betrayal-at-House-on-the-Hill-3rd-Edition-Board-Game-1-300x300.jpg",
    "totalPlays": 0
  },
  {
    "id": "d3fe239f-2271-460f-a9fa-e6e252474056",
    "title": "Decrypto (2018)",
    "players": "3-8",
    "playTime": 45,
    "weight": 3.9,
    "imageUrl": "https://external-preview.redd.it/most-anticipated-board-games-of-2026-bitewing-games-v0-T07wlQhDyRAqUSrf1NbCqmBpU6-G1nlhtdyVfitTEdo.jpeg?auto=webp&s=91160e0ebf8d6bd47fe263ebfb30c71156e9b753",
    "totalPlays": 0
  },
  {
    "id": "2fea0178-86ec-4680-afda-bf2c35c43f84",
    "title": "Just One (2018)",
    "players": "3-7",
    "playTime": 20,
    "weight": 4.04,
    "imageUrl": "https://i.ytimg.com/vi/l5GmPTMx2Xo/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "63b91399-7feb-4997-a445-12febe9ea718",
    "title": "Wavelength (2019)",
    "players": "4-8",
    "playTime": 45,
    "weight": 4.18,
    "imageUrl": "https://www.huzzahtoys.com/cdn/shop/files/Wavelength_5.jpg?v=1738626993",
    "totalPlays": 0
  },
  {
    "id": "c1956019-c4f6-4833-beaf-bd2c07a3ab8c",
    "title": "Codenames (2015)",
    "players": "2-8",
    "playTime": 15,
    "weight": 4.32,
    "imageUrl": "https://imaginaire.com/en/images/CODENAMES-BASE-GAME-XXL-–-2ND-EDITION-ENGLISH__8594156311360-1.JPG",
    "totalPlays": 0
  },
  {
    "id": "2df8fa1a-1956-4f94-9041-f20ef8e2dd64",
    "title": "Secret Hitler (2016)",
    "players": "5-10",
    "playTime": 45,
    "weight": 4.46,
    "imageUrl": "https://i.etsystatic.com/29390321/r/il/98538d/6173478368/il_340x270.6173478368_crrx.jpg",
    "totalPlays": 0
  },
  {
    "id": "580f296f-1752-43c3-b40a-a98d1185801c",
    "title": "Deception: Murder in Hong Kong (2014)",
    "players": "4-12",
    "playTime": 20,
    "weight": 1.6,
    "imageUrl": "https://i.ytimg.com/vi/ojhUGtnyecA/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGUgVChKMA8=&rs=AOn4CLArLRynylq4B1xisAHIZFq0x2AJeg",
    "totalPlays": 0
  },
  {
    "id": "aa50c661-5cd5-4ed6-8ba4-f2116139bb36",
    "title": "Lords of Waterdeep (2012)",
    "players": "2-5",
    "playTime": 120,
    "weight": 1.74,
    "imageUrl": "https://spacebiff.com/wp-content/uploads/2012/04/15-fancy-box.jpg",
    "totalPlays": 0
  },
  {
    "id": "e92cd31c-4052-4156-aa0d-2bbea33891d2",
    "title": "Stone Age (2008)",
    "players": "2-4",
    "playTime": 90,
    "weight": 1.88,
    "imageUrl": "https://media.printables.com/media/prints/374402/images/3150897_5df722cf-d368-4db7-9dde-3f0ed3ef893c/thumbs/inside/1280x960/jpeg/img_0554.webp",
    "totalPlays": 0
  },
  {
    "id": "6eb385f4-2265-476c-a134-9938bb711a0c",
    "title": "Watergate (2019)",
    "players": "2",
    "playTime": 60,
    "weight": 2.02,
    "imageUrl": "https://preview.redd.it/top-100-board-games-of-all-time-2024-edition-games-75-51-v0-05kf9un2d5vd1.jpg?width=1028&format=pjpg&auto=webp&s=f012cb465ba82738d7b50a9ea7da6c4b24ca461e",
    "totalPlays": 0
  },
  {
    "id": "1f3e4859-dbe3-450e-b9b0-8ae91cb53ad0",
    "title": "Targi (2012)",
    "players": "2",
    "playTime": 60,
    "weight": 2.16,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2012/07/village.jpg",
    "totalPlays": 0
  },
  {
    "id": "094e4e86-5f30-4e47-8ec7-e1fd8a7d53d1",
    "title": "Five Tribes (2014)",
    "players": "2-4",
    "playTime": 80,
    "weight": 2.3,
    "imageUrl": "https://i.ytimg.com/vi/tBCjDFgHioU/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "919348a1-aa50-4469-bf3f-b040ff1085e0",
    "title": "Troyes (2010)",
    "players": "1-4",
    "playTime": 90,
    "weight": 2.44,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2012/02/last-will.jpg",
    "totalPlays": 0
  },
  {
    "id": "c0ad7314-9809-4a28-89f7-21fcd6810b14",
    "title": "Keyflower (2012)",
    "players": "2-6",
    "playTime": 120,
    "weight": 2.58,
    "imageUrl": "https://www.donteatthemeeples.com/content/images/2025/08/264c2006-964b-43a5-bed0-1e322be81beb_3000x2000-jpeg.jpg",
    "totalPlays": 0
  },
  {
    "id": "f11f29ae-0719-413e-8e55-98bf37897a82",
    "title": "Grand Austria Hotel (2015)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.72,
    "imageUrl": "https://m.media-amazon.com/images/I/51j5DFkpAwL._AC_UF894,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "d7ccf01d-9d9e-4f15-8cd1-bff8988afa74",
    "title": "Lorenzo il Magnifico (2016)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.86,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2022/07/The-Dicetroyers-Lorenzo-il-magnifico-Big-Box-04.jpg",
    "totalPlays": 0
  },
  {
    "id": "33ebce8e-b9e9-4c76-9e03-b856b08e8207",
    "title": "The Gallerist (2015)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3,
    "imageUrl": "https://i.etsystatic.com/47668388/r/il/eafedd/7604152042/il_fullxfull.7604152042_qix4.jpg",
    "totalPlays": 0
  },
  {
    "id": "e7a04b25-570f-47f3-a126-7b861b512418",
    "title": "Lisboa (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.14,
    "imageUrl": "https://wobgames.net/wp-content/uploads/2020/08/burano-boardgame-430x430.jpg",
    "totalPlays": 0
  },
  {
    "id": "d7ae6728-0032-4db9-993f-7811636fc5d1",
    "title": "On Mars (2020)",
    "players": "1-4",
    "playTime": 150,
    "weight": 3.28,
    "imageUrl": "https://tabletopbellhop.com/wp-content/uploads/2020/01/hqdefault1-4.jpg",
    "totalPlays": 0
  },
  {
    "id": "6b4a1ff6-3374-44f9-a992-f3d2cb14aae4",
    "title": "Kanban EV (2020)",
    "players": "1-4",
    "playTime": 180,
    "weight": 3.42,
    "imageUrl": "https://i.etsystatic.com/22133352/r/il/60f8e0/6334415822/il_fullxfull.6334415822_epro.jpg",
    "totalPlays": 0
  },
  {
    "id": "17e38212-196b-4dd3-88e3-91dfa0a8a263",
    "title": "Vinhos Deluxe Edition (2016)",
    "players": "1-4",
    "playTime": 135,
    "weight": 3.56,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/pic8923324.jpg?crop=center&height=400&v=1753764546&width=300",
    "totalPlays": 0
  },
  {
    "id": "6c6dd8cc-a85d-4f9d-a55b-2c8603c0c323",
    "title": "Clans of Caledonia (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.7,
    "imageUrl": "https://cdn.thingiverse.com/assets/2d/75/7d/8d/71/featured_preview_DSC_0696.JPG",
    "totalPlays": 0
  },
  {
    "id": "7926d9a7-2e2b-4f7c-94b1-24c75ca6364e",
    "title": "Teotihuacan: City of Gods (2018)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.84,
    "imageUrl": "https://boardanddice.com/wp-content/uploads/2022/01/Teotihuacan-Rozgrywka-10-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "eb3f77c3-7a92-4d3e-9902-fca87b571123",
    "title": "Barrage (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.98,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2020/02/TheDicetroyers_Barrage-00a-1.jpg",
    "totalPlays": 0
  },
  {
    "id": "3b9d5ac2-2a79-414d-b858-f21c382b4263",
    "title": "Nemesis (2018)",
    "players": "1-5",
    "playTime": 180,
    "weight": 4.12,
    "imageUrl": "https://steamforged.com/cdn/shop/products/SFRE3-001-TheBoardGame-Box-Back-Flat.png?v=1743078715&width=750",
    "totalPlays": 0
  },
  {
    "id": "083507f7-a830-48a6-b27f-0d7fdd5283d6",
    "title": "Dead of Winter: A Crossroads Game (2014)",
    "players": "2-5",
    "playTime": 120,
    "weight": 4.26,
    "imageUrl": "https://fbi.cults3d.com/uploaders/17767297/illustration-file/34a8c65d-c62c-4364-a247-d70cdf871e50/All-insert-and-accessories.jpg",
    "totalPlays": 0
  },
  {
    "id": "e389db51-9b05-4579-b457-703e288c29b1",
    "title": "Sherlock Holmes Consulting Detective (1981)",
    "players": "1-5",
    "playTime": 15,
    "weight": 4.4,
    "imageUrl": "https://i.ytimg.com/vi/WIZGG7wepQQ/hqdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "ed91cd67-78f2-4c57-a74c-fde71634b8bb",
    "title": "Pandemic (2008)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.54,
    "imageUrl": "https://i.ebayimg.com/images/g/NwsAAeSw~DNpZnBT/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "ce6ac8bf-bbde-4bbd-af23-0fdefddd00c3",
    "title": "Robinson Crusoe: Adventures on the Cursed Island (2012)",
    "players": "1-4",
    "playTime": 120,
    "weight": 1.68,
    "imageUrl": "https://www.boardgamebliss.com/cdn/shop/files/ESDPSAH06EN_Cover-scaled.webp?crop=center&height=400&v=1770961284&width=300",
    "totalPlays": 0
  },
  {
    "id": "23811a81-2bde-4d59-bc97-87a3b652622b",
    "title": "Eldritch Horror (2013)",
    "players": "1-8",
    "playTime": 240,
    "weight": 1.82,
    "imageUrl": "https://assetsio.gnwcdn.com/eldritch-horror-board-game-gameplay-layout.png?width=140&height=187&fit=crop&quality=85&format=jpg&auto=webp",
    "totalPlays": 0
  },
  {
    "id": "4d1d7da6-d0d3-4fcb-a930-11a3392b070b",
    "title": "Arkham Horror: The Card Game (2016)",
    "players": "1-2",
    "playTime": 120,
    "weight": 1.96,
    "imageUrl": "https://makeyourpiecegames.com/wp-content/uploads/2021/04/3-3.png",
    "totalPlays": 0
  },
  {
    "id": "9fe40c97-f9e4-47fb-8b1f-cf30b322a8b6",
    "title": "Gloomhaven: Jaws of the Lion (2020)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.1,
    "imageUrl": "https://gugimages.s3.us-east-2.amazonaws.com/wp-content/uploads/2022/02/07123723/IMG_3849-900x616.jpg",
    "totalPlays": 0
  },
  {
    "id": "7d67dd7c-78c8-4918-bcd1-467dbf80d7e4",
    "title": "Aeon's End (2016)",
    "players": "1-4",
    "playTime": 60,
    "weight": 2.24,
    "imageUrl": "https://gamewardbound.com/wp-content/uploads/2025/11/aeons-end-brama-the-breach-mage-elder.jpg",
    "totalPlays": 0
  },
  {
    "id": "364f3faa-8abb-49af-9346-becaf573988c",
    "title": "Too Many Bones (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.38,
    "imageUrl": "https://store.aetherworks.com.au/images/TMB-ADD-032.jpg",
    "totalPlays": 0
  },
  {
    "id": "554fd131-1bd4-4220-a948-c7a2476618a3",
    "title": "The Lord of the Rings: Journeys in Middle-Earth (2019)",
    "players": "1-5",
    "playTime": 120,
    "weight": 2.52,
    "imageUrl": "https://shared.fastly.steamstatic.com/store_item_assets/steam/apps/1003400/ss_532a6837953f91e56c37e1e7ffbeece5afe9bf2f.1920x1080.jpg?t=1690823237",
    "totalPlays": 0
  },
  {
    "id": "95985743-8d86-4091-a079-31db920ab2a4",
    "title": "Sleeping Gods (2021)",
    "players": "1-4",
    "playTime": 1200,
    "weight": 2.66,
    "imageUrl": "https://unfilteredgamer.com/wp-content/uploads/2021/03/sg4-1024x574.png",
    "totalPlays": 0
  },
  {
    "id": "b5586702-585c-4ac3-ac95-741dd5180d13",
    "title": "Tainted Grail: The Fall of Avalon (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.8,
    "imageUrl": "https://thesolomeeple.com/wp-content/uploads/2019/12/imgp0420.jpg",
    "totalPlays": 0
  },
  {
    "id": "628db72e-d445-4a2d-9a15-18e892b89f34",
    "title": "Oath: Chronicles of Empire and Exile (2021)",
    "players": "1-6",
    "playTime": 120,
    "weight": 2.94,
    "imageUrl": "https://www.gaminglib.com/cdn/shop/products/oath-chronicles-of-empire-and-exile-retail-edition-761329.jpg?v=1700193786&width=1024",
    "totalPlays": 0
  },
  {
    "id": "51c0291b-afa3-4075-9860-0efffef6c4c1",
    "title": "Mombasa (2015)",
    "players": "2-4",
    "playTime": 150,
    "weight": 3.08,
    "imageUrl": "https://i.ytimg.com/vi/LQo8CUl3jZg/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "31069180-5fb4-462c-8a15-d6e4dbf18644",
    "title": "Maracaibo (2019)",
    "players": "1-4",
    "playTime": 120,
    "weight": 3.22,
    "imageUrl": "https://cdn.thingiverse.com/assets/d7/31/68/78/c4/large_display_m4.jpg",
    "totalPlays": 0
  },
  {
    "id": "de42e1df-1718-4751-a7e3-862ea1b24aaf",
    "title": "Nidavellir (2020)",
    "players": "2-5",
    "playTime": 45,
    "weight": 3.36,
    "imageUrl": "https://static.boardgamesindia.com/image/cache/catalog/product/welcome_back_to_the_dungeon_1-300x300h.jpg.webp",
    "totalPlays": 0
  },
  {
    "id": "82e149cf-51f4-4a45-a58e-97018e9a7d7b",
    "title": "Res Arcana (2019)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.5,
    "imageUrl": "https://spacebiff.com/wp-content/uploads/2019/05/3.-synerdragons.jpg?w=604&h=239",
    "totalPlays": 0
  },
  {
    "id": "ead2eea9-c331-49b6-bf97-436d5b9a5ad5",
    "title": "It's a Wonderful World (2019)",
    "players": "1-5",
    "playTime": 60,
    "weight": 3.64,
    "imageUrl": "https://i.ebayimg.com/images/g/BwoAAOSwWMhoKncR/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "5df6622b-ee14-48f5-91ec-40a6d260f17e",
    "title": "Furnace (2020)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.78,
    "imageUrl": "https://cf.geekdo-images.com/ldZPYwRCPg06s_gT1HGdDQ__itemrep/img/Vn8sCpqGgqAXIqGE_UOQ6-Zj5sU=/fit-in/246x300/filters:strip_icc()/pic8745665.png",
    "totalPlays": 0
  },
  {
    "id": "b1dfc091-3f73-45ed-b4d2-3e5260d279b5",
    "title": "Fantasy Realms (2017)",
    "players": "2-6",
    "playTime": 20,
    "weight": 3.92,
    "imageUrl": "https://www.aresgames.eu/wp/wp-content/uploads/2025/08/940x400-VolfiyrionGuilds.jpg",
    "totalPlays": 0
  },
  {
    "id": "c4142771-d3e5-4e3d-b17b-fb9a9a2efd16",
    "title": "Space Base (2018)",
    "players": "2-5",
    "playTime": 60,
    "weight": 4.06,
    "imageUrl": "https://tabletopbellhop.com/wp-content/uploads/2022/06/919Nyr-eY9L._AC_SL1500_1-400x438.jpg",
    "totalPlays": 0
  },
  {
    "id": "680944c5-efbb-4269-83ae-1994e3082377",
    "title": "Gizmos (2018)",
    "players": "2-4",
    "playTime": 50,
    "weight": 4.2,
    "imageUrl": "https://m.media-amazon.com/images/I/71-bbNlS0uL._AC_UF350,350_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "a040bc20-41b8-45b0-91cc-9f310b8ccf5d",
    "title": "Century: Spice Road (2017)",
    "players": "2-5",
    "playTime": 45,
    "weight": 4.34,
    "imageUrl": "https://down-vn.img.susercontent.com/file/ce050ee42864cd4ced406a5f1c66bd23",
    "totalPlays": 0
  },
  {
    "id": "48834e6a-9c7b-4cad-ba33-a0ee9f847664",
    "title": "Sagrada (2017)",
    "players": "1-4",
    "playTime": 45,
    "weight": 4.48,
    "imageUrl": "https://cf.geekdo-images.com/PUu9Gi6_uL5wzU8HQURzxA__square275/img/JkaY_5iWEhzXzH-mIOjwkzasC4w=/275x275/filters:no_upscale():strip_icc()/pic9398550.jpg",
    "totalPlays": 0
  },
  {
    "id": "0462da53-1af0-4824-af74-02197e364583",
    "title": "Calico (2020)",
    "players": "1-4",
    "playTime": 45,
    "weight": 1.62,
    "imageUrl": "https://thedicetroyers.com/wp-content/uploads/2023/09/The-Dicetroyers-Board-Game-Organizer-Insert-Calico-06.jpg",
    "totalPlays": 0
  },
  {
    "id": "e0d8ba6a-bf6f-4170-a226-4a62d352249f",
    "title": "Bärenpark (2017)",
    "players": "2-4",
    "playTime": 45,
    "weight": 1.76,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=122103322785285160",
    "totalPlays": 0
  },
  {
    "id": "c2c9161a-567e-485a-a134-99d975b2b4b2",
    "title": "Isle of Cats (2019)",
    "players": "3-6",
    "playTime": 90,
    "weight": 1.9,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10221034616908309",
    "totalPlays": 0
  },
  {
    "id": "061bf413-f3b7-4cf1-b21b-1b4f37a68c8e",
    "title": "Parks (2019)",
    "players": "1-5",
    "playTime": 60,
    "weight": 2.04,
    "imageUrl": "https://www.teamboardgame.com/wp-content/uploads/2024/02/Parks-2nd-Ed-Base-Camp-1.webp",
    "totalPlays": 0
  },
  {
    "id": "e62999ff-50c7-4f3e-92a0-3f186c02fde3",
    "title": "Tokaido (2012)",
    "players": "2-5",
    "playTime": 45,
    "weight": 2.18,
    "imageUrl": "https://domigr.com.ua/image/cache/data/tokaido/5th_Anniversary_Edition/01_tokaido_5th_anniversary_edition-376x376.jpg",
    "totalPlays": 0
  },
  {
    "id": "7a0c393d-8c57-4cf2-9e51-795c27f6a09b",
    "title": "Takenoko (2011)",
    "players": "2-4",
    "playTime": 45,
    "weight": 2.32,
    "imageUrl": "https://cdn.shoplightspeed.com/shops/638935/files/26760942/1652x2313x2/matagot-takenoko.jpg",
    "totalPlays": 0
  },
  {
    "id": "b6708c15-65e5-4e80-8d2a-5a83aeeeb349",
    "title": "Sushi Go Party! (2016)",
    "players": "2-8",
    "playTime": 20,
    "weight": 2.46,
    "imageUrl": "https://www.shutupandsitdown.com/wp-content/uploads/2016/11/pic2281301.jpg",
    "totalPlays": 0
  },
  {
    "id": "34ce80e6-df8d-4e13-bd2e-afd58d11db88",
    "title": "Welcome To... (2018)",
    "players": "1-100",
    "playTime": 25,
    "weight": 2.6,
    "imageUrl": "https://www.cardboardrepublic.com/wp-content/uploads/2016/06/TTA-cover.jpg",
    "totalPlays": 0
  },
  {
    "id": "332494c2-6763-4154-86a8-34566aa791cb",
    "title": "Cartographers (2019)",
    "players": "1-100",
    "playTime": 45,
    "weight": 2.74,
    "imageUrl": "https://thunderworksgames.com/cdn/shop/files/CH-Collectors-Filled-1024x1024.jpg?v=1761778405",
    "totalPlays": 0
  },
  {
    "id": "2b750292-7d93-4a0b-8d39-1fb069821026",
    "title": "That's Pretty Clever! (2018)",
    "players": "1-4",
    "playTime": 30,
    "weight": 2.88,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10217745864264644",
    "totalPlays": 0
  },
  {
    "id": "2f19447c-de63-43df-af13-353b4530e17b",
    "title": "Sprawlopolis (2018)",
    "players": "1-4",
    "playTime": 20,
    "weight": 3.02,
    "imageUrl": "http://www.beyondsolitaire.net/uploads/4/9/4/6/49468733/published/img-2736.jpg?1561592101",
    "totalPlays": 0
  },
  {
    "id": "0984c130-d9da-4423-b3e4-6ce8fc2219a8",
    "title": "Love Letter (2012)",
    "players": "2-6",
    "playTime": 20,
    "weight": 3.16,
    "imageUrl": "https://i.ebayimg.com/images/g/BBoAAeSwY3Zppgvo/s-l300.jpg",
    "totalPlays": 0
  },
  {
    "id": "70832163-49c5-4f46-8ae0-2cbf47d26040",
    "title": "Skull (2011)",
    "players": "3-6",
    "playTime": 45,
    "weight": 3.3,
    "imageUrl": "https://ashdowngaming.co.uk/cdn/shop/products/skull2_700x.jpg?v=1684424741",
    "totalPlays": 0
  },
  {
    "id": "5a1d1fa1-661f-4fa7-b8fa-f1eb1dbd7eae",
    "title": "Camel Up (2014)",
    "players": "2-8",
    "playTime": 30,
    "weight": 3.44,
    "imageUrl": "https://therewillbe.games/images/member_images/ubarose/images/member_images/David/Camel_Up_02.jpg",
    "totalPlays": 0
  },
  {
    "id": "719cf349-e5b0-48f3-ad3a-823d20f2b116",
    "title": "The Mind (2018)",
    "players": "2-4",
    "playTime": 20,
    "weight": 3.58,
    "imageUrl": "https://i0.wp.com/opinionatedgamers.com/wp-content/uploads/2018/03/mindcomponents.jpeg?resize=370,494&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "ed0e0b7b-14e6-4de6-904c-22fe87e08a24",
    "title": "Hanabi (2010)",
    "players": "2-5",
    "playTime": 25,
    "weight": 3.72,
    "imageUrl": "https://coopboardgames.com/wp-content/uploads/2016/07/hanabi-card-game-review-1024x607.jpg",
    "totalPlays": 0
  },
  {
    "id": "31c0074e-a4d7-44d6-9d48-44d7e2cc948a",
    "title": "Dixit (2008)",
    "players": "3-6",
    "playTime": 30,
    "weight": 3.86,
    "imageUrl": "data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20400%20400%22%20width%3D%22400%22%20height%3D%22400%22%3E%0A%20%20%20%20%3Cdefs%3E%0A%20%20%20%20%20%20%3ClinearGradient%20id%3D%22grad%22%20x1%3D%220%25%22%20y1%3D%220%25%22%20x2%3D%22100%25%22%20y2%3D%22100%25%22%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%220%25%22%20style%3D%22stop-color%3Ahsl(341%2C%2075%25%2C%2055%25)%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%20%20%20%20%3Cstop%20offset%3D%22100%25%22%20style%3D%22stop-color%3Ahsl(62%2C%2080%25%2C%2040%25)%3Bstop-opacity%3A1%22%20%2F%3E%0A%20%20%20%20%20%20%3C%2FlinearGradient%3E%0A%20%20%20%20%3C%2Fdefs%3E%0A%20%20%20%20%3Crect%20width%3D%22100%25%22%20height%3D%22100%25%22%20fill%3D%22url(%23grad)%22%20%2F%3E%0A%20%20%20%20%3Ctext%20x%3D%2250%25%22%20y%3D%2250%25%22%20dominant-baseline%3D%22middle%22%20text-anchor%3D%22middle%22%20font-family%3D%22system-ui%2C%20-apple-system%2C%20sans-serif%22%20font-size%3D%22140%22%20font-weight%3D%22800%22%20fill%3D%22white%22%20opacity%3D%220.9%22%20letter-spacing%3D%22-2%22%3EDI%3C%2Ftext%3E%0A%20%20%3C%2Fsvg%3E",
    "totalPlays": 0
  },
  {
    "id": "3a9d454d-721d-4844-8227-7b4b70b91ea4",
    "title": "Mysterium (2015)",
    "players": "2-7",
    "playTime": 42,
    "weight": 4,
    "imageUrl": "https://v.etsystatic.com/video/upload/q_auto/file_vjesln.jpg",
    "totalPlays": 0
  },
  {
    "id": "1f0ccb6e-0191-4d5f-a1c7-c945979a144a",
    "title": "Betrayal at House on the Hill (2004)",
    "players": "3-6",
    "playTime": 60,
    "weight": 4.14,
    "imageUrl": "https://i.ytimg.com/vi/4qfYtJA1ULg/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "4465fef4-a975-4456-86ec-1c00d2244d50",
    "title": "Smash Up (2012)",
    "players": "2-4",
    "playTime": 45,
    "weight": 4.28,
    "imageUrl": "https://i5.walmartimages.com/asr/61e6077c-8c77-4b68-ad60-b59deb3307f6.b07153ac37d938ad97e15901851ccd22.jpeg?odnHeight=768&odnWidth=768&odnBg=FFFFFF",
    "totalPlays": 0
  },
  {
    "id": "30a30bde-34d0-43da-b91e-61be6d27a929",
    "title": "King of Tokyo (2011)",
    "players": "2-6",
    "playTime": 30,
    "weight": 4.42,
    "imageUrl": "https://www.teamboardgame.com/wp-content/uploads/2022/01/King-of-Tokyo-Monster-Box-2.jpg",
    "totalPlays": 0
  },
  {
    "id": "a0fd0fc6-95c9-4bcb-b115-cc7252f63d87",
    "title": "Survive: Escape from Atlantis! (1982)",
    "players": "2-4",
    "playTime": 60,
    "weight": 1.56,
    "imageUrl": "https://static.wixstatic.com/media/47acff_005213543524428a8a34d14ba14e4aff~mv2.jpg/v1/fill/w_980,h_735,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/47acff_005213543524428a8a34d14ba14e4aff~mv2.jpg",
    "totalPlays": 0
  },
  {
    "id": "aef9f74b-79e1-4231-aecb-4e59bacc9146",
    "title": "Letters from Whitechapel (2011)",
    "players": "2-6",
    "playTime": 90,
    "weight": 1.7,
    "imageUrl": "https://www.gameology.com.au/cdn/shop/products/0a6a6.jpg?v=1768437513&width=1200",
    "totalPlays": 0
  },
  {
    "id": "ef792f78-6611-495f-8efa-8e830297a998",
    "title": "Fury of Dracula (2015)",
    "players": "3-6",
    "playTime": 180,
    "weight": 1.84,
    "imageUrl": "https://www.orderofgamers.com/wordpress/wp-content/uploads/2016/05/furyofdracula3rded.jpg",
    "totalPlays": 0
  },
  {
    "id": "e836437d-eb8b-4ff3-bdb8-3b31668adc9a",
    "title": "Specter Ops (2015)",
    "players": "2-5",
    "playTime": 120,
    "weight": 1.98,
    "imageUrl": "https://cf.geekdo-images.com/OolxfVgT6Tf9OWpWA9NYXA__imagepage/img/JBvQi0w5Q1eqO1qNIzPdGZlnxek=/fit-in/900x600/filters:no_upscale():strip_icc()/pic8393302.jpg",
    "totalPlays": 0
  },
  {
    "id": "372c4273-9a61-4d34-bcc7-19400ef1f47a",
    "title": "Captain Sonar (2016)",
    "players": "2-8",
    "playTime": 60,
    "weight": 2.12,
    "imageUrl": "https://cdn.waterstones.com/override/v2/large/5060/7564/5060756410671.jpg",
    "totalPlays": 0
  },
  {
    "id": "7de89347-1457-4e17-b632-3b0bf480acf7",
    "title": "Two Rooms and a Boom (2013)",
    "players": "6-30",
    "playTime": 20,
    "weight": 2.26,
    "imageUrl": "https://media.printables.com/media/prints/496345/stls/4041745_dfa5d051-6b8f-4341-ac6a-7595ad4a821b/thumbs/inside/1280x960/png/token_case_preview.webp",
    "totalPlays": 0
  },
  {
    "id": "ccfea8ef-b52e-470f-a35c-4f515a83e5b0",
    "title": "The Search for Planet X (2020)",
    "players": "1-4",
    "playTime": 60,
    "weight": 2.4,
    "imageUrl": "https://i.etsystatic.com/30153557/r/il/ee5cba/5659367916/il_1080xN.5659367916_i21f.jpg",
    "totalPlays": 0
  },
  {
    "id": "6c36ae4c-be80-44fc-8669-6430ad8e193f",
    "title": "Alchemists (2014)",
    "players": "2-4",
    "playTime": 120,
    "weight": 2.54,
    "imageUrl": "https://www.cards2games.com/cdn/shop/files/godzilla-card-game-monsters-raid-again-bp02-booster-box-buy-3-186.webp?v=1767064831&width=416",
    "totalPlays": 0
  },
  {
    "id": "fd3fbe51-a125-4536-9955-c6e3df6b9fb6",
    "title": "Trickerion: Legends of Illusion (2015)",
    "players": "2-4",
    "playTime": 180,
    "weight": 2.68,
    "imageUrl": "https://lookaside.instagram.com/seo/google_widget/crawler/?media_id=3844123900486034705",
    "totalPlays": 0
  },
  {
    "id": "6c0b5d37-4cb5-4511-881f-9b7c47f19c2d",
    "title": "Anachrony (2017)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.82,
    "imageUrl": "https://www.meepland.fr/2177-large_default/anachrony-essential-edition-super-meeple-mindclash-games.jpg",
    "totalPlays": 0
  },
  {
    "id": "20f96ba1-8690-4fd6-9fcd-ff3e2e7e53a1",
    "title": "Cerebria: The Inside World (2018)",
    "players": "1-4",
    "playTime": 120,
    "weight": 2.96,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=10106769506776160",
    "totalPlays": 0
  },
  {
    "id": "d84fea74-70a6-435f-8a28-a7c216c9ddae",
    "title": "Agricola: All Creatures Big and Small (2012)",
    "players": "2",
    "playTime": 30,
    "weight": 3.1,
    "imageUrl": "https://i.ytimg.com/vi/y07gLPfWnPY/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "6d1e6752-02e0-4f50-8580-074f8ec27f67",
    "title": "Fields of Arle (2014)",
    "players": "1-2",
    "playTime": 120,
    "weight": 3.24,
    "imageUrl": "https://i.ytimg.com/vi/30y8lEvlWME/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLAjKX4rNFn5DQzRDTOak583B9e0_A",
    "totalPlays": 0
  },
  {
    "id": "61805699-abab-47c3-9533-2a611f28a194",
    "title": "Le Havre (2008)",
    "players": "1-5",
    "playTime": 150,
    "weight": 3.38,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/en/f/f6/Agricola_game.jpg",
    "totalPlays": 0
  },
  {
    "id": "c737c006-9148-4fcd-9898-bf796b4d604a",
    "title": "Ora et Labora (2011)",
    "players": "1-4",
    "playTime": 180,
    "weight": 3.52,
    "imageUrl": "https://dudetakeyourturn.ca/wp-content/uploads/2018/08/hansa-player-board1-e1534354369423.jpg?w=600",
    "totalPlays": 0
  },
  {
    "id": "a8bc0a13-9a96-422e-8841-15a214b68ec7",
    "title": "Caverna: The Cave Farmers (2013)",
    "players": "1-7",
    "playTime": 210,
    "weight": 3.66,
    "imageUrl": "https://i0.wp.com/meepleandthemoose.com/wp-content/uploads/2025/04/Caverna-2.jpg?resize=768,1024&ssl=1",
    "totalPlays": 0
  },
  {
    "id": "409217b9-bd6a-4468-a358-9898303f566a",
    "title": "Airlines Europe (2011)",
    "players": "2-5",
    "playTime": 75,
    "weight": 3.8,
    "imageUrl": "https://mblogthumb-phinf.pstatic.net/20111019_218/lein_13190280061252Ymzy_JPEG/r3.jpg?type=w420",
    "totalPlays": 0
  },
  {
    "id": "50e0e1cc-3718-4ba4-bc12-33981374393c",
    "title": "Thurn and Taxis (2006)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.94,
    "imageUrl": "https://i.etsystatic.com/25500532/r/il/e1415d/3534507496/il_fullxfull.3534507496_19m5.jpg",
    "totalPlays": 0
  },
  {
    "id": "487958e4-6311-4d90-8e42-46764f281aa9",
    "title": "Yinsh (2003)",
    "players": "2",
    "playTime": 60,
    "weight": 4.08,
    "imageUrl": "https://static.guides.co/pld/x9pwkSj1TpaTp3Kp9OK0_YINSH-Board-Game.png",
    "totalPlays": 0
  },
  {
    "id": "b8881cc1-2b3d-4fc5-af20-416c83fbccea",
    "title": "Tzaar (2007)",
    "players": "2",
    "playTime": 60,
    "weight": 4.22,
    "imageUrl": "https://www.dicetower.com/sites/default/files/styles/original_medium/public/bgg_images/pic2490974.png.jpg?itok=aQPYcHI5",
    "totalPlays": 0
  },
  {
    "id": "40148230-1178-4330-a4cd-f37ca93cc6f6",
    "title": "Hive (2001)",
    "players": "2",
    "playTime": 20,
    "weight": 4.36,
    "imageUrl": "https://zulusgames.com/cdn/shop/files/Simple_BG_-_alt_v3.jpg?v=1770930685",
    "totalPlays": 0
  },
  {
    "id": "c448a615-c619-4889-861c-e419a7130d7d",
    "title": "Santorini (2016)",
    "players": "2-3",
    "playTime": 20,
    "weight": 1.5,
    "imageUrl": "https://cdn.shopify.com/s/files/1/0246/2190/8043/t/5/assets/b34c24a67aa7--IMG-3466-resized-a5ef46_700x.jpg?v=1761060954",
    "totalPlays": 0
  },
  {
    "id": "61b481ea-6dd6-41d8-a5e8-b313e6af9503",
    "title": "Onitama (2014)",
    "players": "2",
    "playTime": 20,
    "weight": 1.64,
    "imageUrl": "https://boardgame.tips/images/the-castles-of-burgundy-special-edition.jpg",
    "totalPlays": 0
  },
  {
    "id": "f80ae39a-9104-49b9-8c79-4525df9a0052",
    "title": "Chess (1475)",
    "players": "2",
    "playTime": 90,
    "weight": 1.78,
    "imageUrl": "https://www.sklep-szachy.pl/1471-large_default/chess-checkers-l.jpg",
    "totalPlays": 0
  },
  {
    "id": "bc5ffb9d-6216-451f-a9bf-23de52321918",
    "title": "Go (2200 BC)",
    "players": "1-2",
    "playTime": 120,
    "weight": 1.92,
    "imageUrl": "https://cdn11.bigcommerce.com/s-76a6bv74ts/images/stencil/300x300/products/7577/54254/vintage-japanese-go-board-wood-1980s-showa-25s-471-5-1__89712.1766521535.JPG?c=1",
    "totalPlays": 0
  },
  {
    "id": "5c16efd6-657a-475d-98bd-244e5cb4b166",
    "title": "Tak (2016)",
    "players": "2",
    "playTime": 60,
    "weight": 2.06,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2018/03/Tak-Gameplay.jpg",
    "totalPlays": 0
  },
  {
    "id": "de532a27-f2cc-43f0-98b7-9c8708914a76",
    "title": "Backgammon (3000 BC)",
    "players": "2",
    "playTime": 30,
    "weight": 2.2,
    "imageUrl": "https://i.ebayimg.com/images/g/YNQAAeSwtplpo6oc/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "890df53b-ac55-43bc-8540-07310f19a26d",
    "title": "Mahjong (1850)",
    "players": "3-4",
    "playTime": 120,
    "weight": 2.34,
    "imageUrl": "https://mahjqueen.com/cdn/shop/files/NeonDaze.jpg?v=1767207378&width=1946",
    "totalPlays": 0
  },
  {
    "id": "a7bd8779-ec8d-43ce-ab5d-1d105fe91644",
    "title": "Shogi (1580)",
    "players": "2",
    "playTime": 60,
    "weight": 2.48,
    "imageUrl": "https://www.aobo-shop.es/73-thickbox_default/shogi-deluxe-set.jpg",
    "totalPlays": 0
  },
  {
    "id": "6b6e3828-f77c-4aa3-ba75-e44225101a99",
    "title": "Blokus (2000)",
    "players": "2-4",
    "playTime": 20,
    "weight": 2.62,
    "imageUrl": "https://www.shutterstock.com/image-photo/colorful-game-blokus-background-600nw-1456944755.jpg",
    "totalPlays": 0
  },
  {
    "id": "d21bf179-c92c-4a77-8ff4-24fa8f6722bf",
    "title": "Ingenious (2004)",
    "players": "1-4",
    "playTime": 45,
    "weight": 2.76,
    "imageUrl": "https://b1803394.smushcdn.com/1803394/wp-content/uploads/2020/08/ingenious-colour-blind-friendly.jpg?lossy=1&strip=1&webp=1",
    "totalPlays": 0
  },
  {
    "id": "88a02049-69d4-4087-b5be-d4f83945c8b3",
    "title": "Star Realms (2014)",
    "players": "2",
    "playTime": 20,
    "weight": 2.9,
    "imageUrl": "https://i.ytimg.com/vi/g-8nfRT3XGk/maxresdefault.jpg",
    "totalPlays": 0
  },
  {
    "id": "b89b436a-5209-4fdb-9dec-3670069e7f55",
    "title": "Hero Realms (2016)",
    "players": "2-4",
    "playTime": 30,
    "weight": 3.04,
    "imageUrl": "https://upload.wikimedia.org/wikipedia/en/thumb/6/61/TalismanCover.jpg/250px-TalismanCover.jpg",
    "totalPlays": 0
  },
  {
    "id": "70f19fce-c599-4b64-af56-75868229c4a4",
    "title": "Valley of the Kings (2014)",
    "players": "2-4",
    "playTime": 45,
    "weight": 3.18,
    "imageUrl": "https://i.ebayimg.com/images/g/9ycAAOSwiOdZqv1i/s-l400.jpg",
    "totalPlays": 0
  },
  {
    "id": "3110fff3-8f54-49ac-8af8-79a9f6d25ff8",
    "title": "Tyrants of the Underdark (2016)",
    "players": "2-4",
    "playTime": 60,
    "weight": 3.32,
    "imageUrl": "https://22games.net/wp-content/uploads/2022/12/Tyrants-of-the-Underdark-1.jpg",
    "totalPlays": 0
  },
  {
    "id": "e76efc8d-c2f8-4216-a47a-02f943a0af2c",
    "title": "Dune (1979)",
    "players": "2-4",
    "playTime": 90,
    "weight": 3.46,
    "imageUrl": "https://static0.polygonimages.com/wordpress/wp-content/uploads/chorus/uploads/chorus_asset/file/18957300/dune_original.jpg?q=50&fit=crop&w=815&dpr=1.5",
    "totalPlays": 0
  },
  {
    "id": "0adfa170-4e61-4653-8912-a20074fa06a9",
    "title": "Rex: Final Days of an Empire (2012)",
    "players": "3-6",
    "playTime": 180,
    "weight": 3.6,
    "imageUrl": "https://i.ebayimg.com/images/g/3FkAAOSwXgZdU~80/s-l500.jpg",
    "totalPlays": 0
  },
  {
    "id": "793996d8-9359-4e86-934a-263140bf5095",
    "title": "Twilight Struggle (2005)",
    "players": "2",
    "playTime": 180,
    "weight": 3.74,
    "imageUrl": "https://happygoluckyclonakilty.com/cdn/shop/files/back_4fdde394-d2cc-4dde-ab9a-c6a2dd99f58a_grande.png?v=1722008245",
    "totalPlays": 0
  },
  {
    "id": "58a0e889-c9a9-4427-bbdb-1075cd5f927e",
    "title": "1960: The Making of the President (2007)",
    "players": "2",
    "playTime": 120,
    "weight": 3.88,
    "imageUrl": "https://m.media-amazon.com/images/I/81JrncqSc8L._AC_UF1000,1000_QL80_.jpg",
    "totalPlays": 0
  },
  {
    "id": "42242dcf-0b04-4221-be28-2c94a222b560",
    "title": "Labyrinth: The Awakening, 2010 - ? (2010)",
    "players": "1",
    "playTime": 20,
    "weight": 4.02,
    "imageUrl": "https://img.dungeondice.it/115363-home_default/il-maledetto-dilemma.jpg",
    "totalPlays": 0
  },
  {
    "id": "35fa631c-11c6-4fb0-80d2-38a884619615",
    "title": "Sekigahara: The Unification of Japan (2011)",
    "players": "2",
    "playTime": 180,
    "weight": 4.16,
    "imageUrl": "https://theboardgameschronicle.com/wp-content/uploads/2019/01/157ba-sekigahara_pic_8.jpg",
    "totalPlays": 0
  },
  {
    "id": "64cb449e-4337-41a5-9035-7bb29b3cf0e8",
    "title": "Command & Colors: Ancients (2006)",
    "players": "3-6",
    "playTime": 90,
    "weight": 4.3,
    "imageUrl": "https://kidult.co.uk/acatalog/GMT1608500.jpg",
    "totalPlays": 0
  },
  {
    "id": "4b4ccf5f-2f7f-48cb-9bb0-7553165b3cc0",
    "title": "Memoir '44 (2004)",
    "players": "2-8",
    "playTime": 60,
    "weight": 4.44,
    "imageUrl": "https://memoir44fans-uploads.s3.dualstack.eu-west-1.amazonaws.com/original/1X/b93b1b58f2711f0ac836b482a7a1b70717a4cd69.jpeg",
    "totalPlays": 0
  },
  {
    "id": "0d3abf7a-c974-444d-b23a-42e94fdaaf57",
    "title": "Combat Commander: Europe (2006)",
    "players": "2",
    "playTime": 180,
    "weight": 1.58,
    "imageUrl": "https://www.shutupandsitdown.com/wp-content/uploads/2013/05/3ffeffcec20611e2bc75f23c91709c91_1369134287.jpg",
    "totalPlays": 0
  },
  {
    "id": "1927dba9-5eaa-4fa6-afb3-423e102c9640",
    "title": "Advanced Squad Leader (1985)",
    "players": "2",
    "playTime": 480,
    "weight": 1.72,
    "imageUrl": "https://i.ebayimg.com/images/g/FWgAAeSwc6hpbCTW/s-l1200.webp",
    "totalPlays": 0
  },
  {
    "id": "ff26544b-150d-4a2c-b2db-a5efa019a7ce",
    "title": "Up Front (1983)",
    "players": "2-3",
    "playTime": 60,
    "weight": 1.86,
    "imageUrl": "https://media-cdn.play.date/media/hardwareproducts/cover/Cover_share_card.png",
    "totalPlays": 0
  },
  {
    "id": "e8b8924c-6efd-49ff-b74a-d337066d9953",
    "title": "Food Chain Magnate (2015)",
    "players": "2-5",
    "playTime": 240,
    "weight": 2,
    "imageUrl": "https://meeplerex.com/wp-content/uploads/2025/02/5-3-scaled.jpg",
    "totalPlays": 0
  },
  {
    "id": "f22333dd-a242-4769-ac3c-f49f309f205d",
    "title": "The Great Zimbabwe (2012)",
    "players": "2-5",
    "playTime": 150,
    "weight": 2.14,
    "imageUrl": "https://vaultedcollection.com/cdn/shop/files/Mega_Menu_-_Cards_-_Storage.jpg?v=1737151073",
    "totalPlays": 0
  },
  {
    "id": "2b8b797a-c730-4b02-b753-c91e95fb377e",
    "title": "Antiquity (2004)",
    "players": "2-4",
    "playTime": 180,
    "weight": 2.28,
    "imageUrl": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9K5ysn5YOCNXEWfgw39YSiJXUDYSyTXofnvdF9xgCmPJkjJSHhVgaPkScrrJJLZLzrXgqInMlZZGVmH8RCkgDpwWuGVnQCk2UzWFskx4wmIvXIXd_Cogi4eVT7fswobzTaeZI40XUhPM/s1600/2012-10-21+ixus+002.jpg",
    "totalPlays": 0
  },
  {
    "id": "75484e55-c29e-46b8-9d64-1ea678650c37",
    "title": "Indonesia (2005)",
    "players": "2-5",
    "playTime": 240,
    "weight": 2.42,
    "imageUrl": "https://cf.geekdo-images.com/VHpg-svvRdLCzQdwk8dlIQ__small/img/PthMQwS5TZgFfNwoumGKXfYSGJQ=/fit-in/200x150/filters:strip_icc()/pic311440.jpg",
    "totalPlays": 0
  },
  {
    "id": "ebe9703b-b366-47e5-a273-28fe30e25087",
    "title": "1830: Railways & Robber Barons (1986)",
    "players": "2-7",
    "playTime": 360,
    "weight": 2.56,
    "imageUrl": "https://mblogthumb-phinf.pstatic.net/20160817_116/mocha9_14714421659851Hsgn_JPEG/20160815_130118.jpg?type=w420",
    "totalPlays": 0
  },
  {
    "id": "19b60a50-b022-4962-acf3-193f47464fb8",
    "title": "18xx series (various)",
    "players": "1-2",
    "playTime": 30,
    "weight": 2.7,
    "imageUrl": "https://cube4me.com//wp-content/uploads/2024/06/revenue3.jpg",
    "totalPlays": 0
  },
  {
    "id": "f5be98fb-4e26-463c-8f44-fbd1d89baaf5",
    "title": "Age of Steam (2002)",
    "players": "1-6",
    "playTime": 120,
    "weight": 2.84,
    "imageUrl": "https://preview.redd.it/initial-steam-reactions-pc-gamer-2005-v0-77lk68yk68hg1.png?auto=webp&s=34adfc2ff168dd71cd80fa0d98424ad721b73756",
    "totalPlays": 0
  },
  {
    "id": "e45af936-d5f6-41e0-86d3-ca2592b78461",
    "title": "Railways of the World (2005)",
    "players": "2-6",
    "playTime": 120,
    "weight": 2.98,
    "imageUrl": "https://www.snowmagazine.com/images/La Plagne Ski Resort Review Callum Jelley00781.jpg?t=1762523524293",
    "totalPlays": 0
  },
  {
    "id": "6c1b14cb-388d-4a4f-9303-88a085a4d860",
    "title": "Steam (2009)",
    "players": "3-5",
    "playTime": 90,
    "weight": 3.12,
    "imageUrl": "https://e.snmc.io/lk/o/x/857048d0d6e537bc4706f52625f38569/12808680",
    "totalPlays": 0
  },
  {
    "id": "69a6c8f7-0793-4a24-8692-a1a1656c9253",
    "title": "Container (2007)",
    "players": "3-5",
    "playTime": 90,
    "weight": 3.26,
    "imageUrl": "https://www.steelcitycollectibles.com/storage/img/uploads/products/full/pack-chase48500.jpg",
    "totalPlays": 0
  },
  {
    "id": "4f5ce2cb-612d-4b3d-aea2-f1385feba0e9",
    "title": "Dominant Species (2010)",
    "players": "2-6",
    "playTime": 240,
    "weight": 3.4,
    "imageUrl": "https://cf.geekdo-images.com/GgBeTlRns_2fB6z6UOLc4w__imagepage/img/i9--xQ_myRg0jQ6fuYld-jzCyP0=/fit-in/900x600/filters:no_upscale():strip_icc()/pic821675.jpg",
    "totalPlays": 0
  },
  {
    "id": "1e8f7816-8472-4840-9f8a-9ed6e52d9d6a",
    "title": "High Frontier 4 All (2020)",
    "players": "1-5",
    "playTime": 240,
    "weight": 3.54,
    "imageUrl": "https://i.etsystatic.com/iap/bbd1c8/6974172695/iap_640x640.6974172695_snldxbfw.jpg?version=0",
    "totalPlays": 0
  },
  {
    "id": "4c3d8243-221a-40cb-847b-b27fa8d74c16",
    "title": "Leaving Earth (2015)",
    "players": "1-5",
    "playTime": 180,
    "weight": 3.68,
    "imageUrl": "https://static.wikia.nocookie.net/marveldatabase/images/8/89/X-Men_Vol_7_10_Textless.jpg/revision/latest?cb=20250202202519",
    "totalPlays": 0
  },
  {
    "id": "6814497b-2a67-4f5e-b2be-fbdb4548b4c7",
    "title": "SpaceCorp: 2025-2300AD (2018)",
    "players": "1-4",
    "playTime": 240,
    "weight": 3.82,
    "imageUrl": "https://boardlife.co.kr/wys2/swf_upload/2023/12/26/1703560982675828.jpg",
    "totalPlays": 0
  },
  {
    "id": "70cfe606-9515-4c1a-aafc-c487a566be39",
    "title": "Terra Mystica (2012)",
    "players": "2-5",
    "playTime": 150,
    "weight": 3.96,
    "imageUrl": "https://www.boardgamequest.com/wp-content/uploads/2013/11/IMG_3988.jpg",
    "totalPlays": 0
  },
  {
    "id": "899915b7-4ece-4f43-aeca-beb779c68972",
    "title": "Gaia Project (2017)",
    "players": "1-4",
    "playTime": 150,
    "weight": 4.1,
    "imageUrl": "https://m.media-amazon.com/images/I/81SvUuAVCCL.jpg",
    "totalPlays": 0
  },
  {
    "id": "5987cdb0-2dd7-4102-9922-29fb8c1363b9",
    "title": "Clans (2002)",
    "players": "2-4",
    "playTime": 30,
    "weight": 4.24,
    "imageUrl": "https://i.ytimg.com/vi/D_MumgkWKfk/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCx36F_Nw4gl0ve9iyYrLQ4zlRH5w",
    "totalPlays": 0
  },
  {
    "id": "5763edc2-5f98-432d-a6e6-63ddc0c7430a",
    "title": "Web of Power (2000)",
    "players": "3-5",
    "playTime": 60,
    "weight": 4.38,
    "imageUrl": "https://media.newyorker.com/photos/6977a6404e4d4b703c6e76cd/2:2/w_1600,c_limit/JJ00007-26--square-web.jpg",
    "totalPlays": 0
  },
  {
    "id": "1c15bc9e-1c9a-4653-b142-1f17badd14ac",
    "title": "Iwari (2020)",
    "players": "2-5",
    "playTime": 45,
    "weight": 1.52,
    "imageUrl": "https://bitewinggames.com/wp-content/uploads/2026/01/Gold-Country-Photos-Smaller-22-1024x683.jpg",
    "totalPlays": 0
  },
  {
    "id": "da9f0d6e-a13a-4160-8fda-bd6e4a5e763f",
    "title": "Chinatown (1999)",
    "players": "3-5",
    "playTime": 60,
    "weight": 1.66,
    "imageUrl": "https://www.tiktok.com/api/img/?itemId=7552300189478964492&location=0&aid=1988",
    "totalPlays": 0
  },
  {
    "id": "7cace0d1-df7e-4103-b180-47ec10fbefb5",
    "title": "Bohnanza (1997)",
    "players": "2-7",
    "playTime": 45,
    "weight": 1.8,
    "imageUrl": "https://www.firetoys.co.uk/cdn/shop/files/Screenshot_3.png?v=1747651285&width=1440",
    "totalPlays": 0
  },
  {
    "id": "1edffd91-a484-4b50-8b78-625c851609df",
    "title": "Modern Art (1992)",
    "players": "3-5",
    "playTime": 45,
    "weight": 1.94,
    "imageUrl": "https://cf.geekdo-images.com/imagepagezoom/img/ytHM1kv-jOPFTQDPXhM9e8xd4HQ=/fit-in/1200x900/filters:no_upscale()/pic5494481.png",
    "totalPlays": 0
  },
  {
    "id": "e0f972a6-7171-499e-ba5c-d6fdd816257b",
    "title": "Ra (1999)",
    "players": "2-5",
    "playTime": 60,
    "weight": 2.08,
    "imageUrl": "https://ph-test-11.slatic.net/p/092131a2d4b3b1f8923171dac69125a4.jpg",
    "totalPlays": 0
  },
  {
    "id": "fffcd4ba-65cb-45a4-8e83-7974d7ab7523",
    "title": "High Society (1995)",
    "players": "3-5",
    "playTime": 30,
    "weight": 2.22,
    "imageUrl": "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=2906271236144062",
    "totalPlays": 0
  },
  {
    "id": "cdea26c9-a5ba-45b0-930e-9ba2e3fb9b00",
    "title": "For Sale (1997)",
    "players": "3-6",
    "playTime": 30,
    "weight": 2.36,
    "imageUrl": "https://i.ebayimg.com/images/g/rOMAAOSwJJ1lLXzE/s-l400.jpg",
    "totalPlays": 0
  }
];

const initialPlayers: Player[] = [
  { id: '08add8ea-3158-4a27-ac53-a17353dc20b0', name: 'Nahyup', group: 'User', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nahyup' },
  { id: '6436820c-af37-4b2d-89e0-1644503329d2', name: 'Mom', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mom' },
  { id: 'f03f59af-84be-49b4-bf1c-882fd0344d4b', name: 'Dad', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dad' },
  { id: 'a6ace485-ec6f-46ca-ba76-f832d18fa43b', name: 'Sister', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sister' },
  { id: '87253b71-031f-4e92-bed9-3de068e52d21', name: 'Brother', group: 'Family', imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Brother' },
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
      version: 1,
      migrate: (persistedState: unknown, fromVersion: number) => {
        const state = persistedState as { games: Game[]; players: Player[]; logs: PlayLog[] };
        if (fromVersion < 1 && state.logs) {
          // Remove legacy winnerId field; ensure winnerIds is always a string[]
          state.logs = state.logs.map((log: PlayLog & { winnerId?: string | null }) => {
            const { winnerId, winnerIds, ...rest } = log;
            return {
              ...rest,
              winnerIds: winnerIds ?? (winnerId ? [winnerId] : []),
            } as PlayLog;
          });
        }
        return state;
      },
    }
  )
);
