import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Square, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const SpeechButton = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef(null);

  const getLanguage = () => {
    // Check the HTML lang attribute (updated by Google Translate)
    const lang = document.documentElement.lang || 'en';
    return lang.split('-')[0].toLowerCase();
  };

  const stopSpeech = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      stopSpeech();
      return;
    }

    if (!window.speechSynthesis) {
      return alert("Your browser does not support Speech Synthesis.");
    }

    setIsLoading(true);

    // DYNAMIC DOM READING: This ensures we read the TRANSLATED text
    // since Google Translate modifies the DOM directly.
    const parentCard = buttonRef.current?.closest('.group');
    if (!parentCard) {
      setIsLoading(false);
      return;
    }

    // Extracting text from specific sections of the report card
    const station = parentCard.querySelector('h3')?.innerText || '';
    const issue = parentCard.querySelector('.font-black.uppercase')?.innerText || '';
    const specifics = parentCard.querySelector('.animate-fade-in')?.innerText || ''; // Platform changes etc
    const message = parentCard.querySelector('p.text-sm')?.innerText || '';

    const contentToRead = `${station}. ${issue}. ${specifics}. ${message}`;

    const utterance = new SpeechSynthesisUtterance(contentToRead);
    const langCode = getLanguage();
    utterance.lang = langCode;

    // Trigger voice loading (needed for some browsers)
    window.speechSynthesis.getVoices();

    const startSpeaking = () => {
      const voices = window.speechSynthesis.getVoices();
      // Try to find a voice for the selected language
      const voice = voices.find(v => v.lang.startsWith(langCode)) ||
        voices.find(v => v.lang.startsWith('hi')) || // Fallback to Hindi if it's an Indian lang
        voices[0];

      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        setIsLoading(false);
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setIsLoading(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Chrome workaround: voices might not be loaded yet
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = startSpeaking;
    } else {
      startSpeaking();
    }
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <motion.button
      ref={buttonRef}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => {
        e.stopPropagation();
        handleSpeak();
      }}
      className={`p-2 rounded-xl flex items-center justify-center transition-all shadow-sm ${isSpeaking
        ? 'bg-red-500 text-white animate-pulse-subtle'
        : 'bg-white/80 dark:bg-black/40 text-blue-600 dark:text-blue-400 border border-black/5 dark:border-white/10 hover:bg-white dark:hover:bg-white/10'
        }`}
      title={isSpeaking ? "Stop Reading" : "Listen to Report"}
    >
      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isSpeaking ? (
        <Square size={16} fill="currentColor" />
      ) : (
        <Volume2 size={16} />
      )}
    </motion.button>
  );
};

export default SpeechButton;
