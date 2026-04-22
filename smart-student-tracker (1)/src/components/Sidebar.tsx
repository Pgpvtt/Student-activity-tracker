import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, BookOpen, FileText, Settings, LogOut, Menu, School, Calendar, Users, FlaskConical, Zap, ShieldAlert, Bell, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Subjects', path: '/subjects', icon: BookOpen },
    { name: 'Timetable', path: '/timetable', icon: Calendar },
    { name: 'Analytics', path: '/analytics', icon: Activity },
    { name: 'Faculty', path: '/faculty', icon: Users },
    { name: 'Practicals', path: '/practicals', icon: FlaskConical },
    { name: 'Assignments', path: '/assignments', icon: FileText },
    { name: 'Groups', path: '/groups', icon: School },
    { name: 'Notifications', path: '/notifications', icon: Bell },
    { name: 'Pricing', path: '/pricing', icon: Zap },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  if (user?.email === 'admin@smarttracker.com') {
    navItems.splice(navItems.length - 1, 0, { name: 'Admin', path: '/admin', icon: ShieldAlert });
  }

  return (
    <aside className="hidden md:flex flex-col h-screen w-[200px] fixed left-0 top-0 bg-sidebar text-white py-5 z-50">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-extrabold tracking-tight text-[#818cf8]">SmartTracker</h2>
      </div>
      <nav className="flex-1">
        <ul className="space-y-0">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                to={item.path}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-white/10 text-white border-l-4 border-primary'
                    : 'text-[#9ca3af] hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <button
        onClick={logout}
        className="flex items-center gap-3 px-6 py-3 text-[#9ca3af] hover:text-white text-sm font-medium mt-auto"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
};

export default Sidebar;
