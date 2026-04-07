import React, { useState, useEffect, useRef } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'ur', name: 'Urdu', native: 'اردو' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളం' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' }
];

const LanguageSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const dropdownRef = useRef(null);

  useEffect(() => {
    // Check initial language from cookie
    const getCookie = (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      if (match) return match[2];
      return null;
    };

    const transCookie = getCookie('googtrans');
    if (transCookie) {
      const langCode = transCookie.split('/').pop();
      if (langCode && LANGUAGES.find(l => l.code === langCode)) {
        setCurrentLang(langCode);
      }
    }

    // Close dropdown on outside click
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (langCode) => {
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Set googtrans cookie
    // The format Google Translate expects is /auto/langCode or /en/langCode
    document.cookie = `googtrans=/en/${langCode}; path=/`;
    document.cookie = `googtrans=/en/${langCode}; domain=.${window.location.hostname}; path=/`;
    
    // Reload page to apply translation
    window.location.reload();
  };

  const selectedLangInfo = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  return (
    <div className="relative z-50 pointer-events-auto" ref={dropdownRef}>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-all group"
      >
        <Globe size={16} className="text-blue-600 dark:text-blue-400 group-hover:rotate-12 transition-transform duration-300" />
        <span className="text-xs font-bold tracking-wider hidden sm:inline-block">
          {selectedLangInfo.native}
        </span>
        <span className="text-xs font-bold tracking-wider sm:hidden uppercase">
          {selectedLangInfo.code}
        </span>
        <ChevronDown size={14} className={`text-slate-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 py-2 w-48 sm:w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-black/5 dark:border-white/10 max-h-[60vh] overflow-y-auto custom-scrollbar"
          >
            <div className="px-3 pb-2 mb-2 border-b border-black/5 dark:border-white/10">
              <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Select Language
              </span>
            </div>
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors
                  ${currentLang === lang.code 
                    ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 font-medium'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span>{lang.native}</span>
                  <span className={`text-[10px] ${currentLang === lang.code ? 'opacity-70' : 'text-slate-400'}`}>
                    {lang.name}
                  </span>
                </div>
                {currentLang === lang.code && <Check size={14} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
