import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import PWAManager from '../components/PWAManager';
import { 
  BookOpen, 
  Calendar, 
  FileText, 
  Zap, 
  CheckCircle, 
  BarChart3, 
  ArrowRight, 
  ShieldCheck,
  Check,
  Smartphone,
  Globe,
  Star
} from 'lucide-react';

const LandingPage = () => {
  const plans = [
    {
      id: 'free',
      name: 'Free Plan',
      price: '$0',
      description: 'The essential toolkit for every student starting their journey.',
      features: [
        'Max 3 subjects tracking',
        'Basic weekly timetable',
        'Manual attendance marking',
        'Standard assignments list',
      ],
      cta: 'Get Started',
      color: 'slate',
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: '$9',
      description: 'Master your schedule with advanced tools and smart insights.',
      features: [
        'Unlimited subjects',
        'PDF/Image/Excel Timetable upload',
        'Smart attendance insights',
        'Advanced schedule prediction',
        'Priority feature access',
      ],
      cta: 'Go Pro',
      color: 'indigo',
      popular: true,
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: '$19',
      description: 'The ultimate academic powerhouse with AI-driven strategy.',
      features: [
        'Everything in Pro',
        'Advanced academic analytics',
        'AI-based study suggestions',
        'Custom dashboard themes',
        'Early access to new modules',
      ],
      cta: 'Go Premium',
      color: 'amber',
    },
  ];

  return (
    <div className="min-h-screen bg-background text-text-main font-sans selection:bg-primary/20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] bg-background/80 backdrop-blur-md border-b border-border px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <BookOpen className="text-white" size={18} />
            </div>
            <span className="text-lg font-bold text-primary tracking-tight">
              SmartTracker
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">Features</a>
            <a href="#pricing" className="text-sm font-semibold text-text-muted hover:text-primary transition-colors">Pricing</a>
            <Link to="/login" className="text-sm font-bold text-primary hover:opacity-80 transition-opacity">Login</Link>
            <Link 
              to="/register" 
              className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all active:scale-95"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-primary rounded-full border border-indigo-100"
            >
              <Zap size={14} className="fill-primary" />
              <span className="text-[10px] font-black uppercase tracking-widest">Version 2.0 is live</span>
            </motion.div>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-black text-text-main leading-[1.1] tracking-tight"
            >
              Smart Student Tracker for <span className="text-primary italic">Attendance,</span> Timetable & Productivity
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-text-muted font-medium max-w-lg leading-relaxed"
            >
              Optimize your academic life with our intelligent engine. Track attendance, manage dynamic timetables, and crush your assignments with ease.
            </motion.p>
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Link
                to="/register"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold text-base shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Get Started Now <ArrowRight size={20} />
              </Link>
              <a
                href="#preview"
                className="w-full sm:w-auto px-8 py-4 bg-card text-text-main border border-border rounded-2xl font-bold text-base hover:bg-background transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                View Demo
              </a>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-4 pt-4"
            >
              <div className="flex -space-x-2">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200">
                    <img 
                      src={`https://picsum.photos/seed/user${i}/100/100`} 
                      className="w-full h-full rounded-full" 
                      alt={`User avatar ${i}`}
                      referrerPolicy="no-referrer" 
                    />
                  </div>
                ))}
              </div>
              <div className="text-xs font-bold text-text-muted">
                <span className="text-primary">5,000+</span> students already tracking
              </div>
            </motion.div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring', damping: 20 }}
              className="bg-card rounded-[2.5rem] p-1 border border-border/50 shadow-2xl relative overflow-hidden"
            >
              <img 
                src="https://picsum.photos/seed/dashboard-preview/1200/800" 
                alt="Dashboard Preview" 
                className="rounded-[2.2rem] w-full shadow-inner border border-border/20"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center border border-white/30 cursor-pointer hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1" />
              </div>
            </motion.div>
            
            {/* Floating UI cards for effect */}
            <motion.div 
               animate={{ y: [0, -10, 0] }}
               transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute -top-10 -right-10 bg-card p-4 rounded-3xl shadow-xl border border-border max-w-[180px] hidden lg:block"
            >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-success"></div>
                  <span className="text-[10px] font-black uppercase tracking-tight">85% Attendance</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-success w-[85%] h-full rounded-full"></div>
                </div>
            </motion.div>
            <motion.div 
               animate={{ y: [0, 10, 0] }}
               transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
               className="absolute -bottom-10 -left-10 bg-card p-4 rounded-3xl shadow-xl border border-border max-w-[180px] hidden lg:block"
            >
                <div className="flex items-center gap-2 mb-2">
                  <Zap size={14} className="text-warning fill-warning" />
                  <span className="text-[10px] font-black uppercase tracking-tight">12 Day Streak</span>
                </div>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(i => <div key={i} className="w-3 h-3 bg-indigo-50 rounded-sm"></div>)}
                </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 bg-background border-y border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Powerful Core</h2>
            <h3 className="text-3xl md:text-4xl font-black text-text-main">Everything you need to <span className="text-primary italic">excel.</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Attendance Intelligence',
                description: 'Smart insights on bunks and needed classes. Stay above 75% without the stress.',
                icon: <CheckCircle className="text-success" size={24} />,
                color: 'success'
              },
              {
                title: 'Smart Timetable',
                description: 'Upload PDF/Images and let our engine structure your week automatically.',
                icon: <Calendar className="text-primary" size={24} />,
                color: 'primary'
              },
              {
                title: 'Assignment Tracker',
                description: 'Never miss a deadline. Organize by priority and keep your academic record clean.',
                icon: <FileText className="text-warning" size={24} />,
                color: 'warning'
              },
              {
                title: 'Daily Smart Plan',
                description: 'A personalized daily roadmap generated based on your attendance and tasks.',
                icon: <Zap className="text-indigo-600" size={24} />,
                color: 'indigo'
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-card p-8 rounded-[2rem] border border-border shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all"
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-${feature.color}/5`}>
                  {feature.icon}
                </div>
                <h4 className="text-lg font-bold text-text-main mb-3">{feature.title}</h4>
                <p className="text-sm text-text-muted leading-relaxed font-medium">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Preview Section */}
      <section id="preview" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="w-full lg:w-1/2 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-text-main leading-tight">A Dashboard designed for <span className="text-primary">Focus.</span></h2>
              <p className="text-lg text-text-muted leading-relaxed">
                We stripped away the clutter to give you the data that actually matters. See your overall status in one glance and take action instantly.
              </p>
              <div className="space-y-4">
                {[
                  { icon: <Smartphone size={18} />, text: 'Mobile responsive for on-the-go tracking' },
                  { icon: <Globe size={18} />, text: 'Cloud synced across all your devices' },
                  { icon: <ShieldCheck size={18} />, text: 'Privacy focused and secure' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm font-bold text-text-main">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center border border-border">
                      {item.icon}
                    </div>
                    {item.text}
                  </div>
                ))}
              </div>
            </div>
            <div className="w-full lg:w-1/2 grid grid-cols-2 gap-4">
               <div className="bg-card p-6 rounded-3xl border border-border shadow-xl space-y-4">
                  <div className="text-[10px] uppercase font-black text-text-muted tracking-widest">Attendance</div>
                  <div className="text-3xl font-black">78.5%</div>
                  <div className="text-[10px] px-2 py-1 bg-success/10 text-success rounded-full font-bold inline-block">On Track</div>
               </div>
               <div className="bg-card p-6 rounded-3xl border border-border shadow-xl space-y-4 mt-8">
                  <div className="text-[10px] uppercase font-black text-text-muted tracking-widest">Assignments</div>
                  <div className="text-3xl font-black">12</div>
                  <div className="text-[10px] px-2 py-1 bg-warning/10 text-warning rounded-full font-bold inline-block">3 Overdue</div>
               </div>
               <div className="bg-primary text-white p-6 rounded-3xl border border-primary shadow-xl shadow-primary/20 space-y-4">
                  <div className="text-[10px] uppercase font-black text-white/70 tracking-widest">Study Streak</div>
                  <div className="text-3xl font-black">07 Days</div>
                  <Zap className="fill-white/20 text-white" />
               </div>
               <div className="bg-card p-6 rounded-3xl border border-border shadow-xl space-y-4 mt-8">
                  <div className="text-[10px] uppercase font-black text-text-muted tracking-widest">At Risk</div>
                  <div className="text-3xl font-black text-danger">02</div>
                  <div className="text-[10px] px-2 py-1 bg-danger/10 text-danger rounded-full font-bold inline-block">Needs Attention</div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 bg-background border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Flexible Access</h2>
            <h3 className="text-3xl font-black text-text-main">Choose your path to <span className="text-primary">mastery.</span></h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, idx) => (
              <motion.div
                key={plan.id}
                whileHover={{ y: -8 }}
                className={`relative bg-card rounded-[2.5rem] p-8 border-2 transition-all flex flex-col ${
                  plan.popular 
                    ? 'border-primary ring-4 ring-primary/10 shadow-2xl' 
                    : 'border-border hover:border-primary/30 shadow-xl'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                   <h4 className="text-xl font-bold text-text-main mb-2">{plan.name}</h4>
                   <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-text-main">{plan.price}</span>
                      <span className="text-text-muted text-xs font-bold font-sans">/month</span>
                   </div>
                </div>
                
                <p className="text-[11px] text-text-muted font-bold leading-relaxed mb-8">
                  {plan.description}
                </p>

                <div className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3">
                      <Check className="text-success mt-0.5" size={14} strokeWidth={4} />
                      <span className="text-[11px] font-bold text-text-main leading-tight">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to="/register"
                  className={`w-full py-4 rounded-2xl font-bold text-xs text-center transition-all ${
                    plan.popular
                      ? 'bg-primary text-white shadow-xl shadow-primary/20 hover:opacity-90'
                      : 'bg-slate-50 text-text-main border border-border hover:bg-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-border bg-background text-center">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-12">
           <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-sm">
                <BookOpen className="text-white" size={18} />
              </div>
              <span className="text-lg font-bold text-primary tracking-tight">
                SmartTracker
              </span>
           </div>
           
           <div className="flex items-center gap-12">
             <Link to="/login" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Login</Link>
             <Link to="/pricing" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Pricing</Link>
             <a href="#" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Terms</a>
             <a href="#" className="text-sm font-bold text-text-muted hover:text-primary transition-colors">Privacy</a>
           </div>

           <div className="space-y-4">
             <div className="flex items-center gap-4">
               {[1,2,3].map(i => (
                 <a key={i} href="#" className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-primary hover:border-primary transition-all">
                    <Star size={16} />
                 </a>
               ))}
             </div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
               Built for thinkers. designed for doers.
             </p>
             <p className="text-[10px] text-text-muted">© 2026 SmartTracker Engine. All rights reserved.</p>
           </div>
        </div>
      </footer>
      <PWAManager />
    </div>
  );
};

export default LandingPage;
