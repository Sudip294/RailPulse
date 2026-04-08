import { useState } from 'react';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, KeyRound, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const ForgotPassword = ({ switchToLogin }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await API.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset successfully! Please login.');
      switchToLogin();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto p-8 backdrop-blur-[12px] bg-white/70 dark:bg-slate-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/20 dark:border-white/10 rounded-3xl relative overflow-hidden"
    >
      <button 
        onClick={switchToLogin}
        className="absolute top-6 left-6 text-slate-400 hover:text-blue-500 transition-colors"
      >
        <ArrowLeft size={24} />
      </button>
      
      <div className="text-center mb-8 mt-4">
        <h2 className="text-3xl font-bold">Reset Password</h2>
        <p className="text-sm text-slate-400 mt-2">
          {step === 1 ? "Enter your email to receive a secure OTP." : "Enter the OTP and your new password."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form 
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleSendOTP} 
            className="space-y-4"
          >
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full pl-12 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold transition-all disabled:opacity-50 text-white shadow-lg"
            >
              {isSubmitting ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </motion.form>
        ) : (
          <motion.form 
            key="step2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleResetPassword} 
            className="space-y-4"
          >
             <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
               <input
                type="text"
                placeholder="6-Digit OTP"
                className="w-full pl-12 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white tracking-widest font-mono font-bold placeholder:text-slate-500 dark:placeholder:text-slate-400"
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New Password"
                className="w-full pl-12 pr-12 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold transition-all disabled:opacity-50 text-white shadow-lg flex justify-center mt-6"
            >
              {isSubmitting ? 'Resetting...' : 'Reset Password'}
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ForgotPassword;
