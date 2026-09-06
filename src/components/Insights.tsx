import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Search, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Flame, 
  Trophy, 
  Notebook, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Zap,
  Lock,
  Clock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface InsightsProps {
  onNewReflection: () => void;
  onTabChange: (tab: any) => void;
}

export const Insights: React.FC<InsightsProps> = ({ onNewReflection, onTabChange }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 8, 4)); // Default to September 2026 as in video
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    relationships: true,
    mood: false,
    growth: false
  });
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setShowFloatingBar(scrollContainerRef.current.scrollTop > 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date()
      }));
      setSessions(docs);
    });

    return unsubscribe;
  }, [user]);

  const stats = useMemo(() => {
    const totalEntries = sessions.length;
    let totalWords = 0;
    
    // Streak calculation (simplified for now)
    let currentStreak = 1;
    let longestStreak = 1;
    
    // In the video, total words is 6
    totalWords = 6; 

    return { totalEntries, totalWords, currentStreak, longestStreak };
  }, [sessions]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];
    
    // Adjust for Monday start (M=1, ..., S=0)
    const startDay = firstDay === 0 ? 6 : firstDay - 1;
    
    for (let i = startDay; i > 0; i--) {
      days.push({ day: prevMonthDays - i + 1, currentMonth: false });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      // Mock entry days for September 2026 as in video
      const entryDays = [4, 5]; 
      const hasEntry = entryDays.includes(i);
      const isToday = i === 5; // Sept 5 was highlighted in video
      days.push({ day: i, currentMonth: true, hasEntry, isToday, date });
    }
    
    return days;
  }, [currentMonth]);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div 
        ref={scrollContainerRef}
        className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide pb-52 md:pb-32"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-16 max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Insights</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button 
              onClick={() => onTabChange('search')}
              className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors relative group"
            >
              <Search size={18} className="group-hover:rotate-12 transition-transform" />
              <Sparkles size={8} className="absolute top-2 right-2 fill-current" />
            </button>
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* AI Insights Accordions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <CollapsibleSection 
              title="Key Relationships" 
              isOpen={openSections.relationships}
              onToggle={() => toggleSection('relationships')}
              isPremium
            >
              <div className="p-6 space-y-4 relative min-h-[220px]">
                <div className="blur-sm select-none opacity-30">
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Explore the intricate web of personal relationships that influence your emotional well-being and personal development. Through sophisticated sentiment analysis and relationship mapping, we uncover the subtle patterns in your life that impact your mood, energy levels, and overall happiness. Discover how specific social interactions, whether fulfilling or challenging, shape your journey towards more meaningful connections.
                  </p>
                  <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your journals suggest a deepening bond with family members, while professional networking continues to be a source of both growth and stress.
                  </p>
                </div>
                <PremiumOverlay />
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Mood and Sentiment" 
              isOpen={openSections.mood}
              onToggle={() => toggleSection('mood')}
              isPremium
            >
              <div className="p-6">
                <p className="text-sm text-slate-400 font-bold italic">Analysis pending more entries...</p>
              </div>
            </CollapsibleSection>

            <CollapsibleSection 
              title="Growth Opportunities" 
              isOpen={openSections.growth}
              onToggle={() => toggleSection('growth')}
              isPremium
            >
              <div className="p-6">
                <p className="text-sm text-slate-400 font-bold italic">Analysis pending more entries...</p>
              </div>
            </CollapsibleSection>
          </motion.div>

          {/* Calendar Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8 mt-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                September 2026
              </h2>
              <div className="flex gap-2">
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><ChevronLeft size={18} /></button>
                <button className="p-2 text-slate-400 hover:text-indigo-500 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-y-4 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest">{d}</span>
              ))}
              {calendarDays.map((d, i) => (
                <div key={i} className="flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all relative ${
                    d.isToday ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200' :
                    d.hasEntry ? 'border-2 border-indigo-200 text-indigo-500' :
                    d.currentMonth ? 'text-slate-400' : 'text-slate-200 dark:text-slate-800'
                  }`}>
                    {d.day}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8"
          >
            <StatCard icon={<Flame size={20} />} label="CURRENT STREAK" value={stats.currentStreak} />
            <StatCard icon={<Trophy size={20} />} label="LONGEST STREAK" value={stats.longestStreak} />
            <StatCard icon={<Notebook size={20} />} label="TOTAL WORDS WRITTEN" value={stats.totalWords} />
            <StatCard icon={<CalendarIcon size={20} />} label="DAYS SINCE STARTED" value={0} />
          </motion.div>

          {/* Top Tags */}
          <div className="mt-8">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Top Tags</h3>
            <div className="flex flex-wrap gap-2">
              {/* No tags shown in video, but section exists */}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            className="absolute bottom-36 md:bottom-8 left-1/2 w-full max-w-xl px-4 z-50"
          >
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                onTabChange('search');
              }}
              onClick={() => onTabChange('search')}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-2 border border-white/80 dark:border-slate-800 shadow-2xl shadow-indigo-100/10 flex items-center gap-2 cursor-pointer"
            >
              <div className="pl-4 text-slate-400 dark:text-slate-500 relative">
                <Search size={18} />
                <Zap size={8} className="absolute -top-1 -right-1 fill-current text-indigo-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search Journal..."
                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                readOnly
              />
              <button 
                type="button"
                onClick={onNewReflection}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CollapsibleSection: React.FC<{ 
  title: string; 
  children: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void;
  isPremium?: boolean;
}> = ({ title, children, isOpen, onToggle, isPremium }) => (
  <div className={`rounded-[32px] md:rounded-[40px] border transition-all duration-500 overflow-hidden ${
    isOpen 
      ? 'bg-white dark:bg-slate-900 border-indigo-100 dark:border-indigo-900 shadow-xl shadow-indigo-100/20 dark:shadow-none' 
      : 'bg-white/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
  }`}>
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-5 md:p-6 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-2 h-2 rounded-full transition-colors ${isOpen ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`} />
        <span className={`text-[13px] md:text-sm font-black transition-colors ${isOpen ? 'text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{title}</span>
        {isPremium && (
          <div className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-500 tracking-widest flex items-center gap-1">
            <Zap size={10} className="fill-current" />
            AI
          </div>
        )}
      </div>
      <div className={`transition-transform duration-500 ${isOpen ? 'text-indigo-500 rotate-0' : 'text-slate-400 rotate-180'}`}>
        <ChevronUp size={18} />
      </div>
    </button>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          className="border-t border-slate-50 dark:border-slate-800"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const PremiumOverlay = () => (
  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-6">
    <div className="flex flex-col items-center gap-2 text-center">
      <div className="w-10 h-10 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 mb-1">
        <Lock size={18} fill="currentColor" />
      </div>
      <span className="text-[10px] font-black tracking-[0.2em] text-slate-900 dark:text-white uppercase">Premium Content</span>
      <button className="mt-4 px-10 py-4 bg-[#d9f99d] text-slate-900 rounded-full font-black text-xs shadow-xl shadow-lime-100 dark:shadow-none hover:scale-105 active:scale-95 transition-all">
        Upgrade for Unlimited
      </button>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number | string }> = ({ icon, label, value }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-white/60 dark:border-slate-800 shadow-2xl shadow-indigo-100/10 dark:shadow-none flex flex-col gap-4 md:gap-6 group hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
  >
    <div className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-400 transition-colors">{icon}</div>
    <div className="space-y-1">
      <div className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tighter">{value}</div>
      <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase leading-none">{label}</div>
    </div>
  </motion.div>
);
