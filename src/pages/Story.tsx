import { useBoardGameStore, type PlayLog } from '../store/useBoardGameStore';
import { Sparkles, Trophy, Heart, Calendar, Download, Search, X, ChevronRight, Award, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useMemo, useEffect } from 'react';

const GRADIENTS = [
  { name: 'Deep Space', class: 'from-indigo-950 via-slate-900 to-blue-900' },
  { name: 'Sunset Glow', class: 'from-rose-950 via-slate-900 to-amber-900' },
  { name: 'Ocean Depth', class: 'from-teal-950 via-slate-900 to-emerald-900' },
  { name: 'Royal Purple', class: 'from-violet-950 via-slate-900 to-purple-900' },
];

export default function Story() {
  const { games, players, logs, stories, addStory, deleteStory } = useBoardGameStore();
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  
  // Create New Story State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [selectedGradient, setSelectedGradient] = useState(GRADIENTS[0].class);

  // Timeline State
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'rivalry' | 'kids' | 'friends'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<PlayLog | null>(null);

  const gameMap = useMemo(() => new Map(games.map(g => [g.id, g])), [games]);
  const playerMap = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);

  // 1. Auto-initialize default 2026 Story if stories list is empty
  useEffect(() => {
    if (stories && stories.length === 0 && logs.length > 0) {
      addStory({
        title: "2026 우리들의 보드게임 연대기",
        description: "함께 웃고 울었던 지난 1년간의 플레이 세션과 엄마 아빠의 아크 노바 라이벌전",
        startDate: "2026-01-01",
        endDate: "2026-07-04",
        coverGradient: "from-indigo-950 via-slate-900 to-blue-900"
      });
    }
  }, [stories, logs, addStory]);

  // Find the selected story object
  const currentStory = useMemo(() => {
    return (stories || []).find(s => s.id === selectedStoryId) || null;
  }, [stories, selectedStoryId]);

  // Filter logs specifically in the range of the current story
  const storyLogs = useMemo(() => {
    if (!currentStory) return [];
    const start = new Date(currentStory.startDate).getTime();
    const end = new Date(currentStory.endDate + 'T23:59:59').getTime(); // inclusive
    return logs.filter(log => {
      const d = new Date(log.date).getTime();
      return d >= start && d <= end;
    });
  }, [logs, currentStory]);

  // Calculate detailed stats for the selected story logs
  const stats = useMemo(() => {
    if (!storyLogs.length) return null;

    // Game play counts
    const gamePlays: Record<string, { title: string; subtitle?: string; plays: number; imageUrl: string }> = {};
    // Player stats
    const pStats: Record<string, { name: string; group: string; imageUrl?: string; plays: number; wins: number; totalScore: number; scoreCount: number }> = {};
    players.forEach(p => {
      pStats[p.id] = { name: p.name, group: p.group, imageUrl: p.imageUrl, plays: 0, wins: 0, totalScore: 0, scoreCount: 0 };
    });

    let maxScoreRecord = { score: 0, player: '없음', game: '없음', date: '없음' };
    let totalPlays = storyLogs.length;

    storyLogs.forEach(log => {
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
                date: log.date.substring(0, 10),
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
    const vsGameBreakdown: Record<string, { plays: number; dadWins: number; momWins: number }> = {};

    storyLogs.forEach(log => {
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

    // Kids' accomplishments
    const getPlays = (name: string) => pStats[players.find(p => p.name === name)?.id || '']?.plays || 0;
    const getWins = (name: string) => pStats[players.find(p => p.name === name)?.id || '']?.wins || 0;
    
    const kidsHighlights = {
      seoyeon: { plays: getPlays('서연'), wins: getWins('서연') },
      seoa: { plays: getPlays('서아'), wins: getWins('서아') },
      seojun: { plays: getPlays('서준'), wins: getWins('서준') },
    };

    return {
      totalPlays,
      maxScoreRecord,
      topGames: sortedGames,
      players: sortedPlayers,
      dadWins1v1,
      momWins1v1,
      total1v1Plays,
      vsGameBreakdown,
      kidsHighlights,
    };
  }, [storyLogs, players, gameMap, playerMap]);

  // Filter story logs for display timeline
  const filteredLogs = useMemo(() => {
    let result = [...storyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Filter by type
    if (selectedFilter === 'rivalry') {
      result = result.filter(log => {
        const game = gameMap.get(log.gameId);
        const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name);
        const hasDad = playNames.includes('아빠');
        const hasMom = playNames.includes('엄마');
        const isArkNova = game?.title.includes('Ark Nova') || game?.subtitle?.includes('아크 노바');
        if (log.players.length === 2 && hasDad && hasMom) return true;
        if (isArkNova && hasDad && hasMom) return true;
        return false;
      });
    } else if (selectedFilter === 'kids') {
      result = result.filter(log => {
        const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name);
        return playNames.includes('서연') || playNames.includes('서아') || playNames.includes('서준');
      });
    } else if (selectedFilter === 'friends') {
      result = result.filter(log => {
        return log.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend');
      });
    }

    // Search term
    if (searchTerm.trim() !== '') {
      const lower = searchTerm.toLowerCase();
      result = result.filter(log => {
        const game = gameMap.get(log.gameId);
        const gameTitle = game ? `${game.title} ${game.subtitle || ''}`.toLowerCase() : '';
        const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name || '').join(' ').toLowerCase();
        const memo = (log.reviewMemo || '').toLowerCase();
        return gameTitle.includes(lower) || playNames.includes(lower) || memo.includes(lower);
      });
    }

    return result;
  }, [storyLogs, selectedFilter, searchTerm, gameMap, playerMap]);

  // Handler to Create a new Commemorative Story
  const handleCreateStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newStartDate || !newEndDate) {
      alert('기념관 제목, 시작일, 종료일을 모두 입력해주세요.');
      return;
    }

    addStory({
      title: newTitle,
      description: newDescription,
      startDate: newStartDate,
      endDate: newEndDate,
      coverGradient: selectedGradient
    });

    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setNewStartDate('');
    setNewEndDate('');
    setSelectedGradient(GRADIENTS[0].class);
    setIsCreateModalOpen(false);
  };

  // Handler to delete a story
  const handleDeleteStory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking on card to enter story details
    if (window.confirm('이 보드게임 기념관을 삭제하시겠습니까? 데이터 기록(게임 및 로그) 자체는 삭제되지 않습니다.')) {
      deleteStory(id);
      if (selectedStoryId === id) {
        setSelectedStoryId(null);
      }
    }
  };

  // Generate self-contained HTML for the selected story
  const handleExportHTML = () => {
    if (!currentStory || !stats) return;

    // Filter logs for this specific story
    const filteredDBLogs = logs.filter(log => {
      const d = new Date(log.date).getTime();
      const start = new Date(currentStory.startDate).getTime();
      const end = new Date(currentStory.endDate + 'T23:59:59').getTime();
      return d >= start && d <= end;
    });

    const databaseJSON = JSON.stringify({
      games,
      players,
      logs: filteredDBLogs
    }, null, 2);

    const htmlContent = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dice Five Chronicle: ${currentStory.title}</title>
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
  </style>
</head>
<body class="bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-surface-100 antialiased font-sans transition-colors duration-300">
  <div class="min-h-screen py-10 px-4 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto space-y-10">
      
      <!-- Header -->
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
          <span class="inline-flex h-3.5 w-3.5 relative">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-primary-500"></span>
          </span>
          <span class="text-xs font-bold uppercase tracking-wider text-surface-500">Dice Five Commemorative Story</span>
        </div>
        <button onclick="document.documentElement.classList.toggle('dark')" class="p-2 bg-surface-200 dark:bg-surface-800 rounded-xl hover:scale-105 transition-all text-xs font-bold">
          🌗 테마 전환
        </button>
      </div>

      <!-- Hero Section -->
      <div class="relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-tr ${currentStory.coverGradient} text-white p-8 sm:p-12">
        <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div class="relative z-10 space-y-6 max-w-3xl">
          <div class="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1.5 rounded-full text-xs font-semibold text-primary-200 border border-white/10">
            ✨ 보드게임 기념관 문서
          </div>
          <h1 class="text-4xl sm:text-5xl font-display font-black tracking-tight leading-none">
            ${currentStory.title}
          </h1>
          <p class="text-base sm:text-lg text-slate-300 leading-relaxed font-light">
            ${currentStory.description || '지정된 기간 동안의 플레이 기록과 재미있는 통계입니다.'}
          </p>
          <div class="flex flex-wrap gap-4 text-xs font-semibold text-slate-300">
            <div class="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
              📅 기간: ${currentStory.startDate} ~ ${currentStory.endDate}
            </div>
            <div class="flex items-center gap-2 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
              🎲 플레이 횟수: <span class="text-primary-300 font-bold font-display text-sm">${stats.totalPlays}</span>회
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
            <h3 class="text-lg font-bold">${stats.topGames[0]?.title || '없음'}</h3>
            <p class="text-xs text-surface-400 mt-1">${stats.topGames[0]?.subtitle || ''} • 총 ${stats.topGames[0]?.plays || 0}회 플레이</p>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
          <div class="text-rose-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg></div>
          <div>
            <p class="text-xs text-surface-500 font-semibold uppercase tracking-wider">세기의 라이벌 (Direct 1v1)</p>
            <h3 class="text-lg font-bold">아빠 vs 엄마 : ${stats.dadWins1v1} - ${stats.momWins1v1}</h3>
            <p class="text-xs text-surface-400 mt-1">총 ${stats.total1v1Plays}전의 직접 대결 기록</p>
          </div>
        </div>
        <div class="bg-white dark:bg-surface-800 p-6 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm space-y-3">
          <div class="text-indigo-500"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div>
          <div>
            <p class="text-xs text-surface-500 font-semibold uppercase tracking-wider">최고 득점</p>
            <h3 class="text-lg font-bold">${stats.maxScoreRecord.player} : ${stats.maxScoreRecord.score}점</h3>
            <p class="text-xs text-surface-400 mt-1">${stats.maxScoreRecord.game} (${stats.maxScoreRecord.date})</p>
          </div>
        </div>
      </div>

      <!-- Narrative Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Story 1: Rivalry -->
        <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm flex flex-col justify-between p-6">
          <div class="space-y-3">
            <span class="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-100/50 dark:bg-rose-900/30 px-2.5 py-1 rounded-full">Story #1</span>
            <h3 class="text-lg font-bold text-surface-900 dark:text-white">아빠 vs 엄마 : 대결 연감</h3>
            <p class="text-sm text-surface-600 dark:text-surface-300">
              이 기간 동안 두 사람은 아크 노바, 마르코 폴로2 등 1v1 테이블에서 치열한 싸움을 펼쳤습니다.
            </p>
            <div class="bg-surface-50 dark:bg-surface-900/50 p-3.5 rounded-xl border border-surface-200/50 dark:border-surface-700/50 text-xs">
              <div class="flex justify-between font-bold mb-1">
                <span>아빠 1v1: ${stats.dadWins1v1}승</span>
                <span>엄마 1v1: ${stats.momWins1v1}승</span>
              </div>
              <div class="h-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden flex">
                <div class="bg-rose-500 h-full" style="width: 50%"></div>
                <div class="bg-indigo-500 h-full" style="width: 50%"></div>
              </div>
            </div>
          </div>
          <div class="pt-4 border-t border-surface-100 dark:border-surface-700 text-xs font-semibold text-rose-600 dark:text-rose-400">
            총 ${stats.total1v1Plays}회의 1v1 매치업 완료
          </div>
        </div>

        <!-- Story 2: Kids -->
        <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm flex flex-col justify-between p-6">
          <div class="space-y-3">
            <span class="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-100/50 dark:bg-amber-900/30 px-2.5 py-1 rounded-full">Story #2</span>
            <h3 class="text-lg font-bold text-surface-900 dark:text-white">아이들의 눈부신 활약</h3>
            <p class="text-sm text-surface-600 dark:text-surface-300">
              서연, 서아, 서준이는 전략 및 파티 게임의 판도를 흔들며 당당한 우승 후보가 되었습니다.
            </p>
            <div class="space-y-2 text-xs">
              <div class="flex justify-between"><span>서연 (플레이 / 우승)</span><strong>${stats.kidsHighlights.seoyeon.plays}회 / ${stats.kidsHighlights.seoyeon.wins}승</strong></div>
              <div class="flex justify-between"><span>서아 (플레이 / 우승)</span><strong>${stats.kidsHighlights.seoa.plays}회 / ${stats.kidsHighlights.seoa.wins}승</strong></div>
              <div class="flex justify-between"><span>서준 (플레이 / 우승)</span><strong>${stats.kidsHighlights.seojun.plays}회 / ${stats.kidsHighlights.seojun.wins}승</strong></div>
            </div>
          </div>
          <div class="pt-4 border-t border-surface-100 dark:border-surface-700 text-xs font-semibold text-amber-600 dark:text-amber-400">
            꾸준히 전략적 깊이를 늘려가는 아이들
          </div>
        </div>

        <!-- Story 3: Friends -->
        <div class="bg-white dark:bg-surface-800 rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden shadow-sm flex flex-col justify-between p-6">
          <div class="space-y-3">
            <span class="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">Story #3</span>
            <h3 class="text-lg font-bold text-surface-900 dark:text-white">친구들과 보낸 깊은 지략의 시간</h3>
            <p class="text-sm text-surface-600 dark:text-surface-300">
              알비, 케이, 레티 등 친구 무리가 가세하여 오랜 시간 몰입도 높은 대전을 완성했습니다.
            </p>
            <p class="text-xs bg-slate-100 dark:bg-surface-950/20 p-2 text-surface-500 rounded">
              GWT, Carnegie, SETI, El Grande 등의 전략 게임 위주로 긴밀한 연대가 형성되었습니다.
            </p>
          </div>
          <div class="pt-4 border-t border-surface-100 dark:border-surface-700 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            친구 그룹 모임 플레이: 총 ${storyLogs.filter(l => l.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend')).length}회
          </div>
        </div>
      </div>

      <!-- Player Cards -->
      <div class="space-y-6">
        <h2 class="text-2xl font-bold">👥 플레이어 연감</h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4" id="player-grid"></div>
      </div>

      <!-- Timeline -->
      <div class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-2xl font-bold">📖 이 기간의 추억 책장</h2>
          <div class="flex gap-2">
            <input type="text" id="timeline-search" placeholder="게임, 메모 검색..." oninput="filterTimeline()" class="bg-white dark:bg-surface-800 text-sm px-4 py-2 border border-surface-200 dark:border-surface-700 rounded-xl">
          </div>
        </div>
        <div id="timeline-container" class="space-y-4"></div>
      </div>

    </div>
  </div>

  <!-- Modal -->
  <div id="log-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 hidden">
    <div class="bg-white dark:bg-surface-800 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
      <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center">
        <div>
          <span id="modal-date" class="text-xs font-semibold text-primary-500"></span>
          <h3 id="modal-game" class="text-xl font-bold mt-0.5"></h3>
        </div>
        <button onclick="closeModal()" class="text-surface-500 hover:text-surface-700">&times;</button>
      </div>
      <div class="p-6 overflow-y-auto space-y-6 flex-1">
        <div id="modal-images" class="grid grid-cols-1 sm:grid-cols-2 gap-3 hidden"></div>
        <div>
          <h4 class="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">플레이 스코어 및 결과</h4>
          <div id="modal-scores" class="space-y-2"></div>
        </div>
        <div class="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl">
          <h4 class="text-xs font-bold text-surface-400 mb-2">리뷰 메모</h4>
          <p id="modal-memo" class="text-sm italic"></p>
        </div>
      </div>
    </div>
  </div>

  <script>
    const database = ${databaseJSON};
    const gameMap = new Map(database.games.map(g => [g.id, g]));
    const playerMap = new Map(database.players.map(p => [p.id, p]));

    // Render Players
    const playerGrid = document.getElementById('player-grid');
    database.players.forEach(p => {
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

      if (plays === 0) return; // Don't show inactive players for this period

      const winRate = (wins / plays * 100).toFixed(0);
      const avgScore = scoreCount > 0 ? (totalScore / scoreCount).toFixed(0) : 0;
      const avatarUrl = p.imageUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(p.name);
      const resolvedAvatarUrl = p.imageUrl && p.imageUrl.startsWith('/uploads/') ? p.imageUrl.substring(1) : avatarUrl;

      const card = document.createElement('div');
      card.className = 'bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col items-center text-center space-y-3';
      card.innerHTML = \`
        <div class="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500/20 relative">
          <img src="\${resolvedAvatarUrl}" class="w-full h-full object-cover" onerror="this.src='https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent('\${p.name}')">
        </div>
        <div>
          <h4 class="font-bold text-sm">\${p.name}</h4>
          <span class="text-[10px] bg-slate-100 dark:bg-surface-700 text-slate-500 px-2 py-0.5 rounded font-semibold uppercase">\${p.group === 'Family' ? '가족' : '친구'}</span>
        </div>
        <div class="grid grid-cols-2 w-full pt-2 border-t border-surface-100 text-center gap-1">
          <div>
            <p class="text-[9px] text-surface-400">플레이</p>
            <p class="text-xs font-bold">\${plays}회</p>
          </div>
          <div>
            <p class="text-[9px] text-surface-400">승률 / 평점</p>
            <p class="text-xs font-bold text-primary-500">\${winRate}% (\${avgScore}점)</p>
          </div>
        </div>
      \`;
      playerGrid.appendChild(card);
    });

    // Timeline Rendering
    function filterTimeline() {
      const search = document.getElementById('timeline-search').value.toLowerCase();
      const container = document.getElementById('timeline-container');
      container.innerHTML = '';

      let list = [...database.logs].sort((a, b) => new Date(b.date) - new Date(a.date));

      if (search) {
        list = list.filter(log => {
          const game = gameMap.get(log.gameId);
          const gameTitle = game ? \`\${game.title} \${game.subtitle || ''}\`.toLowerCase() : '';
          const memo = (log.reviewMemo || '').toLowerCase();
          return gameTitle.includes(search) || memo.includes(search);
        });
      }

      list.forEach(log => {
        const game = gameMap.get(log.gameId);
        const winners = log.winnerIds.map(wId => playerMap.get(wId)?.name).join(', ');
        const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name).join(', ');
        const gameTitle = game ? game.title : '알 수 없는 게임';
        
        let imageSnippet = '';
        if (log.imageUrls && log.imageUrls.length > 0) {
          imageSnippet = \`<div class="w-16 h-16 rounded-xl overflow-hidden border shrink-0"><img src="\${log.imageUrls[0].substring(1)}" class="w-full h-full object-cover"></div>\`;
        } else if (game && game.imageUrl) {
          imageSnippet = \`<div class="w-16 h-16 rounded-xl overflow-hidden border shrink-0"><img src="\${game.imageUrl}" class="w-full h-full object-cover" onerror="this.style.display='none'"></div>\`;
        }

        const div = document.createElement('div');
        div.onclick = () => openModal(log.id);
        div.className = 'bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md cursor-pointer flex gap-4 items-center';
        div.innerHTML = \`
          \${imageSnippet}
          <div class="flex-1 min-w-0">
            <span class="text-xs text-surface-400">\${log.date.substring(0,10)}</span>
            <h3 class="font-bold text-base truncate">\${gameTitle}</h3>
            <p class="text-xs text-surface-500 italic truncate">"\${log.reviewMemo || ''}"</p>
            <div class="flex justify-between items-center text-[10px] text-surface-400 mt-2">
              <span>👥 \${playNames}</span>
              <span class="text-primary-500 font-bold">👑 \${winners}</span>
            </div>
          </div>
        \`;
        container.appendChild(div);
      });
    }

    function openModal(logId) {
      const log = database.logs.find(l => l.id === logId);
      if (!log) return;
      const game = gameMap.get(log.gameId);

      document.getElementById('modal-date').textContent = log.date.substring(0, 10);
      document.getElementById('modal-game').innerHTML = game ? game.title : '알 수 없는 게임';
      document.getElementById('modal-memo').textContent = log.reviewMemo || '리뷰 메모가 없습니다.';

      const imgContainer = document.getElementById('modal-images');
      imgContainer.innerHTML = '';
      if (log.imageUrls && log.imageUrls.length > 0) {
        imgContainer.classList.remove('hidden');
        log.imageUrls.forEach(url => {
          const img = document.createElement('img');
          img.src = url.substring(1);
          img.className = 'w-full h-48 object-cover rounded-xl';
          imgContainer.appendChild(img);
        });
      } else {
        imgContainer.classList.add('hidden');
      }

      const scoreContainer = document.getElementById('modal-scores');
      scoreContainer.innerHTML = '';
      [...log.players].sort((a,b) => b.score - a.score).forEach((lp, idx) => {
        const p = playerMap.get(lp.playerId);
        const win = log.winnerIds.includes(lp.playerId);
        const row = document.createElement('div');
        row.className = \`flex justify-between p-2.5 rounded-lg border \${win ? 'bg-primary-500/10 border-primary-500/30' : 'bg-surface-50 dark:bg-surface-900/40 border-surface-200'}\`;
        row.innerHTML = \`<span>\${idx+1}. \${p ? p.name : 'Unknown'} \${win ? '👑' : ''}</span><strong>\${lp.score}점</strong>\`;
        scoreContainer.appendChild(row);
      });

      document.getElementById('log-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('log-modal').classList.add('hidden');
    }

    filterTimeline();
  </script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentStory.title.replace(/\s+/g, '_')}_기념연대기.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 1. Stories Grid List View
  if (selectedStoryId === null) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <Sparkles size={24} className="text-primary-600" />
              보드게임 기념 전시관
            </h2>
            <p className="text-sm text-surface-500">지난 보드게임 플레이 기록들을 묶어 나만의 기념 연대기를 제작하고 다운로드하세요.</p>
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={18} />
            새 기념관 생성
          </button>
        </div>

        {/* Stories list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(stories || []).map(story => {
            // Count matching logs dynamically
            const start = new Date(story.startDate).getTime();
            const end = new Date(story.endDate + 'T23:59:59').getTime();
            const logCount = logs.filter(l => {
              const d = new Date(l.date).getTime();
              return d >= start && d <= end;
            }).length;

            return (
              <div 
                key={story.id} 
                onClick={() => setSelectedStoryId(story.id)}
                className={`group relative rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 flex flex-col h-72 cursor-pointer`}
              >
                {/* Header Cover Gradient */}
                <div className={`h-24 bg-gradient-to-r ${story.coverGradient} p-4 flex flex-col justify-end text-white shrink-0 relative`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="relative z-10 flex justify-between items-end">
                    <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full uppercase">
                      🎲 {logCount}회 플레이
                    </span>
                    <button 
                      onClick={(e) => handleDeleteStory(story.id, e)}
                      className="p-1.5 bg-black/20 hover:bg-rose-600 rounded-lg text-white/80 hover:text-white transition-colors"
                      title="기념관 삭제"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Content body */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg text-surface-900 dark:text-white group-hover:text-primary-600 transition-colors line-clamp-1">
                      {story.title}
                    </h3>
                    <p className="text-xs text-surface-400 flex items-center gap-1 font-semibold">
                      <Calendar size={12} />
                      {story.startDate} ~ {story.endDate}
                    </p>
                    <p className="text-xs text-surface-500 line-clamp-2 dark:text-surface-400 font-light leading-relaxed">
                      {story.description || '이 기간 동안의 보드게임 기록과 우승 연대기를 정리한 기념 문서입니다.'}
                    </p>
                  </div>
                  <div className="flex justify-between items-center text-xs font-semibold text-primary-600 dark:text-primary-400 pt-3 border-t border-surface-100 dark:border-surface-700 mt-2">
                    <span>기념관 입장하기</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Create Story Form */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl p-6 space-y-4">
              <div className="flex justify-between items-center border-b border-surface-200 dark:border-surface-700 pb-3">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-primary-500" />
                  새로운 보드게임 기념관 만들기
                </h3>
                <button 
                  onClick={() => setIsCreateModalOpen(false)}
                  className="p-1 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg text-surface-400"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateStory} className="space-y-4">
                <div>
                  <label className="label">기념관 제목</label>
                  <input 
                    type="text" 
                    placeholder="예: 2026 여름휴가 패밀리 보드게임 결산" 
                    value={newTitle} 
                    onChange={e => setNewTitle(e.target.value)} 
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="label">설명 및 코멘트</label>
                  <textarea 
                    placeholder="예: 2026년 휴가철 동안 가족들이 함께한 기록과 세부 스토리를 담았습니다." 
                    value={newDescription} 
                    onChange={e => setNewDescription(e.target.value)} 
                    className="input h-20 resize-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">시작일</label>
                    <input 
                      type="date" 
                      value={newStartDate} 
                      onChange={e => setNewStartDate(e.target.value)} 
                      className="input text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">종료일</label>
                    <input 
                      type="date" 
                      value={newEndDate} 
                      onChange={e => setNewEndDate(e.target.value)} 
                      className="input text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">커버 테마 그라데이션</label>
                  <div className="grid grid-cols-2 gap-2">
                    {GRADIENTS.map(gradient => (
                      <button
                        type="button"
                        key={gradient.name}
                        onClick={() => setSelectedGradient(gradient.class)}
                        className={`p-3.5 rounded-xl text-white text-[11px] font-bold text-center bg-gradient-to-r ${gradient.class} border-2 transition-all ${
                          selectedGradient === gradient.class 
                            ? 'border-primary-500 scale-102 ring-2 ring-primary-500/20' 
                            : 'border-transparent opacity-85 hover:opacity-100'
                        }`}
                      >
                        {gradient.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-surface-200 dark:border-surface-700 flex justify-end gap-2 text-sm font-semibold">
                  <button 
                    type="button" 
                    onClick={() => setIsCreateModalOpen(false)}
                    className="btn btn-secondary py-2"
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary py-2"
                  >
                    생성하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 2. Specific Story Detail View
  if (!stats) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedStoryId(null)} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
        >
          <ArrowLeft size={16} />
          목록으로 돌아가기
        </button>
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
          <Sparkles size={48} className="text-primary-500 mb-4 animate-pulse" />
          <h3 className="text-xl font-bold mb-2">이 기간의 보드게임 기록이 없습니다</h3>
          <p className="text-surface-500 max-w-sm mb-6">
            기념관 기간({currentStory?.startDate || ''} ~ {currentStory?.endDate || ''})에 속하는 보드게임 플레이 로그가 아직 없습니다.
          </p>
          <button 
            onClick={() => setSelectedStoryId(null)}
            className="btn btn-secondary"
          >
            기념관 목록으로 가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* Back button */}
      <div>
        <button 
          onClick={() => setSelectedStoryId(null)} 
          className="inline-flex items-center gap-2 text-sm font-semibold text-surface-600 hover:text-surface-900 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
        >
          <ArrowLeft size={16} />
          기념관 목록으로 돌아가기
        </button>
      </div>

      {/* Hero card */}
      <div className={`relative rounded-3xl overflow-hidden shadow-xl bg-gradient-to-tr ${currentStory?.coverGradient || 'from-indigo-950 via-slate-900 to-blue-900'} text-white p-8 sm:p-12`}>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-primary-200 border border-white/10">
              <Sparkles size={12} className="animate-pulse" />
              보드게임 기념관
            </div>
            <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight leading-none">
              {currentStory?.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-light">
              {currentStory?.description || '이 기간 동안 있었던 플레이 세션의 다양한 기록과 이야기입니다.'}
            </p>
            <p className="text-xs text-slate-300 font-semibold bg-white/5 border border-white/10 rounded-xl px-4 py-2 self-start inline-block">
              📅 기간: {currentStory?.startDate} ~ {currentStory?.endDate}
            </p>
          </div>
          <button 
            onClick={handleExportHTML}
            className="btn btn-primary self-start md:self-auto flex items-center gap-2 px-5 py-3 rounded-2xl shadow-lg bg-primary-600 hover:bg-primary-700 text-sm font-bold text-white transition-all transform hover:scale-105 shrink-0"
          >
            <Download size={18} />
            이 기간의 HTML 기념장 받기
          </button>
        </div>
      </div>

      {/* Main summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-surface-800">
          <div className="p-3.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-2xl shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">이 기간 플레이 횟수</p>
            <h3 className="text-2xl font-display font-bold text-surface-900 dark:text-white mt-0.5">{stats.totalPlays}회</h3>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-surface-800">
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
            <Heart size={24} />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">엄빠 라이벌전 (1v1)</p>
            <h3 className="text-2xl font-display font-bold text-surface-900 dark:text-white mt-0.5">{stats.dadWins1v1} - {stats.momWins1v1}</h3>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-surface-800">
          <div className="p-3.5 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">이 기간 최다 플레이</p>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mt-0.5 truncate max-w-[160px]" title={stats.topGames[0]?.title}>
              {stats.topGames[0]?.title || '없음'}
            </h3>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 bg-white dark:bg-surface-800">
          <div className="p-3.5 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs text-surface-500 font-semibold uppercase tracking-wider">이 기간 최고 득점</p>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mt-0.5 truncate max-w-[160px]" title={`${stats.maxScoreRecord.player} (${stats.maxScoreRecord.score}점)`}>
              {stats.maxScoreRecord.player} ({stats.maxScoreRecord.score}점)
            </h3>
          </div>
        </div>
      </div>

      {/* Narrative grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Duel card */}
        <div className="card flex flex-col justify-between bg-white dark:bg-surface-800 p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-widest bg-rose-50 dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">Story #1</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">세기의 라이벌: 아빠 vs 엄마</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">팽팽한 균형, 소름 돋는 동점 행진</p>
          </div>
          <div className="text-sm text-surface-600 dark:text-surface-300 space-y-3">
            <p>
              아빠와 엄마의 직접적인 2인 경기(1v1)는 보드게임 대결의 백미였습니다. 
              올해 마르코폴로2(3승 3패 1무), 아크 노바(10승 10패) 등 총 {stats.total1v1Plays}번 마주쳐 {stats.dadWins1v1}대 {stats.momWins1v1}의 팽팽한 스코어를 남겼습니다.
            </p>
          </div>
          <div className="pt-4 border-t border-surface-150 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-rose-600 dark:text-rose-400">
            <span>직접 대결 승률 동점 행진 중!</span>
          </div>
        </div>

        {/* Kids Card */}
        <div className="card flex flex-col justify-between bg-white dark:bg-surface-800 p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">Story #2</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">아이들의 무서운 성장</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">서연, 서아, 서준의 반란</p>
          </div>
          <div className="text-sm text-surface-600 dark:text-surface-300 space-y-3">
            <p>
              아이들의 두뇌 성장이 매섭습니다! 
              <strong>서연</strong>이는 첫 중급 전략 <em>르 아브르</em>에서 아빠를 2점 차(118-116)로 누르고 당당히 1등을 거머쥐었습니다. 
              <strong>서아</strong>는 최애 게임 <em>타코 캣</em>에서 승리를 휩쓸고, 
              <strong>서준</strong>이는 대환장 <em>머핀 타임</em>에서 승리를 가져가 "서준타임"을 외쳤습니다.
            </p>
          </div>
          <div className="pt-4 border-t border-surface-150 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-amber-600 dark:text-amber-400">
            <span>서연: {stats.kidsHighlights.seoyeon.plays}회 ({stats.kidsHighlights.seoyeon.wins}승)</span>
            <span>서아: {stats.kidsHighlights.seoa.plays}회 ({stats.kidsHighlights.seoa.wins}승)</span>
            <span>서준: {stats.kidsHighlights.seojun.plays}회 ({stats.kidsHighlights.seojun.wins}승)</span>
          </div>
        </div>

        {/* Friends Card */}
        <div className="card flex flex-col justify-between bg-white dark:bg-surface-800 p-6 space-y-4">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-0.5 rounded-full">Story #3</span>
            <h3 className="text-lg font-bold text-surface-900 dark:text-white">지성들의 대충돌</h3>
            <p className="text-xs text-surface-500 dark:text-surface-400">친구 모임과 밤샘 헤비 전략</p>
          </div>
          <div className="text-sm text-surface-600 dark:text-surface-300 space-y-3">
            <p>
              주말이나 명절 연휴가 되면 <strong>친구들(알비, 시로, 지니, 심심이, 케이, 레티)</strong>이 모여 헤비 전략을 펼쳤습니다. 
              설 연휴에 달린 <em>엘 그란데</em>, <em>카네기</em>, 신작 <em>SETI</em>에 더해, 무려 4시간 동안 혈투를 벌인 <em>그레이트 웨스턴 트레일</em>의 기억이 생생합니다.
            </p>
          </div>
          <div className="pt-4 border-t border-surface-150 dark:border-surface-700 flex justify-between items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            <span>친구 그룹 플레이: {storyLogs.filter(l => l.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend')).length}회</span>
          </div>
        </div>

      </div>

      {/* Players Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white">👥 함께한 멤버 연감</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {players.map(p => {
            const plays = storyLogs.filter(l => l.players.some(lp => lp.playerId === p.id)).length;
            if (plays === 0) return null; // Only show active players for this story range

            const wins = storyLogs.filter(l => l.winnerIds.includes(p.id)).length;
            const winRate = plays > 0 ? ((wins / plays) * 100).toFixed(0) : '0';
            
            const playerScores = storyLogs.flatMap(l => l.players.filter(lp => lp.playerId === p.id));
            const validScores = playerScores.map(ps => ps.score).filter(s => typeof s === 'number');
            const avgScore = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(0) : '0';

            const defaultImg = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(p.name)}`;
            const resolvedImg = p.imageUrl && p.imageUrl.startsWith('/') ? p.imageUrl.substring(1) : (p.imageUrl || defaultImg);

            return (
              <div key={p.id} className="card p-4 flex flex-col items-center text-center space-y-3 bg-white dark:bg-surface-800 hover:shadow-md transition-shadow group">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary-500/20 group-hover:border-primary-500 transition-colors duration-300 shadow-inner relative">
                  <img src={resolvedImg} alt={p.name} className="w-full h-full object-cover" onError={(e) => {
                    (e.target as HTMLImageElement).src = defaultImg;
                  }} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-surface-900 dark:text-white truncate max-w-[120px]">{p.name}</h4>
                  <span className="text-[10px] bg-slate-100 dark:bg-surface-700 text-slate-500 dark:text-surface-400 px-2 py-0.5 rounded font-semibold uppercase tracking-wider">
                    {p.group === 'Family' ? '가족' : '친구'}
                  </span>
                </div>
                <div className="grid grid-cols-2 w-full pt-2 border-t border-surface-150 dark:border-surface-700 text-center">
                  <div>
                    <p className="text-[9px] text-surface-400 font-semibold uppercase">플레이</p>
                    <p className="text-xs font-bold text-surface-700 dark:text-surface-200">{plays}회</p>
                  </div>
                  <div>
                    <p className="text-[9px] text-surface-400 font-semibold uppercase">승률 / 평점</p>
                    <p className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      {winRate}% <span className="text-[10px] text-surface-400 font-normal font-sans">({avgScore})</span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-xl font-display font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <span>📖</span> 이 기간의 추억 책장 (타임라인)
          </h3>
          {/* Controls */}
          <div className="flex flex-wrap gap-2">
            <div className="relative shrink-0">
              <input 
                type="text" 
                placeholder="게임, 메모, 플레이어 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-9 text-xs py-2 w-48 sm:w-56"
              />
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" />
              {searchTerm && (
                <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                  <X size={12} />
                </button>
              )}
            </div>
            
            <div className="flex bg-white dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 p-0.5">
              {(['all', 'rivalry', 'kids', 'friends'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setSelectedFilter(f)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    selectedFilter === f 
                      ? 'bg-primary-600 text-white shadow-sm' 
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-surface-200'
                  }`}
                >
                  {f === 'all' && '전체'}
                  {f === 'rivalry' && '엄빠 라이벌'}
                  {f === 'kids' && '가족전'}
                  {f === 'friends' && '친구전'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeline container */}
        <div className="space-y-4">
          {filteredLogs.length === 0 ? (
            <div className="card p-12 text-center text-surface-400 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              필터와 검색어에 맞는 플레이 로그가 존재하지 않습니다.
            </div>
          ) : (
            filteredLogs.map(log => {
              const game = gameMap.get(log.gameId);
              const winners = log.winnerIds.map(wId => playerMap.get(wId)?.name).filter(Boolean).join(', ');
              const playNames = log.players.map(lp => playerMap.get(lp.playerId)?.name).filter(Boolean).join(', ');
              
              let formattedDate = '';
              try {
                formattedDate = format(parseISO(log.date), 'yyyy년 MM월 dd일', { locale: ko });
              } catch (e) {
                formattedDate = log.date.substring(0, 10);
              }

              const isRivalry = log.players.length === 2 && playNames.includes('아빠') && playNames.includes('엄마');
              const isFriend = log.players.some(lp => playerMap.get(lp.playerId)?.group === 'Friend');

              let badgeHTML = null;
              if (isRivalry) {
                badgeHTML = <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 px-2 py-0.5 rounded">엄빠 1v1 라이벌</span>;
              } else if (isFriend) {
                badgeHTML = <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded">친구 모임</span>;
              } else {
                badgeHTML = <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded">패밀리 게임</span>;
              }

              let imageSnippet = null;
              if (log.imageUrls && log.imageUrls.length > 0) {
                const resolvedUrl = log.imageUrls[0].startsWith('/') ? log.imageUrls[0].substring(1) : log.imageUrls[0];
                imageSnippet = (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img src={resolvedUrl} alt={game?.title} className="w-full h-full object-cover" />
                  </div>
                );
              } else if (game && game.imageUrl) {
                imageSnippet = (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border border-surface-200 dark:border-surface-700 shadow-inner shrink-0 group-hover:scale-105 transition-transform duration-300">
                    <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }} />
                  </div>
                );
              }

              return (
                <div 
                  key={log.id} 
                  onClick={() => setSelectedLog(log)}
                  className="card p-4 sm:p-5 flex gap-4 group items-center bg-white dark:bg-surface-800 hover:shadow-md cursor-pointer transition-all border border-surface-200 dark:border-surface-700"
                >
                  {imageSnippet}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className="text-xs text-surface-400 font-display">{formattedDate}</span>
                      {badgeHTML}
                    </div>
                    <h4 className="font-bold text-base sm:text-lg truncate text-surface-900 dark:text-white">
                      {game ? game.title : '알 수 없는 게임'}
                      {game?.subtitle && <span className="text-xs sm:text-sm font-normal text-surface-500 font-sans ml-1.5">({game.subtitle})</span>}
                    </h4>
                    <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400 italic truncate mt-1">
                      "{log.reviewMemo || '기록된 메모 없음'}"
                    </p>
                    <div className="flex justify-between items-center pt-2 text-[11px] text-surface-400">
                      <span>👥 멤버: {playNames}</span>
                      <span className="text-primary-500 font-semibold">👑 우승: {winners}</span>
                    </div>
                  </div>
                  <div className="text-surface-300 group-hover:text-primary-500 transition-colors shrink-0">
                    <ChevronRight size={20} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 max-w-2xl w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
              <div>
                <span className="text-xs font-semibold text-primary-500">
                  {(() => {
                    try {
                      return format(parseISO(selectedLog.date), 'yyyy년 MM월 dd일 플레이', { locale: ko });
                    } catch (e) {
                      return selectedLog.date.substring(0, 10);
                    }
                  })()}
                </span>
                <h3 className="text-xl font-bold mt-0.5 text-surface-900 dark:text-white">
                  {gameMap.get(selectedLog.gameId)?.title || '알 수 없는 게임'}
                  {gameMap.get(selectedLog.gameId)?.subtitle && (
                    <span className="text-sm font-normal text-surface-500 ml-1.5">
                      ({gameMap.get(selectedLog.gameId)?.subtitle})
                    </span>
                  )}
                </h3>
              </div>
              <button 
                onClick={() => setSelectedLog(null)} 
                className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-lg text-surface-500 hover:text-surface-700 dark:hover:text-surface-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Photo gallery */}
              {selectedLog.imageUrls && selectedLog.imageUrls.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLog.imageUrls.map((url, idx) => {
                    const resolvedUrl = url.startsWith('/') ? url.substring(1) : url;
                    return (
                      <img 
                        key={idx} 
                        src={resolvedUrl} 
                        alt="Play photograph" 
                        className="w-full h-48 sm:h-64 object-cover rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm"
                      />
                    );
                  })}
                </div>
              )}

              {/* Scores */}
              <div>
                <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-3">플레이 스코어 및 결과</h4>
                <div className="space-y-2">
                  {[...selectedLog.players]
                    .sort((a, b) => (b.score || 0) - (a.score || 0))
                    .map((lp, idx) => {
                      const player = playerMap.get(lp.playerId);
                      const isWinner = selectedLog.winnerIds.includes(lp.playerId);
                      const name = player ? player.name : '알 수 없는 플레이어';
                      const group = player ? (player.group === 'Family' ? '가족' : '친구') : '';
                      const scoreVal = typeof lp.score === 'number' ? lp.score + '점' : '점수 없음';

                      return (
                        <div 
                          key={lp.playerId}
                          className={`flex justify-between items-center p-3 rounded-xl border ${
                            isWinner 
                              ? 'bg-primary-500/10 border-primary-500/30' 
                              : 'bg-surface-50 dark:bg-surface-900/40 border-surface-200/60 dark:border-surface-700/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-5 text-center text-xs font-bold text-surface-400 font-display">{idx + 1}</span>
                            <div>
                              <p className={`text-sm font-bold ${isWinner ? 'text-primary-600 dark:text-primary-400' : 'text-surface-900 dark:text-white'}`}>
                                {name} {isWinner && '👑'}
                              </p>
                              <p className="text-[10px] text-surface-400 font-semibold uppercase">{group}</p>
                            </div>
                          </div>
                          <span className={`font-display font-bold text-sm ${isWinner ? 'text-primary-600 dark:text-primary-400' : 'text-surface-700 dark:text-surface-300'}`}>
                            {scoreVal}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Review memo */}
              <div className="bg-surface-50 dark:bg-surface-900/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                <h4 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-2">리뷰 메모</h4>
                <p className="text-sm italic text-surface-700 dark:text-surface-300 whitespace-pre-wrap">
                  {selectedLog.reviewMemo || '리뷰 메모가 기록되지 않았습니다.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
