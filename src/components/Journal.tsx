import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { 
  Zap, 
  Sparkles,
  Loader2, 
  Book, 
  Lightbulb, 
  ChevronRight, 
  ArrowLeft,
  Mic,
  Image as ImageIcon,
  ScanLine,
  ChevronLast,
  MessageSquare,
  Type,
  MoreHorizontal,
  Check,
  Search,
  Plus,
  MoreVertical,
  Trash2,
  Edit3,
  Clock,
  X,
  Copy,
  Flag,
  ChevronUp,
  ChevronDown,
  ArrowUp
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../lib/firebase';
import { collection, addDoc, setDoc, serverTimestamp, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs, writeBatch } from 'firebase/firestore';
import { Message } from '../types';
import { JournalInsights } from './JournalInsights';

export interface JournalHandle {
  startNewSession: () => void;
  loadSession: (sessionId: string) => void;
}

interface JournalProps {
  onTabChange?: (tab: any) => void;
}

interface AIInteraction {
  id: string;
  type: 'ask' | 'summarize' | 'coach' | 'perspective' | 'patterns' | 'deeper';
  query?: string;
  response: string;
  timestamp: Date;
}

const AITag = () => (
  <div className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-[9px] font-black text-indigo-500 tracking-widest flex items-center gap-1">
    <Zap size={10} className="fill-current" />
    AI
  </div>
);

export const Journal = forwardRef<JournalHandle, JournalProps>(({ onTabChange }, ref) => {
  const { user } = useAuth();
  
  // Initialize state from localStorage
  const [view, setView] = useState<'dashboard' | 'chat' | 'entry' | 'insights'>(() => {
    const saved = localStorage.getItem('mindly_view');
    const validViews = ['dashboard', 'chat', 'entry', 'insights'];
    if (saved && validViews.includes(saved)) return saved as any;
    return 'dashboard';
  });
  const [input, setInput] = useState(() => {
    return localStorage.getItem('mindly_input') || '';
  });
  const [sessionId, setSessionId] = useState<string | null>(() => {
    return localStorage.getItem('mindly_session_id');
  });
  const [aiInteractions, setAiInteractions] = useState<AIInteraction[]>(() => {
    const saved = localStorage.getItem('mindly_ai_interactions');
    if (saved) {
      try {
        return JSON.parse(saved).map((i: any) => ({
          ...i,
          timestamp: new Date(i.timestamp)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [askInput, setAskInput] = useState('');
  const [showAskBar, setShowAskBar] = useState(false);
  const [activeAIAction, setActiveAIAction] = useState<string | null>(null);
  const [sessionSummary, setSessionSummary] = useState<string>('Active Journal');
  const [messages, setMessages] = useState<Message[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  const [showChipMenu, setShowChipMenu] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initializing = useRef(false);

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem('mindly_view', view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem('mindly_input', input);
  }, [input]);

  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('mindly_session_id', sessionId);
    } else {
      localStorage.removeItem('mindly_session_id');
    }
  }, [sessionId]);

  useEffect(() => {
    localStorage.setItem('mindly_ai_interactions', JSON.stringify(aiInteractions));
  }, [aiInteractions]);

  // Focus textarea when entering entry view
  useEffect(() => {
    if (view === 'entry') {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [view]);

  // Auto-resize textarea logic
  useEffect(() => {
    if (textareaRef.current && view === 'entry') {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input, view]);

  // Scroll detection for floating bar
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

  // Streak calculation logic
  const currentStreak = React.useMemo(() => {
    if (sessions.length === 0) return 0;
    const dates = sessions.map(s => {
      const d = s.createdAt?.toDate ? s.createdAt.toDate() : new Date(s.createdAt as string | number | Date);
      return d.toDateString();
    });
    const uniqueDates = Array.from(new Set(dates)).map(d => new Date(d as string));
    uniqueDates.sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let streak = 0;
    let checkDate = new Date(today);
    let i = 0;
    
    const lastEntryDate = uniqueDates[0];
    const diffTime = Math.abs(today.getTime() - lastEntryDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      while (i < uniqueDates.length) {
        const entryDate = uniqueDates[i];
        const dTime = Math.abs(checkDate.getTime() - entryDate.getTime());
        const dDays = Math.round(dTime / (1000 * 60 * 60 * 24));
        
        if (dDays === 0) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
          i++;
        } else if (dDays === 1) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }
    return streak;
  }, [sessions]);

  const startNewSession = React.useCallback(() => {
    // Clear state for new session without creating doc immediately
    setSessionId(null);
    setMessages([]);
    setAiInteractions([]);
    setSessionSummary('New Journal');
    setInput('');
    setView('entry');
  }, []);

  const deleteSession = async (id: string) => {
    if (!user) return;
    try {
      const sessionRef = doc(db, 'users', user.uid, 'sessions', id);
      const messagesRef = collection(db, 'users', user.uid, 'sessions', id, 'messages');
      const interactionsRef = collection(db, 'users', user.uid, 'sessions', id, 'interactions');
      
      const [messagesSnap, interactionsSnap] = await Promise.all([
        getDocs(messagesRef),
        getDocs(interactionsRef)
      ]);

      const batch = writeBatch(db);
      messagesSnap.forEach((msgDoc) => batch.delete(msgDoc.ref));
      interactionsSnap.forEach((intDoc) => batch.delete(intDoc.ref));
      batch.delete(sessionRef);
      await batch.commit();

      if (sessionId === id) {
        setSessionId(null);
        setMessages([]);
        setAiInteractions([]);
        setView('dashboard');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
    } finally {
      setActiveMenuId(null);
    }
  };

  const deleteInteraction = async (interactionId: string) => {
    setAiInteractions(prev => prev.filter(i => i.id !== interactionId));
    
    if (user && sessionId) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'sessions', sessionId, 'interactions', interactionId));
      } catch (e) {
        console.error('Error deleting interaction from Firestore:', e);
      }
    }
  };

  const loadSession = React.useCallback((id: string) => {
    setSessionId((prev) => {
      if (prev === id) {
        setView('entry');
        return prev;
      }
      setIsSessionLoading(true);
      setAiInteractions([]);
      setView('entry');
      return id;
    });
  }, []);

  useImperativeHandle(ref, () => ({
    startNewSession,
    loadSession
  }));

  const formatDateHeader = () => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric'
    }).format(new Date()).replace(',', ' •');
  };

  // Listen for session details (summary)
  useEffect(() => {
    if (!user || !sessionId) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid, 'sessions', sessionId), (doc) => {
      if (doc.exists()) {
        setSessionSummary(doc.data().summary || 'Untitled journal');
      }
    });
    return unsub;
  }, [user, sessionId]);

  // Initialize a new session if none exists
  useEffect(() => {
    if (user && !sessionId && !initializing.current) {
      // Disabled auto-start to show dashboard first
    }
  }, [user, sessionId, startNewSession]);

  // Listen for messages in the current session
  useEffect(() => {
    if (!user || !sessionId) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions', sessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newMessages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(newMessages);
      setIsSessionLoading(false);
    });

    return unsubscribe;
  }, [user, sessionId]);

  // Listen for AI interactions in the current session
  useEffect(() => {
    if (!user || !sessionId) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions', sessionId, 'interactions'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const savedInteractions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
        };
      }) as AIInteraction[];
      
      if (savedInteractions.length > 0) {
        setAiInteractions(savedInteractions);
      }
    });

    return unsubscribe;
  }, [user, sessionId]);

  // Listen for all sessions for the dashboard
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'sessions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSessions(docs);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!isSessionLoading && view === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSessionLoading, view]);

  // Sync input with first message content when loading an existing session in entry view
  useEffect(() => {
    if (view === 'entry' && messages.length > 0 && !isLoading && sessionId) {
      const firstUserMsg = messages.find(m => m.role === 'user');
      if (firstUserMsg && !input) { // Only sync if input is empty to avoid overwriting while typing
        setInput(firstUserMsg.content);
      }
    }
  }, [view, messages, isLoading, sessionId]); // Removed input from dependencies

  const handleAIInteract = async (action: string, query?: string) => {
    if (!user || (!input.trim() && action !== 'ask') || isLoading) return;
    
    if (action === 'ask') {
      if (!query?.trim()) return;
      setShowAskBar(false);
      setAskInput('');
    }

    setIsLoading(true);
    setActiveAIAction(action);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/interact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: user.uid,
          action,
          context: input.trim(),
          query
        })
      });

      if (!response.ok) throw new Error('Failed to get AI response');
      const data = await response.json();
      
      const newInteraction: AIInteraction = {
        id: Math.random().toString(36).substr(2, 9),
        type: action as any,
        query,
        response: data.content,
        timestamp: new Date()
      };

      setAiInteractions(prev => [...prev, newInteraction]);
    } catch (error: any) {
      console.error('AI Interaction Error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
      setActiveAIAction(null);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !user || isLoading) return;

    const userMessage = input.trim();
    setIsLoading(true);
    setError(null);

    try {
      let currentSessionId = sessionId;

      // 1. Create session document if it doesn't exist yet
      if (!currentSessionId) {
        const sessionRef = await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          summary: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
        });
        currentSessionId = sessionRef.id;
        setSessionId(currentSessionId);
      }

      if (view === 'entry') {
        const firstUserMsg = messages.find(m => m.role === 'user');
        if (firstUserMsg && firstUserMsg.id) {
          // Update existing message
          await updateDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId, 'messages', firstUserMsg.id), {
            content: userMessage,
            updatedAt: serverTimestamp()
          });
        } else {
          // Add first message
          await addDoc(collection(db, 'users', user.uid, 'sessions', currentSessionId, 'messages'), {
            role: 'user',
            content: userMessage,
            timestamp: serverTimestamp()
          });
        }

        // Update session summary and timestamp
        const sessionUpdate: any = { 
          updatedAt: serverTimestamp(),
          summary: userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '')
        };
        await updateDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId), sessionUpdate);
        
        // Save AI interactions to Firestore
        if (aiInteractions.length > 0) {
          const interactionsRef = collection(db, 'users', user.uid, 'sessions', currentSessionId, 'interactions');
          for (const interaction of aiInteractions) {
            // Strip undefined values to prevent Firestore crashes
            const sanitizedInteraction = JSON.parse(JSON.stringify(interaction));
            await setDoc(doc(interactionsRef, interaction.id), {
              ...sanitizedInteraction,
              timestamp: serverTimestamp()
            });
          }
          // Clear local interactions after saving to Firestore as the listener will now handle them
          setAiInteractions([]);
        }

        setView('insights');
        setInput('');
        return;
      }

      // Chat view logic
      setInput('');
      await addDoc(collection(db, 'users', user.uid, 'sessions', currentSessionId, 'messages'), {
        content: userMessage,
        role: 'user',
        timestamp: serverTimestamp()
      });

      const sessionUpdate: any = { updatedAt: serverTimestamp() };
      if (messages.length === 0) {
        sessionUpdate.summary = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
      }
      
      await updateDoc(doc(db, 'users', user.uid, 'sessions', currentSessionId), sessionUpdate);

      const idToken = await user.getIdToken();
      const chatHistory = [...messages, { role: 'user', content: userMessage }].map(m => ({
        role: m.role,
        content: m.content
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({
          userId: user.uid,
          sessionId: currentSessionId,
          messages: chatHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to get Gemini response');
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (view === 'entry') {
    return createPortal(
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[200] bg-white dark:bg-slate-950 flex flex-col pt-4 md:pt-12 px-2 md:px-12 pb-0 transition-colors duration-500 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12 relative shrink-0">
          <button 
            onClick={() => setView('dashboard')}
            className="w-10 h-10 rounded-full border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-400 transition-colors bg-slate-100/50 dark:bg-slate-900 shadow-sm shrink-0"
          >
            <ArrowLeft size={18} />
          </button>
          
          <div className="px-5 py-2 bg-slate-200/50 dark:bg-slate-800/50 rounded-full text-slate-700 dark:text-slate-200 font-bold text-[10px] md:text-xs tracking-tight shadow-sm whitespace-nowrap mx-2 truncate max-w-[150px] sm:max-w-none">
            {formatDateHeader()}
          </div>

          <div className="flex items-center gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-full shadow-sm shrink-0">
            <div className="w-6 h-6 rounded-full bg-[#10b981] flex items-center justify-center text-white">
              <Zap size={12} className="fill-current" />
            </div>
            <div className="w-6 h-6 rounded-full bg-[#059669] flex items-center justify-center text-white font-black text-[10px]">
              G
            </div>
          </div>
        </div>

        {/* Main Input Area */}
        <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col items-start md:px-8 overflow-y-auto scrollbar-hide pt-2 pb-4 relative">
          <textarea
            ref={textareaRef}
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Hey, what's on your mind?"
            className="w-full min-h-[150px] bg-transparent text-lg md:text-2xl font-medium text-slate-600 dark:text-slate-400 placeholder:text-slate-200 dark:placeholder:text-slate-800 focus:outline-none resize-none leading-relaxed cursor-text pointer-events-auto"
          />

          {/* AI Interactions List */}
          <div className="w-full space-y-6 pb-20">
            <AnimatePresence initial={false}>
              {aiInteractions.map((interaction) => (
                <AIResponseCard 
                  key={interaction.id} 
                  interaction={interaction} 
                  onDelete={() => deleteInteraction(interaction.id)}
                />
              ))}
            </AnimatePresence>
            
            {isLoading && activeAIAction && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-3"
              >
                <Loader2 size={18} className="animate-spin text-indigo-500" />
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">
                  {activeAIAction === 'summarize' ? 'Summarizing...' : 'Gemini is thinking...'}
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* Ask AI Floating Bar */}
        <AnimatePresence>
          {showAskBar && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-[210]"
            >
              <div className="bg-white dark:bg-slate-900 border-2 border-indigo-100 dark:border-indigo-900/50 rounded-full shadow-2xl p-1.5 flex items-center gap-2">
                <div className="pl-4 text-indigo-500">
                  <Sparkles size={20} />
                </div>
                <input 
                  autoFocus
                  type="text"
                  value={askInput}
                  onChange={(e) => setAskInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && askInput.trim()) {
                      handleAIInteract('ask', askInput.trim());
                    }
                  }}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none focus:outline-none text-sm font-bold text-slate-700 dark:text-slate-200 py-2"
                />
                <button 
                  onClick={() => {
                    if (askInput.trim()) {
                      handleAIInteract('ask', askInput.trim());
                    }
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${askInput.trim() ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 dark:bg-slate-800 text-slate-300 cursor-not-allowed'}`}
                >
                  <ArrowUp size={20} />
                </button>
                <button 
                  onClick={() => setShowAskBar(false)}
                  className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center hover:text-slate-600 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Multi-Layer Toolbar */}
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center shrink-0 bg-white dark:bg-slate-950">
          {/* Top Layer: Suggestion Pills */}
          <AnimatePresence>
            {showChipMenu && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full justify-start snap-x scroll-smooth scroll-pl-4 overflow-hidden"
              >
                {/* Start Spacer for clipping prevention */}
                <div className="flex-none w-4" />
                
                <div className="snap-start shrink-0">
                  <PillButton 
                    label="Ask" 
                    icon={<Sparkles size={14} />} 
                    borderColor="border-indigo-100 dark:border-indigo-900/30" 
                    textColor="text-indigo-600 dark:text-indigo-400" 
                    isAI 
                    onClick={() => setShowAskBar(true)}
                  />
                </div>
                <div className="snap-start shrink-0">
                  <PillButton label="Summarize" borderColor="border-rose-100 dark:border-rose-900/30" isAI onClick={() => handleAIInteract('summarize')} />
                </div>
                <div className="snap-start shrink-0">
                  <PillButton label="Go Deeper" borderColor="border-teal-100 dark:border-teal-900/30" isAI onClick={() => handleAIInteract('go-deeper')} />
                </div>
                <div className="snap-start shrink-0">
                  <PillButton label="Coach Me" borderColor="border-purple-100 dark:border-purple-900/30" isAI onClick={() => handleAIInteract('coach-me')} />
                </div>
                <div className="snap-start shrink-0">
                  <PillButton label="Get Perspective" borderColor="border-indigo-100 dark:border-indigo-900/30" isAI onClick={() => handleAIInteract('get-perspective')} />
                </div>
                <div className="snap-start shrink-0">
                  <PillButton label="Past Patterns" borderColor="border-rose-100 dark:border-rose-900/30" isAI onClick={() => handleAIInteract('past-patterns')} />
                </div>

                {/* End Spacer */}
                <div className="flex-none w-4" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bottom Layer: Action Icons */}
          <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-16 lg:gap-24 w-full max-w-3xl px-2 md:px-10 mt-2 mb-4">
            <div className="flex items-center gap-1 sm:gap-6 lg:gap-8">
              <IconButton 
                icon={<Sparkles size={20} />} 
                active={showChipMenu} 
                onClick={() => setShowChipMenu(!showChipMenu)} 
              />
              <IconButton icon={<MessageSquare size={20} />} />
              <IconButton icon={<Mic size={20} />} />
              <IconButton icon={<ImageIcon size={20} />} />
              <IconButton icon={<Type size={20} />} />
              <IconButton icon={<MoreHorizontal size={20} />} />
            </div>
            
            <button 
              onClick={handleSend}
              className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:scale-105 transition-all active:scale-95 shrink-0 ml-1 relative group"
            >
              <div className="absolute inset-0 rounded-full bg-indigo-400/20 blur-xl group-hover:blur-2xl transition-all" />
              <Check size={24} className="relative z-10" />
            </button>
          </div>
        </div>
      </motion.div>,
      document.getElementById('portal-root')!
    );
  }

  if (view === 'chat') {
    return createPortal(
      <div className="fixed inset-0 z-[200] flex flex-col bg-white dark:bg-slate-950 transition-colors duration-500">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 space-y-6 scrollbar-hide">
          <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full">
            <div>
              <h2 className="text-2xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">{sessionSummary}</h2>
              <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Active Journal Session</p>
            </div>
            <button 
              onClick={() => setView('dashboard')}
              className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-full text-[10px] font-black text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all shadow-sm flex items-center gap-2"
            >
              <ArrowLeft size={14} />
              Exit to Dashboard
            </button>
          </div>

          {isSessionLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
            </div>
          ) : (
            <>
              {messages.length === 0 && !isLoading && (
                <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto space-y-4">
                  <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-inner">
                    <Book size={28} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">Begin your journal</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold leading-relaxed">Share what's on your mind. Gemini is here to listen and help you process your thoughts.</p>
                  </div>
                </div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <div key={message.id || Math.random()} className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} space-y-2`}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`max-w-[80%] p-5 rounded-3xl shadow-sm ${
                        message.role === 'user' 
                          ? 'bg-indigo-600 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-tl-none shadow-indigo-100/10 dark:shadow-none'
                      }`}
                    >
                      <p className="text-sm font-bold leading-relaxed whitespace-pre-wrap">{message.content}</p>
                    </motion.div>
                  </div>
                ))}
              </AnimatePresence>

              {isLoading && (
                <div className="flex items-center gap-3 p-5 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-3xl w-fit shadow-sm">
                  <Loader2 size={16} className="animate-spin text-indigo-600" />
                  <span className="text-sm font-bold text-slate-400 dark:text-slate-500">Gemini is journaling...</span>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-8 bg-white/20 dark:bg-slate-900/20 border-t border-white/40 dark:border-slate-800">
          <div className="max-w-4xl mx-auto">
            <form 
              onSubmit={handleSend}
              className="bg-white dark:bg-slate-900 border-2 border-indigo-50 dark:border-indigo-900/30 rounded-[32px] shadow-xl shadow-indigo-100/20 dark:shadow-none overflow-hidden flex flex-col focus-within:border-indigo-200 transition-all"
            >
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder="How's your mind today?"
                className="w-full p-6 text-base text-slate-800 dark:text-slate-200 focus:outline-none resize-none font-bold placeholder:text-slate-300 dark:placeholder:text-slate-700 bg-transparent"
                rows={2}
              />
              <div className="flex items-center justify-end px-8 py-4 bg-slate-50/50 dark:bg-slate-800/50">
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="px-10 py-3 bg-indigo-600 text-white text-xs font-black rounded-full hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95 disabled:opacity-50"
                >
                  SEND
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>,
      document.getElementById('portal-root')!
    );
  }

  if (view === 'insights') {
    return createPortal(
      <JournalInsights 
        onContinue={() => setView('dashboard')}
        onEdit={() => setView('entry')}
        streakCount={currentStreak}
        interactions={aiInteractions}
      />,
      document.getElementById('portal-root')!
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div 
        ref={scrollContainerRef}
        className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide pb-52 md:pb-32"
      >
        {/* Dashboard View */}
        <div className="flex items-center justify-between mb-8 md:mb-16 max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Journal</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{sessions.length} TOTAL JOURNALS</p>
          </div>
          <div className="flex items-center gap-3">
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

        <div className="max-w-3xl mx-auto space-y-6 pb-24">
          {/* Journal Entries List */}
          {sessions.map((session) => {
            const date = session.createdAt?.toDate() || new Date();
            const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(date).toUpperCase();
            const dayNum = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(date);
            
            return (
              <motion.div 
                key={session.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-surface rounded-[24px] md:rounded-[32px] p-5 md:p-6 flex items-start gap-4 md:gap-6 hover:scale-[1.01] transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => loadSession(session.id)}
              >
                {/* Date Badge */}
                <div className="flex flex-col items-center justify-center w-14 h-14 bg-white dark:bg-slate-800 rounded-2xl shadow-sm shrink-0 border border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-black text-slate-300 dark:text-slate-700 tracking-widest">{dayName}</span>
                  <span className="text-xl font-bold text-slate-800 dark:text-slate-200 leading-none">{dayNum}</span>
                </div>
                
                <div className="flex-1 pt-1">
                  <p className="text-base font-bold text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {session.summary || 'Untitled journal'}
                  </p>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Clock size={12} className="text-slate-300 dark:text-slate-600" />
                      <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* More Menu */}
                <div className="relative z-10">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenuId(activeMenuId === session.id ? null : session.id);
                    }}
                    className="p-2 rounded-full hover:bg-white dark:hover:bg-slate-800 text-slate-300 dark:text-slate-600 hover:text-slate-500 transition-colors"
                  >
                    <MoreVertical size={18} />
                  </button>
                  
                  <AnimatePresence>
                    {activeMenuId === session.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 mt-2 w-40 glass-surface rounded-2xl shadow-2xl p-1.5 z-50"
                      >
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            loadSession(session.id);
                            setActiveMenuId(null);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors"
                        >
                          <Edit3 size={14} />
                          Edit
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteSession(session.id);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Get Started Card */}
            <div className="glass-surface rounded-[40px] p-8 flex flex-col">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl text-indigo-500">
                  <Zap size={24} className="fill-current" />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Progress</h2>
              </div>
              
              <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-4">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((sessions.length / 5) * 100, 100)}%` }}
                  className="h-full bg-indigo-500 rounded-full" 
                />
              </div>
              
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-auto">
                {Math.max(5 - sessions.length, 0)} journals to reach your next milestone.
              </p>
            </div>

            {/* Quick Tips Card */}
            <div className="glass-surface rounded-[40px] p-8 flex flex-col group cursor-pointer hover:scale-[1.02] transition-all">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-2xl text-amber-500">
                  <Lightbulb size={24} />
                </div>
                <h2 className="text-xl font-bold tracking-tight">Mindful Tips</h2>
              </div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Discover 5 ways to deepen your journal practice.</p>
              <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-black text-indigo-500 tracking-widest uppercase">
                Read More <ChevronRight size={14} />
              </div>
            </div>
          </div>
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
            <div 
              onClick={() => onTabChange?.('search')}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl rounded-full p-2 border border-white/80 dark:border-slate-800 shadow-2xl shadow-indigo-100/10 flex items-center gap-2 cursor-pointer"
            >
              <div className="pl-4 text-slate-400 dark:text-slate-500 relative">
                <Search size={18} />
                <Sparkles size={8} className="absolute -top-1 -right-1 fill-current text-indigo-400" />
              </div>
              <div className="flex-1 text-[13px] font-bold text-slate-400 dark:text-slate-600 py-2">
                Search Journal...
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  startNewSession();
                }}
                className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none hover:scale-105 active:scale-95 transition-all"
              >
                <Plus size={22} strokeWidth={2.5} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-36 md:bottom-28 left-1/2 z-[100] w-[calc(100%-48px)] max-w-md bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 p-4 rounded-2xl flex items-center gap-4 shadow-xl shadow-rose-500/5"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
              <Zap size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-rose-900 dark:text-rose-100 mb-0.5">Something went wrong</p>
              <p className="text-xs font-medium text-rose-600 dark:text-rose-400 line-clamp-1">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="p-2 text-rose-400 hover:text-rose-600 transition-colors"
            >
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

const PillButton: React.FC<{ 
  label: string; 
  icon?: React.ReactNode; 
  borderColor?: string;
  textColor?: string;
  isAI?: boolean;
  onClick?: () => void 
}> = ({ label, icon, borderColor = 'border-slate-100 dark:border-slate-800', textColor = 'text-slate-500 dark:text-slate-400', isAI, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 bg-slate-100/80 dark:bg-slate-900/80 border ${borderColor} rounded-full ${textColor} font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm whitespace-nowrap`}
  >
    {icon && <span>{icon}</span>}
    {label}
    {isAI && (
      <AITag />
    )}
  </button>
);

const AIResponseCard: React.FC<{ 
  interaction: AIInteraction; 
  onDelete: () => void 
}> = ({ interaction, onDelete }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = () => {
    navigator.clipboard.writeText(interaction.response);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full bg-white dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[32px] overflow-hidden shadow-sm mb-6"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-500">
              <Sparkles size={16} className="fill-current" />
            </div>
            <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              {interaction.query ? interaction.query : interaction.type}
            </span>
            <AITag />
          </div>
        </div>
        
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
          {interaction.response}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-50 dark:border-slate-800/50">
          <button 
            onClick={onDelete}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-rose-500 transition-colors uppercase tracking-widest"
          >
            <Trash2 size={14} />
            Delete
          </button>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-indigo-500 transition-colors uppercase tracking-widest"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest ml-auto">
            <Flag size={14} />
            Report
          </button>
        </div>
      </div>
      
      {/* Daily Limit Simulation Banner */}
      <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
          Daily Limit Reached
        </div>
        <button className="px-5 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-[10px] font-black rounded-full hover:bg-amber-100 transition-colors uppercase tracking-widest">
          Upgrade for Unlimited
        </button>
      </div>
    </motion.div>
  );
};

const IconButton: React.FC<{ 
  icon: React.ReactNode; 
  active?: boolean;
  onClick?: () => void 
}> = ({ icon, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-3 md:p-2 transition-all hover:scale-110 flex items-center justify-center min-w-[44px] min-h-[44px] ${active ? 'text-indigo-500' : 'text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'}`}
  >
    {icon}
  </button>
);
