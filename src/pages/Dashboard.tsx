import { useBoardGameStore, type Game } from '../store/useBoardGameStore';
import { Gamepad2, Trophy, Users, Clock, RefreshCw, Star } from 'lucide-react';
import { format } from 'date-fns';
import { useState, useEffect, useCallback } from 'react';

export default function Dashboard() {
  const { games, players, logs } = useBoardGameStore();
  const [recommendedGames, setRecommendedGames] = useState<Game[]>([]);

  const pickRandomGames = useCallback(() => {
    if (games.length === 0) return;
    
    // Group games by weight categories to ensure diversity
    const light = games.filter(g => g.weight < 2.0).sort(() => 0.5 - Math.random());
    const medium = games.filter(g => g.weight >= 2.0 && g.weight < 3.0).sort(() => 0.5 - Math.random());
    const heavy = games.filter(g => g.weight >= 3.0 && g.weight <= 4.0).sort(() => 0.5 - Math.random());
    const veryHeavy = games.filter(g => g.weight > 4.0).sort(() => 0.5 - Math.random());

    const selection: Game[] = [];
    const buckets = [light, medium, heavy, veryHeavy];
    
    // Try to take one from each category first
    buckets.forEach(bucket => {
      if (bucket.length > 0) {
        selection.push(bucket[0]);
      }
    });

    // If we need more (e.g. some buckets were empty) or have too many
    if (selection.length > 4) {
      setRecommendedGames(selection.sort(() => 0.5 - Math.random()).slice(0, 4));
    } else if (selection.length < 4 && games.length >= 4) {
      // Fill the rest from all remaining games
      const remaining = games.filter(g => !selection.find(s => s.id === g.id)).sort(() => 0.5 - Math.random());
      setRecommendedGames([...selection, ...remaining.slice(0, 4 - selection.length)]);
    } else {
      setRecommendedGames(selection);
    }
  }, [games]);

  useEffect(() => {
    pickRandomGames();
  }, [pickRandomGames]);

  const totalPlays = logs.length;
  
  // Calculate top player
  const playerWins = logs.reduce((acc, log) => {
    for (const id of log.winnerIds) {
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  let topPlayer: { id: string, name: string, wins: number, imageUrl?: string } | null = null;
  const topWinnerEntry = Object.entries(playerWins).sort((a, b) => b[1] - a[1])[0];
  if (topWinnerEntry) {
    const p = players.find(p => p.id === topWinnerEntry[0]);
    if (p) {
      topPlayer = { id: p.id, name: p.name, wins: topWinnerEntry[1], imageUrl: p.imageUrl };
    }
  }

  const recentLogs = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Overview</h2>
        <div className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-2xl border border-primary-100 dark:border-primary-800">
           <Star size={16} className="text-primary-500 animate-spin-slow" />
           <span className="text-xs font-bold text-primary-700 dark:text-primary-400 uppercase tracking-tighter">Your Daily Picks</span>
        </div>
      </div>

      {/* Recommended Games */}
      {games.length > 0 && (
        <div className="card border-primary-100 dark:border-primary-900/50 bg-gradient-to-br from-white to-primary-50/30 dark:from-surface-800 dark:to-primary-900/10">
          <div className="p-4 border-b border-primary-100 dark:border-primary-900/30 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2 text-primary-900 dark:text-primary-100">
              <Star size={18} className="text-amber-500 fill-amber-500" />
              Recommended for You
            </h3>
            <button 
              onClick={pickRandomGames}
              className="p-1.5 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-600 dark:text-primary-400 rounded-lg transition-all active:rotate-180 duration-500"
              title="Refresh recommendations"
            >
              <RefreshCw size={18} />
            </button>
          </div>
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recommendedGames.map(game => (
              <div key={game.id} className="flex items-center gap-3 p-3 bg-white/50 dark:bg-surface-900/50 rounded-xl border border-primary-50 dark:border-primary-900/20 hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 shadow-sm">
                  <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm text-surface-900 dark:text-white truncate">{game.title}</h4>
                  <p className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">{game.players} • {game.playTime}m</p>
                  <div className="mt-1 flex items-center gap-1">
                    <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter">Weight {game.weight}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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

        <div className="card p-6 flex items-center gap-4 border-l-4 border-l-accent-rose overflow-hidden relative">
          <div className="p-3 bg-rose-100 text-rose-600 rounded-xl dark:bg-rose-900/40 dark:text-rose-400 z-10 shrink-0">
            <Trophy size={24} />
          </div>
          <div className="z-10 min-w-0 flex-1">
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Top Winner</p>
            <div className="flex items-center gap-2 mt-0.5">
              {topPlayer?.imageUrl && (
                <img src={topPlayer.imageUrl} alt={topPlayer.name} className="w-6 h-6 rounded-full object-cover shrink-0 border border-surface-200 dark:border-surface-700" />
              )}
              <p className="text-2xl font-bold truncate">{topPlayer ? topPlayer.name : '-'}</p>
            </div>
            {topPlayer && <p className="text-xs text-surface-500">{topPlayer.wins} wins</p>}
          </div>
          {/* Subtle background image of the top player */}
          {topPlayer?.imageUrl && (
            <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10 dark:opacity-20 pointer-events-none">
               <img src={topPlayer.imageUrl} alt="" className="w-full h-full object-cover rounded-l-full scale-110" />
            </div>
          )}
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
