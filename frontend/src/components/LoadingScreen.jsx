import { motion } from 'framer-motion';
import { TrainFront } from 'lucide-react';

const LoadingScreen = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950"
    >
      <div className="relative">
        {/* Outer Glow Ring */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 -m-4 bg-blue-500/20 dark:bg-blue-400/20 blur-2xl rounded-full"
        />

        {/* Animated Logo Container */}
        <motion.div
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative p-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-2xl flex items-center justify-center transform-gpu"
        >
          <TrainFront size={48} className="text-white" />
        </motion.div>
      </div>

      {/* Brand Name Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="mt-8 flex flex-col items-center"
      >
        <h1 className="text-3xl font-black tracking-[0.2em] bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent uppercase">
          RailPulse
        </h1>
        
        {/* Loading Bar */}
        <div className="mt-4 w-32 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative border border-black/5 dark:border-white/5">
          <motion.div
            initial={{ left: "-100%" }}
            animate={{ left: "100%" }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-blue-500 to-transparent"
          />
        </div>
      </motion.div>

      {/* Footer Status */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute bottom-12 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
      >
        Connecting to Network
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;
