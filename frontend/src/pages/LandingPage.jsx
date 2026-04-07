import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrainFront, Users, Clock, Shield, ArrowRight, Zap, MapPin, Activity, Languages, MessageSquare, Volume2, Smartphone } from 'lucide-react';
import SplitText from '../components/SplitText';
import Particles from '../components/Particles';
import Login from './Login';
import Signup from './Signup';
import ForgotPassword from './ForgotPassword';

// Unsplash free-to-use Mumbai images (no watermark)
const MUMBAI_IMAGES = [
  'https://images.unsplash.com/photo-1747548266586-294895c77218?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1920&q=80', // Mumbai local train
  'https://images.unsplash.com/photo-1558549752-d0df48562b6e?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1920&q=80', // Mumbai platform
  'https://images.unsplash.com/photo-1653299311171-31939b3b84b0?q=80&w=1074&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=1920&q=80', // Mumbai skyline
];

const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: 'Real-Time Updates',
    desc: 'Live crowdsourced reports from thousands of Mumbai commuters every day.',
    color: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-500/10 dark:bg-yellow-500/10',
    border: 'border-yellow-500/20',
  },
  {
    icon: <Users size={22} />,
    title: 'Community Driven',
    desc: 'Verify or flag reports. The crowd keeps itself honest — no single source of truth.',
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-500/10 dark:bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    icon: <Clock size={22} />,
    title: 'Auto-Expires in 24h',
    desc: 'All reports vanish automatically after 24 hours. Always fresh, never stale.',
    color: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    icon: <Shield size={22} />,
    title: 'Fake Report Guard',
    desc: 'Built-in Verify / Fake voting system keeps the feed accurate and trustworthy.',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-500/10 dark:bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    icon: <Languages size={22} />,
    title: 'Multi-Lingual Support',
    desc: 'Break language barriers with support for 7+ Indian languages via Google Translate.',
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-500/10 dark:bg-orange-500/10',
    border: 'border-orange-500/20',
  },
  {
    icon: <MessageSquare size={22} />,
    title: 'Global Community Chat',
    desc: 'Connect with fellow commuters in real-time. Share tips and ask questions.',
    color: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    icon: <Volume2 size={22} />,
    title: 'Speech to Listen',
    desc: 'Listen to reports with our high-quality TTS engine. Perfect for hands-free commuting.',
    color: 'from-indigo-500 to-purple-500',
    bg: 'bg-indigo-500/10 dark:bg-indigo-500/10',
    border: 'border-indigo-500/20',
  },
  {
    icon: <Smartphone size={22} />,
    title: 'Download PWA App',
    desc: 'Install RailPulse as a light-speed app with offline native push notifications.',
    color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-600/10 dark:bg-blue-600/10',
    border: 'border-blue-600/20',
  },
];

const STATS = [
  { value: '2 Lines', label: 'Monitored', icon: <MapPin size={16} /> },
  { value: '55+', label: 'Stations', icon: <TrainFront size={16} /> },
  { value: '24/7', label: 'Live Monitoring', icon: <Activity size={16} /> },
  { value: '< 1 min', label: 'Update Latency', icon: <Zap size={16} /> },
];

const LandingPage = ({ isDarkMode, authView, setAuthView }) => {
  const [imgIndex, setImgIndex] = useState(0);

  // ✅ AUTO IMAGE CHANGE - Every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setImgIndex((prevIndex) => (prevIndex + 1) % MUMBAI_IMAGES.length);
    }, 5000); // 2 seconds interval

    return () => clearInterval(interval); // Cleanup
  }, []);

  return (
    <div className="space-y-0 pb-10">
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-[92vh] flex flex-col lg:flex-row items-center justify-between gap-12 px-4 sm:px-8 pt-8 pb-24 overflow-hidden">
        {/* Particles layer */}
        <Particles isDarkMode={isDarkMode} />

        {/* LEFT: Hero copy */}
        <div className="relative z-10 flex-1 flex flex-col gap-6 max-w-xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 dark:bg-blue-500/15 border border-blue-500/25 text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest w-fit"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            Mumbai Rail Network · Live
          </motion.div>

          {/* Main Heading with SplitText */}
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[0.9] text-slate-900 dark:text-white notranslate">
            <SplitText
              text="Mumbai's"
              className="block"
              delay={0.15}
              stagger={0.04}
            />
            <motion.div
              className="block"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              {['R', 'a', 'i', 'l'].map((char, i) => (
                <motion.span
                  key={i}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 + (i * 0.04), duration: 0.4 }}
                >
                  {char}
                </motion.span>
              ))}
              <span className="invisible"> </span>{/* Space */}
              {['L', 'i', 'v', 'e'].map((char, i) => (
                <motion.span
                  key={`rail-${i}`}
                  className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 + (i * 0.04), duration: 0.4 }}
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
            <SplitText
              text="Tracker"
              className="block"
              delay={0.6}
              stagger={0.04}
            />
          </h2>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-slate-600 dark:text-slate-400 text-base sm:text-lg leading-relaxed max-w-md"
          >
            The pulse of Mumbai's lifelines. Crowdsourced, real-time crowd, delay & platform change reports for Western and Central Line commuters.
          </motion.p>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2"
          >
            {STATS.map((stat, i) => (
              <div
                key={i}
                className="flex flex-col items-start gap-1 p-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 backdrop-blur-sm"
              >
                <span className="text-blue-500 dark:text-blue-400">{stat.icon}</span>
                <span className="text-lg font-black text-slate-900 dark:text-white leading-none">{stat.value}</span>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{stat.label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Scroll hint */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
            className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 font-medium"
          >
            <ArrowRight size={14} className="rotate-90 animate-bounce" />
            Sign in to start reporting
          </motion.div>
        </div>

        {/* RIGHT: Mumbai Image Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, x: 40 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 flex-1 max-w-xl w-full"
        >
          {/* Image card */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-white/10 aspect-[4/3]">
            <AnimatePresence mode="wait">
              <motion.img
                key={imgIndex}
                src={MUMBAI_IMAGES[imgIndex]}
                alt="Mumbai Rail Network"
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.7 }}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback gradient if image fails
                  e.target.style.display = 'none';
                }}
              />
            </AnimatePresence>

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

            {/* Live indicator overlay */}
            <div className="absolute bottom-10 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white text-xs font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              LIVE · Mumbai Local Network
            </div>

            {/* Image switcher dots */}
            <div className="absolute bottom-4 right-4 flex gap-1.5">
              {MUMBAI_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/40'}`}
                />
              ))}
            </div>
          </div>

          {/* Floating card - Route badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="absolute -top-4 -right-2 sm:-right-6 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 dark:border-white/10 flex items-center gap-2"
          >
            <div className="p-1.5 rounded-lg bg-orange-500/20">
              <Activity size={14} className="text-orange-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Western Line</div>
              <div className="text-xs font-black text-slate-900 dark:text-white">High Crowd at Dadar</div>
            </div>
          </motion.div>

          {/* Floating card - Delay badge */}
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut', delay: 1 }}
            className="absolute -bottom-4 -left-2 sm:-left-6 glass rounded-2xl px-4 py-3 shadow-xl border border-white/20 dark:border-white/10 flex items-center gap-2"
          >
            <div className="p-1.5 rounded-lg bg-blue-500/20">
              <Clock size={14} className="text-blue-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Central Line</div>
              <div className="text-xs font-black text-slate-900 dark:text-white">Delay at Thane</div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* ─── AUTH FORMS ─── */}
      <section className="px-4 sm:px-8 pb-10 space-y-6 relative z-10" id="auth">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-center space-y-2"
        >
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Join the Commuter Network
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Login or create an account to post updates and help fellow commuters.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {authView === 'login' && (
            <Login key="login" switchToSignup={() => setAuthView('signup')} switchToForgot={() => setAuthView('forgot')} />
          )}
          {authView === 'signup' && (
            <Signup key="signup" switchToLogin={() => setAuthView('login')} />
          )}
          {authView === 'forgot' && (
            <ForgotPassword key="forgot" switchToLogin={() => setAuthView('login')} />
          )}
        </AnimatePresence>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section className="px-4 sm:px-8 pb-20 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
            Why <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent">RailPulse?</span>
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-base max-w-xl mx-auto">
            Built by commuters, for commuters. Everything you need to navigate Mumbai's local trains.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className={`p-6 rounded-3xl ${feature.bg} border ${feature.border} backdrop-blur-sm flex gap-5 items-start shadow-sm transition-all duration-300`}
            >
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${feature.color} text-white shadow-lg shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-base mb-1.5">{feature.title}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
