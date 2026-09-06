import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  CreditCard, 
  Download, 
  RefreshCcw, 
  Palette, 
  FileText, 
  Bell, 
  ShieldCheck, 
  Key, 
  Brain, 
  HelpCircle, 
  MessageCircle, 
  Share2, 
  Info, 
  ShoppingBag, 
  History, 
  Scale, 
  Heart,
  ChevronRight,
  Zap,
  Lock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { YourAccount } from './YourAccount';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, deleteDoc, doc, writeBatch } from 'firebase/firestore';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface SettingsProps {
  onTabChange: (tab: any) => void;
  onUpgrade: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onTabChange, onUpgrade }) => {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<'settings' | 'account'>('settings');
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const handleResetData = async () => {
    if (!auth.currentUser) return;
    setIsDeleting(true);
    
    try {
      const userId = auth.currentUser.uid;
      const batch = writeBatch(db);
      
      // 1. Get all sessions
      const sessionsRef = collection(db, 'users', userId, 'sessions');
      const sessionsSnap = await getDocs(sessionsRef);
      
      for (const sessionDoc of sessionsSnap.docs) {
        // 2. Get all messages for each session
        const messagesRef = collection(db, 'users', userId, 'sessions', sessionDoc.id, 'messages');
        const messagesSnap = await getDocs(messagesRef);
        
        for (const messageDoc of messagesSnap.docs) {
          batch.delete(messageDoc.ref);
        }
        
        // Delete the session document itself
        batch.delete(sessionDoc.ref);
      }
      
      // 3. Delete user profile document
      const userRef = doc(db, 'users', userId);
      batch.delete(userRef);
      
      await batch.commit();
      alert('All your data has been successfully deleted.');
      window.location.reload();
    } catch (error) {
      console.error('Error deleting data:', error);
      alert('Failed to delete some data. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (currentView === 'account') {
    return (
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="h-full"
      >
        <YourAccount onBack={() => setCurrentView('settings')} />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide pb-52 md:pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-16 max-w-3xl mx-auto">
          <div>
            <h1 className="text-3xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Settings</h1>
            <p className="text-[10px] md:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Personalize Your Journey</p>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {/* Premium Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Zap size={120} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Zap size={24} fill="currentColor" />
                </div>
                <div>
                  <h2 className="text-xl font-serif italic text-slate-900 dark:text-slate-50">Unlock the Full Power of Mindly AI</h2>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Unlimited AI Insights, Coaching Sessions, Voice Journaling, and more!</p>
                </div>
              </div>
              
              <button 
                onClick={onUpgrade}
                className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 hover:scale-[1.01] active:scale-95 transition-all"
              >
                Upgrade to Pro
              </button>
            </div>
          </motion.div>

          {/* Account Section */}
          <SettingsSection title="Your Account">
            <SettingsItem 
              icon={<User size={18} />} 
              label="Your Account" 
              sublabel={user?.email || 'Not signed in'} 
              onClick={() => setCurrentView('account')}
            />
            <SettingsItem 
              icon={<CreditCard size={18} />} 
              label="Your Plan" 
              sublabel="Limited Free Plan" 
            />
            <SettingsItem 
              icon={<Download size={18} />} 
              label="Import & Export" 
              sublabel="Export your data and import entries." 
            />
            <SettingsItem 
              icon={<RefreshCcw size={18} />} 
              label="Sync" 
              sublabel="Last updated: 5 minutes ago" 
            />
          </SettingsSection>

          {/* Preferences Section */}
          <SettingsSection title="Preferences">
            <SettingsItem 
              icon={<Palette size={18} />} 
              label="Appearance" 
              sublabel="Theme: Modern Light" 
            />
            <SettingsItem 
              icon={<FileText size={18} />} 
              label="Quick Templates" 
              sublabel="Create and manage your quick templates." 
            />
            <SettingsItem 
              icon={<Bell size={18} />} 
              label="Notifications" 
              sublabel="Manage your reminders." 
            />
            <SettingsItem 
              icon={<ShieldCheck size={18} />} 
              label="Advanced Security" 
              sublabel="Create Private Pin" 
            />
            <SettingsItem 
              icon={<Key size={18} />} 
              label="MCP Key Management" 
              badge="BETA"
              sublabel="Create, view activity, and revoke MCP connector keys" 
            />
            <SettingsItem 
              icon={<Brain size={18} />} 
              label="AI Preferences" 
              sublabel="Daily AI usage: 5/5. Resets in 4h 49m." 
            />
          </SettingsSection>

          {/* Help & Support */}
          <SettingsSection title="Help & Support">
            <SettingsItem 
              icon={<HelpCircle size={18} />} 
              label="Frequently Asked Questions" 
              sublabel="Answers to common questions." 
            />
            <SettingsItem 
              icon={<MessageCircle size={18} />} 
              label="Contact Support" 
              sublabel="We are here to help!" 
            />
          </SettingsSection>

          {/* Share Section */}
          <SettingsSection title="Share The Love">
            <SettingsItem 
              icon={<Share2 size={18} />} 
              label="Share Mindly AI" 
              sublabel="Know someone who could benefit from Mindly AI? Share the app!" 
            />
          </SettingsSection>

          {/* About Section */}
          <SettingsSection title="About Us">
            <SettingsItem 
              icon={<Heart size={18} />} 
              label="Our Story" 
              sublabel="Founded by visionaries passionate about wellness. Learn more about our story and team!" 
            />
            <SettingsItem 
              icon={<ShoppingBag size={18} />} 
              label="Shop Holstee" 
              sublabel="Inspiration and tools to help you live a more meaningful life" 
            />
          </SettingsSection>

          {/* Version Section */}
          <SettingsSection title="Version">
            <SettingsItem 
              icon={<History size={18} />} 
              label="Changelog" 
              sublabel="Current Version 6.29 (227)" 
            />
            <SettingsItem 
              icon={<Scale size={18} />} 
              label="Legal" 
              sublabel="Our Terms of Service and Privacy Policy" 
            />
            <SettingsItem 
              icon={<Info size={18} />} 
              label="Open Source Licenses" 
            />
          </SettingsSection>

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-rose-300 dark:text-rose-900/50 uppercase tracking-[0.2em] px-4 md:px-6">Danger Zone</h3>
            <div className="bg-rose-50/30 dark:bg-rose-950/10 rounded-[32px] md:rounded-[40px] p-6 md:p-8 border border-rose-100/50 dark:border-rose-900/20">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 shrink-0">
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-rose-900 dark:text-rose-100 tracking-tight">Reset All Account Data</h4>
                  <p className="text-[11px] font-medium text-rose-600/70 dark:text-rose-400/50 mt-1 leading-relaxed">
                    This will permanently delete your profile, all journal sessions, and AI insights. This action is destructive and cannot be undone.
                  </p>
                </div>
              </div>

              {!deleteConfirm ? (
                <button
                  onClick={() => setDeleteConfirm(true)}
                  className="w-full py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-100 dark:shadow-none transition-all active:scale-95"
                >
                  Clear All My Data
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleResetData}
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white rounded-2xl font-black text-sm shadow-xl shadow-rose-100 transition-all flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 size={18} className="animate-spin" /> : 'Yes, Delete Permanently'}
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 py-4 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl font-black text-sm transition-all"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Footer Quote */}
          <div className="py-16 flex flex-col items-center text-center px-6">
            <Heart size={24} className="text-rose-400 mb-6 fill-current animate-pulse" />
            <p className="text-xl font-serif italic text-slate-900 dark:text-slate-100 mb-4">We're grateful for you.</p>
            <p className="text-sm font-medium text-slate-400 dark:text-slate-500 max-w-sm leading-relaxed">
              Building Mindly AI is a labor of love. <br /> Thank you for practicing with us.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-4">
    <h3 className="text-xs font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] px-4 md:px-6">{title}</h3>
    <div className="glass-surface rounded-[32px] md:rounded-[40px] overflow-hidden">
      <div className="divide-y divide-slate-100/50 dark:divide-slate-800/50">
        {children}
      </div>
    </div>
  </div>
);

const SettingsItem: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  sublabel?: string; 
  badge?: string;
  onClick?: () => void;
}> = ({ icon, label, sublabel, badge, onClick }) => (
  <button 
    onClick={onClick}
    className="w-full flex items-center justify-between p-5 md:p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors group text-left min-h-[44px]"
  >
    <div className="flex items-center gap-4">
      <div className="text-slate-300 dark:text-slate-700 group-hover:text-indigo-500 transition-colors shrink-0">
        {icon}
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[13px] md:text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight">{label}</span>
          {badge && (
            <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-[8px] font-black text-indigo-500 tracking-widest">{badge}</span>
          )}
        </div>
        {sublabel && (
          <p className="text-[10px] md:text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">{sublabel}</p>
        )}
      </div>
    </div>
    <ChevronRight size={18} className="text-slate-200 dark:text-slate-800 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
  </button>
);
