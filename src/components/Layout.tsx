import React from 'react';
import { motion } from 'motion/react';
import { 
  LogOut, 
  Plus, 
  Sun, 
  Moon,
  BookText, 
  Compass, 
  Lightbulb, 
  Settings as SettingsIcon,
  Crown,
  Maximize,
  Minimize,
  Zap,
  Sparkles,
  Search
} from 'lucide-react';
import { logout } from '../lib/firebase';
import { useTheme } from '../context/ThemeContext';
import { LogoutConfirm } from './LogoutConfirm';
import { ThemeToggle } from './ThemeToggle';

type TabType = 'today' | 'journal' | 'guides' | 'insights' | 'settings' | 'history' | 'search';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNewReflection: () => void;
  onUpgrade?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, onNewReflection, onUpgrade }) => {
  const { theme, toggleTheme } = useTheme();
  const [isFabVisible, setIsFabVisible] = React.useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const scrollTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
        console.error(`Error attempting to enable fullscreen: ${e.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const handleScroll = (e: any) => {
      const currentY = e.target.scrollTop || 0;
      
      // Hide the FAB if we have scrolled more than 20px from the top
      if (currentY > 20) {
        setIsFabVisible(false);
      } else {
        setIsFabVisible(true);
      }
    };

    // Use capture: true to catch all scroll events from nested containers
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row h-screen h-[100dvh] bg-serene-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans select-none overflow-hidden p-2 md:p-6 gap-2 md:gap-6 transition-colors duration-500">
      {/* Floating Sidebar - Desktop Only */}
      <aside className="hidden md:flex w-72 glass-surface rounded-[40px] flex-col shrink-0 p-8 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-y-auto scrollbar-hide">
        <div className="flex-1 shrink-0">
          <div className="mb-12 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none shrink-0">
                <Zap size={20} fill="currentColor" />
              </div>
              <h1 className="font-serif text-3xl italic text-slate-900 dark:text-slate-50 tracking-tight leading-none">Mindly AI</h1>
            </div>
          </div>
          <nav className="space-y-2">
            <SidebarItem 
              icon={<Sun size={18} />} 
              label="Today" 
              active={activeTab === 'today'} 
              onClick={() => onTabChange('today')} 
            />
            <SidebarItem 
              icon={<BookText size={18} />} 
              label="Journal" 
              active={activeTab === 'journal'} 
              onClick={() => onTabChange('journal')} 
            />
            <SidebarItem 
              icon={<Compass size={18} />} 
              label="Guides" 
              active={activeTab === 'guides'} 
              onClick={() => onTabChange('guides')} 
            />
            <SidebarItem 
              icon={<Lightbulb size={18} />} 
              label="Insights" 
              active={activeTab === 'insights'} 
              onClick={() => onTabChange('insights')} 
            />
            <SidebarItem 
              icon={<SettingsIcon size={18} />} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => onTabChange('settings')} 
            />
          </nav>

          <div className="mt-12 px-2">
            <button 
              onClick={onNewReflection}
              className="w-full py-4 px-6 bg-indigo-600 text-white rounded-full text-sm font-bold shadow-lg shadow-indigo-200/40 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.02] transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Plus size={18} />
              New Journal
            </button>
          </div>
        </div>

        <div className="space-y-6 pt-6 shrink-0 mt-auto">
          <button 
            onClick={onUpgrade}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition-colors"
          >
            <Zap size={14} className="text-indigo-500" />
            Upgrade to Pro
          </button>
          
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-2">
              <ThemeToggle className="!w-10 !h-10 rounded-xl" />
              <button 
                onClick={toggleFullscreen}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </button>
            </div>
            <button 
              onClick={() => setShowLogoutConfirm(true)}
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Logout
            </button>
            <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-400 dark:text-slate-500">
              V1.2.0
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden glass-surface rounded-[32px] md:rounded-[40px] border-none shadow-2xl shadow-slate-200/20 dark:shadow-none">
        {/* Mobile Header / Theme Toggle */}
        <div className="md:hidden absolute top-6 right-6 z-50 flex items-center gap-2">
          <button 
            onClick={() => onTabChange('search')}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors relative"
          >
            <Search size={18} />
            <Sparkles size={8} className="absolute top-2 right-2 fill-current" />
          </button>
          <button 
            onClick={toggleFullscreen}
            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
          <ThemeToggle className="!w-10 !h-10 rounded-xl" />
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="flex-1 overflow-hidden"
        >
          {children}
        </motion.div>
      </main>

      <nav className="md:hidden fixed bottom-6 left-4 right-4 h-20 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/80 shadow-2xl shadow-indigo-100/40 flex items-center justify-around px-2 z-40 dark:bg-slate-900/80 dark:border-slate-800 dark:shadow-none">
        <MobileNavItem icon={<Sun size={24} />} active={activeTab === 'today'} onClick={() => onTabChange('today')} />
        <MobileNavItem icon={<BookText size={24} />} active={activeTab === 'journal'} onClick={() => onTabChange('journal')} />
        <MobileNavItem icon={<Compass size={24} />} active={activeTab === 'guides'} onClick={() => onTabChange('guides')} />
        <MobileNavItem icon={<Lightbulb size={24} />} active={activeTab === 'insights'} onClick={() => onTabChange('insights')} />
        <MobileNavItem icon={<SettingsIcon size={24} />} active={activeTab === 'settings'} onClick={() => onTabChange('settings')} />
      </nav>

      {/* Floating Action Button - Mobile Only */}
      <motion.div
        initial={false}
        animate={{ 
          opacity: isFabVisible ? 1 : 0,
          scale: isFabVisible ? 1 : 0.9,
          y: isFabVisible ? 0 : 10,
          pointerEvents: isFabVisible ? 'auto' : 'none'
        }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        className="md:hidden fixed bottom-28 right-6 z-50"
      >
        <button 
          onClick={onNewReflection}
          className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-indigo-300 dark:shadow-none active:scale-90 transition-all"
        >
          <Plus size={32} />
        </button>
      </motion.div>

      <LogoutConfirm 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={logout}
      />
    </div>
  );
};

const MobileNavItem: React.FC<{ icon: React.ReactNode; active?: boolean; onClick: () => void }> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2.5 sm:p-4 rounded-2xl transition-all min-w-[40px] sm:min-w-[44px] min-h-[40px] sm:min-h-[44px] flex items-center justify-center ${
      active 
        ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-inner' 
        : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50'
    }`}
  >
    {React.cloneElement(icon as React.ReactElement, { size: 20 })}
  </button>
);

const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  active?: boolean; 
  onClick: () => void 
}> = ({ icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all ${
      active 
        ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400 shadow-sm' 
        : 'text-slate-400 hover:bg-slate-50/50 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-800/50 dark:hover:text-slate-400'
    }`}
  >
    <span className={`${active ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-300 dark:text-slate-700'}`}>{icon}</span>
    {label}
  </button>
);
