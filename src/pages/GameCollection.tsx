import { useState, useMemo } from 'react';
import { useBoardGameStore, type Game } from '../store/useBoardGameStore';
import GameModal from '../components/GameModal';
import { Plus, Users, Clock, BrainCircuit, Trash2, Edit2, Gamepad2, Filter, ArrowUpDown } from 'lucide-react';

export type SortOption = 'most_played' | 'least_played' | 'most_photos' | 'abc' | 'zyx' | 'published';

export default function GameCollection() {
  const { games, logs, deleteGame } = useBoardGameStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [gameToDelete, setGameToDelete] = useState<{id: string, title: string} | null>(null);
  
  // Filter & Sort States
  const [playerFilter, setPlayerFilter] = useState<string>('');
  const [weightFilter, setWeightFilter] = useState<string>('');
  const [sortOption, setSortOption] = useState<SortOption>('most_played');

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingGame(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, title: string) => {
    setGameToDelete({ id, title });
  };

// Helper to get all images for a game (cover + log photos)
  const getGameImages = (gameId: string, coverImage?: string) => {
    const images: string[] = [];
    if (coverImage) images.push(coverImage);
    
    // Add all uploaded photos from play logs for this game
    logs.forEach(log => {
      if (log.gameId === gameId && log.imageUrls) {
        images.push(...log.imageUrls);
      }
    });
    
    return images;
  };

  const filteredGames = useMemo(() => {
    let result = games.filter(game => {
      // Player match
      let matchPlayer = true;
      if (playerFilter) {
        const parts = game.players.split('-');
        const min = parseInt(parts[0], 10) || 1;
        const max = parts.length > 1 ? parseInt(parts[1], 10) : min;
        
        if (playerFilter === '5+') {
          matchPlayer = max >= 5;
        } else {
          const target = parseInt(playerFilter, 10);
          matchPlayer = target >= min && target <= max;
        }
      }

      // Weight match
      let matchWeight = true;
      if (weightFilter) {
        if (weightFilter === 'light') matchWeight = game.weight < 2.0;
        else if (weightFilter === 'medium') matchWeight = game.weight >= 2.0 && game.weight < 3.0;
        else if (weightFilter === 'heavy') matchWeight = game.weight >= 3.0 && game.weight <= 4.0;
        else if (weightFilter === 'very_heavy') matchWeight = game.weight > 4.0;
      }

      return matchPlayer && matchWeight;
    });

    // Sort the results globally
    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'most_played':
          return b.totalPlays - a.totalPlays;
        case 'least_played':
          return a.totalPlays - b.totalPlays;
        case 'most_photos': {
          const photosA = getGameImages(a.id, a.imageUrl).length;
          const photosB = getGameImages(b.id, b.imageUrl).length;
          return photosB - photosA; // Sort descending by number of photos
        }
        case 'abc':
          return a.title.localeCompare(b.title);
        case 'zyx':
          return b.title.localeCompare(a.title);
        case 'published':
          return (b.publishedYear || 0) - (a.publishedYear || 0); // Newest first
        default:
          return 0;
      }
    });

    return result;
  }, [games, playerFilter, weightFilter, sortOption, logs]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-surface-900 dark:text-white">Game Collection</h2>
          <p className="text-surface-500">Manage your library of {games.length} games</p>
        </div>
        <button onClick={handleAdd} className="btn btn-primary">
          <Plus size={18} /> Add New Game
        </button>
      </div>

      {/* Filters & Sort */}
      <div className="flex flex-col xl:flex-row gap-4">
        {/* Filters */}
        <div className="flex-1 flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm">
          <div className="flex items-center gap-2 text-surface-500 font-medium px-2">
            <Filter size={18} /> Filters:
          </div>
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select 
              className="input"
              value={playerFilter}
              onChange={(e) => setPlayerFilter(e.target.value)}
            >
              <option value="">All Player Counts</option>
              <option value="1">1 Player</option>
              <option value="2">2 Players</option>
              <option value="3">3 Players</option>
              <option value="4">4 Players</option>
              <option value="5+">5+ Players</option>
            </select>
            <select 
              className="input"
              value={weightFilter}
              onChange={(e) => setWeightFilter(e.target.value)}
            >
              <option value="">All Weights (Complexity)</option>
              <option value="light">Light (&lt; 2.0)</option>
              <option value="medium">Medium (2.0 - 2.99)</option>
              <option value="heavy">Heavy (3.0 - 4.0)</option>
              <option value="very_heavy">Very Heavy (&gt; 4.0)</option>
            </select>
          </div>
        </div>

        {/* Sort */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-surface-800 p-4 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-sm xl:min-w-[320px]">
          <div className="flex items-center gap-2 text-surface-500 font-medium px-2 whitespace-nowrap">
            <ArrowUpDown size={18} /> Sort By:
          </div>
          <select 
            className="input w-full"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
          >
            <option value="most_played">Most Played</option>
            <option value="least_played">Least Played</option>
            <option value="most_photos">Most Photographs</option>
            <option value="abc">A to Z</option>
            <option value="zyx">Z to A</option>
            <option value="published">Newest Published</option>
          </select>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm font-medium text-surface-500 pb-2 border-b border-surface-200 dark:border-surface-700">
        <span>Showing {filteredGames.length} games</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredGames.map(game => {
          const gameImages = getGameImages(game.id, game.imageUrl);
          
          return (
          <div key={game.id} className="card group flex flex-col h-full hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
            <div className="relative h-48 bg-surface-200 dark:bg-surface-800 overflow-hidden">
              {gameImages.length > 0 ? (
                <div id={`carousel-${game.id}`} className="w-full h-full flex overflow-x-auto snap-x snap-mandatory no-scrollbar scroll-smooth">
                  {gameImages.map((imgUrl, idx) => (
                    <img 
                      key={idx}
                      src={imgUrl} 
                      alt={`${game.title} - Image ${idx + 1}`} 
                      className="w-full h-full flex-shrink-0 snap-center object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ))}
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-surface-400">
                  <Gamepad2 size={48} />
                </div>
              )}
              
              {/* Image pagination dots indicator (only if multiple images) */}
              {gameImages.length > 1 && (
                <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5 z-10">
                  {gameImages.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      aria-label={`Go to image ${idx + 1}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        const container = document.getElementById(`carousel-${game.id}`);
                        if (container) {
                          container.scrollTo({
                            left: container.clientWidth * idx,
                            behavior: 'smooth'
                          });
                        }
                      }}
                      className="w-2 h-2 rounded-full bg-white/50 hover:bg-white backdrop-blur-sm shadow-sm transition-colors cursor-pointer" 
                    />
                  ))}
                </div>
              )}

              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg pointer-events-none">
                 Play Count: {game.totalPlays}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 pr-2">
                  <h3 className="text-xl font-bold text-surface-900 dark:text-white line-clamp-1" title={game.title}>
                    {game.title}
                  </h3>
                  {game.publishedYear && (
                    <span className="text-xs font-medium text-surface-500 bg-surface-100 dark:bg-surface-700/50 px-2 py-0.5 rounded-md mt-1 inline-block">
                      {game.publishedYear}
                    </span>
                  )}
                </div>
                <div className="flex opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                  <button onClick={() => handleEdit(game)} className="p-1.5 text-surface-500 hover:text-primary-600 rounded-md hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => handleDelete(game.id, game.title)} className="p-1.5 text-surface-500 hover:text-rose-600 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/30 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <Users size={16} className="text-surface-500 mb-1" />
                  <span className="text-xs font-medium">{game.players}</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <Clock size={16} className="text-surface-500 mb-1" />
                  <span className="text-xs font-medium">{game.playTime}m</span>
                </div>
                <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-surface-50 dark:bg-surface-800/50">
                  <BrainCircuit size={16} className="text-surface-500 mb-1" />
                  <span className="text-xs font-medium">{game.weight}</span>
                </div>
              </div>
            </div>
          </div>
          );
        })}
        
        {filteredGames.length === 0 && games.length > 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center text-surface-500">
            <Filter size={48} className="mb-4 text-surface-300" />
            <p className="text-lg font-medium">No matches found</p>
            <p className="text-sm">Try adjusting your filters.</p>
          </div>
        )}

        {games.length === 0 && (
          <div className="col-span-full py-16 text-center border-2 border-dashed border-surface-300 dark:border-surface-700 rounded-2xl flex flex-col items-center justify-center text-surface-500">
            <Gamepad2 size={48} className="mb-4 text-surface-300" />
            <p className="text-lg font-medium">No games in your collection</p>
            <p className="text-sm">Click "Add New Game" to get started.</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {gameToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-6 text-center">
                <Trash2 size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Delete Game</h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm mb-2">
                  Are you sure you want to delete <span className="font-bold text-surface-700 dark:text-surface-200">{gameToDelete.title}</span>?
                </p>
                <p className="text-red-500 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-900/20 p-2 rounded-lg inline-block">
                  Warning: This will also delete all related play logs. This action cannot be undone.
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setGameToDelete(null)}
                    className="flex-1 px-5 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      deleteGame(gameToDelete.id);
                      setGameToDelete(null);
                    }}
                    className="flex-1 px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm"
                  >
                    Delete Game
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <GameModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        gameToEdit={editingGame} 
      />
    </div>
  );
}
