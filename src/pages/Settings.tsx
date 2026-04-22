import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User, Bell, Shield, Moon, Save, Trash2, Download, UploadCloud, RotateCcw, AlertTriangle, Monitor, Sun, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { dataService, UserData } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      if (user) {
        const userData = await dataService.getUserData(user.id);
        if (userData.settings) {
          setNotifications(userData.settings.notifications ?? true);
        }
      }
    };
    loadSettings();
  }, [user]);

  const handleSave = async () => {
    if (user) {
      setSubmitting(true);
      try {
        const userData = await dataService.getUserData(user.id);
        const newSettings = { ...(userData.settings || {}), notifications, theme };
        await dataService.updateSection(user.id, 'settings', newSettings);
        showToast('Settings saved successfully', 'success');
      } catch (err) {
        showToast('Failed to save settings', 'error');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleExport = async () => {
    if (!user) return;
    try {
      const data = await dataService.getUserData(user.id);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smarttracker_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast('Data exported successfully!', 'success');
    } catch (err) {
      showToast('Failed to export data.', 'error');
    }
  };

  const onImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setPendingImportFile(e.target.files[0]);
    setShowImportConfirm(true);
  };

  const confirmImport = async () => {
    if (!user || !pendingImportFile) return;
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (!json.subjects && !json.assignments) {
          throw new Error('Invalid backup file');
        }

        const cleanData: Partial<UserData> = {
          subjects: json.subjects || [],
          timetable: json.timetable || [],
          assignments: json.assignments || [],
          faculty: json.faculty || [],
          practicals: json.practicals || [],
          settings: json.settings || {},
          timetableMetadata: json.timetableMetadata || {},
          streak: json.streak || 0,
          plan: json.plan || 'free'
        };

        await dataService.setUserData(user.id, cleanData);
        showToast('Data imported! Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showToast('Invalid or corrupt backup file.', 'error');
      }
    };
    reader.readAsText(pendingImportFile);
    setPendingImportFile(null);
    setShowImportConfirm(false);
  };

  const confirmClearData = async () => {
    if (!user) return;
    try {
      await dataService.setUserData(user.id, {
        subjects: [],
        timetable: [],
        assignments: [],
        faculty: [],
        practicals: [],
        streak: 0,
        timetableMetadata: {}
      });
      showToast('Data reset! Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      showToast('Failed to reset data', 'error');
    } finally {
      setShowResetConfirm(false);
    }
  };

  return (
    <Layout>
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-black text-text-main tracking-tight">App Settings</h2>
          <div className="px-2 py-0.5 bg-indigo-50 text-primary rounded text-[10px] font-black uppercase">Local Storage</div>
        </div>
        <p className="text-text-muted text-sm font-medium">Manage your academic preferences and local data backups.</p>
      </header>

      <div className="max-w-2xl space-y-6 mb-12">
        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-slate-50/50 flex items-center gap-2">
            <User size={18} className="text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-text-main">Student Profile</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Full Name</label>
                <div className="px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm text-text-main font-bold">
                  {user?.name}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest">Login Identity</label>
                <div className="px-3 py-2 bg-slate-50 border border-border rounded-lg text-sm text-text-main font-bold">
                  {user?.email}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-slate-50/50 flex items-center gap-2">
            <Bell size={18} className="text-primary" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-text-main">Preferences</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Attendance Notifications</p>
                <p className="text-xs text-text-muted font-medium">Auto-reminders to log your presence after every lecture.</p>
              </div>
              <button 
                onClick={() => setNotifications(!notifications)}
                className={`w-10 h-5 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-slate-300'}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full shadow-sm transition-all ${notifications ? 'left-6' : 'left-1'}`} />
              </button>
            </div>
            <div className="flex flex-col gap-4 border-t border-border pt-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Display Theme</p>
                <p className="text-xs text-text-muted font-medium">Select a theme that matches your focus level.</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'light', label: 'Light', icon: Sun },
                  { id: 'dark', label: 'Dark', icon: Moon },
                  { id: 'system', label: 'System', icon: Monitor }
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTheme(t.id as any)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      theme === t.id 
                        ? 'bg-primary/10 border-primary text-primary shadow-sm' 
                        : 'bg-slate-50 border-border text-text-muted hover:border-primary/50'
                    }`}
                  >
                    <t.icon size={18} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <div className="p-4 border-b border-border bg-slate-50/50 flex items-center gap-2">
            <RotateCcw size={18} className="text-indigo-600" />
            <h3 className="font-bold text-sm uppercase tracking-widest text-text-main">Data & Backup</h3>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Export My Data</p>
                <p className="text-xs text-text-muted font-medium">Download a complete JSON snapshot of your subjects and logs.</p>
              </div>
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-indigo-50 text-primary border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2"
              >
                <Download size={14} /> Export Backup
              </button>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border pt-6">
              <div className="space-y-0.5">
                <p className="text-sm font-bold">Import Backup</p>
                <p className="text-xs text-text-muted font-medium">Restore your tracking data from a previous JSON export.</p>
              </div>
              <label className="px-4 py-2 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all flex items-center justify-center gap-2 cursor-pointer">
                <UploadCloud size={14} /> Import File
                <input 
                  type="file" 
                  accept=".json" 
                  className="hidden" 
                  onChange={onImportFileChange}
                />
              </label>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-border pt-6">
              <div className="space-y-0.5">
                <p className="text-sm font-bold text-danger">Reset All Data</p>
                <p className="text-xs text-text-muted font-medium">Wipe all your subjects and logs. Actions cannot be undone.</p>
              </div>
              <button 
                onClick={() => setShowResetConfirm(true)}
                className="px-4 py-2 bg-red-50 text-danger border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2"
              >
                <Trash2 size={14} /> Wipe Everything
              </button>
            </div>
          </div>
        </section>

        <ConfirmModal 
          isOpen={showResetConfirm}
          onClose={() => setShowResetConfirm(false)}
          onConfirm={confirmClearData}
          title="Reset All Data"
          message="Are you sure you want to clear all your tracking data? This will permanently delete all subjects, timetable entries, and assignments. Your account and settings will be preserved."
          confirmText="Wipe All Data"
          isDangerous={true}
        />

        <ConfirmModal 
          isOpen={showImportConfirm}
          onClose={() => { setShowImportConfirm(false); setPendingImportFile(null); }}
          onConfirm={confirmImport}
          title="Import Data Backup"
          message="Are you sure you want to import this backup file? This will replace ALL your current subjects, timetable, and assignments with the data in the backup. This action cannot be undone."
          confirmText="Import Data"
          isDangerous={true}
        />

        <div className="flex items-center gap-4 pt-4 pb-12">
          <button 
            onClick={handleSave}
            disabled={submitting}
            className="px-8 py-3 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:opacity-90 transition-all active:scale-95 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
          >
            {submitting ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />} Update Settings
          </button>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
