import { useBoardGameStore } from '../store/useBoardGameStore';
import { Trophy, CalendarDays, X, Play, Users, Clock, BrainCircuit, ExternalLink, Gamepad2 } from 'lucide-react';
import { format } from 'date-fns';
import { getBggUrl } from '../lib/bggUtils';

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

  const bggUrl = getBggUrl(game);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-surface-200 dark:border-surface-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-surface-100 dark:border-surface-800 flex justify-between items-start bg-surface-50 dark:bg-surface-800/50">
          <div className="flex gap-3.5 items-center">
            <div className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-surface-200 dark:border-surface-700 shadow-sm">
              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-lg sm:text-xl text-surface-900 dark:text-white leading-tight">{game.title}</h3>
                {game.publishedYear && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                    {game.publishedYear}
                  </span>
                )}
              </div>
              {game.subtitle && (
                <p className="text-xs font-medium text-surface-500 mt-0.5">{game.subtitle}</p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-500 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 custom-scrollbar">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50 flex flex-col items-center justify-center">
              <Users size={16} className="text-surface-400 mb-1" />
              <span className="text-xs font-semibold text-surface-900 dark:text-white">{game.players}</span>
              <span className="text-[10px] text-surface-400">Players</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50 flex flex-col items-center justify-center">
              <Clock size={16} className="text-surface-400 mb-1" />
              <span className="text-xs font-semibold text-surface-900 dark:text-white">{game.duration ?? game.playTime}m</span>
              <span className="text-[10px] text-surface-400">Duration</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50 flex flex-col items-center justify-center">
              <BrainCircuit size={16} className="text-surface-400 mb-1" />
              <span className="text-xs font-semibold text-surface-900 dark:text-white">{game.weight}</span>
              <span className="text-[10px] text-surface-400">Weight</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50 flex flex-col items-center justify-center">
              <Gamepad2 size={16} className="text-surface-400 mb-1" />
              <span className="text-xs font-semibold text-surface-900 dark:text-white">{game.totalPlays}</span>
              <span className="text-[10px] text-surface-400">Plays</span>
            </div>
          </div>

          {/* BGG Link Section */}
          <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 dark:from-amber-500/20 dark:via-orange-500/15 dark:to-transparent border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md">
                BGG
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-300">
                  <span>BoardGameGeek</span>
                  <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-300">External Link</span>
                </div>
                <p className="text-xs text-surface-600 dark:text-surface-400 truncate mt-0.5">
                  {game.bggUrl ? 'Custom BGG Page' : `Search BGG for "${game.title}"`}
                </p>
              </div>
            </div>
            <a
              href={bggUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-colors shrink-0 shadow-sm group"
            >
              <span>Go to BGG</span>
              <ExternalLink size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          {/* Play History Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-sm text-surface-900 dark:text-white flex items-center gap-2">
                <Trophy size={16} className="text-amber-500" /> Play History & Winners
              </h4>
              <span className="text-xs text-surface-400">{gameLogs.length} Sessions</span>
            </div>

            {gameLogs.length === 0 ? (
              <div className="text-center py-8 text-surface-400 bg-surface-50 dark:bg-surface-800/20 rounded-2xl border border-dashed border-surface-200 dark:border-surface-700/50">
                <Play size={36} className="mx-auto mb-2 opacity-30" />
                <p className="text-xs font-medium">No play logs recorded yet for this game.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gameLogs.map((log) => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-surface-50 dark:bg-surface-800/40 border border-surface-100 dark:border-surface-700/50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-surface-500 flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {format(new Date(log.date), 'MMM do, yyyy')}
                      </span>
                      <span className="text-xs font-medium text-surface-400">
                        {log.players.length} Players
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5">
                      {log.winnerIds.map(winnerId => {
                        const p = players.find(player => player.id === winnerId);
                        return (
                          <div key={winnerId} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-[11px] font-bold shadow-2xs">
                            <Trophy size={11} className="fill-current" />
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
    </div>
  );
}
