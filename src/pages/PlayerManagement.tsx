import { useState, useRef } from 'react';
import { useBoardGameStore, type Player } from '../store/useBoardGameStore';
import { Users, UserPlus, Trash2, Shield, User, Pencil, Upload } from 'lucide-react';
import { PlayerDetailsModal } from '../components/PlayerDetailsModal';

export default function PlayerManagement() {
  const store = useBoardGameStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayerId, setEditingPlayerId] = useState<string | null>(null);
  const [playerToDelete, setPlayerToDelete] = useState<string | null>(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  
  const [name, setName] = useState('');
  const [group, setGroup] = useState<'Family' | 'Friend' | 'User'>('Friend');
  const [imageUrl, setImageUrl] = useState('');
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setName('');
    setGroup('Friend');
    setImageUrl('');
    setPreviewImage(null);
    setEditingPlayerId(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (player: Player) => {
    resetForm();
    setEditingPlayerId(player.id);
    setName(player.name);
    setGroup(player.group);
    setImageUrl(player.imageUrl || '');
    setPreviewImage(player.imageUrl || null);
    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Resize image to ~200x200 max to save space
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        const resizedDataUrl = canvas.toDataURL('image/webp', 0.8);
        setPreviewImage(resizedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Provide a default avatar if none exists, or use the uploaded preview, or string URL
    const finalImageUrl = previewImage || imageUrl.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`;

    if (editingPlayerId) {
      store.updatePlayer(editingPlayerId, { name: name.trim(), group, imageUrl: finalImageUrl });
    } else {
      store.addPlayer({ name: name.trim(), group, imageUrl: finalImageUrl });
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const GroupBadge = ({ group }: { group: 'Family' | 'Friend' | 'User' }) => {
    switch (group) {
      case 'Family':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"><Users size={12} /> Family</span>;
      case 'User':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400"><Shield size={12} /> User</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"><User size={12} /> Friend</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-surface-900 dark:text-white">Player Management</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Add, edit, and organize players for your board game sessions.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-medium transition-colors shadow-sm"
        >
          <UserPlus size={20} />
          <span>Add Player</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {store.players.map((player) => (
          <div 
            key={player.id} 
            onClick={() => setSelectedPlayerId(player.id)}
            className="bg-white dark:bg-surface-800 rounded-2xl p-5 border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col items-center text-center group cursor-pointer hover:border-primary-500 dark:hover:border-primary-500 transition-all hover:shadow-md active:scale-[0.98]"
          >
            <div className="relative mb-4">
              {player.imageUrl ? (
                <img src={player.imageUrl} alt={player.name} className="w-24 h-24 rounded-full object-cover border-4 border-surface-100 dark:border-surface-700 shadow-sm bg-surface-100 dark:bg-surface-700" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-surface-200 dark:bg-surface-700 flex items-center justify-center border-4 border-surface-100 dark:border-surface-700 shadow-sm">
                  <User size={40} className="text-surface-400" />
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-bold text-surface-900 dark:text-white mb-1">{player.name}</h3>
            <GroupBadge group={player.group} />
            
            <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 w-full flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenEditModal(player);
                }}
                className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors"
                title="Edit player"
              >
                <Pencil size={18} />
              </button>
               <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setPlayerToDelete(player.id);
                }}
                disabled={player.group === 'User'}
                className="p-2 text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={player.group === 'User' ? "Cannot delete the main user" : "Delete player"}
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}

        {store.players.length === 0 && (
           <div className="col-span-full bg-white dark:bg-surface-800 rounded-2xl p-8 border border-surface-200 dark:border-surface-700 text-center">
             <Users size={48} className="mx-auto text-surface-300 dark:text-surface-600 mb-4" />
             <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">No players yet</h3>
             <p className="text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
               Add players to start tracking who you play games with and keep track of scores.
             </p>
           </div>
        )}
      </div>

      {/* Add/Edit Player Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between bg-surface-50/50 dark:bg-surface-800/50">
                <h2 className="text-lg font-bold text-surface-900 dark:text-white">
                  {editingPlayerId ? 'Edit Player' : 'Add New Player'}
                </h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 text-surface-500 hover:text-surface-900 dark:hover:text-white hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
             </div>
             
             <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                      placeholder="Enter player name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Group
                    </label>
                    <select
                      value={group}
                      onChange={(e) => setGroup(e.target.value as 'Family' | 'Friend' | 'User')}
                      className="w-full px-4 py-2.5 bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                    >
                      <option value="Friend">Friend</option>
                      <option value="Family">Family</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                      Profile Image
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="shrink-0 relative group">
                        {previewImage || imageUrl ? (
                          <img 
                            src={previewImage || imageUrl} 
                            alt="Preview" 
                            className="w-16 h-16 rounded-full object-cover border-2 border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-800"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-surface-100 dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 flex items-center justify-center">
                             <User size={24} className="text-surface-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <input
                          type="url"
                          value={imageUrl}
                          onChange={(e) => {
                            setImageUrl(e.target.value);
                            setPreviewImage(null); // Clear upload preview if URL is typed
                          }}
                          className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-900 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all dark:text-white"
                          placeholder="Or enter image URL"
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                          />
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-surface-700 dark:text-surface-300 bg-surface-100 hover:bg-surface-200 dark:bg-surface-700 dark:hover:bg-surface-600 rounded-lg transition-colors border border-surface-200 dark:border-surface-600"
                          >
                            <Upload size={14} />
                            Upload Image
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-medium bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition-colors shadow-sm"
                  >
                    {editingPlayerId ? 'Save Changes' : 'Add Player'}
                  </button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {playerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-surface-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-surface-800 rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-6 text-center">
                <Trash2 size={48} className="mx-auto text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">Delete Player</h2>
                <p className="text-surface-500 dark:text-surface-400 text-sm">
                  Are you sure you want to delete this player? This action cannot be undone.
                </p>
                <div className="mt-8 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setPlayerToDelete(null)}
                    className="flex-1 px-5 py-2.5 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-100 dark:hover:bg-surface-700 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      store.deletePlayer(playerToDelete);
                      setPlayerToDelete(null);
                    }}
                    className="flex-1 px-5 py-2.5 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors shadow-sm"
                  >
                    Delete
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}
      {/* Player Details Modal */}
      {selectedPlayerId && (
        <PlayerDetailsModal 
          playerId={selectedPlayerId} 
          onClose={() => setSelectedPlayerId(null)} 
        />
      )}
    </div>
  );
}
