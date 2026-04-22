import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Bell, Filter, CheckCircle2, Calendar, FileText, Trash2, CheckSquare } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { notificationService, Notification } from '../services/notificationService';

const NotificationCenter = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<'all' | 'attendance' | 'assignment' | 'timetable'>('all');

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        const data = await notificationService.getNotifications(user.id);
        setNotifications(Array.isArray(data) ? data : []);
      }
    };
    fetchNotifications();
  }, [user]);

  const filteredNotifications = notifications.filter(n => filter === 'all' || n.type === filter);

  const handleMarkRead = async (id: string) => {
    if (user) {
      await notificationService.markAsRead(user.id, id);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    }
  };

  const handleMarkAllRead = async () => {
    if (user) {
      await notificationService.markAllAsRead(user.id);
      const data = await notificationService.getNotifications(user.id);
      setNotifications(Array.isArray(data) ? data : []);
    }
  };

  return (
    <Layout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
            <Bell className="text-primary" size={24} /> Notification Center
          </h2>
          <p className="text-sm text-text-muted font-medium">Keep track of your academic alerts and daily reminders.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleMarkAllRead}
            className="px-4 py-2 bg-indigo-50 text-primary border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center gap-2"
          >
            <CheckSquare size={14} /> Mark All as Read
          </button>
        </div>
      </header>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {(['all', 'attendance', 'assignment', 'timetable'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${
              filter === t 
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
                : 'bg-card text-text-muted border-border hover:border-primary/30'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="max-w-4xl space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="py-20 text-center bg-card rounded-3xl border border-border border-dashed">
            <Bell size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">No notifications in this category</p>
          </div>
        ) : (
          filteredNotifications.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 rounded-3xl border transition-all flex items-start gap-6 relative group ${
                !n.read 
                  ? 'bg-card border-primary shadow-xl shadow-primary/5 ring-1 ring-primary/10' 
                  : 'bg-background opacity-70 border-border'
              }`}
            >
              <div className={`p-4 rounded-2xl flex-shrink-0 ${
                n.type === 'attendance' ? 'bg-red-50 text-danger' : 
                n.type === 'assignment' ? 'bg-amber-50 text-warning' : 
                'bg-indigo-50 text-primary'
              }`}>
                {n.type === 'attendance' && <CheckCircle2 size={24} />}
                {n.type === 'assignment' && <FileText size={24} />}
                {n.type === 'timetable' && <Calendar size={24} />}
              </div>
              
              <div className="flex-1 space-y-1 pr-12">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    n.type === 'attendance' ? 'text-danger' : 
                    n.type === 'assignment' ? 'text-warning' : 
                    'text-primary'
                  }`}>{n.type} ALERT</span>
                  <span className="text-[10px] text-text-muted font-bold">•</span>
                  <span className="text-[10px] text-text-muted font-bold">{new Date(n.date).toLocaleString()}</span>
                </div>
                <h4 className={`text-lg font-bold leading-tight ${!n.read ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</h4>
                <p className="text-sm text-text-muted font-medium leading-relaxed">{n.message}</p>
              </div>

              {!n.read && (
                <button 
                  onClick={() => handleMarkRead(n.id)}
                  className="absolute right-6 top-6 p-2 bg-indigo-50 text-primary rounded-xl hover:bg-primary hover:text-white transition-all shadow-sm"
                  title="Mark as read"
                >
                  <CheckSquare size={18} />
                </button>
              )}
            </motion.div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default NotificationCenter;
