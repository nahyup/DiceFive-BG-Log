import { useState } from 'react';
import { useBoardGameStore, type PlayerScore } from '../store/useBoardGameStore';
import { format } from 'date-fns';
import { Trophy, CalendarDays, Users, MessageSquareText, Plus, Trash2, ImageIcon, X, Edit2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

export default function PlayLog() {
  const { games, players, logs, addLog, updateLog, deleteLog } = useBoardGameStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<string | null>(null); // State for editing
  const [logToDelete, setLogToDelete] = useState<string | null>(null); // New state for delete confirmation
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for viewing large images

  const [formData, setFormData] = useState({
    gameId: '',
    date: new Date().toISOString().split('T')[0],
    playerScores: [] as PlayerScore[],
    reviewMemo: '',
    imageUrls: [] as string[],
  });

  const filteredGames = games
    .filter(g => g.title.toLowerCase().includes(gameSearchQuery.toLowerCase()))
    .slice(0, 10); // Limit to top 10 results for performance and UI

  const handleGameSelect = (gameId: string, gameTitle: string) => {
    setFormData({ ...formData, gameId });
    setGameSearchQuery(gameTitle);
    setIsDropdownOpen(false);
  };

  const handleAddPlayerScore = (playerId: string) => {
    if (formData.playerScores.find(ps => ps.playerId === playerId)) return;
    setFormData({
      ...formData,
      playerScores: [...formData.playerScores, { playerId, score: 0 }]
    });
  };

  const handleRemovePlayerScore = (playerId: string) => {
    setFormData({
      ...formData,
      playerScores: formData.playerScores.filter(ps => ps.playerId !== playerId)
    });
  };

  const handleScoreChange = (playerId: string, score: number) => {
    setFormData({
      ...formData,
      playerScores: formData.playerScores.map(ps => 
        ps.playerId === playerId ? { ...ps, score } : ps
      )
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.gameId || formData.playerScores.length === 0) {
      alert("Please select a game and add at least one player.");
      return;
    }

    // Auto-calculate winner(s)
    let winnerId: string | undefined = undefined;
    let winnerIds: string[] = [];
    
    if (formData.playerScores.length > 0) {
      const highestScore = Math.max(...formData.playerScores.map(ps => ps.score));
      // Check for ties or single winner
      const winners = formData.playerScores.filter(ps => ps.score === highestScore);
      
      winnerIds = winners.map(w => w.playerId);
      if (winners.length === 1) {
        winnerId = winners[0].playerId;
      }
    }

    if (logToEdit) {
      updateLog(logToEdit, {
        gameId: formData.gameId,
        date: new Date(formData.date).toISOString(),
        players: formData.playerScores,
        winnerId,
        winnerIds,
        reviewMemo: formData.reviewMemo,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined
      });
    } else {
      addLog({
        gameId: formData.gameId,
        date: new Date(formData.date).toISOString(),
        players: formData.playerScores,
        winnerId,
        winnerIds,
        reviewMemo: formData.reviewMemo,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined
      });
    }

    resetForm();
  };

  const resetForm = () => {
    setIsFormOpen(false);
    setLogToEdit(null);
    setGameSearchQuery('');
    setFormData({
      gameId: '',
      date: new Date().toISOString().split('T')[0],
      playerScores: [],
      reviewMemo: '',
      imageUrls: [],
    });
  };

  const openFormForEdit = (logId: string) => {
    const log = logs.find(l => l.id === logId);
    if (!log) return;
    
    const game = games.find(g => g.id === log.gameId);
    
    setLogToEdit(logId);
    setGameSearchQuery(game?.title || '');
    setFormData({
      gameId: log.gameId,
      date: log.date.split('T')[0],
      playerScores: log.players,
      reviewMemo: log.reviewMemo,
      imageUrls: log.imageUrls || [],
    });
    setIsFormOpen(true);
  };
    
  const availablePlayers = players.filter(
    p => !formData.playerScores.some(ps => ps.playerId === p.id)
  );

  // Functions for delete confirmation modal
  const confirmDelete = () => {
    if (logToDelete) {
      deleteLog(logToDelete);
      setLogToDelete(null);
    }
  };

  const cancelDelete = () => {
    setLogToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Play Logs</h2>
          <p className="text-surface-500">Record and review your play sessions</p>
        </div>
        {!isFormOpen && (
          <button onClick={() => setIsFormOpen(true)} className="btn btn-primary">
            <Plus size={18} /> New Session
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="card p-6 animate-in fade-in slide-in-from-top-4 duration-300 border-primary-200 dark:border-primary-800 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold">{logToEdit ? 'Edit Play Session' : 'Record Play Session'}</h3>
            <button onClick={resetForm} className="text-surface-400 hover:text-surface-700">Cancel</button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <label className="label">Game Played</label>
                <input 
                  required
                  type="text"
                  placeholder="Search game title..."
                  className="input"
                  value={gameSearchQuery}
                  onChange={e => {
                    setGameSearchQuery(e.target.value);
                    setFormData({ ...formData, gameId: '' }); // Reset ID if typing
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  // Delay blur so click events on dropdown items can fire
                  onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                />
                
                {isDropdownOpen && filteredGames.length > 0 && (
                  <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                    {filteredGames.map(g => (
                      <li 
                        key={g.id}
                        className="px-4 py-2 hover:bg-primary-50 dark:hover:bg-primary-900/30 cursor-pointer text-sm dark:text-white"
                        onClick={() => handleGameSelect(g.id, g.title)}
                      >
                        {g.title}
                      </li>
                    ))}
                  </ul>
                )}
                {isDropdownOpen && gameSearchQuery && filteredGames.length === 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg p-4 text-center text-surface-500 text-sm">
                    No games found
                  </div>
                )}
              </div>
              
              <div>
                <label className="label">Date</label>
                <input 
                  required
                  type="date"
                  className="input"
                  value={formData.date}
                  onChange={e => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
            </div>

            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
              <label className="label flex justify-between items-center mb-3">
                <span>Players & Scores</span>
                {availablePlayers.length > 0 && (
                  <select 
                    className="text-sm bg-white dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded px-2 py-1"
                    onChange={e => {
                      if (e.target.value) {
                        handleAddPlayerScore(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                  >
                    <option value="" disabled>Add Player...</option>
                    {availablePlayers.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.group})</option>
                    ))}
                  </select>
                )}
              </label>
              
              {formData.playerScores.length === 0 ? (
                <div className="text-center py-4 text-surface-500 text-sm">
                  Add players from the dropdown above
                </div>
              ) : (
                <div className="space-y-3">
                  {formData.playerScores.map(ps => {
                    const player = players.find(p => p.id === ps.playerId);
                    return (
                      <div key={ps.playerId} className="flex items-center gap-3 bg-white dark:bg-surface-800 p-2 rounded-lg border border-surface-200 dark:border-surface-700 shadow-sm">
                        <span className="flex-1 font-medium pl-2">{player?.name}</span>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-surface-500">Score:</label>
                          <input 
                            type="number" 
                            className="input !py-1 !px-2 w-24 text-right"
                            value={ps.score}
                            onChange={e => handleScoreChange(ps.playerId, Number(e.target.value))}
                          />
                          <button 
                            type="button" 
                            onClick={() => handleRemovePlayerScore(ps.playerId)}
                            className="text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/30 p-1.5 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="label">Review / Memo (For YouTube 'Dice Five')</label>
              <textarea 
                className="input min-h-[100px] resize-y"
                placeholder="Write your review, memorable moments, or thoughts for the YouTube channel..."
                value={formData.reviewMemo}
                onChange={e => setFormData({ ...formData, reviewMemo: e.target.value })}
              />
            </div>

            <div>
              <label className="label flex items-center gap-2 mb-2">
                <ImageIcon size={16} /> 
                <span>Session Photos</span>
              </label>
              <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700">
                <ImageUpload
                  multiple={true}
                  value={formData.imageUrls}
                  onChange={(urls) => setFormData({ ...formData, imageUrls: urls as string[] })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn btn-primary px-8">
                {logToEdit ? 'Save Changes' : 'Save Play Log'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-xl font-display font-semibold mt-8 mb-4">Historical Logs</h3>
        {logs.length === 0 ? (
          <div className="card py-16 text-center text-surface-500">
            <CalendarDays size={48} className="mx-auto mb-4 text-surface-300" />
            <p className="text-lg">No play sessions recorded</p>
          </div>
        ) : (
          [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => {
            const game = games.find(g => g.id === log.gameId);
            
            return (
              <div key={log.id} className="card p-5 group flex flex-col md:flex-row gap-5">
                <div className="md:w-1/4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-surface-200 dark:border-surface-700 pb-4 md:pb-0 md:pr-4">
                  <div className="text-sm text-surface-500 font-medium mb-1">
                    {format(new Date(log.date), 'MMM do, yyyy')}
                  </div>
                  <h4 className="font-bold text-lg text-surface-900 dark:text-white leading-tight">
                    {game?.title || 'Unknown Game'}
                  </h4>
                </div>
                
                <div className="md:w-1/2">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={16} className="text-surface-400" />
                    <span className="text-sm font-medium">Players & Scores</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {log.players.sort((a,b) => b.score - a.score).map((ps) => {
                      const p = players.find(p => p.id === ps.playerId);
                      const isWinner = (log.winnerIds && log.winnerIds.includes(ps.playerId)) || (!log.winnerIds && ps.playerId === log.winnerId);
                      return (
                        <div 
                          key={ps.playerId} 
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm border ${
                            isWinner 
                              ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-700/50 dark:text-amber-400 font-bold shadow-sm' 
                              : 'bg-surface-50 border-surface-200 text-surface-700 dark:bg-surface-800 dark:border-surface-700 dark:text-surface-300'
                          }`}
                        >
                          {isWinner && <Trophy size={14} />}
                          <span>{p?.name}: {ps.score}</span>
                        </div>
                      );
                    })}
                  </div>
                  
                  {log.imageUrls && log.imageUrls.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700/50">
                      <div className="flex items-center gap-2 mb-3">
                        <ImageIcon size={16} className="text-surface-400" />
                        <span className="text-sm font-medium">Photos ({log.imageUrls.length})</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {log.imageUrls.map((url, i) => (
                          <div 
                            key={i} 
                            className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-400 transition-colors shadow-sm"
                            onClick={() => setSelectedImage(url)}
                          >
                            <img src={url} alt={`Session photo ${i+1}`} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="md:w-1/4 flex flex-col justify-between">
                  {log.reviewMemo ? (
                    <div className="bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg flex-1 text-sm italic text-surface-600 dark:text-surface-400 relative">
                      <MessageSquareText size={16} className="absolute top-3 right-3 text-surface-300 dark:text-surface-600" />
                      "{log.reviewMemo}"
                    </div>
                  ) : (
                    <div className="flex-1"></div>
                  )}
                  <div className="mt-3 flex justify-end gap-2">
                    <button 
                      className="p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Edit Log"
                      onClick={() => openFormForEdit(log.id)}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete Log"
                      onClick={() => setLogToDelete(log.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {logToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden border border-surface-200 dark:border-surface-700 animate-in zoom-in-95 duration-200">
            <div className="p-6 text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold font-display text-surface-900 dark:text-white mb-2">Delete Play Log</h3>
              <p className="text-surface-600 dark:text-surface-300 text-sm mb-6">
                Are you sure you want to delete this play log?
                <br />
                <span className="text-red-500 dark:text-red-400 text-xs font-medium mt-2 block">
                  Warning: This will remove this play record from player statistics forever. This action cannot be undone.
                </span>
              </p>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelDelete}
                  className="flex-1 btn bg-surface-100 hover:bg-surface-200 text-surface-700 dark:bg-surface-700 dark:hover:bg-surface-600 dark:text-surface-200 border-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 btn bg-red-600 hover:bg-red-700 text-white font-medium border-none shadow-sm shadow-red-600/20"
                >
                  Delete Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 p-2 rounded-full backdrop-blur-md transition-all"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedImage(null);
            }}
          >
            <X size={24} />
          </button>
          
          <img 
            src={selectedImage} 
            alt="Enlarged session photo" 
            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
          />
        </div>
      )}
    </div>
  );
}
