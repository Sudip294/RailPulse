import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainTrack, ArrowUp } from 'lucide-react';

const FloatingFooter = () => {
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowTopBtn(true);
      } else {
        setShowTopBtn(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl px-2">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 20px 40px rgba(59, 130, 246, 0.15)",
          borderColor: "rgba(255, 255, 255, 0.2)"
        }}
        transition={{ duration: 0.1, ease: "easeOut" }}
        className="glass rounded-2xl md:rounded-full px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xl transition-all border border-white/20 dark:border-white/10 group relative overflow-hidden bg-white/40 dark:bg-slate-900/40"
      >
        {/* Animated Sweep Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[sweep_2s_infinite] pointer-events-none" />

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-500 to-purple-600 text-white shadow-md">
              <TrainTrack size={18} />
            </div>
            <span className="font-black text-sm md:text-base tracking-widest uppercase text-slate-800 dark:text-white">
              RailPulse
            </span>
          </div>

          <div className="md:hidden">
            <AnimatePresence>
              {showTopBtn && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={scrollToTop}
                  className="p-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                >
                  <ArrowUp size={16} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="text-center md:text-left flex-1 px-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <p className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter leading-tight whitespace-nowrap shrink-0">
            Built for Mumbai Commuters
          </p>

          {/* Status Indicator - Desktop Position */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm shrink-0 whitespace-nowrap">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            SYSTEM LIVE
          </div>

          <p className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 uppercase tracking-tighter leading-tight whitespace-nowrap shrink-0">
            Real-time Rail Monitoring
          </p>
        </div>

        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            {/* Status Indicator - Mobile Position */}
            <div className="flex md:hidden items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-sm mb-1">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              SYSTEM LIVE
            </div>

            <p className="text-[9px] md:text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap shrink-0">
              Designed & Developed by <span className="text-blue-500 font-bold italic">Sudip Bag</span> &copy; {new Date().getFullYear()}
            </p>
          </div>

          <div className="hidden md:flex items-center justify-center w-[44px] h-[44px] shrink-0">
            <AnimatePresence>
              {showTopBtn && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  onClick={scrollToTop}
                  whileHover={{ y: -5 }}
                  className="p-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-110 active:scale-95 transition-transform shadow-lg flex items-center justify-center w-full h-full"
                >
                  <ArrowUp size={20} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes sweep {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(200%); }
          }
        ` }} />
      </motion.div>
    </div>
  );
};

export default FloatingFooter;
