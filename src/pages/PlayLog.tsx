import { useState, useEffect } from 'react';
import { useBoardGameStore, type PlayerScore } from '../store/useBoardGameStore';
import { format } from 'date-fns';
import { Trophy, CalendarDays, Users, MessageSquareText, Plus, Trash2, ImageIcon, X, Edit2, Clock, Search, Gamepad2 } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

export default function PlayLog() {
  const { games, players, logs, addLog, updateLog, deleteLog } = useBoardGameStore();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [gameSearchQuery, setGameSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [logToEdit, setLogToEdit] = useState<string | null>(null); // State for editing
  const [logToDelete, setLogToDelete] = useState<string | null>(null); // New state for delete confirmation
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // State for viewing large images

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', '7d', '30d', 'year'
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    setVisibleCount(10);
  }, [searchQuery, selectedPlayerId, timeFilter]);

  const [formData, setFormData] = useState({
    gameId: '',
    date: new Date().toISOString().split('T')[0],
    playerScores: [] as PlayerScore[],
    reviewMemo: '',
    imageUrls: [] as string[],
  });

  const filteredGames = games
    .filter(g => {
      const normalizedTitle = g.title.toLowerCase().replace(/\s+/g, '');
      const normalizedSubtitle = (g.subtitle || '').toLowerCase().replace(/\s+/g, '');
      const normalizedQuery = gameSearchQuery.toLowerCase().replace(/\s+/g, '');
      return normalizedTitle.includes(normalizedQuery) || normalizedSubtitle.includes(normalizedQuery);
    })
    .slice(0, 20); // Limit results for performance and UI

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
      if (!formData.gameId) {
        if (gameSearchQuery) {
          alert(`"${gameSearchQuery}" was not chosen from the list. Please select the game from the search results dropdown.`);
        } else {
          alert("Please select a game.");
        }
      } else if (formData.playerScores.length === 0) {
        alert("Please add at least one player.");
      }
      return;
    }

    // Auto-calculate winner(s)
    let winnerIds: string[] = [];
    
    if (formData.playerScores.length > 0) {
      const highestScore = Math.max(...formData.playerScores.map(ps => ps.score));
      const winners = formData.playerScores.filter(ps => ps.score === highestScore);
      winnerIds = winners.map(w => w.playerId);
    }

    if (logToEdit) {
      updateLog(logToEdit, {
        gameId: formData.gameId,
        date: new Date(formData.date).toISOString(),
        players: formData.playerScores,
        winnerIds,
        reviewMemo: formData.reviewMemo,
        imageUrls: formData.imageUrls.length > 0 ? formData.imageUrls : undefined
      });
    } else {
      addLog({
        gameId: formData.gameId,
        date: new Date(formData.date).toISOString(),
        players: formData.playerScores,
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

  // Filter logs
  const filteredLogs = logs.filter(log => {
    const game = games.find(g => g.id === log.gameId);
    if (!game) return false;
    
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      game.title.toLowerCase().includes(searchLower) ||
      (game.subtitle || '').toLowerCase().includes(searchLower) ||
      log.reviewMemo.toLowerCase().includes(searchLower);
      
    const matchesPlayer = selectedPlayerId === '' ||
      log.players.some(p => p.playerId === selectedPlayerId);

    // Time filter logic
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const logDate = new Date(log.date);
      const now = new Date();
      if (timeFilter === '7d') {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(now.getDate() - 7);
        matchesTime = logDate >= sevenDaysAgo;
      } else if (timeFilter === '30d') {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(now.getDate() - 30);
        matchesTime = logDate >= thirtyDaysAgo;
      } else if (timeFilter === 'year') {
        matchesTime = logDate.getFullYear() === now.getFullYear();
      }
    }
      
    return matchesSearch && matchesPlayer && matchesTime;
  });

  // Sort and slice logs for dynamic pagination
  const displayedLogs = [...filteredLogs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, visibleCount);

  // Group logs by local date YYYY-MM-DD
  const groupedLogs = displayedLogs.reduce((acc: { [key: string]: typeof logs }, log) => {
    const dateKey = format(new Date(log.date), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(log);
    return acc;
  }, {});

  // Sort keys descending
  const sortedDates = Object.keys(groupedLogs).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getRelativeDateStr = (dateKey: string) => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd');
    
    if (dateKey === todayStr) return 'Today';
    if (dateKey === yesterdayStr) return 'Yesterday';
    return '';
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
                        onMouseDown={(e) => {
                          e.preventDefault(); // Prevent focus loss from input
                          handleGameSelect(g.id, g.title);
                        }}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{g.title}</span>
                          {g.subtitle && <span className="text-xs text-surface-400">{g.subtitle}</span>}
                        </div>
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

            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700 space-y-4">
              <div>
                <span className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                  Select Players
                </span>
                <div className="space-y-3">
                  {(['User', 'Family', 'Friend'] as const).map(groupName => {
                    const groupPlayers = players.filter(p => p.group === groupName);
                    if (groupPlayers.length === 0) return null;
                    return (
                      <div key={groupName} className="space-y-1.5">
                        <span className="text-[10px] uppercase font-bold text-surface-400 tracking-wider">
                          {groupName}
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {groupPlayers.map(p => {
                            const isSelected = formData.playerScores.some(ps => ps.playerId === p.id);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    handleRemovePlayerScore(p.id);
                                  } else {
                                    handleAddPlayerScore(p.id);
                                  }
                                }}
                                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all cursor-pointer select-none ${
                                  isSelected
                                    ? 'bg-primary-500 border-primary-500 text-white shadow-sm transform scale-[0.98]'
                                    : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700 hover:scale-[1.02]'
                                }`}
                              >
                                {p.imageUrl ? (
                                  <img src={p.imageUrl} alt={p.name} className="w-5 h-5 rounded-full object-cover" />
                                ) : (
                                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold uppercase ${
                                    isSelected ? 'bg-white/20 text-white' : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-300'
                                  }`}>
                                    {p.name.charAt(0)}
                                  </div>
                                )}
                                <span>{p.name}</span>
                                {isSelected && <span className="text-[10px] ml-0.5">✓</span>}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                <span className="block text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wider mb-2">
                  Scores
                </span>
                {formData.playerScores.length === 0 ? (
                  <div className="text-center py-4 text-surface-400 text-sm italic">
                    Tap players above to add them to this session
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
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mt-8 mb-2">
          <h3 className="text-xl font-display font-semibold">Historical Logs</h3>
          <span className="text-sm text-surface-500 font-medium">
            Showing {filteredLogs.length} of {logs.length} sessions
          </span>
        </div>

        {/* Filters Panel */}
        <div className="card p-4 space-y-3 bg-surface-50/50 dark:bg-surface-800/30">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full relative">
              <label className="sr-only">Search logs</label>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
                <Search size={16} />
              </div>
              <input 
                type="text"
                placeholder="Search by game title, sub-title or memo..."
                className="input !pl-9 !py-1.5 w-full text-sm"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="flex gap-3 w-full sm:w-auto shrink-0">
              <div className="relative flex-1 sm:flex-initial">
                <select
                  className="w-full text-sm bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg pl-3 pr-8 py-1.5 focus:border-primary-500 focus:outline-none dark:text-white"
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(e.target.value)}
                >
                  <option value="">All Players</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              {(searchQuery || selectedPlayerId || timeFilter !== 'all') && (
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedPlayerId(''); setTimeFilter('all'); }}
                  className="btn btn-secondary !py-1.5 !px-3 text-xs"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Time range quick filters */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-surface-200/50 dark:border-surface-700/50">
            <span className="text-[10px] uppercase font-bold text-surface-400 mr-2 tracking-wider">Time Range:</span>
            {[
              { id: 'all', label: 'All Time' },
              { id: '7d', label: 'Last 7 Days' },
              { id: '30d', label: 'Last 30 Days' },
              { id: 'year', label: 'This Year' }
            ].map(pill => (
              <button
                key={pill.id}
                onClick={() => setTimeFilter(pill.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  timeFilter === pill.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-600 dark:text-surface-300'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="card py-16 text-center text-surface-500">
            <CalendarDays size={48} className="mx-auto mb-4 text-surface-300" />
            <p className="text-lg">No play sessions found</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sortedDates.map(dateKey => (
              <div key={dateKey} className="space-y-4">
                {/* Date Group Header */}
                <div className="flex items-center justify-between gap-4 pt-4 first:pt-0">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-400 rounded-xl font-bold font-display shadow-sm">
                      <span className="text-xl leading-none">{format(new Date(dateKey), 'd')}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-surface-900 dark:text-white font-display text-base sm:text-lg">
                          {format(new Date(dateKey), 'EEEE, MMMM yyyy')}
                        </span>
                        {getRelativeDateStr(dateKey) && (
                          <span className="bg-primary-500/10 text-primary-600 dark:text-primary-400 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                            {getRelativeDateStr(dateKey)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-surface-500 font-medium mt-0.5">
                        {groupedLogs[dateKey].length} {groupedLogs[dateKey].length === 1 ? 'Session' : 'Sessions'} played
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-surface-200 to-transparent dark:from-surface-700/50"></div>
                </div>

                {/* Day Logs List */}
                <div className="space-y-4 sm:pl-4 sm:border-l-2 sm:border-surface-200 sm:dark:border-surface-800/60 sm:ml-6">
                  {groupedLogs[dateKey].map(log => {
                    const game = games.find(g => g.id === log.gameId);
                    
                    return (
                      <div key={log.id} className="card p-5 group flex flex-col md:flex-row gap-5 relative hover:border-primary-200 dark:hover:border-primary-900/50 transition-colors duration-200">
                        {/* Edit/Delete Actions */}
                        <div className="absolute top-4 right-4 flex items-center gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200 bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm p-0.5 rounded-lg border border-surface-100 dark:border-surface-700 shadow-sm z-10">
                          <button 
                            className="p-1.5 text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                            title="Edit Log"
                            onClick={() => openFormForEdit(log.id)}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="p-1.5 text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Delete Log"
                            onClick={() => setLogToDelete(log.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Game Box Art & Info */}
                        <div className="flex gap-4 items-start md:w-1/3">
                          {game?.imageUrl ? (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 border border-surface-200 dark:border-surface-700/50 shadow-sm bg-surface-50 dark:bg-surface-900/40">
                              <img src={game.imageUrl} alt={game.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            </div>
                          ) : (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-primary-100 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0 border border-surface-200 dark:border-surface-700/50">
                              <Gamepad2 size={24} />
                            </div>
                          )}
                          
                          <div className="min-w-0 pr-8 md:pr-0">
                            <h4 className="font-bold text-base sm:text-lg text-surface-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {game?.title || 'Unknown Game'}
                            </h4>
                            {game?.subtitle && (
                              <p className="text-xs text-surface-400 dark:text-surface-500 font-medium mt-0.5 truncate leading-none">
                                {game.subtitle}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {game?.playTime && (
                                <span className="inline-flex items-center gap-1 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-surface-200/50 dark:border-surface-700/50">
                                  <Clock size={10} />
                                  {game.playTime}m
                                </span>
                              )}
                              {game?.weight && (
                                <span className="inline-flex items-center gap-1 bg-surface-50 dark:bg-surface-800 text-surface-600 dark:text-surface-400 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-surface-200/50 dark:border-surface-700/50">
                                  <span>Weight</span>
                                  <span className="font-bold text-surface-800 dark:text-surface-200">{game.weight.toFixed(2)}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Players, Scores, Memo, Photos */}
                        <div className="flex-1 space-y-3">
                          {/* Players List */}
                          <div>
                            <div className="flex items-center gap-2 mb-2 text-surface-400">
                              <Users size={14} />
                              <span className="text-xs font-semibold uppercase tracking-wider">Players & Scores</span>
                            </div>
                            <div className="flex flex-wrap gap-2.5">
                              {log.players.sort((a,b) => b.score - a.score).map((ps) => {
                                const p = players.find(p => p.id === ps.playerId);
                                const isWinner = log.winnerIds.includes(ps.playerId);
                                return (
                                  <div 
                                    key={ps.playerId} 
                                    className={`inline-flex items-center gap-2 pl-1 pr-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${
                                      isWinner 
                                        ? 'bg-gradient-to-r from-amber-500/10 to-amber-500/5 border-amber-300/60 text-amber-800 dark:text-amber-400 dark:border-amber-800/80 dark:from-amber-950/20 dark:to-transparent ring-2 ring-amber-500/10' 
                                        : 'bg-surface-50 dark:bg-surface-900 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                                    }`}
                                  >
                                    <div className="relative shrink-0">
                                      {p?.imageUrl ? (
                                        <img src={p.imageUrl} alt={p.name} className="w-5 h-5 rounded-full object-cover border border-surface-200 dark:border-surface-700" />
                                      ) : (
                                        <div className="w-5 h-5 rounded-full bg-surface-300 dark:bg-surface-600 flex items-center justify-center text-[9px] font-bold text-white uppercase">
                                          {p?.name.charAt(0)}
                                        </div>
                                      )}
                                      {isWinner && (
                                        <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                                          <Trophy size={6} className="fill-white" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <span className="truncate max-w-[80px]">{p?.name || 'Unknown'}</span>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-black ${
                                      isWinner 
                                        ? 'bg-amber-500 text-white dark:bg-amber-600' 
                                        : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-300'
                                    }`}>
                                      {ps.score}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Memo / Review */}
                          {log.reviewMemo && (
                            <div className="relative pl-3 border-l-2 border-primary-500/50 dark:border-primary-500/30 text-sm text-surface-600 dark:text-surface-300 bg-surface-50/50 dark:bg-surface-900/10 p-2.5 rounded-r-xl italic font-medium">
                              <MessageSquareText size={12} className="inline-block mr-1 text-surface-400 dark:text-surface-600 align-middle -mt-0.5" />
                              "{log.reviewMemo}"
                            </div>
                          )}

                          {/* Photos */}
                          {log.imageUrls && log.imageUrls.length > 0 && (
                            <div className="pt-1">
                              <div className="flex flex-wrap gap-2">
                                {log.imageUrls.map((url, i) => (
                                  <div 
                                    key={i} 
                                    className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border border-surface-200 dark:border-surface-700 cursor-pointer hover:border-primary-500 transition-colors shadow-sm bg-surface-100 dark:bg-surface-800 shrink-0"
                                    onClick={() => setSelectedImage(url)}
                                  >
                                    <img src={url} alt={`Session photo ${i+1}`} className="w-full h-full object-cover hover:scale-110 transition-transform duration-300" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {filteredLogs.length > visibleCount && (
          <div className="flex justify-center pt-4">
            <button
              onClick={() => setVisibleCount(prev => prev + 10)}
              className="btn btn-secondary px-8 py-2.5 font-semibold text-sm flex items-center gap-2 hover:border-primary-500 hover:text-primary-600 transition-all dark:hover:text-primary-400 dark:hover:border-primary-400/50"
            >
              <span>Load More Sessions</span>
              <span className="text-xs bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400 px-2 py-0.5 rounded-full font-bold">
                {filteredLogs.length - visibleCount} remaining
              </span>
            </button>
          </div>
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
