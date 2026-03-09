import { useState, useEffect } from 'react';
import { useBoardGameStore, type Game } from '../store/useBoardGameStore';
import { X } from 'lucide-react';
interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: Game | null;
}

export default function GameModal({ isOpen, onClose, gameToEdit }: GameModalProps) {
  const { addGame, updateGame } = useBoardGameStore();
  
  const [formData, setFormData] = useState({
    title: '',
    players: '',
    playTime: 60,
    weight: 2.5,
    imageUrl: ''
  });

  useEffect(() => {
    if (gameToEdit) {
      setFormData({
        title: gameToEdit.title,
        players: gameToEdit.players,
        playTime: gameToEdit.playTime,
        weight: gameToEdit.weight,
        imageUrl: gameToEdit.imageUrl
      });
    } else {
      setFormData({
        title: '',
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
          <div>
            <label className="label">Game Title</label>
            <input 
              required
              type="text" 
              className="input" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g. Catan"
            />
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

          <div>
            <label className="label">Image URL</label>
            <input 
              type="url" 
              className="input" 
              value={formData.imageUrl}
              onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              placeholder="https://..."
            />
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
