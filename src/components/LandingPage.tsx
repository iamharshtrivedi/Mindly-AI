import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  ArrowRight, 
  CheckCircle2, 
  Heart, 
  Brain, 
  Compass, 
  ShieldCheck, 
  Star,
  Quote,
  ChevronRight,
  Menu,
  X,
  Sun,
  Moon
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '../context/ThemeContext';

interface LandingPageProps {
  onSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onSignIn }) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { theme } = useTheme();

  return (
    <div className="min-h-screen bg-serene-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-500">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-serene-50/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-serene-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200 dark:shadow-none">
              <Zap size={20} fill="currentColor" />
            </div>
            <span className="text-2xl font-serif italic tracking-tight text-slate-900 dark:text-slate-50">Mindly AI</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#method">The Method</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <div className="flex items-center gap-4 border-l border-serene-200 dark:border-slate-800 pl-8 ml-2">
              <ThemeToggle className="!w-10 !h-10 rounded-xl" />
              <button 
                onClick={onSignIn}
                className="px-6 py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-full text-sm font-bold hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-200 dark:shadow-none"
              >
                Get Started
              </button>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle className="!w-10 !h-10 rounded-xl" />
            <button 
              className="p-2 text-slate-600 dark:text-slate-400"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Menu */}
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 space-y-4 shadow-xl"
          >
            <NavLink href="#features" onClick={() => setIsMenuOpen(false)}>Features</NavLink>
            <NavLink href="#method" onClick={() => setIsMenuOpen(false)}>The Method</NavLink>
            <NavLink href="#pricing" onClick={() => setIsMenuOpen(false)}>Pricing</NavLink>
            <button 
              onClick={() => { onSignIn(); setIsMenuOpen(false); }}
              className="w-full px-6 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              Get Started
            </button>
          </motion.div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-8 md:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-serene-100 dark:bg-slate-900 border border-serene-200 dark:border-slate-800 text-serene-700 dark:text-serene-400 text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              <Star size={12} className="fill-current" />
              The guided journal for self-growth
            </div>
            <h1 className="text-5xl md:text-8xl font-serif italic text-slate-900 dark:text-slate-50 leading-[1.1] mb-8 tracking-tight">
              A journal that listens,<br />and <span className="text-indigo-600">talks back.</span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">
              Mindly.ai is a structured space to clear your mind, document your life, and see your personal growth over time.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button 
                onClick={onSignIn}
                className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 dark:shadow-none hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3"
              >
                Start Your Free Journal
                <ArrowRight size={20} />
              </button>
              <div className="flex items-center gap-3 px-6 text-sm font-medium text-slate-400 dark:text-slate-600">
                <CheckCircle2 size={16} className="text-teal-500" />
                No credit card required
              </div>
            </div>
          </motion.div>

          {/* App Preview Mockup */}
          <div className="mt-20 relative max-w-5xl mx-auto w-full">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-2 md:p-4 shadow-2xl shadow-indigo-200/30 dark:shadow-none border border-slate-200 dark:border-slate-800">
              <div className="w-full bg-white dark:bg-slate-950 rounded-[32px] overflow-hidden aspect-[16/10] min-h-[300px] md:min-h-[400px] relative shadow-inner border border-slate-100 dark:border-slate-900">
                {/* Mockup Dashboard content */}
                <div className="absolute inset-0 flex flex-col p-8 bg-indigo-50 dark:bg-slate-900">
                  <div className="flex items-center justify-between mb-12">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-200 dark:shadow-none"></div>
                    <div className="flex gap-4">
                      <div className="w-32 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-300 dark:border-slate-700"></div>
                      <div className="w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow-md border border-slate-300 dark:border-slate-700"></div>
                    </div>
                  </div>
                  <div className="max-w-xl mx-auto w-full text-center">
                    <div className="w-24 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[8px] font-black tracking-widest uppercase mx-auto mb-6 shadow-lg shadow-indigo-100 dark:shadow-none">Today</div>
                    
                    <div className="w-full h-12 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl shadow-indigo-100/10 dark:shadow-none mb-4 flex items-center px-6">
                      <span className="text-slate-600 dark:text-slate-400 text-sm font-semibold">What's on your mind?</span>
                    </div>
                    
                    <div className="w-3/4 h-10 rounded-2xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-xl shadow-indigo-100/10 dark:shadow-none mx-auto flex items-center justify-center">
                      <span className="text-slate-800 dark:text-slate-200 text-xs font-bold italic">"Yesterday I felt incredibly productive..."</span>
                    </div>

                    <div className="mt-12 grid grid-cols-2 gap-8">
                      <div className="h-44 rounded-[32px] bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-300 dark:border-slate-700 p-6 flex flex-col items-start text-left">
                        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
                          <Brain size={16} />
                        </div>
                        <div className="text-slate-900 dark:text-slate-50 font-bold text-sm mb-1">AI Insights</div>
                        <div className="text-slate-700 dark:text-slate-400 text-[11px] font-medium leading-relaxed">Your patterns show a spike in creativity during morning sessions.</div>
                      </div>
                      
                      <div className="h-44 rounded-[32px] bg-white dark:bg-slate-800 shadow-2xl shadow-slate-200 dark:shadow-none border border-slate-300 dark:border-slate-700 p-6 flex flex-col items-start text-left">
                        <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center mb-4 text-teal-600 dark:text-teal-400">
                          <Compass size={16} />
                        </div>
                        <div className="text-slate-900 dark:text-slate-50 font-bold text-sm mb-1">Weekly Review</div>
                        <div className="text-slate-700 dark:text-slate-400 text-[11px] font-medium leading-relaxed">You've completed 5 entries this week. Keep the momentum!</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating elements */}
            <div className="absolute -top-12 -left-4 md:-left-12 hidden md:block">
              <FeatureTag icon={<Heart size={16} className="text-rose-500" />} label="Self-Care" />
            </div>
            <div className="absolute top-1/4 -right-4 md:-right-12 hidden md:block">
              <FeatureTag icon={<Brain size={16} className="text-indigo-500" />} label="AI Insights" />
            </div>
            <div className="absolute -bottom-6 left-1/4 hidden md:block">
              <FeatureTag icon={<Compass size={16} className="text-teal-500" />} label="Guided Paths" />
            </div>
          </div>
        </div>
      </section>

      {/* Method Section */}
      <section id="method" className="py-32 bg-white dark:bg-slate-900 border-y border-serene-100 dark:border-slate-800 px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <span className="text-[10px] font-black text-indigo-500 tracking-[0.2em] uppercase mb-4 block">The Mindly Method</span>
            <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 mb-6">A framework for a more<br />intentional life.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <MethodStep 
              number="01" 
              title="Journal" 
              description="Clear your mind with our expert-led journaling guides and daily inspiration prompts."
            />
            <MethodStep 
              number="02" 
              title="Insights" 
              description="Our AI engine synthesizes your thoughts to find patterns, themes, and emotional shifts."
            />
            <MethodStep 
              number="03" 
              title="Grow" 
              description="Review your progress by week, month, and year to see how far you've come on your journey."
            />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 bg-serene-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-[10px] font-black text-teal-500 tracking-[0.2em] uppercase mb-4 block">Guided Journaling</span>
              <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 dark:text-slate-50 mb-8 leading-tight">Expert prompts for every moment of life.</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 mb-10 leading-relaxed">
                Whether you're dealing with anxiety, practicing gratitude, or planning your next big project, our 100+ expert guides help you dive deeper.
              </p>
              <ul className="space-y-6">
                <BenefitItem label="Over 100+ Guided Journaling programs" />
                <BenefitItem label="Personalized AI follow-up questions" />
                <BenefitItem label="Theme-based inspiration library" />
                <BenefitItem label="Voice-to-text with real-time transcription" />
              </ul>
            </div>
            <div className="relative">
              <div className="aspect-square glass-surface rounded-[60px] p-8 flex flex-col justify-center items-center text-center border-none">
                <Quote size={48} className="text-indigo-500/10 mb-8" />
                <p className="text-2xl font-serif italic text-slate-700 dark:text-slate-300 leading-snug mb-8">
                  "What is one small thing you can do today that will make tomorrow easier?"
                </p>
                <div className="px-6 py-2 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 rounded-full text-xs font-black tracking-widest uppercase">
                  Daily Question
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Privacy */}
      <section className="py-32 bg-serene-950 text-white px-6 overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
          <ShieldCheck size={64} className="text-indigo-400 mb-10" />
          <h2 className="text-4xl md:text-6xl font-serif italic mb-8">Your thoughts are private.<br />And we keep them that way.</h2>
          <p className="max-w-2xl text-serene-300 text-lg leading-relaxed mb-12">
            Mindly AI uses bank-level encryption. We never sell your data, and we never use your private journals to train AI models.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-4xl">
            <TrustBadge label="End-to-End Encryption" />
            <TrustBadge label="Biometric Lock" />
            <TrustBadge label="GDPR Compliant" />
            <TrustBadge label="Data Portability" />
          </div>
        </div>
        <div className="absolute top-0 right-0 p-32 opacity-10 blur-3xl bg-indigo-600 rounded-full"></div>
        <div className="absolute bottom-0 left-0 p-32 opacity-10 blur-3xl bg-purple-600 rounded-full"></div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-6 bg-serene-50 dark:bg-slate-950 transition-colors duration-500">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 dark:text-slate-50 mb-12">Start your Mindly AI journey today.</h2>
          <div className="glass-surface rounded-[40px] p-10 md:p-16 relative border-none">
            <div className="inline-block px-4 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8">
              Limited Free Plan
            </div>
            <h3 className="text-2xl font-bold mb-4 dark:text-slate-50">Mindly AI Free</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-10">Essential features to start your journaling practice.</p>
            <ul className="text-left space-y-4 mb-12 max-w-xs mx-auto">
              <li className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={16} className="text-indigo-500" />
                Unlimited basic entries
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                <CheckCircle2 size={16} className="text-indigo-500" />
                Daily inspiration prompts
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-slate-400 dark:text-slate-600">
                <X size={16} />
                Advanced AI Coaching
              </li>
            </ul>
            <button 
              onClick={onSignIn}
              className="w-full py-5 bg-slate-900 dark:bg-indigo-600 text-white rounded-2xl font-black text-lg hover:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-slate-200 dark:shadow-none"
            >
              Get Started for Free
            </button>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-24 px-6 bg-white dark:bg-slate-900 border-t border-serene-100 dark:border-slate-800 transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-serif italic text-slate-900 dark:text-slate-50 mb-4">Journal anywhere, anytime.</h2>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-xl mx-auto md:mx-0">
              Download the Mindly AI mobile app to capture your thoughts on the go. Available now on iOS and Android.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {/* Play Store */}
            <div className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl cursor-pointer hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 border border-slate-800 shadow-xl shadow-indigo-100/5">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-7 h-7">
                  <path fill="#4285F4" d="M7.45 3.32a3.83 3.83 0 0 0-1.07 2.7v35.96a3.83 3.83 0 0 0 1.07 2.7l.13.12L27.6 24.78v-.56L7.58 3.2l-.13.12z" />
                  <path fill="#34A853" d="M34.25 31.42l-6.65-6.64v-.56l6.65-6.64.16.09 7.87 4.47c2.25 1.28 2.25 3.37 0 4.65l-7.87 4.47-.16.11z" />
                  <path fill="#FBBC04" d="M34.41 31.53L27.6 24.5l-20.15 20.3c.75.79 2 .88 3.1.25l23.86-13.52z" />
                  <path fill="#EA4335" d="M34.41 17.47L10.55 3.95c-1.1-.63-2.35-.54-3.1.25L27.6 24.5l6.81-7.03z" />
                </svg>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">GET IT ON</span>
                <span className="text-lg font-semibold tracking-tight">Google Play</span>
              </div>
            </div>

            {/* App Store */}
            <div className="flex items-center gap-3 px-6 py-3 bg-black text-white rounded-2xl cursor-pointer hover:bg-slate-900 transition-all hover:scale-105 active:scale-95 border border-slate-800 shadow-xl shadow-indigo-100/5">
              <div className="w-8 h-8 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.1 2.48-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83zM13 3.5c.73-.83 1.24-2.02 1.1-3.15-1.04.04-2.3.69-3.05 1.52-.67.74-1.26 1.96-1.1 3.05 1.16.09 2.34-.6 3.05-1.42z"/></svg>
              </div>
              <div className="flex flex-col items-start leading-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-300">Download on the</span>
                <span className="text-lg font-semibold tracking-tight">App Store</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-serene-200 dark:border-slate-800 bg-serene-50 dark:bg-slate-950 px-6 transition-colors duration-500">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <Zap size={16} fill="currentColor" />
                </div>
                <span className="text-xl font-serif italic tracking-tight text-slate-900 dark:text-slate-50">Mindly AI</span>
              </div>
              <p className="max-w-xs text-sm text-slate-400 dark:text-slate-500 font-medium leading-relaxed">
                Empowering individuals to grow through the practice of journaling.
              </p>
              <div className="flex gap-4">
                <SocialIcon />
                <SocialIcon />
                <SocialIcon />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
              <FooterColumn title="Product" links={['Features', 'Method', 'Pricing']} />
              <FooterColumn title="Resources" links={['Guides', 'Help Center', 'Privacy']} />
              <FooterColumn title="Company" links={['About Us', 'Contact', 'Press']} />
            </div>
          </div>
          
          <div className="mt-20 pt-8 border-t border-serene-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest">© 2026 Mindly AI. All rights reserved.</p>
            <div className="flex gap-8">
              <button className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest hover:text-indigo-600 transition-colors">Terms</button>
              <button className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest hover:text-indigo-600 transition-colors">Privacy</button>
              <button className="text-xs text-slate-400 dark:text-slate-600 font-medium uppercase tracking-widest hover:text-indigo-600 transition-colors">Cookies</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
  <a 
    href={href} 
    onClick={onClick}
    className="text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors tracking-tight"
  >
    {children}
  </a>
);

const FeatureTag: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-2xl border border-serene-200 dark:border-slate-800 flex items-center gap-3 transition-colors"
  >
    {icon}
    <span className="text-xs font-black text-slate-900 dark:text-slate-50 tracking-tight">{label}</span>
  </motion.div>
);

const MethodStep: React.FC<{ number: string; title: string; description: string }> = ({ number, title, description }) => (
  <div className="space-y-6">
    <div className="text-5xl font-serif italic text-indigo-200 dark:text-indigo-900/40">{number}</div>
    <h3 className="text-2xl font-bold tracking-tight dark:text-slate-50">{title}</h3>
    <p className="text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </div>
);

const BenefitItem: React.FC<{ label: string }> = ({ label }) => (
  <li className="flex items-center gap-4">
    <div className="w-5 h-5 rounded-full bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center text-teal-600 dark:text-teal-400">
      <CheckCircle2 size={14} />
    </div>
    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
  </li>
);

const TrustBadge: React.FC<{ label: string }> = ({ label }) => (
  <div className="p-6 border border-white/20 rounded-3xl bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center text-center gap-3">
    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400">{label}</span>
  </div>
);

const FooterColumn: React.FC<{ title: string; links: string[] }> = ({ title, links }) => (
  <div className="space-y-6">
    <h4 className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.2em]">{title}</h4>
    <ul className="space-y-4">
      {links.map(link => (
        <li key={link}>
          <button className="text-sm font-medium text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{link}</button>
        </li>
      ))}
    </ul>
  </div>
);

const SocialIcon: React.FC = () => (
  <button className="w-8 h-8 rounded-lg bg-serene-100 dark:bg-slate-900 flex items-center justify-center text-slate-400 dark:text-slate-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/40 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
    <div className="w-4 h-4 bg-current rounded-sm"></div>
  </button>
);
