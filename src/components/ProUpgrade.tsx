import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Check, 
  Sparkles, 
  Library, 
  RefreshCcw, 
  ShieldCheck, 
  Tags, 
  Mic, 
  Scan, 
  Image as ImageIcon,
  ChevronRight,
  Star,
  Quote,
  Zap
} from 'lucide-react';

interface ProUpgradeProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProUpgrade: React.FC<ProUpgradeProps> = ({ isOpen, onClose }) => {
  const [showPlans, setShowPlans] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'yearly' | 'monthly' | 'lifetime'>('yearly');

  const features = [
    { icon: <Sparkles size={18} />, label: "AI-Powered Coach & Insights" },
    { icon: <Library size={18} />, label: "Access to 100+ Journaling Guides" },
    { icon: <RefreshCcw size={18} />, label: "Unlimited Syncing Across Devices" },
    { icon: <ShieldCheck size={18} />, label: "Enhanced Privacy Features" },
    { icon: <Tags size={18} />, label: "Custom Tags & Templates" },
    { icon: <Mic size={18} />, label: "Unlimited Voice Dictation" },
    { icon: <Scan size={18} />, label: "Scan Written Journal" },
    { icon: <ImageIcon size={18} />, label: "Photos, Formatting, and More!" },
  ];

  const testimonials = [
    {
      author: "Susanb33",
      title: "Yay!",
      text: "Spent the last couple of days checking out a lot of journaling apps. Yours is the first that works easily across interfaces - iPhone, chrome book, and work computer. I am so pleased. I have wanted to journal for a while but it seems like my paper journal days are over!"
    },
    {
      author: "Renz Ang",
      title: "The best out there",
      text: "I rarely leave reviews, mainly because not all applications are life-changing, but this one definitely is life-changing and worthy of one. The app's mechanism allows you type out all of your thoughts and feelings in a very clean, blank canvas."
    },
    {
      author: "IrishSto...",
      title: "Fantastic",
      text: "As a mental health professional, I'm always looking for tools to help clients and myself. This is my favorite so far - the web based app is a game changer for those who prefer typing over mobile devices."
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[600] flex items-center justify-center p-4 sm:p-6"
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose} />
          
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white dark:bg-slate-900 z-[610] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="absolute top-6 right-6 z-[620]">
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:scale-110 active:scale-95 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide">
              {!showPlans ? (
                <div className="p-8 pt-12">
                  <div className="flex flex-col items-center text-center mb-8">
                    <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-xl shadow-indigo-200 dark:shadow-none mb-6">
                      <Zap size={32} fill="currentColor" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full text-[10px] font-black tracking-widest uppercase mb-3">
                      <Star size={10} fill="currentColor" />
                      Premium
                    </div>
                    <h2 className="text-3xl md:text-4xl font-serif italic text-slate-900 dark:text-slate-50 leading-tight">
                      Unlock the Full Power of Mindly AI
                    </h2>
                  </div>

                  <div className="space-y-4 mb-12">
                    {features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                        <div className="text-indigo-500 shrink-0">
                          {feature.icon}
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{feature.label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Testimonials */}
                  <div className="mb-12">
                    <div className="flex items-center justify-center gap-3 mb-8">
                      <Quote size={20} className="text-indigo-400" />
                      <h3 className="text-sm font-black text-slate-400 dark:text-slate-600 tracking-widest uppercase">Community Love</h3>
                    </div>
                    
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                      {testimonials.map((t, i) => (
                        <div key={i} className="min-w-[280px] p-6 rounded-3xl bg-indigo-50/50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-800">
                          <div className="flex items-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} size={12} className="text-amber-400 fill-current" />
                            ))}
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{t.title}</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">{t.text}</p>
                          <span className="text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-widest">by {t.author}</span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center mt-6">
                      <button 
                        onClick={() => setShowPlans(true)}
                        className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline tracking-widest uppercase"
                      >
                        View All Plans
                      </button>
                    </div>
                  </div>

                  {/* Store Badges */}
                  <div className="flex flex-row items-center justify-center gap-3 mb-8">
                    {/* Play Store */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-xl cursor-pointer hover:bg-slate-900 transition-colors border border-slate-800">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg viewBox="0 0 48 48" className="w-5 h-5">
                          <path fill="#4285F4" d="M7.45 3.32a3.83 3.83 0 0 0-1.07 2.7v35.96a3.83 3.83 0 0 0 1.07 2.7l.13.12L27.6 24.78v-.56L7.58 3.2l-.13.12z" />
                          <path fill="#34A853" d="M34.25 31.42l-6.65-6.64v-.56l6.65-6.64.16.09 7.87 4.47c2.25 1.28 2.25 3.37 0 4.65l-7.87 4.47-.16.11z" />
                          <path fill="#FBBC04" d="M34.41 31.53L27.6 24.5l-20.15 20.3c.75.79 2 .88 3.1.25l23.86-13.52z" />
                          <path fill="#EA4335" d="M34.41 17.47L10.55 3.95c-1.1-.63-2.35-.54-3.1.25L27.6 24.5l6.81-7.03z" />
                        </svg>
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[7px] font-bold uppercase tracking-wider text-slate-300">GET IT ON</span>
                        <span className="text-sm font-semibold tracking-tight">Google Play</span>
                      </div>
                    </div>

                    {/* App Store */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl cursor-pointer hover:bg-slate-800 transition-colors">
                      <div className="w-6 h-6 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.24-2.02 1.1-3.15-1.04.04-2.3.69-3.05 1.52-.67.74-1.26 1.96-1.1 3.05 1.16.09 2.34-.6 3.05-1.42z"/></svg>
                      </div>
                      <div className="flex flex-col items-start leading-none">
                        <span className="text-[8px] uppercase tracking-tighter">Download on the</span>
                        <span className="text-xs font-bold">App Store</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-center text-center">
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 mb-1">Cancel anytime for any reason</p>
                    <div className="flex gap-4 text-[10px] font-bold text-indigo-500">
                      <button>Terms of Service</button>
                      <button>Privacy Policy</button>
                    </div>
                    <button className="mt-4 text-[10px] font-black text-indigo-600 uppercase tracking-widest">Request a Scholarship</button>
                  </div>
                </div>
              ) : (
                <div className="p-8 pt-12">
                   <button 
                    onClick={() => setShowPlans(false)}
                    className="mb-6 text-xs font-black text-slate-400 hover:text-indigo-600 flex items-center gap-2 tracking-widest uppercase transition-colors"
                   >
                     <ChevronRight size={14} className="rotate-180" />
                     Back to features
                   </button>

                   <h2 className="text-3xl font-serif italic text-slate-900 dark:text-slate-50 mb-8">Choose Your Plan</h2>

                   <div className="space-y-4 mb-12">
                     {/* Yearly */}
                     <button 
                       onClick={() => setSelectedPlan('yearly')}
                       className={`w-full p-6 rounded-[32px] text-left transition-all border-2 relative overflow-hidden ${
                         selectedPlan === 'yearly' 
                          ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                       }`}
                     >
                       <div className="absolute top-0 right-0 px-4 py-1.5 bg-green-500 text-white text-[9px] font-black tracking-widest uppercase rounded-bl-2xl">
                         7-Day Free Trial
                       </div>
                       <div className="flex justify-between items-end mb-2">
                         <div>
                           <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Yearly</h3>
                           <div className="flex items-center gap-2">
                             <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">$69.00</span>
                             <span className="text-sm text-slate-400 line-through font-bold">$96.00</span>
                           </div>
                         </div>
                         <div className="text-right">
                           <span className="block text-xs font-black text-slate-900 dark:text-slate-100">$5.75 / mo.</span>
                         </div>
                       </div>
                     </button>

                     {/* Monthly */}
                     <button 
                       onClick={() => setSelectedPlan('monthly')}
                       className={`w-full p-6 rounded-[32px] text-left transition-all border-2 ${
                         selectedPlan === 'monthly' 
                          ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                       }`}
                     >
                       <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Monthly</h3>
                         <span className="text-xl font-black text-slate-900 dark:text-slate-100">$8.00 / mo.</span>
                       </div>
                     </button>

                     {/* Lifetime */}
                     <button 
                       onClick={() => setSelectedPlan('lifetime')}
                       className={`w-full p-6 rounded-[32px] text-left transition-all border-2 ${
                         selectedPlan === 'lifetime' 
                          ? 'border-indigo-600 bg-indigo-50/30 dark:bg-indigo-900/10' 
                          : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900'
                       }`}
                     >
                       <div className="flex justify-between items-center">
                         <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">Lifetime</h3>
                         <span className="text-xl font-black text-slate-900 dark:text-slate-100">$250.00</span>
                       </div>
                     </button>
                   </div>
                </div>
              )}
            </div>

            {/* Bottom Button Sticky */}
            <div className="p-8 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
               <button className="w-full py-5 bg-indigo-600 text-white rounded-[24px] font-black text-lg shadow-xl shadow-indigo-200 dark:shadow-none hover:scale-[1.02] active:scale-95 transition-all">
                 Continue
               </button>
               <p className="mt-4 text-[10px] text-center text-slate-400 dark:text-slate-600 font-medium">
                 Free for 7 days then $69.00 billed annually. <br />
                 Cancel anytime, for any reason.
               </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
