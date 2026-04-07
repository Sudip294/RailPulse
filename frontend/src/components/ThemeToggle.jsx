import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button
      onClick={toggleTheme}
      className={`relative w-20 h-10 rounded-full p-1 transition-colors duration-500 overflow-hidden shadow-inner ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-blue-100 border-blue-200'
      } border-2`}
      aria-label="Toggle Theme"
    >
      <motion.div
        animate={{
          x: isDarkMode ? 40 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 30
        }}
        className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-lg ${
          isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100'
        } border`}
      >
        <motion.div
           initial={false}
           animate={{
            rotate: isDarkMode ? 360 : 0,
            scale: isDarkMode ? 1 : 1,
            opacity: 1
           }}
           transition={{ duration: 0.5 }}
           className={isDarkMode ? 'text-blue-400' : 'text-yellow-500'}
        >
          {isDarkMode ? <Moon size={18} fill="currentColor" /> : <Sun size={18} fill="currentColor" />}
        </motion.div>
      </motion.div>

      {/* Decorative stars/clouds */}
      <div className="absolute inset-0 flex justify-between items-center px-3 pointer-events-none">
        <div className={`transition-opacity duration-500 ${isDarkMode ? 'opacity-100' : 'opacity-0'}`}>
           <div className="w-1 h-1 bg-white rounded-full absolute top-2 right-12 animate-pulse" />
           <div className="w-0.5 h-0.5 bg-white rounded-full absolute bottom-2 right-10 animate-pulse [animation-delay:1s]" />
           <div className="w-1 h-1 bg-white rounded-full absolute top-4 left-6 animate-pulse [animation-delay:0.5s]" />
        </div>
        <div className={`transition-opacity duration-500 ${isDarkMode ? 'opacity-0' : 'opacity-100'}`}>
           <div className="w-3 h-1.5 bg-white/40 rounded-full absolute top-2 right-4" />
           <div className="w-4 h-2 bg-white/60 rounded-full absolute bottom-2 right-6" />
        </div>
      </div>
    </button>
  );
};

export default ThemeToggle;
