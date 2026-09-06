import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Flame, 
  Star,
  Info,
  ChevronRight,
  MessageSquare,
  Lightbulb,
  Tag
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface JournalInsightsProps {
  onContinue: () => void;
  onEdit: () => void;
  streakCount: number;
  interactions: any[];
}

const AITag = () => (
  <div className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-500 tracking-widest flex items-center gap-1">
    <Sparkles size={10} className="fill-current" />
    AI
  </div>
);

export const JournalInsights: React.FC<JournalInsightsProps> = ({ onContinue, onEdit, streakCount, interactions }) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    summary: true,
    coach: true
  });

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getInteractionByType = (type: string) => {
    const interaction = interactions.find(i => i.type === type);
    return interaction?.response;
  };

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const currentDay = 4; // Friday in the video

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[60] bg-white dark:bg-slate-950 flex flex-col overflow-y-auto scrollbar-hide transition-colors duration-500"
    >
      <div className="max-w-3xl mx-auto w-full p-6 md:p-12 space-y-6 pb-32">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Sparkles size={24} className="text-slate-800 dark:text-slate-100" />
          <h1 className="text-3xl md:text-4xl font-black text-[#1e293b] dark:text-slate-100 tracking-tighter">Insights</h1>
          <AITag />
        </div>

        {/* Streak Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[32px] p-6 sm:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <Flame size={20} className="text-slate-800 dark:text-slate-200 fill-current" />
            <h2 className="text-xl font-black text-[#1e293b] dark:text-slate-100 tracking-tight">{streakCount} Day Streak</h2>
          </div>

          <div className="flex justify-between items-center px-0 sm:px-2 overflow-x-auto pb-2 scrollbar-hide">
            {days.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-3 min-w-[45px]">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border transition-all ${
                  i === currentDay 
                    ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-900/50 text-indigo-400' 
                    : 'bg-slate-50/50 dark:bg-slate-800/50 border-slate-50 dark:border-slate-800 text-slate-200 dark:text-slate-800'
                }`}>
                  <Star size={16} fill={i === currentDay ? 'currentColor' : 'none'} />
                </div>
                <span className={`text-[10px] font-black tracking-widest ${i === currentDay ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-200 dark:text-slate-800'}`}>{day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Limit Alert */}
        <div className="bg-rose-50/50 dark:bg-rose-900/10 border border-rose-100/50 dark:border-rose-900/30 rounded-2xl p-4 flex items-center gap-3 text-rose-500">
          <Info size={16} />
          <p className="text-xs font-bold">Daily AI limit reached. Try again tomorrow.</p>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-4">
          <InsightSection 
            id="summary"
            title="Summary" 
            icon={<Sparkles size={16} />}
            isOpen={openSections.summary}
            onToggle={() => toggleSection('summary')}
            content={getInteractionByType('summarize')}
            emptyText="No summary available."
          />
          <InsightSection 
            id="coach"
            title="Coach" 
            icon={<MessageSquare size={16} />}
            isOpen={openSections.coach}
            onToggle={() => toggleSection('coach')}
            content={getInteractionByType('coach-me')}
            emptyText="No coaching insights available."
          />
          <InsightSection 
            id="patterns"
            title="Past Patterns" 
            icon={<Sparkles size={16} />}
            isOpen={openSections.patterns}
            onToggle={() => toggleSection('patterns')}
            content={getInteractionByType('past-patterns')}
            emptyText="No patterns identified."
          />
          <InsightSection 
            id="perspective"
            title="Perspective" 
            icon={<Lightbulb size={16} />}
            isOpen={openSections.perspective}
            onToggle={() => toggleSection('perspective')}
            content={getInteractionByType('get-perspective')}
            emptyText="No perspective insights available."
          />
          <InsightSection 
            id="deeper"
            title="Go Deeper" 
            icon={<ChevronRight size={16} />}
            isOpen={openSections.deeper}
            onToggle={() => toggleSection('deeper')}
            content={getInteractionByType('go-deeper')}
            emptyText="No deep dive insights available."
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-8 space-y-4">
          <button 
            onClick={onContinue}
            className="w-full py-4 bg-[#7c83fd] text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-[1.01] active:scale-95 transition-all"
          >
            Continue
          </button>
          <button 
            onClick={onEdit}
            className="w-full py-2 text-slate-400 dark:text-slate-600 font-bold text-xs hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
          >
            Edit Journal
          </button>
        </div>
      </div>
    </motion.div>
  );
};

interface InsightSectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  emptyText: string;
  content?: string;
}

const InsightSection: React.FC<InsightSectionProps> = ({ title, icon, isOpen, onToggle, emptyText, content }) => (
  <div className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-colors duration-500">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
    >
      <div className="flex items-center gap-2">
        <div className="text-slate-400 dark:text-slate-600">{icon}</div>
        <span className="text-sm font-black text-slate-700 dark:text-slate-300">{title}</span>
        <AITag />
      </div>
      <div className="text-indigo-400">
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </div>
    </button>
    
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="border-t border-slate-50 dark:border-slate-800"
        >
          <div className="p-6">
            {content ? (
              <div className="prose dark:prose-invert max-w-none text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-xs font-bold text-slate-400 dark:text-slate-600">{emptyText}</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);
