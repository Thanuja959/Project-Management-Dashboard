import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useDataStore } from '@/store/dataStore';
import { useToast } from '@/components/ui/Toast';
import { CheckSquare, Eye, EyeOff, Mail, Lock, Loader2, Shield, User } from 'lucide-react';
import { motion } from 'framer-motion';

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, clearError } = useAuthStore();
  const { users } = useDataStore();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = 'Invalid email format';
    if (!password.trim()) errs.password = 'Password is required';
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setErrors({});
    const success = await login(email, password);
    if (success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    }
  };

  const fillDemo = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('thanujatanu66@gmail.com');
       const admin = users.find(
      (user) => user.email === 'thanujatanu66@gmail.com'
    );

    setPassword(admin?.password || 'admin123');
    } else {
      setEmail('user@example.com');
      setPassword('user123');
    }
    clearError();
    setErrors({});
  };

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      {/* Left panel */}
      <div className="relative flex flex-1 flex-col justify-between bg-slate-900 p-8 text-white lg:p-12">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
          <div className="absolute -bottom-20 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative">
          <div className="flex items-center gap-2.5">
           <div className="flex h-[60px] w-[60px] items-center justify-center rounded-xl backdrop-blur">
          <img
        src="/images/logo.png"
        alt="FlowBoard Logo"
        className="h-[60px] w-[60px] object-contain"
           />
         </div>
            <span className="text-3xl font-bold tracking-tight">FlowBoard</span>
          </div>
        </div>
        <div className="relative max-w-md">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold leading-tight lg:text-4xl"
          >
            Project management that keeps your team in flow.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-slate-300"
          >
            Plan projects, track tasks, visualize progress, and keep everyone aligned — all in one workspace.
          </motion.p>
          <div className="mt-8 space-y-3">
            {['Kanban boards with drag-and-drop', 'Real-time analytics & dashboards', 'Role-based access control'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                  <CheckSquare className="h-3 w-3 text-emerald-400" />
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
        <div className="relative text-xs text-slate-400">© 2026 FlowBoard. All rights reserved.</div>
      </div>

      {/* Right panel - login form */}
      <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 dark:bg-slate-950 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm"
        >
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Welcome back</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Sign in to your account to continue.</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`input pl-9 ${errors.email ? 'border-rose-500' : ''}`}
                />
              </div>
              {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={`input px-9 ${errors.password ? 'border-rose-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-800 focus:ring-slate-400 dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-600 dark:text-slate-400">Remember me</span>
              </label>
            </div>

            {error && (
              <div className="rounded-lg bg-rose-50 px-3 py-2.5 text-sm text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-8 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Demo Credentials</p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemo('admin')}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-2.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Admin</p>
                  <p className="text-xs text-slate-400">thanujatanu66@gmail.com</p>
                </div>
              </button>
              {/* <button
                onClick={() => fillDemo('user')}
                className="flex w-full items-center gap-3 rounded-lg border border-slate-200 p-2.5 text-left transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
                  <User className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">User</p>
                  <p className="text-xs text-slate-400">user@example.com / user123</p>
                </div>
              </button> */}
            </div>
            <p className="mt-3 text-xs text-slate-400">Click a card to auto-fill credentials.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
