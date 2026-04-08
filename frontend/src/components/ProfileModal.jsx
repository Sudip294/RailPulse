import { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, Mail, Calendar, Info, Trash2, LogOut, Check, ShieldCheck, XCircle, Edit2, TrainFront, Bell, BellOff } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';

const ProfileModal = ({ isOpen, onClose, targetUserId }) => {
  const { user, logout, updateUser } = useContext(AuthContext);
  const [profileData, setProfileData] = useState(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [showDeleteZone, setShowDeleteZone] = useState(false);

  // Check if viewing own profile
  const isOwnProfile = !targetUserId || targetUserId === user?._id || targetUserId === user?.id;

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    } else {
      // Clear data when closing to prevent flash of old data
      setProfileData(null);
      setIsEditingBio(false);
      setShowDeleteZone(false);
    }
  }, [isOpen, targetUserId]);

  const fetchProfile = async () => {
    try {
      const url = targetUserId ? `/user/profile/${targetUserId}` : '/user/profile';
      const { data } = await API.get(url);
      setProfileData(data);
      setNewBio(data.user.bio || '');
    } catch (error) {
      toast.error('Failed to load profile');
      onClose();
    }
  };

  const maskEmail = (email) => {
    if (!email) return '';
    if (isOwnProfile) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return `**@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Type validation
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      return toast.error('Only JPG and PNG images are allowed');
    }

    // Size validation (2MB)
    if (file.size > 2 * 1024 * 1024) {
      return toast.error('Image size must be less than 2MB');
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = async () => {
      const base64Img = reader.result;
      try {
        setIsUpdating(true);
        const { data } = await API.put('/user/profile', { profileImg: base64Img });
        updateUser(data);
        setProfileData(prev => ({ ...prev, user: data }));
        toast.success('Profile picture updated');
      } catch (error) {
        toast.error('Upload failed');
      } finally {
        setIsUpdating(false);
      }
    };
  };

  const handleUpdateBio = async () => {
    try {
      setIsUpdating(true);
      const { data } = await API.put('/user/profile', { bio: newBio });
      updateUser(data);
      setProfileData(prev => ({ ...prev, user: data }));
      setIsEditingBio(false);
      toast.success('Bio updated');
    } catch (error) {
      toast.error('Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsUpdating(true);
      await API.post('/user/delete-account', { confirmationEmail: deleteConfirm });
      toast.success('Account permanently deleted');
      logout();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Deletion failed');
    } finally {
      setIsUpdating(false);
    }
  };

  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (isOpen && isOwnProfile) {
      checkSubscription();
    }
  }, [isOpen, isOwnProfile]);

  const checkSubscription = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
  };

  // Helper to convert VAPID key
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const handleToggleNotifications = async () => {
    try {
      setIsSubscribing(true);

      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        toast.error('Push notifications are not supported by your browser.');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      if (isSubscribed) {
        // Unsubscribe logic
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          await subscription.unsubscribe();
          await API.post('/push/unsubscribe', { endpoint: subscription.endpoint });
          setIsSubscribed(false);
          toast.success('Notifications disabled');
        }
      } else {
        // Subscribe logic
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          toast.error('Permission denied');
          return;
        }

        const vapidRes = await API.get('/push/vapidPublicKey');
        const publicVapidKey = vapidRes.data.publicKey;

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await API.post('/push/subscribe', { subscription });
        setIsSubscribed(true);
        toast.success('Notifications enabled! 🎉');
      }
    } catch (error) {
      console.error('Push toggle error:', error);
      toast.error('Failed to change notification settings');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!user || !profileData) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl border border-black/5 dark:border-white/10 overflow-y-auto max-h-[90vh] scrollbar-hide"
          >
            {/* Modal Header/Cover */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-purple-600 relative">
              <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 rounded-xl bg-black/10 hover:bg-black/20 text-white backdrop-blur-md transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 sm:px-10 pb-8 sm:pb-10 -mt-12 sm:-mt-16">
              {/* Profile Header Block */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-8 text-center sm:text-left">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-xl bg-slate-100 dark:bg-slate-800">
                    {profileData.user.profileImg ? (
                      <img src={profileData.user.profileImg} className="w-full h-full object-cover" alt="Profile" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-600">
                        <TrainFront size={48} />
                      </div>
                    )}
                  </div>
                  <label className={`absolute bottom-2 right-2 p-2.5 rounded-xl bg-blue-600 text-white shadow-lg cursor-pointer hover:scale-110 active:scale-95 transition-all ${!isOwnProfile && 'hidden'}`}>
                    <Camera size={18} />
                    <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleImageUpload} />
                  </label>
                </div>

                <div className="flex-1 mb-2 text-center sm:text-left">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{profileData.user.name}</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center sm:justify-start gap-2">
                    <Mail size={14} /> {maskEmail(profileData.user.email)}
                  </p>
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/5 border border-emerald-500/10 flex flex-col items-center">
                  <ShieldCheck size={24} className="text-emerald-500 mb-1" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{profileData.stats.verifiedCount}</span>
                  <span className="text-[10px] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Verifications</span>
                </div>
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-500/10 flex flex-col items-center">
                  <XCircle size={24} className="text-red-500 mb-1" />
                  <span className="text-2xl font-black text-slate-800 dark:text-white leading-none">{profileData.stats.fakedCount}</span>
                  <span className="text-[10px] font-bold text-red-600/70 uppercase tracking-widest mt-1">Fake Flags</span>
                </div>
              </div>

              {/* Info Sections */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3 px-1">
                    <h4 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                      <Info size={14} /> Description / Bio
                    </h4>
                    {isOwnProfile && !isEditingBio && (
                      <button onClick={() => setIsEditingBio(true)} className="text-blue-500 p-1.5 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-all">
                        <Edit2 size={14} />
                      </button>
                    )}
                  </div>

                  {isEditingBio ? (
                    <div className="space-y-3">
                      <textarea
                        value={newBio}
                        onChange={(e) => setNewBio(e.target.value.slice(0, 150))}
                        className="w-full h-24 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-sm font-medium resize-none"
                        placeholder="Write something about your commute..."
                      />
                      <div className="flex justify-between items-center px-1">
                        <span className="text-[10px] font-bold text-slate-400">{newBio.length} / 150</span>
                        <div className="flex gap-2">
                          <button onClick={() => setIsEditingBio(false)} className="px-4 py-1.5 rounded-xl text-xs font-bold text-slate-500">Cancel</button>
                          <button onClick={handleUpdateBio} disabled={isUpdating} className="px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md">Save</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="px-4 py-3 rounded-2xl bg-slate-50/50 dark:bg-white/5 italic text-sm text-slate-600 dark:text-slate-400 font-medium border border-black/5 dark:border-white/5 min-h-[50px]">
                      {profileData.user.bio || (isOwnProfile ? "No bio yet. Add one to let others know who you are!" : "This user hasn't added a bio yet.")}
                    </p>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Network</span>
                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Calendar size={14} /> {new Date(profileData.user.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  {isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleToggleNotifications}
                        disabled={isSubscribing}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl transition-all font-bold text-sm shadow-sm disabled:opacity-50 ${
                          isSubscribed 
                            ? 'bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400' 
                            : 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {isSubscribed ? <BellOff size={16} /> : <Bell size={16} />}
                        {isSubscribed ? 'Disable' : 'Notifications'}
                      </button>
                      <button 
                        onClick={() => {
                          toast.success('Logged out successfully! ✅');
                          logout();
                          onClose();
                        }} 
                        className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white transition-all font-bold text-sm shadow-sm"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </div>
                  )}
                </div>

                {isOwnProfile && (
                  <div className="pt-4 border-t border-black/5 dark:border-white/5 text-left">
                    {!showDeleteZone ? (
                      <button onClick={() => setShowDeleteZone(true)} className="text-[11px] font-black text-red-500/60 hover:text-red-500 uppercase tracking-widest px-1 transition-colors">
                        Account Settings & Deletion
                      </button>
                    ) : (
                      <div className="bg-red-500/5 p-5 rounded-3xl border border-red-500/10 space-y-4">
                        <div className="flex items-center justify-between">
                          <h5 className="text-xs font-black text-red-600 uppercase tracking-widest">Permanent Deletion</h5>
                          <button onClick={() => setShowDeleteZone(false)} className="p-1 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-lg transition-colors"><X size={14} className="text-red-500" /></button>
                        </div>
                        <p className="text-[11px] text-red-700/70 dark:text-red-400/60 leading-relaxed">
                          To delete your account and all associated posts, please type <span className="font-bold text-red-600 dark:text-red-500 underline">{profileData.user.email} delete</span> below.
                        </p>
                        <input
                          type="text"
                          value={deleteConfirm}
                          onChange={(e) => setDeleteConfirm(e.target.value)}
                          placeholder="your@email.com delete"
                          className="w-full p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/40 outline-none text-sm font-mono text-center shadow-inner"
                        />
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirm !== `${profileData.user.email} delete` || isUpdating}
                          className="w-full py-3.5 rounded-xl bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-red-500/20 disabled:opacity-30 disabled:shadow-none transition-all"
                        >
                          <Trash2 size={14} className="inline mr-2" /> Finalize Deletion
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ProfileModal;
