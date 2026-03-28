import { useBoardGameStore } from '../store/useBoardGameStore';
import { Trophy, CalendarDays, X, Play } from 'lucide-react';
import { format } from 'date-fns';

interface GameHistoryModalProps {
  gameId: string;
  onClose: () => void;
}

export default function GameHistoryModal({ gameId, onClose }: GameHistoryModalProps) {
  const { games, players, logs } = useBoardGameStore();
  const game = games.find(g => g.id === gameId);
  const gameLogs = logs
    .filter(l => l.gameId === gameId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (!game) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-surface-100 dark:border-surface-800 flex justify-between items-center bg-surface-50 dark:bg-surface-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-surface-200 dark:border-surface-700">
              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="font-bold text-surface-900 dark:text-white leading-tight">{game.title}</h3>
              <p className="text-xs text-surface-500">Play History & Winners</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {gameLogs.length === 0 ? (
            <div className="text-center py-12 text-surface-400">
              <Play size={48} className="mx-auto mb-4 opacity-20" />
              <p>No play logs found for this game.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gameLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-bold text-surface-400 flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {format(new Date(log.date), 'MMM do, yyyy')}
                    </span>
                    <span className="text-xs font-medium text-surface-400">
                      {log.players.length} Players
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {log.winnerIds.map(winnerId => {
                      const p = players.find(player => player.id === winnerId);
                      return (
                        <div key={winnerId} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold shadow-sm">
                          <Trophy size={12} className="fill-current" />
                          {p?.name || 'Unknown'}
                        </div>
                      );
                    })}
                    {log.winnerIds.length === 0 && (
                      <span className="text-xs italic text-surface-400">No winners recorded</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
