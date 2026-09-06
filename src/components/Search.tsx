import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, 
  Sparkles, 
  Tag, 
  Bookmark as BookmarkIcon, 
  Calendar, 
  ArrowUpRight,
  X,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  Lock,
  History
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';

interface SearchProps {
  onSelectSession: (id: string) => void;
  onBack: () => void;
}

export const Search: React.FC<SearchProps> = ({ onSelectSession, onBack }) => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'tags' | 'bookmarks' | 'reviews' | 'journeys'>('tags');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      }));
      setSessions(docs);
    });

    return unsubscribe;
  }, [user]);

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return sessions.filter(s => 
      s.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [sessions, searchQuery]);

  // Group filtered results by month
  const groupedResults = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    filteredSessions.forEach(session => {
      const date = session.updatedAt as Date;
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(session);
    });
    return groups;
  }, [filteredSessions]);

  return (
    <div className="h-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto scrollbar-hide pb-52 md:pb-32">
        <div className="max-w-3xl mx-auto p-4 md:p-12">
          <header className="mb-10 md:mb-20">
            <h1 className="text-3xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Search</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">FIND YOUR REFLECTIONS</p>
          </header>

        {/* Upgrade Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 p-6 glass-surface rounded-[32px] flex items-center justify-between group cursor-pointer hover:scale-[1.01] transition-transform"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-500">
              <Sparkles size={24} />
            </div>
            <div>
              <span className="block font-bold text-slate-900 dark:text-slate-50">AI Enhanced Search</span>
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Unlock semantic search across your entire history.</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
        </motion.div>

        {/* Browse Sections */}
        {!searchQuery && (
          <div className="space-y-16">
            <section>
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-8 px-2">BROWSE ENTRIES</h2>
              <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide px-2">
                <BrowseTab 
                  active={activeTab === 'tags'} 
                  onClick={() => setActiveTab('tags')}
                  icon={<Tag size={18} />} 
                  label="By Tag" 
                />
                <BrowseTab 
                  active={activeTab === 'bookmarks'} 
                  onClick={() => setActiveTab('bookmarks')}
                  icon={<BookmarkIcon size={18} />} 
                  label="Bookmarked" 
                />
                <BrowseTab 
                  active={activeTab === 'reviews'} 
                  onClick={() => setActiveTab('reviews')}
                  icon={<Calendar size={18} />} 
                  label="Reviews" 
                />
                <BrowseTab 
                  active={activeTab === 'journeys'} 
                  onClick={() => setActiveTab('journeys')}
                  icon={<TrendingUp size={18} />} 
                  label="Journeys" 
                />
              </div>
              
              <AnimatePresence mode="wait">
                {activeTab === 'tags' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mt-10"
                  >
                    <div className="flex flex-wrap gap-3">
                      {['MIND', 'GROWTH', 'ANXIETY', 'JOY', 'PRODUCTIVITY'].map(tag => (
                        <button key={tag} className="px-5 py-2 glass-surface rounded-full text-[10px] font-black text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-all uppercase tracking-widest">
                          {tag}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </section>

            <section>
              <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-8">ASK A QUESTION</h2>
              <div className="relative">
                <div className="space-y-4 filter blur-md select-none opacity-40">
                  <QuestionPrompt text="What are my core personal values?" />
                  <QuestionPrompt text="How have my goals, priorities, or concerns evolved over time?" />
                  <QuestionPrompt text="What brings me joy?" />
                  <QuestionPrompt text="Reflecting back, what have I accomplished?" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="flex items-center gap-2 px-8 py-4 glass-surface rounded-full shadow-2xl font-bold text-slate-800 dark:text-slate-100 hover:scale-110 active:scale-95 transition-all z-10">
                    <Lock size={18} className="text-emerald-500" />
                    <span>Upgrade to Unlock</span>
                  </button>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Search Results */}
        {searchQuery && (
          <div className="space-y-12 pb-24">
            {Object.keys(groupedResults).length > 0 ? (
              (Object.entries(groupedResults) as [string, any[]][]).map(([month, monthSessions]) => (
                <div key={month}>
                  <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-6">{month}</h3>
                  <div className="space-y-4">
                    {monthSessions.map(session => (
                      <motion.div
                        key={session.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onSelectSession(session.id)}
                        className="p-6 md:p-8 glass-surface rounded-[32px] md:rounded-[40px] shadow-sm hover:scale-[1.01] transition-transform cursor-pointer group"
                      >
                        <div className="flex items-start gap-4 md:gap-6">
                          <div className="w-12 h-12 md:w-14 md:h-14 bg-slate-50 dark:bg-slate-950/40 rounded-[18px] md:rounded-[20px] flex flex-col items-center justify-center shrink-0 border border-slate-100 dark:border-slate-800">
                            <span className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{session.updatedAt.toLocaleString('default', { weekday: 'short' })}</span>
                            <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 leading-none">{session.updatedAt.getDate()}</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-500 transition-colors leading-tight mb-2 line-clamp-2">{session.summary || 'Untitled journal'}</h4>
                            <div className="flex items-center gap-1 text-indigo-400/30">
                              <Sparkles size={12} className="fill-current" />
                              <Sparkles size={12} className="fill-current" />
                              <Sparkles size={12} className="fill-current" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-24 glass-surface rounded-[48px] border-dashed">
                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 dark:text-slate-700">
                  <SearchIcon size={40} />
                </div>
                <h3 className="text-2xl font-serif italic text-slate-900 dark:text-slate-50 mb-2">No results found</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Try broadening your search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

      {/* Floating Search Bar */}
      <div className="absolute bottom-36 md:bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
        <div className="flex flex-col items-center gap-1">
          <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-2 border border-white/80 dark:border-slate-800 shadow-2xl flex items-center gap-2">
            <div className="pl-4 text-slate-500 dark:text-slate-400 relative">
              <SearchIcon size={20} />
              <Sparkles size={10} className="absolute -top-1 -right-1 fill-current text-indigo-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Journal..."
              className="flex-1 bg-transparent border-none focus:outline-none text-base font-bold text-slate-700 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-600"
            />
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            ) : (
              <button 
                onClick={onBack}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors"
              >
                <X size={20} />
              </button>
            )}
          </div>
          <p className="text-[9px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest mt-2">Daily free limit reached. Using standard search.</p>
        </div>
      </div>
    </div>
  );
};

const BrowseTab: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 md:px-6 py-3 md:py-4 rounded-[24px] transition-all font-bold text-sm whitespace-nowrap shrink-0 ${
      active 
        ? 'glass-surface bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-50 shadow-indigo-100/20' 
        : 'bg-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
    }`}
  >
    <span className="shrink-0 flex items-center justify-center">{icon}</span>
    <span>{label}</span>
  </button>
);

const QuestionPrompt: React.FC<{ text: string }> = ({ text }) => (
  <div className="p-6 glass-surface rounded-[24px] text-slate-600 dark:text-slate-400 font-bold text-sm">
    {text}
  </div>
);
