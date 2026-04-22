import React, { useState, useEffect, useRef } from 'react';
import { Menu, Bell, Check, ExternalLink, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService, Notification } from '../services/notificationService';

const TopBar = () => {
  const { user } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        await notificationService.generateAutoNotifications(user.id);
        const data = await notificationService.getNotifications(user.id);
        setNotifications(Array.isArray(data) ? data : []);
      }
    };
    fetchNotifications();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

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
    <header className="flex justify-between items-center px-6 py-4 bg-transparent sticky top-0 z-[60]">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden p-1 text-text-muted hover:text-primary transition-colors"
          aria-label="Open side menu"
        >
          <Menu />
        </button>
        <h1 className="text-xl font-bold text-text-main">
          Academic Dashboard
        </h1>
      </div>
      <div className="flex items-center gap-6">
        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
          className="p-2 text-text-muted hover:text-primary transition-colors"
          aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {resolvedTheme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 text-text-muted hover:text-primary transition-colors relative"
            aria-label={`View notifications, ${unreadCount} unread`}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-background">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden z-[100]"
              >
                <div className="px-4 py-3 bg-slate-50 border-b border-border flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-widest text-text-main">System Alerts</h4>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllRead}
                      className="text-[10px] font-bold text-primary hover:underline uppercase"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center bg-white">
                       <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                       <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest">No notifications yet</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {notifications.slice(0, 5).map((n) => (
                        <div 
                          key={n.id} 
                          className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 relative group ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                        >
                          {!n.read && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>}
                          <div className={`w-8 h-8 rounded-lg flex-shrink-0 items-center justify-center flex ${
                            n.type === 'attendance' ? 'bg-red-50 text-danger' : 
                            n.type === 'assignment' ? 'bg-amber-50 text-warning' : 
                            'bg-indigo-50 text-primary'
                          }`}>
                            <Bell size={14} />
                          </div>
                          <div className="space-y-1 pr-6">
                            <p className={`text-[11px] font-bold leading-tight ${!n.read ? 'text-text-main' : 'text-text-muted'}`}>{n.title}</p>
                            <p className="text-[10px] text-text-muted font-medium line-clamp-2">{n.message}</p>
                            <p className="text-[9px] text-text-muted uppercase font-black">{new Date(n.date).toLocaleDateString()}</p>
                          </div>
                          {!n.read && (
                            <button 
                              onClick={() => handleMarkRead(n.id)}
                              className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary"
                              title="Mark as read"
                            >
                              <Check size={14} strokeWidth={4} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Link 
                  to="/notifications" 
                  onClick={() => setShowNotifications(false)}
                  className="px-4 py-3 bg-slate-50 border-t border-border flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary transition-colors"
                >
                  See All Notifications <ExternalLink size={12} />
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
            </div>
            <span className="text-sm font-semibold text-text-main hidden sm:block">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
