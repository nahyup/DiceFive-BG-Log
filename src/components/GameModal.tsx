import { useState, useEffect } from 'react';
import { useBoardGameStore, type Game, type GameStatus } from '../store/useBoardGameStore';
import { X, Sparkles } from 'lucide-react';
import ImageUpload from './ImageUpload';
import { formatBggUrl, lookupBggInfo } from '../lib/bggUtils';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameToEdit?: Game | null;
}

export default function GameModal({ isOpen, onClose, gameToEdit }: GameModalProps) {
  const { games, addGame, updateGame } = useBoardGameStore();
  const [error, setError] = useState<string | null>(null);
  const [isFetchingBgg, setIsFetchingBgg] = useState(false);
  const [bggStatusMsg, setBggStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  
  const [formData, setFormData] = useState<{
    title: string;
    subtitle: string;
    publishedYear: number;
    players: string;
    duration: number | string;
    playTime: number | string;
    weight: number;
    imageUrl: string;
    status: GameStatus;
    bggUrl: string;
  }>({
    title: '',
    subtitle: '',
    publishedYear: new Date().getFullYear(),
    players: '',
    duration: 60,
    playTime: 60,
    weight: 2.5,
    imageUrl: '',
    status: 'Owned',
    bggUrl: ''
  });

  useEffect(() => {
    setError(null);
    setBggStatusMsg(null);
    if (gameToEdit) {
      const dur = gameToEdit.duration ?? gameToEdit.playTime ?? 60;
      setFormData({
        title: gameToEdit.title,
        subtitle: gameToEdit.subtitle || '',
        publishedYear: gameToEdit.publishedYear || new Date().getFullYear(),
        players: gameToEdit.players,
        duration: dur,
        playTime: dur,
        weight: gameToEdit.weight,
        imageUrl: gameToEdit.imageUrl,
        status: gameToEdit.status || 'Owned',
        bggUrl: gameToEdit.bggUrl || ''
      });
    } else {
      setFormData({
        title: '',
        subtitle: '',
        publishedYear: new Date().getFullYear(),
        players: '',
        duration: 60,
        playTime: 60,
        weight: 2.5,
        imageUrl: '',
        status: 'Owned',
        bggUrl: ''
      });
    }
  }, [gameToEdit, isOpen]);

  if (!isOpen) return null;

  const handleAutoFillBgg = async () => {
    if (!formData.bggUrl.trim()) return;
    setIsFetchingBgg(true);
    setBggStatusMsg(null);

    try {
      const info = await lookupBggInfo(formData.bggUrl, games);
      if (info) {
        setFormData(prev => {
          const dur = info.duration || info.playTime || prev.duration;
          return {
            ...prev,
            title: info.title || prev.title,
            subtitle: info.subtitle !== undefined && info.subtitle !== '' ? info.subtitle : prev.subtitle,
            publishedYear: info.publishedYear || prev.publishedYear,
            players: info.players || prev.players,
            duration: dur,
            playTime: dur,
            weight: info.weight || prev.weight,
            imageUrl: info.imageUrl || prev.imageUrl,
            bggUrl: info.bggUrl || formatBggUrl(prev.bggUrl) || prev.bggUrl
          };
        });

        if (info.title || info.players || info.duration || info.playTime) {
          setBggStatusMsg({ text: '✨ BGG 정보(제목, 인원, 시간, 난이도 등)를 성공적으로 불러왔습니다!', isError: false });
        } else {
          setBggStatusMsg({ text: '🔗 BGG 직결 링크(https://boardgamegeek.com/boardgame/...)로 자동 변환되었습니다!', isError: false });
        }
      } else {
        setBggStatusMsg({ text: '⚠️ 올바른 BGG ID 숫자(예: 342942) 또는 URL을 입력해 주세요.', isError: true });
      }
    } catch (err) {
      setBggStatusMsg({ text: '⚠️ BGG 정보를 불러오는 중 오류가 발생했습니다.', isError: true });
    } finally {
      setIsFetchingBgg(false);
    }
  };

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

    const formattedBgg = formatBggUrl(formData.bggUrl) || formData.bggUrl.trim();
    const dur = formData.duration;
    const payload = {
      ...formData,
      duration: dur,
      playTime: dur,
      bggUrl: formattedBgg
    };

    if (gameToEdit) {
      updateGame(gameToEdit.id, payload);
    } else {
      addGame(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-surface-900/40 dark:bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-800 rounded-2xl w-full max-w-md shadow-xl overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-xl font-display font-semibold">
            {gameToEdit ? 'Edit Game' : 'Add New Game'}
          </h3>
          <button onClick={onClose} className="text-surface-500 hover:text-surface-700 dark:hover:text-surface-300 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-medium px-4 py-3 rounded-xl">
              <span>⚠️</span> {error}
            </div>
          )}

          {/* BGG Auto-Fill Quick Section */}
          <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-2">
            <label className="label text-amber-900 dark:text-amber-300 font-bold flex justify-between items-center text-xs">
              <span>BGG ID / 링크로 정보 자동 채우기</span>
              {isFetchingBgg && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-normal animate-pulse flex items-center gap-1">
                  <Sparkles size={12} className="animate-spin" /> 불러오는 중...
                </span>
              )}
            </label>
            <div className="flex gap-2">
              <input 
                type="text" 
                className="input text-sm flex-1 bg-white dark:bg-surface-900" 
                value={formData.bggUrl}
                onChange={(e) => {
                  setFormData({...formData, bggUrl: e.target.value});
                  if (bggStatusMsg) setBggStatusMsg(null);
                }}
                placeholder="예: 342942 또는 https://boardgamegeek.com/boardgame/342942"
              />
              <button
                type="button"
                onClick={handleAutoFillBgg}
                disabled={!formData.bggUrl.trim() || isFetchingBgg}
                className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 flex items-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs cursor-pointer"
              >
                <Sparkles size={14} />
                <span>정보 불러오기</span>
              </button>
            </div>
            {bggStatusMsg && (
              <p className={`text-[11px] font-medium ${bggStatusMsg.isError ? 'text-red-500' : 'text-emerald-700 dark:text-emerald-400'}`}>
                {bggStatusMsg.text}
              </p>
            )}
          </div>

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
              <label className="label">Subtitle (Korean Title)</label>
              <input 
                type="text" 
                className="input" 
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                placeholder="예) 카탄"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Duration (min)</label>
              <input 
                required
                type="text" 
                className="input" 
                value={formData.duration}
                onChange={(e) => {
                  const val = e.target.value;
                  const num = Number(val);
                  const parsed = !isNaN(num) && val.trim() !== '' ? num : val;
                  setFormData({...formData, duration: parsed, playTime: parsed});
                }}
                placeholder="e.g. 60 or 45-60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as GameStatus})}
              >
                <option value="Owned">Owned</option>
                <option value="Owned by Friends">Owned by Friends</option>
                <option value="Wishlist">Wishlist</option>
                <option value="Preorder">Preorder</option>
                <option value="None">None</option>
              </select>
            </div>
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
                  type="text" 
                  className="input text-sm" 
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                  placeholder="e.g. /uploads/image.jpg or https://example.com/image.jpg"
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
