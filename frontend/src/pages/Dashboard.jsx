import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { io } from 'socket.io-client';
import { STATION_DATA, ISSUE_TYPES, PLATFORM_LIST } from '../utils/constants';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Train, MapPin, Plus, Clock, ShieldCheck, AlertCircle, XCircle, Trash2, MessageSquare, Check, Filter, Edit3, UserIcon } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';
import SpeechButton from '../components/SpeechButton';

const socket = io('http://localhost:5000');

const Dashboard = ({ onViewProfile }) => {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = useState([]);

  // Real-time sync: Update local reports state when current user updates their profile (name or image)
  useEffect(() => {
    if (user && reports.length > 0) {
      const currentUserId = user._id || user.id;
      setReports(prevReports => prevReports.map(report => {
        const reportAuthorId = report.userId?._id || report.userId?.id;
        if (reportAuthorId === currentUserId) {
          return {
            ...report,
            userId: {
              ...report.userId,
              name: user.name,
              profileImg: user.profileImg
            }
          };
        }
        return report;
      }));
    }
  }, [user?.profileImg, user?.name]);
  const [filterType, setFilterType] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [editMessageText, setEditMessageText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({
    line: 'WesternLine',
    station: 'Andheri',
    issue: 'Crowd',
    details: '',
    fromPF: '1',
    toPF: '2'
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const { data } = await API.get('/reports');
        setReports(data);
      } catch (error) {
        console.error("Failed to fetch reports", error);
      }
    };
    fetchReports();

    socket.on('newReport', (report) => {
      setReports((prev) => [report, ...prev]);
    });

    socket.on('updateUpvote', ({ id, upvotes }) => {
      setReports((prev) => prev.map(r => r._id === id ? { ...r, upvotes } : r));
    });

    socket.on('updateFake', ({ id, fakeVotes }) => {
      setReports((prev) => prev.map(r => r._id === id ? { ...r, fakeVotes } : r));
    });

    socket.on('updateMessage', ({ id, message }) => {
      setReports((prev) => prev.map(r => r._id === id ? { ...r, message } : r));
    });

    socket.on('reportDeleted', ({ id }) => {
      setReports((prev) => prev.filter(r => r._id !== id));
    });

    return () => {
      socket.off('newReport');
      socket.off('updateUpvote');
      socket.off('updateFake');
      socket.off('updateMessage');
      socket.off('reportDeleted');
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const reportData = {
        ...newReport,
        line: newReport.line === 'WesternLine' ? 'Western' : 'Central'
      };

      if (newReport.issue === 'Platform Change') {
        reportData.details = `From PF ${newReport.fromPF} to ${newReport.toPF}`;
      }

      await API.post('/reports', reportData);
      setShowModal(false);
      toast.success('Report posted successfully!');
    } catch (error) {
      toast.error('Failed to post report');
    }
  };

  const handleUpvote = async (id) => {
    try {
      await API.patch(`/reports/${id}/upvote`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login to verify reports');
    }
  };

  const handleFake = async (id) => {
    try {
      await API.patch(`/reports/${id}/fake`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login to report fake');
    }
  };

  const handleUpdateMessage = async (id) => {
    try {
      await API.patch(`/reports/${id}/message`, { message: editMessageText });
      setEditingId(null);
      setEditMessageText('');
      toast.success('Message updated');
    } catch (error) {
      toast.error('Failed to update message');
    }
  };

  const handleDeleteClick = (id) => {
    setItemToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await API.delete(`/reports/${itemToDelete}`);
      toast.success('Report deleted');
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      toast.error('Failed to delete report');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-32 md:pb-40">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white/40 dark:bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-black/5 dark:border-white/10 shadow-xl">
        <div>
          <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-500 bg-clip-text text-transparent flex items-center gap-3">
            <Train className="text-blue-500" size={32} /> Live Commuter Feed
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1 font-medium text-lg">Real-time updates to plan your journey safely.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-2xl font-bold transition-all shadow-lg text-white hover:scale-105 active:scale-95 text-lg"
        >
          <Plus size={24} /> Post Update
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 bg-white/30 dark:bg-black/20 p-2 rounded-2xl border border-black/5 dark:border-white/5 w-fit">
        <div className="flex items-center gap-2 px-3 text-slate-500 font-bold border-r border-slate-300 dark:border-slate-700">
          <Filter size={18} /> <span className="hidden sm:inline">Filter:</span>
        </div>
        {['All', ...ISSUE_TYPES].map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${filterType === type ? 'bg-blue-500 text-white shadow-md scale-105' : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/10 hover:scale-105'}`}
          >
            {type === 'Platform Change' ? 'PF Change' : type}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence>
          {reports.filter(r => filterType === 'All' || r.issue === filterType).map((report) => (
            <motion.div
              key={report._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative overflow-hidden glass rounded-3xl border border-white/20 dark:border-white/10 shadow-xl hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] dark:hover:shadow-[0_0_20px_rgba(147,51,234,0.15)] transition-all group"
            >
              {/* Color Band for Line */}
              <div className={`absolute top-0 left-0 w-2 h-full ${report.line === 'Western' ? 'bg-gradient-to-b from-orange-400 to-red-500' : 'bg-gradient-to-b from-blue-400 to-indigo-600'}`}></div>

              <div className="p-6 pl-8 flex justify-between items-stretch h-full gap-4">
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-sm font-bold">
                    <span className={`px-3 py-1.5 rounded-lg shadow-sm ${report.line === 'Western' ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'}`}>
                      {report.line} Line
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-white/50 dark:bg-black/20 px-3 py-1.5 rounded-lg">
                      <Clock size={16} /> {report.createdAt ? new Date(report.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl font-black text-slate-800 dark:text-white flex items-center gap-2">
                      <MapPin size={24} className={report.line === 'Western' ? 'text-orange-500' : 'text-blue-500'} /> {report.station}
                    </h3>
                    <SpeechButton />
                  </div>

                  <div className="p-3 rounded-xl bg-white/40 dark:bg-black/20 border border-black/5 dark:border-white/5 flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <AlertCircle size={20} className={`${report.issue === 'Crowd' ? 'text-yellow-600 dark:text-yellow-500' : report.issue === 'Delay' ? 'text-red-500' : 'text-purple-500'}`} />
                      <p className="text-slate-700 dark:text-slate-200 font-medium">
                        <span className={`font-black uppercase tracking-wide ${report.issue === 'Crowd' ? 'text-yellow-600 dark:text-yellow-500' : report.issue === 'Delay' ? 'text-red-500' : 'text-purple-500'}`}>
                          {report.issue}
                        </span> reported here.
                      </p>
                    </div>
                    {report.details && (
                      <div className="ml-8 px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold flex items-center gap-2 self-start animate-fade-in shadow-sm">
                        <span className="opacity-80">SPECIFICS:</span> {report.details}
                      </div>
                    )}
                  </div>

                  {/* Message Display & Edit Box */}
                  {editingId === report._id ? (
                    <div className="pt-2 animate-fade-in flex flex-col gap-2">
                      <textarea
                        autoFocus
                        value={editMessageText}
                        onChange={(e) => setEditMessageText(e.target.value)}
                        placeholder="Add a custom alert or update..."
                        className="w-full p-3 rounded-xl bg-white/50 dark:bg-black/30 border border-blue-200 dark:border-blue-900 focus:border-blue-500 outline-none transition-all text-slate-800 dark:text-slate-200 text-sm resize-none"
                        rows="2"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingId(null)} className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button onClick={() => handleUpdateMessage(report._id)} className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white transition-colors flex items-center gap-1"><Check size={14} /> Save</button>
                      </div>
                    </div>
                  ) : (
                    report.message && (
                      <div className="mt-2 p-3 bg-blue-50/80 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-xl flex items-start gap-3">
                        <MessageSquare size={16} className="text-blue-500 mt-0.5 shrink-0" />
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">{report.message}</p>
                      </div>
                    )
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div
                      onClick={() => onViewProfile(report.userId?._id)}
                      className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-all"
                    >
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-tight transition-colors">Source:</span>
                      <div className="w-5 h-5 rounded-full overflow-hidden border border-black/5 dark:border-white/10 bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 shadow-sm group-hover:border-blue-500/50 transition-all">
                        {report.userId?.profileImg ? (
                          <img src={report.userId.profileImg} className="w-full h-full object-cover" alt="Source" />
                        ) : (
                          <div className="text-slate-400 dark:text-slate-600">
                            <UserIcon size={10} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 font-bold truncate max-w-[120px] sm:max-w-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {report.userId?.name || 'Anonymous Commuter'}
                      </p>
                    </div>

                    {/* Author Controls */}
                    {user && (user.id === report.userId?._id || user._id === report.userId?._id) && !editingId && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditingId(report._id); setEditMessageText(report.message || ''); }} className="p-1.5 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors" title="Edit Message">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(report._id)} className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-white/50 dark:hover:bg-white/10 rounded-lg transition-colors" title="Delete Post">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col border-l border-black/5 dark:border-white/10 pl-4 md:pl-6 justify-center items-center gap-3">
                  <button
                    onClick={() => handleUpvote(report._id)}
                    className="flex flex-col items-center justify-center gap-1.5 w-16 h-20 md:w-20 md:h-24 rounded-2xl bg-white/60 hover:bg-white dark:bg-white/5 dark:hover:bg-white/10 shadow-sm border border-black/5 dark:border-white/10 transition-all text-blue-600 dark:text-blue-400 hover:border-blue-500/30 dark:hover:border-blue-400/30 group-hover:scale-105 active:scale-95"
                  >
                    <ShieldCheck size={24} className="text-slate-400 md:w-7 md:h-7 group-hover:text-blue-500 dark:text-slate-500 dark:group-hover:text-blue-400 transition-colors" />
                    <span className="font-black text-xl md:text-2xl leading-none text-slate-800 dark:text-white">{report.upvotes || 0}</span>
                    <span className="text-[9px] md:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider">Verify</span>
                  </button>

                  <button
                    onClick={() => handleFake(report._id)}
                    className="flex flex-col items-center justify-center gap-1 w-16 h-14 md:w-20 md:h-16 rounded-xl bg-red-50/50 hover:bg-red-50 dark:bg-red-500/5 dark:hover:bg-red-500/10 border border-red-100/50 dark:border-red-500/10 transition-all text-red-500 hover:text-red-600 hover:border-red-200 dark:hover:border-red-500/30 group-hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <XCircle size={18} className="md:w-5 md:h-5 opacity-80" />
                    <span className="font-bold text-sm md:text-base leading-none">{report.fakeVotes || 0}</span>
                    <span className="text-[8px] md:text-[9px] uppercase font-bold tracking-wider opacity-80">Fake</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="w-full max-w-lg p-8 bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl shadow-2xl space-y-6"
          >
            <h3 className="text-3xl font-black text-slate-800 dark:text-white">New Report</h3>
            <p className="text-slate-500 dark:text-slate-400 -mt-2">Help fellow commuters by sharing accurate updates.</p>

            <form onSubmit={handleSubmit} className="space-y-5 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Line</label>
                  <select
                    className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                    onChange={(e) => setNewReport({ ...newReport, line: e.target.value, station: STATION_DATA[e.target.value][0] })}
                  >
                    <option value="WesternLine" className="dark:bg-slate-800">Western Line</option>
                    <option value="CentralLine" className="dark:bg-slate-800">Central Line</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Station</label>
                  <select
                    className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none"
                    value={newReport.station}
                    onChange={(e) => setNewReport({ ...newReport, station: e.target.value })}
                  >
                    {STATION_DATA[newReport.line].map(s => (
                      <option key={s} value={s} className="dark:bg-slate-800">{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">What's the issue?</label>
                <div className="grid grid-cols-3 gap-3">
                  {ISSUE_TYPES.map(i => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setNewReport({ ...newReport, issue: i })}
                      className={`py-3 rounded-xl border-2 transition-all font-bold shadow-sm text-sm ${newReport.issue === i ? 'bg-gradient-to-br from-blue-500 to-indigo-600 border-transparent text-white scale-105' : 'bg-white dark:bg-transparent border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>

              {newReport.issue === 'Platform Change' && (
                <div className="grid grid-cols-2 gap-4 animate-fade-in py-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">From PF</label>
                    <select
                      className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none shadow-sm"
                      value={newReport.fromPF}
                      onChange={(e) => setNewReport({ ...newReport, fromPF: e.target.value })}
                    >
                      {PLATFORM_LIST.map(p => (
                        <option key={p} value={p} className="dark:bg-slate-800">{p}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">To PF</label>
                    <select
                      className="w-full p-4 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 focus:border-blue-500 outline-none transition-all text-slate-900 dark:text-white font-medium appearance-none shadow-sm"
                      value={newReport.toPF}
                      onChange={(e) => setNewReport({ ...newReport, toPF: e.target.value })}
                    >
                      {PLATFORM_LIST.map(p => (
                        <option key={p} value={p} className="dark:bg-slate-800">{p}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-bold transition-all shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold transition-all shadow-lg text-white"
                >
                  Post Update
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete this report?"
        message="This action is permanent and will remove the report from all commuters' feeds instantly."
      />
    </div>
  );
};

export default Dashboard;
