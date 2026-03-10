import { Outlet, NavLink } from 'react-router-dom';
import { LayoutDashboard, Library, PenSquare, BarChart3, Dice5, Download, Upload, Users, Menu, X } from 'lucide-react';
import { useRef, useState } from 'react';
import clsx from 'clsx';
import { useBoardGameStore } from '../store/useBoardGameStore';

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/collection', icon: Library, label: 'Collection' },
    { to: '/players', icon: Users, label: 'Players' },
    { to: '/play-log', icon: PenSquare, label: 'Play Log' },
    { to: '/statistics', icon: BarChart3, label: 'Statistics' },
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useBoardGameStore();

  const handleExport = () => {
    const data = {
      games: store.games,
      players: store.players,
      logs: store.logs
    };
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dice-five-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.games && parsed.players && parsed.logs) {
          store.importData(parsed);
          alert('Data imported successfully!');
        } else {
          alert('Invalid backup file format.');
        }
      } catch (error) {
        alert('Error parsing the backup file.');
      }
    };
    reader.readAsText(file);
    // Reset input so the same file could be imported again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex h-screen w-full bg-surface-100 dark:bg-surface-900 overflow-hidden">
      {/* Mobile Backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "w-64 bg-white dark:bg-surface-800 border-r border-surface-200 dark:border-surface-700 flex flex-col transition-all duration-300 z-30",
        "fixed md:static inset-y-0 left-0 transform",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl text-white shadow-md shadow-primary-500/20">
              <Dice5 size={24} strokeWidth={2.5}/>
            </div>
            <h1 className="text-xl font-display font-bold text-surface-900 dark:text-white">Dice Five</h1>
          </div>
          <button 
            className="md:hidden p-2 text-surface-500 hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors rounded-lg"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200',
                  isActive 
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' 
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900 dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-surface-200'
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        
        {/* Data Management Footer */}
        <div className="p-4 border-t border-surface-200 dark:border-surface-700 space-y-2">
          <p className="px-2 text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Data</p>
          <button 
            onClick={handleExport}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-surface-200"
          >
            <Download size={18} />
            <span className="text-sm">Export Data</span>
          </button>
          
          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-surface-600 hover:bg-surface-100 hover:text-surface-900 transition-colors dark:text-surface-400 dark:hover:bg-surface-800/50 dark:hover:text-surface-200"
          >
            <Upload size={18} />
            <span className="text-sm">Import Data</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 z-10">
          <div className="flex items-center gap-2">
            <Dice5 size={24} className="text-primary-600" />
            <h1 className="text-lg font-display font-bold text-surface-900 dark:text-white">Dice Five</h1>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-surface-600 hover:bg-surface-100 rounded-lg dark:text-surface-400 dark:hover:bg-surface-700 transition-colors"
          >
            <Menu size={24} />
          </button>
        </header>
        
        <div className="flex-1 overflow-x-hidden overflow-y-auto bg-surface-100/50 dark:bg-surface-900/50 p-6 lg:p-10">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
