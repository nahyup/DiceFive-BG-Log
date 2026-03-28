import type { Player, PlayLog, Game } from '../store/useBoardGameStore';

export interface PlayerStats {
  plays: number;
  wins: number;
  winRate: number;
  elo: number;
  favoriteGameTitle: string;
  favoriteGamePlays: number;
  bestGameTitle: string;
  bestGameWinRate: number;
}

export function calculateEloScores(players: Player[], logs: PlayLog[]): Record<string, number> {
  const eloScores: Record<string, number> = {};
  const K = 32;

  // Initialize everyone at 1200
  players.forEach(p => {
    eloScores[p.id] = 1200;
  });

  // Process logs in chronological order
  const sortedLogs = [...logs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  sortedLogs.forEach(log => {
    const logPlayerIds = log.players.map(p => p.playerId);
    const n = logPlayerIds.length;
    if (n < 2) return;

    const changes: Record<string, number> = {};
    logPlayerIds.forEach(id => { changes[id] = 0; });

    // Treat as series of 1v1 matchups based on scores
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const scoreA = log.players[i].score;
        const scoreB = log.players[j].score;
        const idA = log.players[i].playerId;
        const idB = log.players[j].playerId;
        
        const ratingA = eloScores[idA];
        const ratingB = eloScores[idB];

        const expectedA = 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
        const expectedB = 1 - expectedA;

        let actualA = 0.5;
        if (scoreA > scoreB) actualA = 1;
        else if (scoreA < scoreB) actualA = 0;
        
        const actualB = 1 - actualA;

        // Normalizing by (n-1) to avoid inflation in large games
        changes[idA] = (changes[idA] || 0) + (K / (n - 1)) * (actualA - expectedA);
        changes[idB] = (changes[idB] || 0) + (K / (n - 1)) * (actualB - expectedB);
      }
    }

    // Apply changes
    logPlayerIds.forEach(id => {
      eloScores[id] = Math.round(eloScores[id] + (changes[id] || 0));
    });
  });

  return eloScores;
}

export function calculatePlayerPerformance(
  player: Player,
  logs: PlayLog[],
  games: Game[],
  elo: number = 1200
): PlayerStats {
  const playerLogs = logs.filter(l => l.players.some(ps => ps.playerId === player.id));
  const plays = playerLogs.length;
  const wins = playerLogs.filter(l => l.winnerIds.includes(player.id)).length;
  const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;

  // Favorite game: game this player has played the most (min 2 plays)
  const gamePlayCounts: Record<string, number> = {};
  playerLogs.forEach(log => {
    gamePlayCounts[log.gameId] = (gamePlayCounts[log.gameId] || 0) + 1;
  });
  const favoriteGameId = Object.entries(gamePlayCounts)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])[0]?.[0];
  const favoriteGame = games.find(g => g.id === favoriteGameId);
  const favoriteGameTitle = favoriteGame?.title || '';
  const favoriteGamePlays = favoriteGameId ? gamePlayCounts[favoriteGameId] : 0;

  // Best game: game with highest personal win rate (min 2 plays)
  const gameWinCounts: Record<string, number> = {};
  playerLogs.forEach(log => {
    if (log.winnerIds.includes(player.id)) {
      gameWinCounts[log.gameId] = (gameWinCounts[log.gameId] || 0) + 1;
    }
  });

  let bestGameTitle = '';
  let bestGameWinRate = 0;
  Object.entries(gamePlayCounts).forEach(([gameId, count]) => {
    if (count < 2) return; // need at least 2 plays for meaningful rate
    const rate = Math.round(((gameWinCounts[gameId] || 0) / count) * 100);
    if (rate > bestGameWinRate) {
      bestGameWinRate = rate;
      bestGameTitle = games.find(g => g.id === gameId)?.title || '';
    }
  });

  return {
    plays,
    wins,
    winRate,
    elo,
    favoriteGameTitle,
    favoriteGamePlays,
    bestGameTitle,
    bestGameWinRate
  };
}

export function getPlayerGameHistory(playerId: string, logs: PlayLog[]) {
  return logs
    .filter(l => l.players.some(ps => ps.playerId === playerId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
