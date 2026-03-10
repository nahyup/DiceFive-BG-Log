import { useState, useEffect } from 'react';
import { useBoardGameStore, type Game } from '../store/useBoardGameStore';
import { X } from 'lucide-react';
import ImageUpload from './ImageUpload';
interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: Game | null;
}

export default function GameModal({ isOpen, onClose, gameToEdit }: GameModalProps) {
  const { games, addGame, updateGame } = useBoardGameStore();
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    publishedYear: new Date().getFullYear(),
    players: '',
    playTime: 60,
    weight: 2.5,
    imageUrl: ''
  });

  useEffect(() => {
    setError(null);
    if (gameToEdit) {
      setFormData({
        title: gameToEdit.title,
        publishedYear: gameToEdit.publishedYear || new Date().getFullYear(),
        players: gameToEdit.players,
        playTime: gameToEdit.playTime,
        weight: gameToEdit.weight,
        imageUrl: gameToEdit.imageUrl
      });
    } else {
      setFormData({
        title: '',
        publishedYear: new Date().getFullYear(),
        players: '',
        playTime: 60,
        weight: 2.5,
        imageUrl: ''
      });
    }
  }, [gameToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check for duplicates
    const normalizedTitle = formData.title.trim().toLowerCase();
    const isDuplicate = games.some(g => 
      g.title.toLowerCase() === normalizedTitle && g.id !== gameToEdit?.id
    );

    if (isDuplicate) {
      setError('A game with this title is already registered.');
      return;
    }

    if (gameToEdit) {
      updateGame(gameToEdit.id, formData);
    } else {
      addGame(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-surface-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-xl font-display font-semibold">
            {gameToEdit ? 'Edit Game' : 'Add New Game'}
          </h3>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Game Title</label>
              <input 
                required
                type="text" 
                className={`input ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}`} 
                value={formData.title}
                onChange={(e) => {
                  setFormData({...formData, title: e.target.value});
                  if (error) setError(null);
                }}
                placeholder="e.g. Catan"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            
            <div>
              <label className="label">Published Year</label>
              <input 
                required
                type="number" 
                min="1000"
                max="2100"
                className="input" 
                value={formData.publishedYear}
                onChange={(e) => setFormData({...formData, publishedYear: Number(e.target.value)})}
                placeholder="e.g. 1995"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Players</label>
              <input 
                required
                type="text" 
                className="input" 
                value={formData.players}
                onChange={(e) => setFormData({...formData, players: e.target.value})}
                placeholder="e.g. 2-4"
              />
            </div>
            <div>
              <label className="label">Play Time (min)</label>
              <input 
                required
                type="number" 
                min="1"
                className="input" 
                value={formData.playTime}
                onChange={(e) => setFormData({...formData, playTime: Number(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="label">Complexity/Weight (1.0 - 5.0)</label>
            <input 
              required
              type="number" 
              min="1.0"
              max="5.0"
              step="0.01"
              className="input" 
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-surface-900 dark:text-white">Game Image</h4>
            <div className="bg-surface-50 dark:bg-surface-800/50 p-4 rounded-xl border border-surface-200 dark:border-surface-700 space-y-4">
              <ImageUpload
                multiple={false}
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: Array.isArray(url) ? url[0] : url })}
              />
              <div className="flex items-center gap-3">
                <div className="h-px bg-surface-200 dark:bg-surface-700 flex-1"></div>
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-widest">OR ENTER URL</span>
                <div className="h-px bg-surface-200 dark:bg-surface-700 flex-1"></div>
              </div>
              <div>
                <input 
                  type="url" 
                  className="input text-sm" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost">Cancel</button>
            <button type="submit" className="btn btn-primary">
              {gameToEdit ? 'Save Changes' : 'Add Game'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
