import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Clock, CheckCheck, User as UserIcon, Pencil, Trash2, RotateCcw, Check, AlertCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const socket = io(SOCKET_URL);

// Format a date to "Apr 6, 2026 · 5:30 PM"
const formatTimestamp = (date) => {
  const d = new Date(date);
  return d.toLocaleString([], {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

// Format short time "5:30 PM"
const formatShortTime = (date) => {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Avatar = ({ name, img, size = 8, onClick }) => {
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';
  const colors = ['from-blue-500 to-indigo-600', 'from-purple-500 to-pink-600', 'from-emerald-500 to-teal-600', 'from-orange-500 to-red-500', 'from-cyan-500 to-blue-500'];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <button
      onClick={onClick}
      className={`w-${size} h-${size} rounded-full overflow-hidden shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 group`}
      title={`View ${name}'s profile`}
    >
      {img ? (
        <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
      ) : (
        <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${colors[colorIndex]} text-white text-xs font-black group-hover:opacity-90 transition-opacity`}>
          {initials}
        </div>
      )}
    </button>
  );
};

const GlobalChat = ({ isOpen, onClose, onViewProfile }) => {
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [pendingIds, setPendingIds] = useState(new Set());

  // Edit/Delete States
  const [editingId, setEditingId] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [undoCountdown, setUndoCountdown] = useState(0);
  const undoTimerRef = useRef(null);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const MAX_CHARS = 300;

  // Load history on open
  useEffect(() => {
    if (!isOpen || !user) return;

    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/chat', { headers: { Authorization: `Bearer ${token}` } });
        setMessages(res.data);
      } catch (err) {
        console.error('Failed to fetch chat history', err);
      }
    };
    fetchMessages();
  }, [isOpen, user]);

  // Socket.IO real-time listeners
  useEffect(() => {
    const onReceive = (msg) => {
      setMessages(prev => {
        const exists = prev.some(m => m._id === msg._id);
        if (exists) {
          setPendingIds(p => { const n = new Set(p); n.delete(msg._id); return n; });
          return prev.map(m => m._id === msg._id ? msg : m);
        }
        return [...prev, msg];
      });
    };

    const onUpdate = (updatedMsg) => {
      setMessages(prev => prev.map(m => m._id === updatedMsg._id ? updatedMsg : m));
    };

    const onDelete = (msgId) => {
      setMessages(prev => prev.filter(m => m._id !== msgId));
    };

    socket.on('chat:receive', onReceive);
    socket.on('chat:update', onUpdate);
    socket.on('chat:delete', onDelete);

    return () => {
      socket.off('chat:receive', onReceive);
      socket.off('chat:update', onUpdate);
      socket.off('chat:delete', onDelete);
    };
  }, []);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  }, [messages, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 300);
  }, [isOpen]);

  const handleSend = async () => {
    const msg = inputText.trim();
    if (!msg || isSending) return;

    const token = localStorage.getItem('token');
    const tempId = `temp-${Date.now()}`;

    const optimistic = {
      _id: tempId,
      userId: user._id || user.id,
      senderName: user.name,
      senderImg: user.profileImg || '',
      message: msg,
      createdAt: new Date().toISOString(),
      pending: true,
    };

    setMessages(prev => [...prev, optimistic]);
    setPendingIds(p => new Set([...p, tempId]));
    setInputText('');
    setIsSending(true);

    try {
      const res = await API.post('/chat', { message: msg }, { headers: { Authorization: `Bearer ${token}` } });
      // Replace the temporary message with the actual message from the database to avoid flickering
      setMessages(prev => prev.map(m => m._id === tempId ? res.data : m));
      setPendingIds(p => { const n = new Set(p); n.delete(tempId); return n; });
    } catch (err) {
      setMessages(prev => prev.map(m => m._id === tempId ? { ...m, failed: true, pending: false } : m));
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  const handleUpdate = async (id) => {
    const msg = editValue.trim();
    if (!msg || msg.length > MAX_CHARS) return;

    try {
      const token = localStorage.getItem('token');
      await API.put(`/chat/${id}`, { message: msg }, { headers: { Authorization: `Bearer ${token}` } });
      setEditingId(null);
      toast.success('Message updated');
    } catch (err) {
      toast.error('Failed to update message');
    }
  };

  const handleDelete = async (id) => {
    // Start Undo countdown
    setConfirmDeleteId(id);
    setUndoCountdown(5);

    if (undoTimerRef.current) clearInterval(undoTimerRef.current);

    undoTimerRef.current = setInterval(() => {
      setUndoCountdown(prev => {
        if (prev <= 1) {
          clearInterval(undoTimerRef.current);
          performDelete(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const performDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await API.delete(`/chat/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setConfirmDeleteId(null);
      toast.success('Message deleted');
    } catch (err) {
      toast.error('Deletion failed');
      setConfirmDeleteId(null);
    }
  };

  const handleUndo = () => {
    if (undoTimerRef.current) {
      clearInterval(undoTimerRef.current);
      setConfirmDeleteId(null);
      setUndoCountdown(0);
      toast.success('Deletion cancelled');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const myId = user?._id || user?.id;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[420px] z-[110] flex flex-col bg-white/80 dark:bg-slate-900/90 backdrop-blur-2xl border-l border-black/5 dark:border-white/10 shadow-2xl"
          >
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
              <div className="absolute -top-32 -right-32 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl" />
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-b border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                  <MessageSquare size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-black text-slate-900 dark:text-white text-base leading-none">Community Chat</h2>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">Global · Text Only</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 hover:text-slate-800 dark:hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 scrollbar-hide">
              {messages.length === 0 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center justify-center h-full gap-3 text-center pt-10">
                  <div className="p-4 rounded-2xl bg-blue-500/10"><MessageSquare size={32} className="text-blue-500" /></div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">No messages yet.<br />Be the first to say something!</p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isOwn = msg.userId === myId || msg.userId?.toString() === myId?.toString();
                  const isPending = msg.pending;
                  const isFailed = msg.failed;
                  const isEditing = editingId === msg._id;
                  const isConfirmingDelete = confirmDeleteId === msg._id;

                  return (
                    <motion.div
                      key={msg._id}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className={`flex gap-2.5 items-start ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar name={msg.senderName} img={msg.senderImg} size={8} onClick={() => !isOwn && msg.userId && onViewProfile && onViewProfile(msg.userId?.toString?.() || msg.userId)} />

                      <div className={`flex flex-col gap-1.5 max-w-[78%] group ${isOwn ? 'items-end' : 'items-start'}`}>
                        <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="text-[11px] font-black text-slate-700 dark:text-slate-300">{isOwn ? 'You' : msg.senderName}</span>
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                            {formatTimestamp(msg.createdAt)}
                          </span>
                        </div>

                        <div className="relative group/actions">
                          {isEditing ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <textarea
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value.slice(0, MAX_CHARS))}
                                className="w-full p-3 rounded-2xl bg-white dark:bg-black/60 border-2 border-blue-500 outline-none text-sm text-slate-800 dark:text-white resize-none shadow-xl"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-white/10 text-[10px] font-black uppercase tracking-widest">Cancel</button>
                                <button onClick={() => handleUpdate(msg._id)} className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5"><Check size={12} /> Save</button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative group/bubble">
                              <div 
                                onClick={() => isOwn && !isPending && !isConfirmingDelete && setActiveActionId(activeActionId === msg._id ? null : msg._id)}
                                className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed font-medium shadow-sm transition-all cursor-pointer ${isOwn
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm'
                                : 'bg-white dark:bg-white/10 text-slate-800 dark:text-slate-200 border border-black/5 dark:border-white/10 rounded-tl-sm'
                                } ${isPending ? 'opacity-70' : ''} ${isConfirmingDelete ? 'blur-[2px] pointer-events-none opacity-40' : ''}`}
                              >
                                {msg.message}
                              </div>

                              {/* Edit/Delete Actions - Fixed hover zone + Mobile Tap support */}
                              {isOwn && !isPending && !isConfirmingDelete && (
                                <div className={`absolute top-0 ${isOwn ? 'right-full pr-2' : 'left-full pl-2'} h-full flex items-center transition-all duration-200 z-10 ${activeActionId === msg._id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 group-hover/bubble:opacity-100 group-hover/bubble:translate-x-0'} pointer-events-none group-hover/bubble:pointer-events-auto ${activeActionId === msg._id ? 'pointer-events-auto' : ''}`}>
                                  <div className="flex gap-1 items-center bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl p-1 shadow-xl border border-black/5 dark:border-white/10">
                                    <button onClick={(e) => { e.stopPropagation(); setEditingId(msg._id); setEditValue(msg.message); setActiveActionId(null); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-blue-500 transition-colors" title="Edit"><Pencil size={14} /></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(msg._id); setActiveActionId(null); }} className="p-1.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-red-500 transition-colors" title="Delete"><Trash2 size={14} /></button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Delete Confirmation Overlay (Popover) */}
                          <AnimatePresence>
                            {isConfirmingDelete && (
                              <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} className="absolute inset-0 flex items-center justify-center z-10">
                                <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 flex flex-col items-center gap-2 text-center min-w-[160px]">
                                  <div className="flex items-center gap-1.5 text-xs font-black text-red-500 uppercase tracking-tighter">
                                    <AlertCircle size={14} /> Delete?
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={handleUndo} className="px-3 py-1.5 rounded-xl bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-md shadow-blue-500/20">
                                      <RotateCcw size={12} /> Undo ({undoCountdown})
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        <div className={`flex items-center gap-2 px-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          {msg.isEdited && <span className="text-[9px] font-bold text-slate-400 italic">(edited)</span>}
                          {isOwn && (
                            <div className="flex items-center gap-1">
                              {isPending ? <Clock size={11} className="text-slate-400" /> : isFailed ? <span className="text-[10px] text-red-500 font-bold">Failed</span> : <CheckCheck size={12} className="text-blue-400" />}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
              <div ref={bottomRef} />
            </div>

            <div className="shrink-0 px-4 py-4 border-t border-black/5 dark:border-white/10 bg-white/30 dark:bg-black/20 backdrop-blur-sm">
              {!user ? (
                <p className="text-center text-sm text-slate-400">Login to send messages.</p>
              ) : (
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value.slice(0, MAX_CHARS))}
                      onKeyDown={handleKeyDown}
                      placeholder="Message the community..."
                      rows={1}
                      className="w-full px-4 py-[11px] pr-14 rounded-2xl bg-white dark:bg-black/40 border border-black/10 dark:border-white/10 focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-all text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 resize-none max-h-32 scrollbar-hide"
                      style={{ height: 'auto', minHeight: '44px' }}
                      onInput={(e) => {
                        e.target.style.height = 'auto';
                        e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                      }}
                    />
                    <span className={`absolute bottom-2.5 right-3 text-[10px] font-bold ${inputText.length > 260 ? 'text-red-500' : 'text-slate-400'}`}>
                      {MAX_CHARS - inputText.length}
                    </span>
                  </div>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={handleSend} disabled={!inputText.trim() || isSending} className="h-11 w-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 flex items-center justify-center">
                    <Send size={18} />
                  </motion.button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default GlobalChat;
