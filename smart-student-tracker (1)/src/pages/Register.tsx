import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dataService } from '../services/dataService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

    if (!name.trim() || !email.trim() || !password.trim()) {
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: name });
      
      // Initialize Firestore document
      await dataService.initUser(userCredential.user.uid, {
        name,
        email,
        plan: 'free'
      });

      showToast('Registration successful! Welcome, ' + name, 'success');
      navigate('/dashboard');
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Registration failed');
      showToast('An unexpected error occurred during registration', 'error');
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
            <h1 className="text-2xl font-bold text-text-main tracking-tight">Join the sanctuary.</h1>
            <p className="text-text-muted text-sm">Create your account to start tracking your academic mastery.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-2.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold border border-red-100">{error}</div>}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2">
                <User size={14} /> Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                placeholder="Alex Rivers"
                required
              />
            </div>
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
              <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-2">
                <Lock size={14} /> Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-3 pt-2">
              <button
                type="submit"
                disabled={loading || !name || !email || !password}
                className="w-full py-2 bg-primary text-white font-bold rounded-lg shadow-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : 'Create Account'} <ArrowRight size={16} />
              </button>
              <Link
                to="/login"
                className="w-full py-2 bg-background text-text-main font-semibold rounded-lg border border-border hover:bg-slate-50 transition-all flex items-center justify-center text-sm"
              >
                Already have an account? Login
              </Link>
            </div>
          </form>
        </section>
        <section className="hidden md:flex w-1/2 relative bg-slate-50 overflow-hidden items-center justify-center border-l border-border">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10"></div>
          <div className="relative w-full h-full flex items-center justify-center p-8 text-center">
             <div className="max-w-xs">
                <h2 className="text-xl font-bold text-text-main mb-2">Master your schedule.</h2>
                <p className="text-text-muted text-sm">
                  Join thousands of students who have optimized their academic life with our smart tracking engine.
                </p>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Register;
