import { useBoardGameStore } from '../store/useBoardGameStore';
import { Gamepad2, Trophy, Users, Clock } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { games, players, logs } = useBoardGameStore();

  const totalPlays = logs.length;
  
  // Calculate top player
  const playerWins = logs.reduce((acc, log) => {
    for (const id of log.winnerIds) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  let topPlayer: { id: string, name: string, wins: number } | null = null;
  const topWinnerEntry = Object.entries(playerWins).sort((a, b) => b[1] - a[1])[0];
  if (topWinnerEntry) {
    const p = players.find(p => p.id === topWinnerEntry[0]);
    if (p) {
      topPlayer = { id: p.id, name: p.name, wins: topWinnerEntry[1] };
    }
  }

  const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-primary-500">
          <div className="p-3 bg-primary-100 text-primary-600 rounded-xl dark:bg-primary-900/40 dark:text-primary-400">
            <Gamepad2 size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Games</p>
            <p className="text-2xl font-bold">{games.length}</p>
          </div>
        </div>
        
        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-accent-amber">
          <div className="p-3 bg-amber-100 text-amber-600 rounded-xl dark:bg-amber-900/40 dark:text-amber-400">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total Plays</p>
            <p className="text-2xl font-bold">{totalPlays}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-accent-teal">
          <div className="p-3 bg-teal-100 text-teal-600 rounded-xl dark:bg-teal-900/40 dark:text-teal-400">
            <Users size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Players Tracking</p>
            <p className="text-2xl font-bold">{players.length}</p>
          </div>
        </div>

        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-accent-rose">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl dark:bg-rose-900/40 dark:text-rose-400">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Top Winner</p>
            <p className="text-2xl font-bold">{topPlayer ? topPlayer.name : '-'}</p>
            {topPlayer && <p className="text-xs text-surface-500">{topPlayer.wins} wins</p>}
          </div>
        </div>
      </div>

      {/* Recent Plays and Top Games */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card flex flex-col">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
            <h3 className="font-semibold font-display">Recent Play Sessions</h3>
          </div>
          <div className="p-0 overflow-hidden flex-1">
            {recentLogs.length === 0 ? (
              <div className="p-8 text-center text-surface-500">No play sessions logged yet.</div>
            ) : (
              <ul className="divide-y divide-surface-200 dark:divide-surface-700">
                {recentLogs.map((log) => {
                  const game = games.find(g => g.id === log.gameId);
                  const winnerNames = log.winnerIds.map(id => players.find(p => p.id === id)?.name).filter(Boolean).join(', ');
                  return (
                    <li key={log.id} className="p-4 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex gap-3">
                          {game?.imageUrl ? (
                            <img src={game.imageUrl} alt={game.title} className="w-12 h-12 rounded object-cover shadow-sm bg-surface-200" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-primary-100 flex items-center justify-center text-primary-600">
                              <Gamepad2 size={20} />
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-surface-900 dark:text-white">{game?.title || 'Unknown Game'}</p>
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              {format(new Date(log.date), 'MMM d, yyyy')} • {log.players.length} Players
                            </p>
                          </div>
                        </div>
                        {winnerNames && (
                          <div className="flex items-center gap-1.5 text-xs font-medium text-accent-amber border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full">
                            <Trophy size={12} />
                            <span>{winnerNames} won</span>
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <div className="card flex flex-col">
          <div className="p-5 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
            <h3 className="font-semibold font-display">Most Played Games</h3>
          </div>
          <div className="p-0 overflow-hidden flex-1">
            <ul className="divide-y divide-surface-200 dark:divide-surface-700">
              {[...games].sort((a, b) => b.totalPlays - a.totalPlays).slice(0, 5).map((game, index) => (
                <li key={game.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center text-xs font-bold text-surface-600 dark:text-surface-400">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-surface-900 dark:text-surface-50">{game.title}</p>
                      <p className="text-xs text-surface-500">{game.players} • {game.playTime}m • Weight {game.weight}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center justify-center bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-lg px-3 py-1 text-sm font-semibold">
                      {game.totalPlays} plays
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
