import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, X, Zap } from 'lucide-react';
import { signInWithGooglePopup, signInWithGoogleRedirect } from '../lib/firebase';

interface AuthProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Auth: React.FC<AuthProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSignIn = async (method: 'popup' | 'redirect' = 'popup') => {
    setIsLoading(true);
    setError(null);
    try {
      if (method === 'popup') {
        await signInWithGooglePopup();
      } else {
        await signInWithGoogleRedirect();
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in popup was closed. Please try the "Redirect" method below or disable Brave Shields.');
      } else if (err.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked. Please try the "Redirect" method below.');
      } else {
        console.error('Sign in error:', err);
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative max-w-md w-full bg-white dark:bg-slate-900 rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.15)] p-12 text-center border border-slate-100 dark:border-slate-800"
          >
            <button 
              onClick={onClose}
              className="absolute top-8 right-8 p-2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={24} />
            </button>

            <div className="w-20 h-20 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white mx-auto mb-10 shadow-2xl shadow-indigo-200">
              <Zap size={32} fill="currentColor" />
            </div>
            
            <h1 className="text-3xl font-serif italic text-slate-900 dark:text-slate-100 mb-4 tracking-tight">Mindly AI</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
              Sign in to start your secure, private, AI-powered reflection journey.
            </p>

            <div className="space-y-6">
              <button
                onClick={() => handleSignIn('popup')}
                disabled={isLoading}
                className={`w-full flex items-center justify-center gap-4 py-5 px-8 rounded-2xl font-black text-lg transition-all duration-300 shadow-xl ${
                  isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed text-white/80' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white active:scale-[0.98] shadow-indigo-100 dark:shadow-none'
                }`}
              >
                <LogIn size={24} strokeWidth={2.5} />
                {isLoading ? 'Signing in...' : 'Sign in with Google'}
              </button>

              {error && (
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl"
                  >
                    <p className="text-sm font-bold text-rose-600 dark:text-rose-400">{error}</p>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-left"
                  >
                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">Troubleshooting Tips</p>
                    <ul className="text-[11px] font-bold text-slate-600 dark:text-slate-400 space-y-3">
                      <li className="flex gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400">1.</span>
                        <span>Click the <strong className="text-slate-900 dark:text-white">"Open in New Tab"</strong> button in the top right to bypass app frame limits.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-600 dark:text-indigo-400">2.</span>
                        <span>If using Brave, <strong className="text-slate-900 dark:text-white">Disable Brave Shields</strong> (the lion icon in the address bar).</span>
                      </li>
                      <li className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400">3.</span>
                          <span>Popup still blocked? Use the fallback method:</span>
                        </div>
                        <button 
                          onClick={() => handleSignIn('redirect')}
                          className="text-indigo-600 dark:text-indigo-400 hover:underline text-left pl-6 font-black"
                        >
                          Alternative: Sign in via Redirect →
                        </button>
                      </li>
                    </ul>
                  </motion.div>
                </div>
              )}
            </div>
            
            <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800">
              <p className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em] mb-6">
                SECURE AUTHENTICATION • ENCRYPTED STORAGE
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed max-w-[240px] mx-auto">
                By signing in, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
