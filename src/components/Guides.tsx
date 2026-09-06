import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { 
  ChevronRight, 
  Search, 
  Plus, 
  Zap, 
  Flame, 
  Brain, 
  Target, 
  Heart, 
  Moon,
  MessageSquare,
  Lock,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const COLLECTION_CHIPS = [
  { icon: <Target size={16} />, label: "Intentions & Goals" },
  { icon: <Zap size={16} />, label: "Play" },
  { icon: <Zap size={16} />, label: "Spiritual" },
  { icon: <Brain size={16} />, label: "Anxiety & Depression" },
  { icon: <Heart size={16} />, label: "Creativity" },
  { icon: <Brain size={16} />, label: "Personal Growth" },
  { icon: <Heart size={16} />, label: "Nourishing" },
  { icon: <Heart size={16} />, label: "Relationships" },
  { icon: <Flame size={16} />, label: "Trauma & Healing" },
];

const VOICES = [
  { name: "Jessica", image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150" },
  { name: "Marati", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150" },
  { name: "Jenny", image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150" },
  { name: "Liv", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150" },
  { name: "Nick", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150" },
];

const TAGS = [
  "BODY", "ANXIETY", "DEPRESSION", "GROWTH", "LEADERSHIP", "LOVE", "REFLECT AND RESET",
  "ALIVE", "TRANSITION", "FORGIVENESS", "CONFIDENCE", "MIND", "CURIOSITY", "JOY", "POSITIVE",
  "SELF-AWARENESS", "EMOTION", "STRENGTH", "INTENTION", "PRODUCTIVITY", "AFFIRMATION", "COURAGE",
  "RITUALS", "BALANCE", "HARMONY", "CREATIVE WRITING", "RESILIENCE", "COMPASSION", "VALUES", "GRATITUDE"
];

const IMAGE_FALLBACK = "https://images.unsplash.com/photo-1518241353349-e889b90243b3?w=800";

interface GuidesProps {
  onTabChange?: (tab: any) => void;
}

export const Guides: React.FC<GuidesProps> = ({ onTabChange }) => {
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = IMAGE_FALLBACK;
  };
  return (
    <div className="h-full bg-transparent overflow-hidden relative">
      <div 
        ref={scrollContainerRef}
        className="h-full overflow-y-auto scrollbar-hide pb-52"
      >
        <div className="max-w-3xl mx-auto p-4 md:p-8 lg:p-12">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-8 md:mb-16 max-w-3xl mx-auto">
            <div>
              <h1 className="text-3xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Guides</h1>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">EXPAND YOUR MIND</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button 
                onClick={() => onTabChange?.('search')}
                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-serene-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all active:scale-90 flex items-center justify-center text-slate-400 hover:text-indigo-500 transition-colors relative group"
              >
                <Search size={18} className="group-hover:rotate-12 transition-transform" />
                <Sparkles size={8} className="absolute top-2 right-2 fill-current" />
              </button>
            </div>
          </div>

          {/* Unlock Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-400">
                  <Lock size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-slate-900 dark:text-slate-50 font-bold text-lg">Monthly Review</h3>
                    <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-500 text-[8px] font-black uppercase rounded-full">NEW</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">A distilled recap of your month.</p>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-indigo-500 rounded-full" />
              </div>
              <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">UNLOCK WITH 1+ ENTRIES</p>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="group relative glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8 overflow-hidden cursor-pointer hover:scale-[1.01] transition-transform"
          >
            <div className="flex items-start justify-between relative z-10 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center text-purple-400">
                  <Lock size={20} />
                </div>
                <div>
                  <h3 className="text-slate-900 dark:text-slate-50 font-bold text-lg mb-1">Annual Review</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">A holistic look at your entire year.</p>
                </div>
              </div>
            </div>
            <div className="mt-auto">
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-1/5 bg-purple-500 rounded-full" />
              </div>
              <p className="mt-4 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">UNLOCK WITH 5+ MONTHS</p>
            </div>
          </motion.div>
        </div>


        {/* Recommended For You */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 mb-6 tracking-tight">Recommended For You</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            <GuideCard 
              title="Cultivating Your Inner Quiet" 
              author="Deepak Ramola" 
              description="Magnify what you want and retire what doesn't serve anymore."
              tags={["MIND", "GROWTH"]}
              image="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"
              featured
              onError={handleImageError}
            />
            <GuideCard 
              title="Go From Fear to Confidence" 
              author="Nick Wignall" 
              description="Lower your anxiety and boost your confidence."
              tags={["ANXIETY", "CONFIDENCE"]}
              image="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800"
              featured
              onError={handleImageError}
            />
          </div>
        </section>

        {/* Browse by Collection */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 mb-6 tracking-tight">Browse by Collection</h2>
          <div className="flex flex-wrap gap-3">
            {COLLECTION_CHIPS.map((chip, i) => (
              <button key={i} className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full text-sm font-bold text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-900 shadow-sm transition-all whitespace-nowrap">
                {chip.icon}
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* Featured Guides */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 mb-6 tracking-tight">Featured Guides</h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            <GuideCard 
              title="Set Your Time Free" 
              author="Jenny Blake" 
              description="Freeing time is a skill, and it's one you can get better at."
              tags={["MANAGEMENT", "+3"]}
              image="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=800"
              featured
              onError={handleImageError}
            />
            <GuideCard 
              title="Your Reunion Journey" 
              author="Jerry Colonna" 
              description="Healing Ourselves, Healing Our Ancestors."
              tags={["SOUL", "GROWTH", "+2"]}
              image="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800"
              featured
              onError={handleImageError}
            />
          </div>
        </section>

        {/* Featured Voices */}
        <section className="mb-12">
          <h2 className="text-2xl font-black text-[#1e293b] dark:text-slate-100 mb-6 tracking-tight">Featured Voices</h2>
          <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {VOICES.map((voice, i) => (
              <div key={i} className="flex flex-col items-center gap-3 shrink-0">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg">
                  <img 
                    src={voice.image} 
                    alt={voice.name} 
                    className="w-full h-full object-cover" 
                    referrerPolicy="no-referrer" 
                    crossOrigin="anonymous" 
                    onError={handleImageError}
                  />
                </div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{voice.name}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Multi-Day Journeys */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Guided Journeys</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <GuideCard 
              title="Reflect & Reset" 
              author="Mindly AI" 
              description="Reflect on your life and find new balance."
              tags={["REFLECT AND RESET", "+1"]}
              image="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800"
              variant="journey"
              onError={handleImageError}
            />
            <GuideCard 
              title="Gratitude Journey" 
              author="Grateful Living" 
              description="Start a new relationship with gratitude."
              tags={["GRATITUDE"]}
              image="https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=800"
              variant="journey"
              onError={handleImageError}
            />
          </div>
        </section>

        {/* Premium Guides */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Premium Library</h2>
            <button className="text-[10px] font-black text-indigo-500 uppercase tracking-widest hover:underline">View All</button>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6">
            <GuideCard 
              title="Kinship: Unlock Deeper Connections" 
              author="Holstee" 
              description="Embrace Gratitude and Strengthen Bonds."
              tags={["HOLSTEE", "KINSHIP", "+8"]}
              image="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800"
              premium
              onError={handleImageError}
            />
            <GuideCard 
              title="Wellness: Cultivate A Fulfilling Life" 
              author="Holstee" 
              description="Explore Your Life's Dimensions with Your Mind, Body, Soul."
              tags={["WELLNESS", "HOLSTEE", "+5"]}
              image="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"
              premium
              onError={handleImageError}
            />
          </div>
        </section>

        {/* Latest Guides */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Latest Additions</h2>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-6 px-6">
            <GuideCard 
              title="What Got Passed Down" 
              author="Mindly AI" 
              description="Find the rules you inherited without ever agreeing to them."
              tags={["SELF-AWARENESS", "+4"]}
              image="https://images.unsplash.com/photo-1528712306091-ed0763094c98?w=800"
              isNew
              onError={handleImageError}
            />
            <GuideCard 
              title="The Stories No One Tells" 
              author="Mindly AI" 
              description="What your family's silence is protecting."
              tags={["KINSHIP", "+2"]}
              image="https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800"
              isNew
              onError={handleImageError}
            />
          </div>
        </section>

        {/* Explore by Tag */}
        <section className="mb-32">
          <h2 className="text-2xl font-bold tracking-tight mb-8">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {TAGS.map((tag, i) => (
              <button key={i} className="px-4 py-2 glass-surface rounded-xl text-[10px] font-black text-slate-400 dark:text-slate-600 hover:text-indigo-500 transition-colors uppercase tracking-widest">
                {tag}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>

    {/* Bottom Search Bar */}
      <AnimatePresence>
        {showFloatingBar && (
          <motion.div 
            initial={{ opacity: 0, y: 100, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 100, x: '-50%' }}
            className="absolute bottom-36 md:bottom-8 left-1/2 w-full max-w-2xl px-4 z-50"
          >
            <div 
              onClick={() => onTabChange?.('search')}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-2 border border-white/80 dark:border-slate-800 shadow-2xl shadow-indigo-200/20 dark:shadow-none flex items-center gap-2 cursor-pointer"
            >
              <div className="pl-4 text-slate-500 dark:text-slate-400 relative">
                <Search size={20} />
                <Zap size={10} className="absolute -top-1 -right-1 fill-current text-indigo-400 dark:text-indigo-500" />
              </div>
              <div className="flex-1 text-sm font-bold text-slate-400 dark:text-slate-500 py-2">
                Search Guides...
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onTabChange?.('search');
                }}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={24} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface GuideCardProps {
  title: string;
  author: string;
  description: string;
  tags: string[];
  image: string;
  featured?: boolean;
  premium?: boolean;
  isNew?: boolean;
  variant?: 'guide' | 'journey';
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

const GuideCard: React.FC<GuideCardProps> = ({ title, author, description, tags, image, featured, premium, isNew, variant = 'guide', onError }) => (
  <motion.div 
    whileHover={{ y: -8 }}
    className={`shrink-0 ${variant === 'journey' ? 'w-full' : 'w-[280px] md:w-[380px]'} relative glass-surface rounded-[32px] md:rounded-[40px] overflow-hidden group cursor-pointer`}
  >
    <div className="h-40 md:h-48 relative overflow-hidden">
      <img 
        src={image} 
        alt={title} 
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
        referrerPolicy="no-referrer" 
        crossOrigin="anonymous" 
        onError={onError}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
      <div className="absolute top-6 left-6 flex gap-2">
        {featured && (
          <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-full border border-white/20 tracking-widest">
            FEATURED
          </span>
        )}
        {premium && (
          <span className="px-3 py-1 bg-purple-500/20 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-full border border-white/20 tracking-widest">
            PREMIUM
          </span>
        )}
        {isNew && (
          <span className="px-3 py-1 bg-amber-400/20 backdrop-blur-md text-white text-[8px] font-black uppercase rounded-full border border-white/20 tracking-widest">
            NEW
          </span>
        )}
      </div>
    </div>
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-3 md:mb-4">
        <div className="w-8 h-8 rounded-full overflow-hidden border border-slate-100 dark:border-slate-800">
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${author}`} 
            alt={author} 
            className="w-full h-full object-cover" 
            referrerPolicy="no-referrer" 
            crossOrigin="anonymous" 
          />
        </div>
        <p className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">{author}</p>
      </div>
      <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 leading-tight group-hover:text-indigo-500 transition-colors">{title}</h3>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 mb-4 md:mb-6 leading-relaxed">{description}</p>
      <div className="flex items-center gap-2">
        {tags.map((tag, i) => (
          <span key={i} className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-[9px] font-black text-slate-400 dark:text-slate-600 rounded-lg uppercase tracking-widest">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);
