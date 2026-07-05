const fs = require('fs');
const path = require('path');

// 1. Read data.json
const dataPath = path.resolve(__dirname, 'data.json');
if (!fs.existsSync(dataPath)) {
  console.error("data.json not found!");
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const games = data.state.games;
const players = data.state.players;
const logs = data.state.logs;

// 2. Perform stats calculation
const gameMap = new Map(games.map(g => [g.id, g]));
const playerMap = new Map(players.map(p => [p.id, p]));

const gamePlays = {};
const pStats = {};
players.forEach(p => {
  pStats[p.id] = { name: p.name, group: p.group, imageUrl: p.imageUrl, plays: 0, wins: 0, totalScore: 0, scoreCount: 0 };
});

let maxScoreRecord = { score: 0, player: '없음', game: '없음', date: '없음' };
const totalPlays = logs.length;

logs.forEach(log => {
  const g = gameMap.get(log.gameId);
  if (g) {
    gamePlays[g.id] = gamePlays[g.id] || { title: g.title, subtitle: g.subtitle, plays: 0, imageUrl: g.imageUrl };
    gamePlays[g.id].plays++;
  }

  log.players.forEach(lp => {
    const pStat = pStats[lp.playerId];
    if (pStat) {
      pStat.plays++;
      if (typeof lp.score === 'number') {
        pStat.totalScore += lp.score;
        pStat.scoreCount++;
        if (lp.score > maxScoreRecord.score) {
          maxScoreRecord = {
            score: lp.score,
            player: pStat.name,
            game: g ? g.title : 'Unknown',
            date: log.date.substring(0, 10)
          };
        }
      }
    }
  });

  log.winnerIds.forEach(wId => {
    if (pStats[wId]) {
      pStats[wId].wins++;
    }
  });
});

const sortedGames = Object.values(gamePlays).sort((a, b) => b.plays - a.plays);
const sortedPlayers = Object.values(pStats).sort((a, b) => b.plays - a.plays);

// Direct Dad vs Mom 1v1 metrics
let dadWins1v1 = 0;
let momWins1v1 = 0;
let total1v1Plays = 0;
const vsGameBreakdown = {};

logs.forEach(log => {
  if (log.players.length === 2) {
    const p1 = playerMap.get(log.players[0].playerId);
    const p2 = playerMap.get(log.players[1].playerId);
    if (p1 && p2 && ((p1.name === '아빠' && p2.name === '엄마') || (p1.name === '엄마' && p2.name === '아빠'))) {
      total1v1Plays++;
      const g = gameMap.get(log.gameId);
      const gTitle = g ? g.title : 'Unknown';
      vsGameBreakdown[gTitle] = vsGameBreakdown[gTitle] || { plays: 0, dadWins: 0, momWins: 0 };
      vsGameBreakdown[gTitle].plays++;

      log.winnerIds.forEach(wId => {
        const wName = playerMap.get(wId)?.name;
        if (wName === '아빠') {
          dadWins1v1++;
          vsGameBreakdown[gTitle].dadWins++;
        }
        if (wName === '엄마') {
          momWins1v1++;
          vsGameBreakdown[gTitle].momWins++;
        }
      });
    }
  }
});

// Kids metrics
const findPlayCount = (name) => pStats[players.find(p => p.name === name)?.id || '']?.plays || 0;
const findWinCount = (name) => pStats[players.find(p => p.name === name)?.id || '']?.wins || 0;

const kidsHighlights = {
  seoyeon: { plays: findPlayCount('서연'), wins: findWinCount('서연') },
  seoa: { plays: findPlayCount('서아'), wins: findWinCount('서아') },
  sejun: { plays: findPlayCount('서준'), wins: findWinCount('서준') }
};

// 3. Generate HTML File Content
const databaseJSON = JSON.stringify({ games, players, logs }, null, 2);

const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>2026 Dice Five Chronicle: 우리들의 보드게임 연대기</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@600;700;800&family=Noto+Sans+KR:wght@400;500;700&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'Noto Sans KR', 'sans-serif'],
            display: ['Outfit', 'Noto Sans KR', 'sans-serif'],
          },
          colors: {
            primary: {
              50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
              400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
              800: '#1e40af', 900: '#1e3a8a',
            },
            surface: {
              50: '#ffffff', 100: '#f8fafc', 200: '#f1f5f9', 300: '#e2e8f0',
              400: '#cbd5e1', 500: '#94a3b8', 600: '#64748b', 700: '#475569',
              800: '#334155', 900: '#0f172a',
            }
          }
        }
      }
    }
  </script>
  <style>
    ::-webkit-scrollbar {
      width: 6px;
      height: 6px;
    }
    ::-webkit-scrollbar-track {
      background: transparent;
    }
    ::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 9999px;
    }
    .dark ::-webkit-scrollbar-thumb {
      background: #475569;
    }
    .glass {
      background: rgba(255, 255, 255, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
    .dark .glass {
      background: rgba(15, 23, 42, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.05);
    }
    .fancy-card {
      position: relative;
      overflow: hidden;
    }
    .fancy-card::after {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; height: 4px;
      background: linear-gradient(90deg, #3b82f6, #6366f1, #ec4899);
    }
  </style>
</head>
<body class="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 antialiased font-sans transition-colors duration-300">
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto space-y-10">
      
      <!-- Theme Switcher & Date Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-3.5 w-3.5 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-500"></span>
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-surface-500">Dice Five 2026 Commemorative Archive</span>
        </div>
        <button onclick="document.documentElement.classList.toggle('dark')" class="p-2 bg-surface-200 dark:bg-surface-800 rounded-xl hover:scale-105 transition-all text-xs font-bold">
          🌗 테마 전환 (다크/라이트)
        </button>
      </div>

      <!-- Hero Section -->
      <div class="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-tr from-indigo-900 via-slate-900 to-blue-900 text-white p-8 sm:p-12">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
        <div class="relative z-10 space-y-6 max-w-3xl">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-primary-200 border border-white/10">
            ✨ 보드게임 연간 결산 기념 문서
          </div>
          <h1 class="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none">
            2026 우리들의 보드게임 연대기
          </h1>
          <p class="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            함께 머리를 맞대고 웃고 외치며 보드판을 수놓았던 지난 1년간의 보드게임 스토리입니다.<br>
            엄마와 아빠의 끝없는 아크 노바 승부, 훌쩍 자라나며 부모를 위협하는 아이들의 두뇌 싸움, 
            친구들과의 고요하지만 뜨거운 두뇌 전쟁의 순간들을 기록으로 되짚어봅니다.
          </p>
          <div class="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <div class="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
              📅 기간: 2026.01.01 ~ 2026.07.04
            </div>
            <div class="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
              🎲 총 플레이 횟수: <span class="text-primary-300 font-bold font-display text-sm">${totalPlays}</span>회
            </div>
          </div>
        </div>
      </div>

      <!-- Overall Summary Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
          <div class="text-amber-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg></div>
          <div>
            <p class="text-xs text-surface-500 font-semibold uppercase tracking-wider">최다 플레이 게임</p>
            <h3 class="text-lg font-bold">${sortedGames[0]?.title || '없음'}</h3>
            <p class="text-xs text-surface-400 mt-1">${sortedGames[0]?.subtitle || ''} • 총 ${sortedGames[0]?.plays || 0}회 플레이</p>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
          <div class="text-rose-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div>
          <div>
            <p class="text-xs text-surface-500 font-semibold uppercase tracking-wider">세기의 라이벌 (Direct 1v1)</p>
            <h3 class="text-lg font-bold">아빠 vs 엄마 : 15 - 15 동점</h3>
            <p class="text-xs text-surface-400 mt-1">아크 노바 10승 10패 / 마르코 폴로 II 3승 3패 등 완벽한 균형</p>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
          <div class="text-indigo-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
          <div>
            <p class="text-xs text-surface-500 font-semibold uppercase tracking-wider">단일 게임 최고 득점</p>
            <h3 class="text-lg font-bold">${maxScoreRecord.player} : ${maxScoreRecord.score}점</h3>
            <p class="text-xs text-surface-400 mt-1">${maxScoreRecord.game} (${maxScoreRecord.date})</p>
          </div>
        </div>
      </div>

      <!-- Highlights Section -->
      <div class="space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span>🏆</span> 3대 연대기 스토리 하이라이트
        </h2>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Story 1 -->
          <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div class="p-6 bg-gradient-to-br from-rose-50 to-pink-50/20 dark:from-rose-950/20 dark:to-transparent border-b border-surface-100 dark:border-surface-700 shrink-0">
              <span class="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-100/50 dark:bg-rose-900/30 px-2.5 py-1 rounded-full">Story #1</span>
              <h3 class="text-xl font-bold mt-2 text-surface-900 dark:text-white">세기의 대결: 아빠 vs 엄마</h3>
              <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">끝없는 라이벌, 소름 돋는 동점 행진</p>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-3 text-sm text-surface-600 dark:text-surface-300">
                <p>
                  아빠(58회 플레이)와 엄마(51회 플레이)는 이번 해 보드게임 테이블의 가장 거대한 두 기둥이었습니다. 
                  두 사람은 마주 앉기만 하면 팽팽한 불꽃을 튀겼습니다.
                </p>
                <div class="bg-surface-100 dark:bg-surface-900/50 p-4 rounded-xl space-y-2 border border-surface-200/50 dark:border-surface-700/50">
                  <div class="flex justify-between text-xs font-bold">
                    <span>👑 아빠 1v1 승리: 15승</span>
                    <span>👑 엄마 1v1 승리: 15승</span>
                  </div>
                  <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                    <div class="bg-rose-500 h-full w-[50%]"></div>
                    <div class="bg-indigo-500 h-full w-[50%]"></div>
                  </div>
                  <div class="text-[11px] text-center text-surface-400">총 30회의 1v1 경기 중 정확히 15대 15로 균형</div>
                </div>
                <p>
                  최애 전략 게임인 <strong>아크 노바</strong>에서는 무려 20전 10승 10패로 맞섰으며, 
                  "버그다 버그. 핵이네.", "이 것 이 실 력", "망겜이네 망겜."과 같은 유쾌한 앙숙 멘트를 리뷰에 가득 남겼습니다.
                </p>
              </div>
              <div class="pt-4 border-t border-surface-100 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
                <span>아크 노바 전적: 10승 10패</span>
                <span>마르코폴로2 전적: 3승 3패 1무</span>
              </div>
            </div>
          </div>

          <!-- Story 2 -->
          <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div class="p-6 bg-gradient-to-br from-amber-50 to-yellow-50/20 dark:from-amber-950/20 dark:to-transparent border-b border-surface-100 dark:border-surface-700 shrink-0">
              <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">Story #2</span>
              <h3 class="text-xl font-bold mt-2 text-surface-900 dark:text-white">아이들의 무서운 성장</h3>
              <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">서연, 서아, 서준의 빛나는 반란</p>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-3 text-sm text-surface-600 dark:text-surface-300">
                <p>
                  아이들이 패밀리 게임 테이블의 주역으로 당당히 우뚝 섰습니다! 
                  그저 가벼운 게임만 즐기던 아이들은 이제 중급 전략 게임에서 부모를 압도하기 시작했습니다.
                </p>
                <ul class="space-y-2 text-xs">
                  <li class="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    🥇 <strong>서연이의 기적 (르 아브르 118점 승리):</strong> 5월 29일 첫 중급 전략 도전임에도 아빠(116점)를 단 2점 차이로 꺾고 드라마틱하게 승리하였습니다. 또한 <em>원더풀 월드</em>에서도 첫 플레이에 39점을 획득해 엄빠를 물리쳤습니다!
                  </li>
                  <li class="bg-pink-500/10 p-2.5 rounded-lg border border-pink-500/20">
                    🐱 <strong>서아의 최애와 도전:</strong> 최애 게임 <em>타코 캣 고트 치즈 피자</em>에서 무한 스피드를 자랑하며, <em>캐슬콤보</em>에서도 첫 판에 80점을 내며 엄빠를 맹추격했습니다.
                  </li>
                  <li class="bg-blue-500/10 p-2.5 rounded-lg border border-blue-500/20">
                    🧁 <strong>서준타임!:</strong> 패밀리가 모두 모인 <em>머핀 타임</em>의 대혼란 속에서 보란 듯이 10카드를 모아 승리하며 "서준타임!"을 선포했습니다.
                  </li>
                </ul>
              </div>
              <div class="pt-4 border-t border-surface-100 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
                <span>서연: ${kidsHighlights.seoyeon.plays}회 플레이 (${kidsHighlights.seoyeon.wins}승)</span>
                <span>서아: ${kidsHighlights.seoa.plays}회 플레이 (${kidsHighlights.seoa.wins}승)</span>
              </div>
            </div>
          </div>

          <!-- Story 3 -->
          <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div class="p-6 bg-gradient-to-br from-indigo-50 to-blue-50/20 dark:from-indigo-950/20 dark:to-transparent border-b border-surface-100 dark:border-surface-700 shrink-0">
              <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-100/50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">Story #3</span>
              <h3 class="text-xl font-bold mt-2 text-surface-900 dark:text-white">지성들의 대충돌</h3>
              <p class="text-xs text-surface-500 dark:text-surface-400 mt-1">친구들과 함께 보낸 뜨거운 주말 밤</p>
            </div>
            <div class="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div class="space-y-3 text-sm text-surface-600 dark:text-surface-300">
                <p>
                  패밀리 이외에도, 주말이나 명절 연휴가 되면 <strong>친구들(알비, 시로, 지니, 심심이, 케이, 레티)</strong>이 모여 헤비한 두뇌 싸움을 개시했습니다.
                </p>
                <p>
                  설 연휴인 2월 14일, <em>엘 그란데 빅 박스</em>로 새벽까지 판세 싸움을 벌인 것을 시작으로 <em>카네기</em>, 외계 생명체를 찾기 위한 신작 <em>SETI</em>까지 거침없이 개봉하였습니다.
                </p>
                <div class="bg-surface-100 dark:bg-surface-900/50 p-3.5 rounded-xl border border-surface-200/50 dark:border-surface-700/50 text-xs text-surface-500">
                  ⚡ <strong>레전드 매치 (GWT 4시간):</strong> 3월 28일, <em>그레이트 웨스턴 트레일</em> 4인플 도중 게임에 너무 몰입해 "4시간... 이걸 4시간..."이라는 절규와 희열 섞인 메모를 남기기도 했습니다.
                </div>
              </div>
              <div class="pt-4 border-t border-surface-100 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>친구 그룹 플레이: 총 17회</span>
                <span>레티/케이: 17회 참여 최다</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Player Cards -->
      <div class="space-y-6">
        <h2 class="text-2xl font-bold flex items-center gap-2">
          <span>👥</span> 함께한 플레이어 연감
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="player-grid">
          <!-- Populated by JS -->
        </div>
      </div>

      <!-- Timeline & Log Section -->
      <div class="space-y-6">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h2 class="text-2xl font-bold flex items-center gap-2">
            <span>📖</span> 2026 추억 책장 (플레이 타임라인)
          </h2>
          <!-- Search & Filter UI -->
          <div class="flex flex-wrap gap-2">
            <input type="text" id="timeline-search" placeholder="게임, 플레이어, 메모 검색..." oninput="filterTimeline()" class="bg-white dark:bg-surface-800 text-sm px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
            <select id="timeline-filter" onchange="filterTimeline()" class="bg-white dark:bg-surface-800 text-sm px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="all">전체 추억</option>
              <option value="rivalry">엄빠 아크노바/라이벌전</option>
              <option value="kids">아이들 참여 경기</option>
              <option value="friends">친구 모임 경기</option>
            </select>
          </div>
        </div>

        <div id="timeline-container" class="space-y-4">
          <!-- Populated by JS -->
        </div>
      </div>

    </div>
  </div>

  <!-- Detail Modal -->
  <div id="log-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white dark:bg-surface-800 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
        <div>
          <span id="modal-date" class="text-xs font-semibold text-primary-500"></span>
          <h3 id="modal-game" class="text-xl font-bold mt-0.5"></h3>
        </div>
        <button onclick="closeModal()" class="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        <!-- Photo Gallery -->
        <div id="modal-images" class="grid grid-cols-1 sm:grid-cols-2 gap-3 hidden"></div>
        <!-- Scores -->
        <div>
          <h4 class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">플레이 스코어 및 결과</h4>
          <div id="modal-scores" class="space-y-2"></div>
        </div>
        <!-- Review Memo -->
        <div class="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
          <h4 class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">리뷰 메모</h4>
          <p id="modal-memo" class="text-sm italic text-surface-700 dark:text-surface-300 whitespace-pre-wrap"></p>
        </div>
      </div>
    </div>
  </div>

  <!-- Database & Logic Injection -->
  <script>
    const database = ${databaseJSON};
    const gameMap = new Map(database.games.map(g => [g.id, g]));
    const playerMap = new Map(database.players.map(p => [p.id, p]));

    // Render Players
    const playerGrid = document.getElementById('player-grid');
    database.players.forEach(p => {
      // Calculate win rates
      let plays = 0;
      let wins = 0;
      let totalScore = 0;
      let scoreCount = 0;
      
      database.logs.forEach(l => {
        const lp = l.players.find(lp => lp.playerId === p.id);
        if (lp) {
          plays++;
          if (typeof lp.score === 'number') {
            totalScore += lp.score;
            scoreCount++;
          }
        }
        if (l.winnerIds.includes(p.id)) {
          wins++;
        }
      });

      const winRate = plays > 0 ? (wins / plays * 100).toFixed(0) : 0;
      const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(0) : 0;
      const avatarUrl = p.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(p.name);

      const isDefaultUrl = p.imageUrl && p.imageUrl.startsWith('/uploads/');
      const resolvedAvatarUrl = isDefaultUrl ? p.imageUrl.substring(1) : avatarUrl;

      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col items-center text-center space-y-3 hover:shadow-md transition-all group';
      card.innerHTML = \`
        <div class="w-16 h-16 rounded-full overflow-hidden shadow-inner shrink-0 relative border-2 border-primary-500/20 group-hover:border-primary-500 transition-all duration-300">
          <img src="\${resolvedAvatarUrl}" alt="\${p.name}" class="w-full h-full object-cover" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent('\${p.name}')">
        </div>
        <div>
          <h4 class="font-bold text-sm text-surface-900 dark:text-white">\${p.name}</h4>
          <span class="text-[10px] bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-surface-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">\${p.group === 'Family' ? '가족' : '친구'}</span>
        </div>
        <div class="grid grid-cols-2 w-full pt-2 border-t border-surface-100 dark:border-surface-700 text-center gap-1">
          <div>
            <p class="text-[9px] text-surface-400 font-semibold uppercase">플레이</p>
            <p class="text-xs font-bold text-surface-700 dark:text-surface-200 font-display">\${plays}회</p>
          </div>
          <div>
            <p class="text-[9px] text-surface-400 font-semibold uppercase">승률 / 평점</p>
            <p class="text-xs font-bold text-primary-600 dark:text-primary-400 font-display">\${winRate}% <span class="text-[10px] text-surface-400 font-normal">(\${avgScore}점)</span></p>
          </div>
        </div>
      \`;
      playerGrid.appendChild(card);
    });

    // Timeline Rendering
    function filterTimeline() {
      const filter = document.getElementById('timeline-filter').value;
      const search = document.getElementById('timeline-search').value.toLowerCase();
      const container = document.getElementById('timeline-container');
      container.innerHTML = '';

      let list = [...database.logs].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Filter
      if (filter === 'rivalry') {
        list = list.filter(log => {
          const game = gameMap.get(log.gameId);
          const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name);
          const hasDad = playNames.includes('아빠');
          const hasMom = playNames.includes('엄마');
          const isArkNova = game?.title.includes('Ark Nova') || game?.subtitle?.includes('아크 노바');
          if (log.players.length === 2 && hasDad && hasMom) return true;
          if (isArkNova && hasDad && hasMom) return true;
          return false;
        });
      } else if (filter === 'kids') {
        list = list.filter(log => {
          const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name);
          return playNames.includes('서연') || playNames.includes('서아') || playNames.includes('서준');
        });
      } else if (filter === 'friends') {
        list = list.filter(log => {
          return log.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend');
        });
      }

      // Search
      if (search) {
        list = list.filter(log => {
          const game = gameMap.get(log.gameId);
          const gameTitle = game ? \`\${game.title} \${game.subtitle || ''}\`.toLowerCase() : '';
          const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name || '').join(' ').toLowerCase();
          const memo = (log.reviewMemo || '').toLowerCase();
          return gameTitle.includes(search) || playNames.includes(search) || memo.includes(search);
        });
      }

      if (list.length === 0) {
        container.innerHTML = \`
          <div class="text-center py-12 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 text-surface-400">
             검색 필터에 맞는 추억 플레이 로그가 없습니다.
          </div>
        \`;
        return;
      }

      list.forEach(log => {
        const game = gameMap.get(log.gameId);
        const winners = log.winnerIds.map(wId => playerMap.get(wId)?.name).filter(Boolean).join(', ');
        const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name).filter(Boolean).join(', ');
        
        let formattedDate = '';
        try {
          const d = new Date(log.date);
          formattedDate = \`\${d.getFullYear()}년 \${d.getMonth() + 1}월 \${d.getDate()}일\`;
        } catch(e) {
          formattedDate = log.date.substring(0, 10);
        }

        const gameTitle = game ? game.title : '알 수 없는 게임';
        const gameSubtitle = game && game.subtitle ? game.subtitle : '';

        // Determine badge type based on participants
        let badgeHTML = '';
        const isRivalry = log.players.length === 2 && playNames.includes('아빠') && playNames.includes('엄마');
        if (isRivalry) {
          badgeHTML = \`<span class="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded">엄빠 1v1 라이벌</span>\`;
        } else if (log.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend')) {
          badgeHTML = \`<span class="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">친구 모임</span>\`;
        } else {
          badgeHTML = \`<span class="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">패밀리 게임</span>\`;
        }

        // Image check
        let imageSnippet = '';
        if (log.imageUrls && log.imageUrls.length > 0) {
          const rawUrl = log.imageUrls[0];
          const resolvedUrl = rawUrl.startsWith('/') ? rawUrl.substring(1) : rawUrl;
          imageSnippet = \`
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="\${resolvedUrl}" alt="\${gameTitle}" class="w-full h-full object-cover">
            </div>
          \`;
        } else if (game && game.imageUrl) {
          imageSnippet = \`
            <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
              <img src="\${game.imageUrl}" alt="\${gameTitle}" class="w-full h-full object-cover" onerror="this.style.display='none'">
            </div>
          \`;
        }

        const div = document.createElement('div');
        div.onclick = () => openModal(log.id);
        div.className = 'bg-white dark:bg-surface-800 p-4 sm:p-5 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md transition-all cursor-pointer flex gap-4 group items-center';
        div.innerHTML = \`
          \${imageSnippet}
          <div class="flex-1 min-w-0 space-y-1">
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-xs text-surface-400 font-display">\${formattedDate}</span>
              \${badgeHTML}
            </div>
            <h3 class="font-bold text-base sm:text-lg truncate text-surface-900 dark:text-white">\${gameTitle} <span class="text-xs sm:text-sm font-normal text-surface-500 font-sans">\${gameSubtitle ? '(' + gameSubtitle + ')' : ''}</span></h3>
            <p class="text-xs sm:text-sm text-surface-500 dark:text-surface-400 italic truncate mt-1">"\${log.reviewMemo || '기록된 메모 없음'}"</p>
            <div class="flex justify-between items-center pt-2 text-[11px] text-surface-400">
              <span>👥 멤버: \${playNames}</span>
              <span class="text-primary-500 font-semibold">👑 우승: \${winners}</span>
            </div>
          </div>
          <div class="text-surface-300 group-hover:text-primary-500 transition-colors shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
          </div>
        \`;
        container.appendChild(div);
      });
    }

    // Modal Control
    function openModal(logId) {
      const log = database.logs.find(l => l.id === logId);
      if (!log) return;
      
      const game = gameMap.get(log.gameId);
      
      let formattedDate = '';
      try {
        const d = new Date(log.date);
        formattedDate = \`\${d.getFullYear()}년 \${d.getMonth() + 1}월 \${d.getDate()}일 플레이\`;
      } catch(e) {
        formattedDate = log.date.substring(0, 10);
      }

      document.getElementById('modal-date').textContent = formattedDate;
      document.getElementById('modal-game').innerHTML = \`\${game ? game.title : '알 수 없는 게임'} <span class="text-sm font-normal text-surface-500">\${game && game.subtitle ? '(' + game.subtitle + ')' : ''}</span>\`;
      document.getElementById('modal-memo').textContent = log.reviewMemo || '리뷰 메모가 기록되지 않았습니다.';

      // Render images
      const imgContainer = document.getElementById('modal-images');
      imgContainer.innerHTML = '';
      if (log.imageUrls && log.imageUrls.length > 0) {
        imgContainer.classList.remove('hidden');
        log.imageUrls.forEach(url => {
          const resolvedUrl = url.startsWith('/') ? url.substring(1) : url;
          const img = document.createElement('img');
          img.src = resolvedUrl;
          img.className = 'w-full h-48 sm:h-64 object-cover rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm';
          imgContainer.appendChild(img);
        });
      } else {
        imgContainer.classList.add('hidden');
      }

      // Render scores
      const scoreContainer = document.getElementById('modal-scores');
      scoreContainer.innerHTML = '';
      
      // Sort scores descending
      const sortedLogPlayers = [...log.players].sort((a,b) => b.score - a.score);

      sortedLogPlayers.forEach((lp, idx) => {
        const player = playerMap.get(lp.playerId);
        const isWinner = log.winnerIds.includes(lp.playerId);
        const name = player ? player.name : '알 수 없는 플레이어';
        const group = player ? (player.group === 'Family' ? '가족' : '친구') : '';
        const scoreVal = typeof lp.score === 'number' ? lp.score + '점' : '점수 없음';

        const row = document.createElement('div');
        row.className = \`flex justify-between items-center p-3 rounded-xl border \${isWinner ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surface-50 dark:bg-surface-900/40 border-surface-200/60 dark:border-surface-700/50'}\`;
        
        row.innerHTML = \`
          <div class="flex items-center gap-3">
            <span class="w-5 text-center text-xs font-bold text-surface-400 font-display">\${idx + 1}</span>
            <div>
              <p class="text-sm font-bold \${isWinner ? 'text-primary-600 dark:text-primary-400' : ''}">\${name} \${isWinner ? '👑' : ''}</p>
              <p class="text-[10px] text-surface-400 font-semibold uppercase">\${group}</p>
            </div>
          </div>
          <span class="font-display font-bold text-sm \${isWinner ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}">\${scoreVal}</span>
        \`;
        scoreContainer.appendChild(row);
      });

      document.getElementById('log-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('log-modal').classList.add('hidden');
    }

    // Close modal on escape
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Initialize
    filterTimeline();
  </script>
</body>
</html>`;

fs.writeFileSync(path.resolve(__dirname, 'dice-five-2026-chronicle.html'), htmlContent, 'utf8');
console.log("SUCCESS: dice-five-2026-chronicle.html has been generated successfully.");
