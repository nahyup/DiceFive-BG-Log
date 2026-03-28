import { useState, useMemo } from 'react';
import { useBoardGameStore, type Game } from '../store/useBoardGameStore';
import { calculateEloScores } from '../lib/statsUtils';
import { 
  Users, 
  Swords, 
  History, 
  Compass, 
  Crown, 
  Zap, 
  ChevronRight, 
  Dices,
  Info
} from 'lucide-react';
import { formatDistanceToNow, subDays, isBefore } from 'date-fns';

type RecommendationCategory = {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  games: { game: Game; reason: string }[];
};

export default function GameRecommend() {
  const { games, players, logs } = useBoardGameStore();
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  
  const eloScores = useMemo(() => calculateEloScores(players, logs), [players, logs]);

  const togglePlayer = (id: string) => {
    setSelectedPlayerId(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };
  
  // Custom setter to fix the name
  const setSelectedPlayerId = (update: (prev: string[]) => string[]) => {
    setSelectedPlayerIds(update);
  };

  const recommendations = useMemo((): RecommendationCategory[] => {
    if (selectedPlayerIds.length === 0) return [];

    const selectedPlayers = players.filter(p => selectedPlayerIds.includes(p.id));
    // Skip using selectedPlayers if not needed right now to avoid lint errors
    console.log('Recommending for:', selectedPlayers.map(p => p.name).join(', '));
    const now = new Date();
    const longTimeAgo = subDays(now, 30);

    // 1. Settling Scores: Close ELO/Results
    const settlingScores: { game: Game; reason: string }[] = [];
    games.forEach(game => {
      const gameLogs = logs.filter(l => 
        l.gameId === game.id && 
        selectedPlayerIds.every(id => l.players.some(ps => ps.playerId === id))
      );
      
      if (gameLogs.length >= 2) {
        // Check ELO closeness for these players
        const groupElos = selectedPlayerIds.map(id => eloScores[id]);
        const maxElo = Math.max(...groupElos);
        const minElo = Math.min(...groupElos);
        
        if (maxElo - minElo < 60) {
          settlingScores.push({ 
            game, 
            reason: `Highly competitive! Your ELO gap for this group is only ${maxElo - minElo} points.` 
          });
        }
      }
    });

    // 2. Forgotten Gems: Not played in a while
    const forgottenGems: { game: Game; reason: string }[] = [];
    games.forEach(game => {
      const gameLogs = logs.filter(l => 
        l.gameId === game.id && 
        selectedPlayerIds.every(id => l.players.some(ps => ps.playerId === id))
      ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (gameLogs.length > 0) {
        const lastPlay = new Date(gameLogs[0].date);
        if (isBefore(lastPlay, longTimeAgo)) {
          forgottenGems.push({ 
            game, 
            reason: `It's been ${formatDistanceToNow(lastPlay)} since your last group session.` 
          });
        }
      }
    });

    // 3. Uncharted Territory: Never played by this specific group
    const unchartedTerritory: { game: Game; reason: string }[] = [];
    games.forEach(game => {
      const hasPlayedTogether = logs.some(l => 
        l.gameId === game.id && 
        selectedPlayerIds.every(id => l.players.some(ps => ps.playerId === id))
      );

      if (!hasPlayedTogether) {
        unchartedTerritory.push({ 
          game, 
          reason: `Fresh experience! This group combination has never logged a session of this game.` 
        });
      }
    });

    // 4. Dethrone the Champ: One player is dominating
    const dethroneTheChamp: { game: Game; reason: string }[] = [];
    games.forEach(game => {
      const gameLogs = logs.filter(l => 
        l.gameId === game.id && 
        selectedPlayerIds.every(id => l.players.some(ps => ps.playerId === id))
      );

      if (gameLogs.length >= 3) {
        const winCounts: Record<string, number> = {};
        gameLogs.forEach(log => {
          log.winnerIds.forEach(id => {
            if (selectedPlayerIds.includes(id)) {
              winCounts[id] = (winCounts[id] || 0) + 1;
            }
          });
        });

        const sortedWinners = Object.entries(winCounts).sort((a, b) => b[1] - a[1]);
        if (sortedWinners.length > 0 && sortedWinners[0][1] >= (gameLogs.length * 0.6)) {
          const champName = players.find(p => p.id === sortedWinners[0][0])?.name || 'Someone';
          dethroneTheChamp.push({ 
            game, 
            reason: `${champName} is on a ${Math.round((sortedWinners[0][1]/gameLogs.length)*100)}% win streak! Time for a rebellion?` 
          });
        }
      }
    });

    // 5. Quick Pick-me-ups: Fast games
    const quickPicks: { game: Game; reason: string }[] = [];
    games.filter(g => g.playTime <= 45 && g.weight < 2.5).forEach(game => {
      quickPicks.push({ 
        game, 
        reason: `Perfect for a quick session. Estimated time: ${game.playTime}m.` 
      });
    });

    return [
      { 
        id: 'settling', 
        title: 'Settling Scores', 
        description: 'Level the playing field in these highly competitive matchups.', 
        icon: Swords, 
        color: 'text-rose-500 bg-rose-50 dark:bg-rose-900/20',
        games: settlingScores.slice(0, 3) 
      },
      { 
        id: 'forgotten', 
        title: 'Forgotten Gems', 
        description: 'Time to bring these back to the table after a long hiatus.', 
        icon: History, 
        color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-900/20',
        games: forgottenGems.slice(0, 3) 
      },
      { 
        id: 'uncharted', 
        title: 'Uncharted Territory', 
        description: 'Try something completely new with this specific player group.', 
        icon: Compass, 
        color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
        games: unchartedTerritory.slice(0, 3) 
      },
      { 
        id: 'dethrone', 
        title: 'Dethrone the Champ', 
        description: 'Show the reigning champion that their reign is over!', 
        icon: Crown, 
        color: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
        games: dethroneTheChamp.slice(0, 3) 
      },
      { 
        id: 'quick', 
        title: 'Quick Pick-me-ups', 
        description: 'Light and fast-paced games for when you are short on time.', 
        icon: Zap, 
        color: 'text-sky-500 bg-sky-50 dark:bg-sky-900/20',
        games: quickPicks.sort(() => 0.5 - Math.random()).slice(0, 3) 
      },
    ].filter(cat => cat.games.length > 0);
  }, [games, players, logs, selectedPlayerIds, eloScores]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Smart Recommendations</h2>
          <p className="text-surface-500">Select players to get personalized game suggestions</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs font-bold text-primary-600 bg-primary-50 dark:bg-primary-900/20 px-3 py-1.5 rounded-full border border-primary-100 dark:border-primary-800 uppercase tracking-wider">
          <Dices size={14} className="animate-bounce" />
          Intelligent AI Assist
        </div>
      </div>

      {/* Player Selection */}
      <section className="card p-6 bg-white dark:bg-surface-800">
        <label className="block text-sm font-bold text-surface-500 uppercase tracking-widest mb-4">Who's playing?</label>
        <div className="flex flex-wrap gap-4">
          {players.map(player => (
            <button
              key={player.id}
              onClick={() => togglePlayer(player.id)}
              className={`
                group flex items-center gap-3 p-1.5 pr-4 rounded-full border-2 transition-all duration-300
                ${selectedPlayerIds.includes(player.id)
                  ? 'bg-primary-50 border-primary-500 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                  : 'bg-white dark:bg-surface-900 border-surface-100 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:border-surface-300 dark:hover:border-surface-500'}
              `}
            >
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white dark:border-surface-800 shadow-sm shrink-0">
                {player.imageUrl ? (
                  <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-surface-100 flex items-center justify-center">
                    <Users size={14} className="text-surface-400" />
                  </div>
                )}
              </div>
              <span className="font-bold text-sm">{player.name}</span>
            </button>
          ))}
        </div>
        
        {selectedPlayerIds.length === 0 && (
          <div className="mt-8 flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded-2xl text-amber-700 dark:text-amber-400 text-sm">
            <Info size={18} className="shrink-0" />
            <p>Select at least one player to unlock personalized recommendations based on your group's play history.</p>
          </div>
        )}
      </section>

      {/* Categories */}
      {selectedPlayerIds.length > 0 && recommendations.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {recommendations.map(cat => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl ${cat.color}`}>
                  <cat.icon size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-surface-900 dark:text-white leading-tight">{cat.title}</h3>
                  <p className="text-xs text-surface-500 font-medium">{cat.description}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                {cat.games.map(({ game, reason }) => (
                  <div key={game.id} className="group flex items-center gap-4 p-3 bg-white dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm hover:shadow-md hover:border-primary-200 dark:hover:border-primary-800 transition-all duration-300">
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-surface-100 dark:border-surface-700 group-hover:scale-105 transition-transform">
                      <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-surface-900 dark:text-white truncate">{game.title}</h4>
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-tighter text-surface-400 mt-0.5">
                        <span>{game.players} players</span>
                        <span>•</span>
                        <span>{game.playTime}m</span>
                        <span>•</span>
                        <span className="text-primary-500">Weight {game.weight}</span>
                      </div>
                      <p className="text-xs text-surface-600 dark:text-surface-400 line-clamp-2 mt-1 italic opacity-80 leading-relaxed font-medium">
                        "{reason}"
                      </p>
                    </div>
                    <ChevronRight size={16} className="text-surface-300 group-hover:text-primary-500 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPlayerIds.length > 0 && recommendations.length === 0 && (
        <div className="col-span-full py-20 text-center space-y-4">
           <Dices size={64} className="mx-auto text-surface-200" strokeWidth={1} />
           <p className="text-surface-500 max-w-sm mx-auto">
             Actually, we couldn't find specific matches for this group yet! Try adding more play logs to help the AI learn your preferences.
           </p>
        </div>
      )}
    </div>
  );
}
