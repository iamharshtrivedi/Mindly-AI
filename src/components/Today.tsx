import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Sparkles, 
  Search, 
  Plus, 
  Calendar as CalendarIcon, 
  Trophy, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Zap,
  Star,
  Quote,
  Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, getDocs } from 'firebase/firestore';

interface TodayProps {
  onNewReflection: () => void;
  onTabChange: (tab: any) => void;
  onUpgrade: () => void;
}

export const Today: React.FC<TodayProps> = ({ onNewReflection, onTabChange, onUpgrade }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [countdown, setCountdown] = useState({ h: 23, m: 51, s: 37 });
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [lookBackTab, setLookBackTab] = useState<'week' | 'month' | 'year'>('week');
  const [searchQuery, setSearchQuery] = useState('');

  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Fetch all sessions for stats and calendar
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

  // Fetch all sessions for stats and calendar
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

  // Countdown timer logic
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { s = 59; m--; }
        else if (h > 0) { s = 59; m = 59; h--; }
        else { clearInterval(timer); }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Stats calculation
  const stats = useMemo(() => {
    const totalEntries = sessions.length;
    let totalWords = 0;
    
    // Streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    
    if (sessions.length > 0) {
      const dates = sessions.map(s => (s.createdAt as Date).toDateString());
      const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d as string));
      uniqueDates.sort((a, b) => b.getTime() - a.getTime());

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let checkDate = new Date(today);
      let i = 0;
      
      // Check if they entry today or yesterday to continue streak
      const lastEntryDate = uniqueDates[0];
      const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        while (i < uniqueDates.length) {
          const entryDate = uniqueDates[i];
          const dTime = Math.abs(checkDate.getTime() - entryDate.getTime());
          const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
          
          if (dDays === 0) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
            i++;
          } else if (dDays === 1) {
            // Gap of 1 day is fine if it was just today vs yesterday
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }

      // Longest streak (simplified)
      longestStreak = Math.max(currentStreak, 1);
    }

    return { totalEntries, totalWords, currentStreak, longestStreak };
  }, [sessions]);

  // Calendar logic
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const prevMonthDays = new Date(year, month, 0).getDate();
    const days = [];
    
    // Fill previous month
    const startDay = firstDay === 0 ? 6 : firstDay - 1; // Adjust for Monday start
    for (let i = startDay; i > 0; i--) {
      days.push({ day: prevMonthDays - i + 1, currentMonth: false });
    }
    
    // Current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const hasEntry = sessions.some(s => s.createdAt.toDateString() === date.toDateString());
      days.push({ day: i, currentMonth: true, hasEntry, date });
    }
    
    return days;
  }, [currentMonth, sessions]);

  const changeMonth = (offset: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + offset, 1));
  };

  const daysLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const weekDays = useMemo(() => {
    const today = new Date();
    const day = today.getDay(); // 0-6
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday start
    const monday = new Date(today.setDate(diff));
    
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const hasEntry = sessions.some(s => s.createdAt.toDateString() === d.toDateString());
      const isToday = d.toDateString() === new Date().toDateString();
      return { day: daysLabels[i], hasEntry, isToday };
    });
  }, [sessions]);

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div 
        ref={scrollContainerRef}
        className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide pb-52 md:pb-32"
      >
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl md:text-7xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none">Today</h1>
            <div className="hidden md:flex items-center gap-3">
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
          <p className="text-[10px] md:text-xs font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Daily Inspiration / Question - Journal Style */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface rounded-[32px] p-8 md:p-10 text-center relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform border border-serene-100 dark:border-slate-800"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles size={16} className="text-indigo-400 fill-current" />
              <h2 className="text-[9px] font-black text-indigo-500 dark:text-indigo-400 tracking-[0.2em] uppercase">Daily Inspiration</h2>
            </div>
            <p className="text-xl md:text-2xl font-serif italic text-slate-800 dark:text-slate-100 leading-tight mb-6">
              "What is one thing you can do today that your future self will thank you for?"
            </p>
            <button 
              onClick={onNewReflection}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
            >
              Write Journal
              <div className="px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black tracking-widest flex items-center gap-1">
                <Sparkles size={8} className="fill-current" />
                AI
              </div>
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Look Back - Journal Style */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-surface rounded-[40px] p-8"
            >
              <div className="flex items-center gap-3 mb-8">
                <CalendarIcon size={20} className="text-indigo-400" />
                <h2 className="text-xl font-bold tracking-tight">Look Back</h2>
              </div>
              
              <div className="flex bg-serene-100 dark:bg-slate-800 p-1 rounded-2xl mb-8">
                {(['week', 'month', 'year'] as const).map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setLookBackTab(tab)}
                    className={`flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all tracking-widest uppercase ${
                      lookBackTab === tab ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="bg-serene-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center justify-between border border-serene-100 dark:border-slate-800 group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-600 flex items-center justify-center text-indigo-400">
                      <Star size={20} />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-widest">Memories</h3>
                      <p className="text-[10px] font-medium text-slate-400">Discover your highlights.</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </div>
            </motion.div>

            {/* Stats / Streak */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-surface rounded-[40px] p-8 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
                    <Flame size={20} className={`${stats.currentStreak > 0 ? 'text-orange-500' : 'text-slate-300'} fill-current`} />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight">{stats.currentStreak} Day Streak</h2>
                </div>
              </div>

              <div className="flex justify-between items-center mb-8">
                {weekDays.map((wd, i) => (
                  <div key={i} className="flex flex-col items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                      wd.hasEntry 
                        ? 'bg-orange-500 text-white' 
                        : wd.isToday ? 'border border-indigo-200' : 'bg-serene-50 dark:bg-slate-800'
                    }`}>
                      <span className="text-[10px] font-black">{wd.day[0]}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-auto text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest text-center">Maintain your growth</p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <StatCard label="TOTAL WORDS" value="0" color="text-indigo-500" />
            <StatCard label="TOTAL ENTRIES" value={String(stats.totalEntries)} color="text-teal-500" />
            <StatCard label="LONGEST STREAK" value={String(stats.longestStreak)} color="text-purple-500" />
          </div>

          {/* Checklist Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Daily Progress</h2>
              <div className="text-[10px] font-black text-slate-300 dark:text-slate-600 tracking-widest uppercase">0/4 DONE</div>
            </div>
            <div className="space-y-4">
              <ChecklistItem label="Start Your First Journal" checked={sessions.length > 0} />
              <ChecklistItem label="Complete a Guide" checked={false} />
              <ChecklistItem label="Journal on Mobile" checked={false} />
              <ChecklistItem label="Leave a Review (Bonus!)" checked={false} />
            </div>
          </motion.div>

          {/* Calendar Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif italic">
                {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
              </h2>
              <div className="flex gap-2">
                <button onClick={() => changeMonth(-1)} className="p-2 glass-surface rounded-full text-slate-400 hover:text-indigo-500 transition-colors"><ChevronLeft size={18} /></button>
                <button onClick={() => changeMonth(1)} className="p-2 glass-surface rounded-full text-slate-400 hover:text-indigo-500 transition-colors"><ChevronRight size={18} /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-y-2 text-center">
              {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-4">{d}</span>
              ))}
              {calendarDays.map((d, i) => {
                const isToday = d.date?.toDateString() === new Date().toDateString();
                return (
                  <div key={i} className="flex items-center justify-center p-1">
                    <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center text-sm font-bold transition-all relative ${
                      isToday ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-200' : 
                      d.currentMonth ? 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800' : 'text-slate-200 dark:text-slate-800'
                    }`}>
                      {d.day}
                      {d.hasEntry && !isToday && (
                        <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Daily Question Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-surface rounded-[40px] p-8 text-center relative overflow-hidden group cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles size={18} className="text-indigo-400 fill-current" />
              <h2 className="text-xs font-black text-indigo-500 dark:text-indigo-400 tracking-widest uppercase">Daily Question</h2>
            </div>
            <p className="text-2xl font-serif italic text-slate-800 dark:text-slate-100 leading-tight mb-6">
              What is a memory that will forever make you laugh out loud?
            </p>
            <button 
              onClick={onNewReflection}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-full text-xs font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all inline-flex items-center gap-2"
            >
              Write Journal
              <div className="px-1.5 py-0.5 rounded-full bg-white/20 text-[8px] font-black tracking-widest flex items-center gap-1">
                <Sparkles size={8} className="fill-current" />
                AI
              </div>
            </button>
          </motion.div>

          {/* Look Back Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-surface rounded-[40px] p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <CalendarIcon size={18} className="text-indigo-400" />
              <h2 className="text-xl font-bold tracking-tight">Look Back</h2>
            </div>
            
            <div className="flex bg-slate-50 dark:bg-slate-800 p-1 rounded-2xl mb-6">
              {(['week', 'month', 'year'] as const).map(tab => (
                <button 
                  key={tab}
                  onClick={() => setLookBackTab(tab)}
                  className={`flex-1 py-2 text-xs font-black rounded-xl transition-all tracking-tight ${
                    lookBackTab === tab ? 'text-indigo-600 bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-4 group cursor-pointer hover:bg-white dark:hover:bg-slate-700 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-600 flex items-center justify-center text-indigo-400 shadow-sm shrink-0">
                <Clock size={24} className="text-indigo-300 dark:text-indigo-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Write a Journal</h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Capture your thoughts today to create memories for tomorrow.</p>
              </div>
            </div>
          </motion.div>

          {/* Premium Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-surface rounded-[40px] p-8 relative overflow-hidden"
          >
            <div className="flex flex-col sm:items-center sm:flex-row gap-8 relative z-10">
              <div className="w-20 h-20 mx-auto sm:mx-0 rounded-[32px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200 shrink-0">
                <Zap size={40} fill="currentColor" />
              </div>
              <div className="text-center sm:text-left flex-1">
                <h2 className="text-2xl font-serif italic text-slate-900 dark:text-slate-50 mb-2 leading-none">The Full Mindly Experience</h2>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">Unlimited AI Coaching, Voice Journals, Photo Memories, and Multi-Device Sync.</p>
                <button 
                  onClick={onUpgrade}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Upgrade to Pro
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quote Section */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="py-16 flex flex-col items-center text-center px-6"
          >
            <Quote size={32} className="text-slate-200 dark:text-slate-800 mb-8" />
            <p className="text-2xl font-serif italic text-slate-400 dark:text-slate-500 leading-relaxed mb-6 max-w-xl">
              "It is necessary ... for a man to go away by himself ... to sit on a rock ... and ask, 'Who am I, where have I been, and where am I going?'"
            </p>
            <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">Carl Sandburg</span>
          </motion.div>
        </div>
      </div>

      {/* Bottom Floating Bar */}
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
                <Sparkles size={8} className="absolute -top-1 -right-1 fill-current text-indigo-400" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search Journal..."
                className="flex-1 bg-transparent border-none focus:outline-none text-[13px] font-bold text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
              />
              <button 
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNewReflection();
                }}
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

const ChecklistItem: React.FC<{ label: string; checked?: boolean }> = ({ label, checked }) => (
  <div className="flex items-center gap-4 group cursor-pointer">
    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
      checked ? 'bg-indigo-600 border-indigo-600 shadow-sm shadow-indigo-100' : 'border-slate-100 dark:border-slate-800 group-hover:border-indigo-200 dark:group-hover:border-indigo-900'
    }`}>
      {checked ? <CheckCircle2 size={14} className="text-white" /> : <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-indigo-100 transition-colors" />}
    </div>
    <span className={`text-sm font-black tracking-tight transition-colors ${
      checked ? 'text-slate-400 dark:text-slate-600 line-through' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100'
    }`}>{label}</span>
  </div>
);

const StatCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <motion.div 
    whileHover={{ y: -2 }}
    className="glass-surface rounded-[40px] p-8 flex flex-col items-center gap-3 group border border-slate-100 dark:border-slate-800 hover:border-indigo-100 dark:hover:border-indigo-900 transition-all"
  >
    <div className={`w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center font-black text-2xl ${color} shadow-inner transition-colors group-hover:bg-white dark:group-hover:bg-slate-700`}>
      {value}
    </div>
    <span className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-widest text-center leading-none mt-2">{label}</span>
  </motion.div>
);
