import { useState, useEffect, useContext } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { motion, AnimatePresence } from 'framer-motion'
import { AuthContext, AuthProvider } from './context/AuthContext'
import Dashboard from './pages/Dashboard'
import LandingPage from './pages/LandingPage'
import FloatingFooter from './components/FloatingFooter'
import ThemeToggle from './components/ThemeToggle'
import Aurora from './components/Aurora'
import CustomCursor from './components/CustomCursor'
import LoadingScreen from './components/LoadingScreen'
import ProfileModal from './components/ProfileModal'
import LanguageSwitcher from './components/LanguageSwitcher'
import GlobalChat from './components/GlobalChat'
import { LogOut, User as UserIcon, TrainFront, MessageSquare, Menu, X } from 'lucide-react'

// --- Animated Hamburger Button Sub-component ---
const HamburgerButton = ({ isOpen, onClick }) => {
  return (
    <motion.button
      onClick={onClick}
      className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all md:hidden z-[100]"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        animate={isOpen ? "open" : "closed"}
        className="w-5 h-5 flex flex-col justify-between items-center"
      >
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: 45, y: 8 },
          }}
          className="w-full h-0.5 bg-blue-600 dark:text-blue-400 rounded-full origin-center"
        />
        <motion.span
          variants={{
            closed: { opacity: 1, x: 0 },
            open: { opacity: 0, x: 10 },
          }}
          className="w-full h-0.5 bg-blue-600 dark:text-blue-400 rounded-full"
        />
        <motion.span
          variants={{
            closed: { rotate: 0, y: 0 },
            open: { rotate: -45, y: -8 },
          }}
          className="w-full h-0.5 bg-blue-600 dark:text-blue-400 rounded-full origin-center"
        />
      </motion.div>
    </motion.button>
  );
};

function AppContent() {
  const { user, logout } = useContext(AuthContext)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [authView, setAuthView] = useState('login')
  const [isLoading, setIsLoading] = useState(true)
  const [selectedProfileId, setSelectedProfileId] = useState(null)
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDarkMode])

  useEffect(() => {
    if (!user) {
      setSelectedProfileId(null)
      setIsMenuOpen(false)
    }
  }, [user])

  // Close menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const toggleTheme = () => setIsDarkMode(!isDarkMode)

  const handleLogout = () => {
    try {
      logout()
      toast.success('Logged out successfully! ✅')
      setIsMenuOpen(false)
    } catch (error) {
      toast.error('Logout failed ❌')
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-500 overflow-x-hidden font-sans pb-24">
      <AnimatePresence>
        {isLoading && <LoadingScreen key="loader" />}
      </AnimatePresence>

      <CustomCursor />

      <Toaster position="top-center" gutter={8} toastOptions={{
        className: 'glass text-sm font-medium',
        style: { background: 'var(--toast-bg)', backdropFilter: 'blur(10px)', color: 'inherit', border: '1px solid var(--toast-border)' }
      }} />

      <Aurora isDarkMode={isDarkMode} />

      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[160px] rounded-full" />
      </div>

      {/* ─── HEADER ─── */}
      <header className="fixed top-0 w-full z-[90] backdrop-blur-2xl bg-white/60 dark:bg-slate-900/60 border-b border-black/5 dark:border-white/10 px-4 sm:px-6 py-4 sm:py-5 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
            <TrainFront size={22} className="text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent notranslate">
            RAILPULSE
          </h1>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsChatOpen(true)}
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
                  title="Community Chat"
                >
                  <MessageSquare size={16} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold tracking-wider">Chat</span>
                </motion.button>
                <div
                  onClick={() => setSelectedProfileId(user?._id || user?.id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer transition-all group"
                >
                  {user.profileImg ? (
                    <div className="w-6 h-6 rounded-lg overflow-hidden border border-black/10 dark:border-white/10">
                      <img src={user.profileImg} className="w-full h-full object-cover" alt="Profile" />
                    </div>
                  ) : (
                    <UserIcon size={14} className="text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform" />
                  )}
                  <span className="text-xs font-bold uppercase tracking-wider block max-w-[80px] truncate">{user.name}</span>
                </div>
              </>
            )}
            <LanguageSwitcher />
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
          </div>

          {/* Mobile controls: Theme toggle is always accessible */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
            <HamburgerButton isOpen={isMenuOpen} onClick={() => setIsMenuOpen(!isMenuOpen)} />
          </div>
        </div>
      </header>

      {/* --- Mobile Menu Overlay --- */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md z-[80] md:hidden"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className="fixed top-24 left-4 right-4 z-[81] bg-white/70 dark:bg-slate-900/80 backdrop-blur-2xl rounded-[2.5rem] border border-black/5 dark:border-white/10 shadow-2xl p-6 md:hidden flex flex-col gap-6"
            >
              {user ? (
                <>
                  <div 
                    onClick={() => {
                      setSelectedProfileId(user?._id || user?.id);
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center gap-4 p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-md">
                      {user.profileImg ? (
                        <img src={user.profileImg} className="w-full h-full object-cover" alt="Profile" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                          <UserIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-white uppercase tracking-tighter leading-none">{user.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-1 uppercase">View Profile</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => {
                        setIsChatOpen(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-all"
                    >
                      <div className="p-3 rounded-2xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
                        <MessageSquare size={24} />
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Community Chat</span>
                    </button>
                    
                    <div className="flex flex-col items-center gap-3 p-5 rounded-[2rem] bg-emerald-500/5 border border-emerald-500/10 transition-all">
                      <div className="p-1 rounded-2xl text-emerald-600 dark:text-emerald-400">
                        <LanguageSwitcher />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-300">Language</span>
                    </div>
                  </div>

                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-3 py-4 rounded-[2rem] bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-black uppercase tracking-[0.2em] text-xs"
                  >
                    <LogOut size={18} /> Logout Account
                  </button>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-4">Start Reporting Today</p>
                  <div className="p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10">
                   <LanguageSwitcher />
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── MAIN ─── */}
      <main className="relative z-10 pt-24 sm:pt-28 px-4 sm:px-6 max-w-5xl mx-auto">
        {!user ? (
          <LandingPage
            isDarkMode={isDarkMode}
            authView={authView}
            setAuthView={setAuthView}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Dashboard onViewProfile={(id) => setSelectedProfileId(id)} />
          </motion.div>
        )}
      </main>

      <FloatingFooter />

      {/* User Profile Dashboard Modal */}
      <ProfileModal
        isOpen={!!selectedProfileId}
        targetUserId={selectedProfileId}
        onClose={() => setSelectedProfileId(null)}
      />
      {/* Global Community Chat Sidebar */}
      <GlobalChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        onViewProfile={(id) => {
          setIsChatOpen(false)
          setTimeout(() => setSelectedProfileId(id), 200)
        }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
