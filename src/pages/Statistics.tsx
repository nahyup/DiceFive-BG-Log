import { useState } from 'react';
import { useBoardGameStore } from '../store/useBoardGameStore';
import { BarChart3, Medal, Gamepad2, Calendar, Award, ChevronRight, Trophy, History } from 'lucide-react';
import { calculatePlayerPerformance } from '../lib/statsUtils';
import { PlayerDetailsModal } from '../components/PlayerDetailsModal';

export default function Statistics() {
  const { games, players, logs } = useBoardGameStore();
  const [groupFilter, setGroupFilter] = useState<'All' | 'Family' | 'Friend'>('All');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Filter players based on group
  const filteredPlayers = groupFilter === 'All' 
    ? players 
    : players.filter(p => p.group === groupFilter);

  // Filter logs based on group
  // A log is included if at least one player in that log belongs to the selected group
  const filteredLogs = groupFilter === 'All'
    ? logs
    : logs.filter(l => l.players.some(ps => {
        const player = players.find(p => p.id === ps.playerId);
        return player?.group === groupFilter;
      }));

  // Filter games based on those played in the filtered logs
  const filteredGames = groupFilter === 'All'
    ? games
    : games.map(g => {
        const playCount = filteredLogs.filter(l => l.gameId === g.id).length;
        return { ...g, totalPlays: playCount };
      }).filter(g => g.totalPlays > 0);

  // Compute stats for filtered players
  const playerStats = filteredPlayers.map(p => {
    const perf = calculatePlayerPerformance(p, filteredLogs, games);
    return { ...p, ...perf };
  }).sort((a, b) => b.winRate - a.winRate);

  // Compute top games from filtered games
  const sortedGames = [...filteredGames].sort((a, b) => b.totalPlays - a.totalPlays).slice(0, 10);

  // Compute publication stats from filtered games
  const gamesWithYear = [...filteredGames]
    .filter(g => g.publishedYear !== undefined)
    .sort((a, b) => (a.publishedYear || 0) - (b.publishedYear || 0));
    
  let medianYear = 0;
  if (gamesWithYear.length > 0) {
    const mid = Math.floor(gamesWithYear.length / 2);
    if (gamesWithYear.length % 2 === 0) {
      medianYear = Math.round(((gamesWithYear[mid - 1].publishedYear || 0) + (gamesWithYear[mid].publishedYear || 0)) / 2);
    } else {
      medianYear = gamesWithYear[mid].publishedYear || 0;
    }
  }
  
  const oldestGame = gamesWithYear[0];
  const newestGame = gamesWithYear[gamesWithYear.length - 1];

  // Decade distribution
  const groupedDecades: Record<string, number> = {};
  gamesWithYear.forEach(g => {
    if (g.publishedYear) {
      if (g.publishedYear < 1980) {
        groupedDecades['Before 1980s'] = (groupedDecades['Before 1980s'] || 0) + 1;
      } else {
        const decade = Math.floor(g.publishedYear / 10) * 10;
        groupedDecades[`${decade}s`] = (groupedDecades[`${decade}s`] || 0) + 1;
      }
    }
  });

  const decades = Object.entries(groupedDecades)
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => {
      if (a.label === 'Before 1980s') return -1;
      if (b.label === 'Before 1980s') return 1;
      return a.label.localeCompare(b.label);
    });

  const maxDecadeCount = Math.max(...decades.map(d => d.count), 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Statistics</h2>
          <p className="text-surface-500">Deep dive into your gaming history</p>
        </div>
        
        <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-xl w-fit border border-surface-200 dark:border-surface-700">
          {(['All', 'Family', 'Friend'] as const).map((group) => (
            <button
              key={group}
              onClick={() => setGroupFilter(group)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                groupFilter === group
                  ? 'bg-white dark:bg-surface-700 text-primary-600 dark:text-primary-400 shadow-sm'
                  : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      </div>

      {/* Player Performance Leaderboard */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="text-amber-500" size={24} />
          <h3 className="text-xl font-bold font-display">Player Rankings</h3>
        </div>
        
        <div className="bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-100 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider w-16 text-center">Rank</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider">Win Rate</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider hidden md:table-cell">Details</th>
                  <th className="px-6 py-4 text-xs font-bold text-surface-500 uppercase tracking-wider text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
                {playerStats.map((stat, index) => (
                  <tr 
                    key={stat.id} 
                    onClick={() => setSelectedPlayerId(stat.id)}
                    className="group hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-center">
                      <div className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                        ${index === 0 ? 'bg-amber-100 text-amber-600 border border-amber-200' : 
                          index === 1 ? 'bg-slate-100 text-slate-500 border border-slate-200' :
                          index === 2 ? 'bg-orange-100 text-orange-600 border border-orange-200' :
                          'text-surface-400'}
                      `}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-surface-100 dark:border-surface-700">
                          {stat.imageUrl ? (
                            <img src={stat.imageUrl} alt={stat.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-200 flex items-center justify-center">
                              <Medal className="text-surface-400" size={18} />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {stat.name}
                          </div>
                          <div className="text-xs text-surface-500">{stat.group}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-[120px]">
                        <div className="flex-1 h-2 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-500 transition-all duration-500" 
                            style={{ width: `${stat.winRate}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-surface-700 dark:text-surface-300 w-10 text-right">{stat.winRate}%</span>
                      </div>
                      <div className="text-[10px] text-surface-400 mt-0.5">{stat.wins}W / {stat.plays}P</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Gamepad2 size={12} className="text-surface-400 shrink-0" />
                          <span className="text-xs text-surface-600 dark:text-surface-400 truncate max-w-[120px]" title={`Favorite: ${stat.favoriteGameTitle}`}>
                            {stat.favoriteGameTitle || '—'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 overflow-hidden">
                          <Award size={12} className="text-surface-400 shrink-0" />
                          <span className="text-xs text-surface-600 dark:text-surface-400 truncate max-w-[120px]" title={`Best: ${stat.bestGameTitle}`}>
                            {stat.bestGameTitle || '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight className="inline-block text-surface-300 group-hover:text-primary-500 transition-colors" size={20} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Collection Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center gap-2 mb-6">
            <History className="text-primary-500" />
            <h3 className="text-lg font-bold font-display">Publication Timeline</h3>
          </div>
          
          <div className="space-y-4">
            {decades.map(({ label, count }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-surface-700 dark:text-surface-300">{label}</span>
                  <span className="text-surface-500">{count} games</span>
                </div>
                <div className="w-full bg-surface-100 dark:bg-surface-800 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
                    style={{ width: `${(count / maxDecadeCount) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {decades.length === 0 && (
              <p className="text-center text-surface-400 py-4">No publication data available</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card p-6 border-t-4 border-t-primary-500">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary-50 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
                <Calendar size={20} />
              </div>
              <h4 className="font-bold">Collection Age</h4>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-surface-500 uppercase tracking-wider mb-1">Median Year</p>
                <p className="text-3xl font-display font-bold text-surface-900 dark:text-white">{medianYear || '-'}</p>
              </div>
              <div className="pt-4 border-t border-surface-100 dark:border-surface-700 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-surface-500 uppercase mb-1">Oldest</p>
                  <p className="font-bold text-surface-900 dark:text-white truncate" title={oldestGame?.title}>
                    {oldestGame?.publishedYear || '-'}
                  </p>
                  <p className="text-[10px] text-surface-400 truncate">{oldestGame?.title}</p>
                </div>
                <div>
                  <p className="text-[10px] text-surface-500 uppercase mb-1">Newest</p>
                  <p className="font-bold text-surface-900 dark:text-white truncate" title={newestGame?.title}>
                    {newestGame?.publishedYear || '-'}
                  </p>
                  <p className="text-[10px] text-surface-400 truncate">{newestGame?.title}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 bg-surface-900 dark:bg-surface-800 text-white relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-10">
              <Award size={120} />
            </div>
            <h4 className="text-sm font-medium text-surface-400 mb-1">Total Collection Insights</h4>
            <p className="text-2xl font-bold font-display">{filteredGames.length} Unique Titles</p>
            <p className="text-xs text-surface-500 mt-2 italic">
              {groupFilter === 'All' 
                ? `A legacy of ${oldestGame && newestGame ? `${(newestGame.publishedYear || 0) - (oldestGame.publishedYear || 0)}+` : '0'} years of gaming history.`
                : `Showing ${filteredGames.length} games played by ${groupFilter} group.`}
            </p>
          </div>
        </div>
      </div>

      {/* Game Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <Gamepad2 className="text-primary-500" />
            <h3 className="text-lg font-bold font-display">Most Played Games</h3>
          </div>
          
          <div className="space-y-4">
            {sortedGames.map((game, i) => {
              const maxPlays = sortedGames[0]?.totalPlays || 1;
              const width = Math.max(5, (game.totalPlays / maxPlays) * 100);
              
              // Find top player for this game
              const gameLogs = logs.filter(l => l.gameId === game.id);
              const winCounts: Record<string, number> = {};
              gameLogs.forEach(log => {
                log.winnerIds.forEach(id => { winCounts[id] = (winCounts[id] || 0) + 1; });
              });
              
              let topPlayerId = '';
              let maxWins = 0;
              Object.entries(winCounts).forEach(([id, counts]) => {
                if (counts > maxWins) {
                  maxWins = counts;
                  topPlayerId = id;
                }
              });
              
              const topPlayer = players.find(p => p.id === topPlayerId);
              
              return (
                <div key={game.id} className="relative">
                  <div className="flex justify-between items-center text-sm mb-1 z-10 relative px-1">
                    <span className="font-medium text-surface-900 dark:text-surface-100 line-clamp-1">{game.title}</span>
                    <div className="flex items-center gap-2">
                       <span className="text-surface-500 whitespace-nowrap">{game.totalPlays} plays</span>
                       {topPlayer && maxWins > 0 && (
                          <div 
                            className="w-6 h-6 rounded-full border border-amber-400 bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center shrink-0 overflow-hidden"
                            title={`${topPlayer.name} has the most wins: ${maxWins}`}
                          >
                             {topPlayer.imageUrl ? (
                               <img src={topPlayer.imageUrl} alt={topPlayer.name} className="w-full h-full object-cover" />
                             ) : (
                               <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                                 {topPlayer.name.charAt(0).toUpperCase()}
                               </span>
                             )}
                          </div>
                       )}
                    </div>
                  </div>
                  <div className="w-full bg-surface-100 dark:bg-surface-800 rounded h-8 absolute top-0 left-0 overflow-hidden">
                    <div 
                      className={`h-full rounded ${i === 0 ? 'bg-primary-100 dark:bg-primary-900/30' : 'bg-surface-200 dark:bg-surface-700/50'}`} 
                      style={{ width: `${width}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
            
            {sortedGames.length === 0 && (
               <p className="text-center text-surface-400 py-4">No data yet</p>
            )}
          </div>
        </div>

        <div className="card p-6 bg-gradient-to-br from-primary-900 to-primary-700 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-primary-900/20">
          <BarChart3 size={64} className="mb-6 opacity-80" strokeWidth={1} />
          <h3 className="text-2xl font-display font-bold mb-2">Keep Playing!</h3>
          <p className="text-primary-100 max-w-sm mb-8">
            The more games you log, the more detailed your family statistics will become. Build up your history to see who truly rules the tabletop.
          </p>
          <div className="flex gap-4">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[100px]">
              <p className="text-3xl font-bold">{filteredGames.length}</p>
              <p className="text-xs text-primary-200 mt-1 uppercase tracking-wider">Games</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-4 min-w-[100px]">
              <p className="text-3xl font-bold">{filteredLogs.length}</p>
              <p className="text-xs text-primary-200 mt-1 uppercase tracking-wider">Log Entries</p>
            </div>
          </div>
        </div>
      </div>
      {/* Player Details Modal */}
      {selectedPlayerId && (
        <PlayerDetailsModal 
          playerId={selectedPlayerId} 
          onClose={() => setSelectedPlayerId(null)} 
        />
      )}
    </div>
  );
}
