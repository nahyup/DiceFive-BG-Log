import { useBoardGameStore } from '../store/useBoardGameStore';
import { calculatePlayerPerformance, getPlayerGameHistory, calculateEloScores } from '../lib/statsUtils';
import { User, Gamepad2, History, X } from 'lucide-react';
import { format } from 'date-fns';

interface PlayerDetailsModalProps {
  playerId: string;
  onClose: () => void;
}

const GroupBadge = ({ group }: { group: string }) => {
  const colors = {
    User: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400',
    Family: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Friend: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${colors[group as keyof typeof colors] || colors.Friend}`}>
      {group}
    </span>
  );
};

export function PlayerDetailsModal({ playerId, onClose }: PlayerDetailsModalProps) {
  const store = useBoardGameStore();
  const player = store.players.find(p => p.id === playerId);
  
  if (!player) return null;
  
  const eloScores = calculateEloScores(store.players, store.logs);
  const stats = calculatePlayerPerformance(player, store.logs, store.games, eloScores[playerId]);
  const history = getPlayerGameHistory(playerId, store.logs).slice(0, 10);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm overflow-y-auto">
      <div 
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl w-full max-w-2xl my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-r from-primary-600 to-primary-800 shrink-0">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition-colors z-10"
          >
            <X size={20} />
          </button>
          <div className="absolute -bottom-12 left-8">
            {player.imageUrl ? (
              <img src={player.imageUrl} alt={player.name} className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-900 shadow-lg object-cover bg-white" />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-white dark:border-surface-900 shadow-lg bg-surface-200 flex items-center justify-center">
                <User size={40} className="text-surface-400" />
              </div>
            )}
          </div>
        </div>
        
        <div className="pt-16 px-8 pb-8">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">{player.name}</h2>
              <div className="mt-1">
                <GroupBadge group={player.group} />
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-100 dark:border-surface-700">
              <p className="text-xs text-surface-500 uppercase font-bold tracking-wider mb-1">ELO Rating</p>
              <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">{stats.elo}</p>
              <p className="text-xs text-surface-400 mt-1">Skill Ranking</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-100 dark:border-surface-700">
              <p className="text-xs text-surface-500 uppercase font-bold tracking-wider mb-1">Win Rate</p>
              <p className="text-2xl font-display font-bold text-primary-600 dark:text-primary-400">{stats.winRate}%</p>
              <p className="text-xs text-surface-400 mt-1">{stats.wins} wins / {stats.plays} plays</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-100 dark:border-surface-700">
              <p className="text-xs text-surface-500 uppercase font-bold tracking-wider mb-1">Favorite Game</p>
              <p className="text-lg font-bold text-surface-900 dark:text-white truncate" title={stats.favoriteGameTitle}>
                {stats.favoriteGameTitle || '—'}
              </p>
              <p className="text-xs text-surface-400 mt-1">{stats.favoriteGamePlays || 0} sessions</p>
            </div>
            <div className="bg-surface-50 dark:bg-surface-800 p-4 rounded-2xl border border-surface-100 dark:border-surface-700">
              <p className="text-xs text-surface-500 uppercase font-bold tracking-wider mb-1">Best Performance</p>
              <p className="text-lg font-bold text-surface-900 dark:text-white truncate" title={stats.bestGameTitle}>
                {stats.bestGameTitle || '—'}
              </p>
              <p className="text-xs text-surface-400 mt-1">{stats.bestGameWinRate > 0 ? `${stats.bestGameWinRate}% win rate` : 'N/A'}</p>
            </div>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <History size={18} className="text-primary-500" />
              <h3 className="font-bold text-surface-900 dark:text-white">Recent Activity</h3>
            </div>
            
            <div className="space-y-3">
              {history.map(log => {
                const game = store.games.find(g => g.id === log.gameId);
                const isWinner = log.winnerIds.includes(player.id);
                return (
                  <div key={log.id} className="flex items-center gap-4 p-3 bg-surface-50 dark:bg-surface-800/50 rounded-xl border border-surface-100 dark:border-surface-700">
                    <div className="shrink-0 w-10 h-10 rounded-lg overflow-hidden">
                      <img src={game?.imageUrl} alt={game?.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-surface-900 dark:text-white truncate">{game?.title}</h4>
                      <p className="text-xs text-surface-500">{format(new Date(log.date), 'MMM d, yyyy')}</p>
                    </div>
                    <div className="text-right">
                      {isWinner ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider">Win</span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-surface-200 text-surface-600 dark:bg-surface-700 dark:text-surface-400 uppercase tracking-wider">Play</span>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {history.length === 0 && (
                <div className="text-center py-8 bg-surface-50 dark:bg-surface-800/50 rounded-2xl border-2 border-dashed border-surface-200 dark:border-surface-700">
                  <Gamepad2 size={32} className="mx-auto text-surface-300 mb-2" />
                  <p className="text-sm text-surface-500 font-medium">No games logged yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
