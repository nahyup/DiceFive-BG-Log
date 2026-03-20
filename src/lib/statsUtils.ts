import type { Player, PlayLog, Game } from '../store/useBoardGameStore';

export interface PlayerStats {
  plays: number;
  wins: number;
  winRate: number;
  favoriteGameTitle: string;
  favoriteGamePlays: number;
  bestGameTitle: string;
  bestGameWinRate: number;
}

export function calculatePlayerPerformance(
  player: Player,
  logs: PlayLog[],
  games: Game[]
): PlayerStats {
  const playerLogs = logs.filter(l => l.players.some(ps => ps.playerId === player.id));
  const plays = playerLogs.length;
  const wins = playerLogs.filter(l => l.winnerIds.includes(player.id)).length;
  const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;

  // Favorite game: game this player has played the most
  const gamePlayCounts: Record<string, number> = {};
  playerLogs.forEach(log => {
    gamePlayCounts[log.gameId] = (gamePlayCounts[log.gameId] || 0) + 1;
  });
  const favoriteGameId = Object.entries(gamePlayCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
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
