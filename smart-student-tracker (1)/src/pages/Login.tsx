import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      showToast('Welcome back!', 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message || 'Login failed');
      showToast('Login failed: Invalid credentials', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background text-text-main min-h-screen flex items-center justify-center p-4">
      <main className="w-full max-w-4xl flex flex-col md:flex-row overflow-hidden rounded-xl shadow-xl bg-card border border-border">
        <section className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-background">
          <div className="mb-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">
              SmartTracker
            </span>
          </div>
          <div className="space-y-1 mb-8">
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Welcome back</h1>
            <p className="text-text-muted text-sm">Enter your credentials to access your dashboard.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2">
                <Mail size={14} /> Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                placeholder="alex@university.edu"
                required
              />
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2">
                  <Lock size={14} /> Password
                </label>
                <a href="#" className="text-[10px] font-bold text-primary hover:underline uppercase">Forgot?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-main"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full py-2 bg-primary text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Login'} <ArrowRight size={16} />
              </button>
              <Link
                to="/register"
                className="w-full py-2 bg-background text-text-main font-semibold rounded-lg border border-border hover:bg-slate-50 transition-all flex items-center justify-center text-sm"
              >
                Create Account
              </Link>
            </div>
          </form>
        </section>
        <section className="hidden md:flex w-1/2 relative bg-slate-50 overflow-hidden items-center justify-center border-l border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
          <div className="relative w-full h-full flex items-center justify-center p-8">
             <div className="bg-card p-6 rounded-xl shadow-sm max-w-xs space-y-4 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-primary px-2 py-0.5 bg-indigo-50 rounded-full uppercase">Insight</span>
                </div>
                <p className="text-sm font-semibold text-text-main leading-tight">
                  "This system turned my academic chaos into a focused masterpiece."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">A</div>
                  <div>
                    <p className="text-xs font-bold">Alex Rivers</p>
                    <p className="text-[10px] text-text-muted">Senior CS Student</p>
                  </div>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Login;
