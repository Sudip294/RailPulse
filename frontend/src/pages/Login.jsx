import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axios';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = ({ switchToSignup, switchToForgot }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { data } = await API.post('/auth/login', form);
      login(data);
      toast.success('Welcome back! ✅');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed ❌');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-md mx-auto p-8 backdrop-blur-[12px] bg-white/70 dark:bg-slate-900/60 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)] border border-white/20 dark:border-white/10 rounded-3xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Welcome Back</h2>
        <p className="text-sm text-slate-400 mt-2">Log in to track Mumbai's pulse.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="email"
            placeholder="Email Address"
            className="w-full pl-12 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full pl-12 pr-12 p-4 rounded-xl bg-slate-100/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 outline-none focus:border-blue-500 transition-all text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-400"
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        <div className="flex justify-end px-1">
          <button
            type="button"
            onClick={switchToForgot}
            className="text-xs font-semibold text-blue-500 hover:underline"
          >
            Forgot Password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold transition-all disabled:opacity-50 text-white shadow-lg mt-4"
        >
          {isSubmitting ? 'Logging In...' : 'Log In'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-500 dark:text-slate-400 text-sm">
        Don't have an account? <button onClick={switchToSignup} className="text-blue-500 font-bold hover:underline">Sign Up</button>
      </p>
    </motion.div>
  );
};

export default Login;
