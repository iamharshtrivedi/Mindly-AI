import { useState, useRef, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { handleRedirectResult } from './lib/firebase';
import { Auth } from './components/Auth';
import { LandingPage } from './components/LandingPage';
import { Layout } from './components/Layout';
import { Journal, JournalHandle } from './components/Journal';
import { History } from './components/History';
import { Today } from './components/Today';
import { Guides } from './components/Guides';
import { Search } from './components/Search';
import { Insights } from './components/Insights';
import { Settings } from './components/Settings';
import { ProUpgrade } from './components/ProUpgrade';
import { Loader2 } from 'lucide-react';

function App() {
  const { user, loading } = useAuth();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [activeTab, setActiveTab] = useState<'today' | 'journal' | 'guides' | 'insights' | 'settings' | 'history' | 'search'>(() => {
    const saved = localStorage.getItem('mindly_active_tab');
    const validTabs = ['today', 'journal', 'guides', 'insights', 'settings', 'history', 'search'];
    if (saved && validTabs.includes(saved)) return saved as any;
    return 'today';
  });
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const journalRef = useRef<JournalHandle>(null);

  useEffect(() => {
    localStorage.setItem('mindly_active_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const checkRedirect = async () => {
      setIsRedirecting(true);
      try {
        const result = await handleRedirectResult();
        if (result?.user) {
          console.log("[Auth] Redirect sign-in successful");
          setIsAuthOpen(false);
        }
      } catch (error) {
        console.error("[Auth] Redirect error handling:", error);
      } finally {
        setIsRedirecting(false);
      }
    };
    checkRedirect();
  }, []);

  useEffect(() => {
    if (user) {
      setIsAuthOpen(false);
    }
  }, [user]);

  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-serene-50 dark:bg-slate-950 flex items-center justify-center transition-colors duration-500">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 tracking-[0.2em] uppercase">Initializing Session</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <LandingPage onSignIn={() => setIsAuthOpen(true)} />
        <Auth isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      </>
    );
  }

  const handleNewReflection = () => {
    journalRef.current?.startNewSession();
  };

  const handleSelectSession = (sessionId: string) => {
    setActiveTab('journal');
    journalRef.current?.loadSession(sessionId);
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onNewReflection={handleNewReflection}
        onUpgrade={() => setIsProOpen(true)}
      >
      <div className={activeTab === 'today' ? 'h-full' : 'hidden'}>
        <Today 
          onNewReflection={handleNewReflection} 
          onTabChange={setActiveTab} 
          onUpgrade={() => setIsProOpen(true)}
        />
      </div>
      <div className={activeTab === 'journal' ? 'h-full' : 'hidden'}>
        <Journal ref={journalRef} onTabChange={setActiveTab} />
      </div>
      <div className={activeTab === 'guides' ? 'h-full' : 'hidden'}>
        <Guides onTabChange={setActiveTab} />
      </div>
      <div className={activeTab === 'history' ? 'h-full' : 'hidden'}>
        <History onSelectSession={handleSelectSession} />
      </div>
      <div className={activeTab === 'search' ? 'h-full' : 'hidden'}>
        <Search 
          onSelectSession={handleSelectSession} 
          onBack={() => setActiveTab('today')}
        />
      </div>
      <div className={activeTab === 'insights' ? 'h-full' : 'hidden'}>
        <Insights 
          onNewReflection={handleNewReflection}
          onTabChange={setActiveTab}
        />
      </div>
      <div className={activeTab === 'settings' ? 'h-full' : 'hidden'}>
        <Settings onTabChange={setActiveTab} onUpgrade={() => setIsProOpen(true)} />
      </div>
    </Layout>

    <ProUpgrade isOpen={isProOpen} onClose={() => setIsProOpen(false)} />
  </>
);
}

export default App;
