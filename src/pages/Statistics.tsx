import { useState } from 'react';
import { useBoardGameStore } from '../store/useBoardGameStore';
import { BarChart3, TrendingUp, Medal, Gamepad2, Calendar, History, Award } from 'lucide-react';

export default function Statistics() {
  const { games, players, logs } = useBoardGameStore();
  const [groupFilter, setGroupFilter] = useState<'All' | 'Family' | 'Friend'>('All');

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
    const playerLogs = filteredLogs.filter(l => l.players.some(ps => ps.playerId === p.id));
    const plays = playerLogs.length;
    const wins = playerLogs.filter(l => 
      l.winnerIds.includes(p.id)
    ).length;
    const winRate = plays > 0 ? Math.round((wins / plays) * 100) : 0;
    
    // Highest score
    let highScore = 0;
    let highScoreGame = '';
    
    playerLogs.forEach(log => {
      const ps = log.players.find(x => x.playerId === p.id);
      if (ps && ps.score > highScore) {
        highScore = ps.score;
        const game = games.find(g => g.id === log.gameId);
        highScoreGame = game?.title || 'Unknown Game';
      }
    });

    return { ...p, plays, wins, winRate, highScore, highScoreGame };
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

      {/* Player Stats Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Medal className="text-accent-amber" />
          <h3 className="text-xl font-bold font-display">Player Performance</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playerStats.map((stat, index) => (
            <div key={stat.id} className="card p-6 relative overflow-hidden group">
              {index === 0 && stat.plays > 0 && (
                <div className="absolute top-0 right-0 bg-accent-amber text-white text-xs font-bold px-3 py-1 rounded-bl-lg shadow-sm">
                  Top Player
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold flex items-center gap-2">
                    {stat.name}
                    <span className="text-xs font-normal bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 px-2 py-0.5 rounded">
                      {stat.group}
                    </span>
                  </h4>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-surface-500">Win Rate</span>
                    <span className="font-bold">{stat.winRate}%</span>
                  </div>
                  <div className="w-full bg-surface-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-1000" 
                      style={{ width: `${stat.winRate}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-surface-400 mt-1">{stat.wins} wins in {stat.plays} plays</p>
                </div>

                <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-3 flex justify-between items-center border border-surface-100 dark:border-surface-700">
                  <div className="flex items-center gap-2 text-surface-600 dark:text-surface-300">
                    <TrendingUp size={16} />
                    <span className="text-sm">High Score</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg leading-none">{stat.highScore}</p>
                    {stat.highScore > 0 && (
                      <p className="text-[10px] text-surface-400 mt-0.5 truncate max-w-[100px]">{stat.highScoreGame}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
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
    </div>
  );
}
