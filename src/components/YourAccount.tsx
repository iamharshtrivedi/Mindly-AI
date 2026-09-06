import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Camera, 
  LogOut, 
  Trash2, 
  Mail, 
  Lock,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { LogoutConfirm } from './LogoutConfirm';

interface YourAccountProps {
  onBack: () => void;
}

export const YourAccount: React.FC<YourAccountProps> = ({ onBack }) => {
  const { user, signOut } = useAuth();
  const [showEditEmail, setShowEditEmail] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ');
      setFirstName(parts[0] || '');
      setLastName(parts.slice(1).join(' ') || '');
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload(); // Refresh to clear state
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden relative">
      <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto scrollbar-hide pb-52 md:pb-32">
        {/* Header */}
        <div className="max-w-3xl mx-auto mb-8 md:mb-16">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-indigo-500 transition-colors mb-6 group min-h-[44px]"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-bold">Back</span>
          </button>
          
          <h1 className="text-3xl md:text-5xl font-serif italic text-slate-900 dark:text-slate-50 tracking-tight leading-none mb-1">Your Account</h1>
          <p className="text-[10px] md:text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-2">Information</p>
        </div>

        <div className="max-w-3xl mx-auto space-y-10">
          {/* Information Card */}
          <div className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-12">
            <div className="flex flex-col items-center mb-12">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300 dark:text-slate-700 overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl">
                  {user?.photoURL ? (
                    <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                       <span className="text-3xl font-serif">{user?.email?.[0].toUpperCase() || '?'}</span>
                    </div>
                  )}
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                  <Camera size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">First Name</label>
                  <input 
                    type="text" 
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Email</label>
                <div className="w-full px-6 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm font-medium text-slate-500 flex items-center gap-2">
                  <Mail size={16} />
                  {user?.email}
                </div>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={() => setShowEditEmail(true)}
                  className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-indigo-600 dark:text-indigo-400 font-black text-sm rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                >
                  Edit email
                </button>

                <div className="pt-8 pb-4">
                  <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-widest mb-2">Account Created</p>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {user?.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown date'} using Email/Password.
                  </p>
                </div>

                <button 
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Delete Account Section */}
          <div className="space-y-4">
            <h3 className="text-xs font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] px-4 md:px-6">Delete Account</h3>
            <div className="glass-surface rounded-[32px] md:rounded-[40px] p-6 md:p-12 text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8">
                At any time you can permanently delete your account and all of your entries.
              </p>
              <button className="w-full py-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-rose-500 font-black text-sm rounded-2xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 active:scale-95">
                <Trash2 size={18} />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Email Modal */}
      <AnimatePresence>
        {showEditEmail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditEmail(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] p-8 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif italic text-slate-900 dark:text-slate-100">Change email</h2>
                <button 
                  onClick={() => setShowEditEmail(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                Enter a new email address. We'll send a confirmation link to it. Your account email changes only after you open that link.
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <input 
                    type="email" 
                    placeholder="New email"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <input 
                    type="password" 
                    placeholder="Current password"
                    className="w-full px-6 py-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:outline-none transition-all text-sm font-medium"
                  />
                </div>

                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 text-center px-4">
                  You'll confirm it's you before the change is sent.
                </div>

                <button className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 active:scale-95 transition-all">
                  Send confirmation link
                </button>
                <button 
                  onClick={() => setShowEditEmail(false)}
                  className="w-full py-4 text-slate-400 dark:text-slate-600 font-black text-sm hover:text-slate-600 dark:hover:text-slate-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <LogoutConfirm 
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};
