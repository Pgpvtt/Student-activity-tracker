import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, BookOpen, Trash2, Palette, Loader2 } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Subjects = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  const [editingSubject, setEditingSubject] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({ subjectName: '', color: '#4f46e5', teacherName: '', type: 'Theory' });
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchSubjects();
  }, [user]);

  const fetchSubjects = async () => {
    if (!user) return;
    try {
      const userData = await dataService.getUserData(user.id);
      // Ensure subjects exists even if data is corrupt
      const rawSubjects = (userData.subjects || []);
      
      const userSubjects = rawSubjects.map((s: any) => {
        const attendance = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
        
        let safeBunks = 0;
        let neededClasses = 0;
        if (attendance >= 75) {
          safeBunks = Math.floor((s.attendedClasses - 0.75 * s.totalClasses) / 0.75);
        } else {
          neededClasses = Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25);
        }

        const riskLevel = attendance < 75 ? 'High' : attendance < 85 ? 'Medium' : 'Low';
        const recommendation = attendance < 75 ? 'Attend next class' : safeBunks > 0 ? 'Safe to skip' : 'Attend next class';

        return {
          ...s,
          insights: {
            attendance: attendance.toFixed(1),
            safeBunks,
            neededClasses,
            riskLevel,
            recommendation
          }
        };
      });
      setSubjects(userSubjects);
    } catch (err) {
      console.error('Error fetching subjects:', err);
      showToast('Error loading subjects', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newSubject.subjectName.trim()) {
      showToast('Subject name is required', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      
      if (editingSubject) {
        userData.subjects = (userData.subjects || []).map((s: any) => 
          s._id === editingSubject._id ? { ...s, ...newSubject } : s
        );
        showToast('Subject updated successfully', 'success');
      } else {
        const newSub = {
          _id: Date.now().toString(),
          userId,
          ...newSubject,
          totalClasses: 0,
          attendedClasses: 0
        };
        if (!userData.subjects) userData.subjects = [];
        userData.subjects.push(newSub);
        showToast('Subject added successfully', 'success');
      }
      
      await dataService.setUserData(userId, userData);
      
      setNewSubject({ subjectName: '', color: '#4f46e5', teacherName: '', type: 'Theory' });
      setShowAddModal(false);
      setEditingSubject(null);
      await fetchSubjects();
    } catch (err) {
      console.error('Error adding/updating subject:', err);
      showToast('Error saving subject', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (subject: any) => {
    setEditingSubject(subject);
    setNewSubject({
      subjectName: subject.subjectName,
      color: subject.color,
      teacherName: subject.teacherName || '',
      type: subject.type || 'Theory'
    });
    setShowAddModal(true);
  };

  const handleDeleteClick = (id: string) => {
    setSubjectToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !subjectToDelete) return;
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      userData.subjects = (userData.subjects || []).filter((s: any) => s._id !== subjectToDelete);
      await dataService.setUserData(userId, userData);
      showToast('Subject deleted successfully', 'success');
      await fetchSubjects();
    } catch (err) {
      showToast('Error deleting subject', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setSubjectToDelete(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-background"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Subjects</h2>
          <p className="text-text-muted text-sm">Manage your curriculum and track attendance.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> Add Subject
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subjects.map((sub) => (
          <motion.div
            key={sub._id}
            whileHover={{ y: -4 }}
            className={`bg-card rounded-2xl p-6 border border-border flex flex-col gap-5 shadow-sm relative overflow-hidden transition-all ${
              parseFloat(sub.insights.attendance) < 75 ? 'border-t-4 border-t-danger' : 
              parseFloat(sub.insights.attendance) > 85 ? 'border-t-4 border-t-success' : 'border-t-4 border-t-warning'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${sub.color}15`, color: sub.color }}>
                  <BookOpen size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base">{sub.subjectName}</h3>
                  <p className={`text-[10px] font-bold uppercase ${
                    sub.insights.riskLevel === 'High' ? 'text-danger' : sub.insights.riskLevel === 'Medium' ? 'text-warning' : 'text-success'
                  }`}>
                    {sub.insights.riskLevel} Risk
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openEditModal(sub)}
                  className="text-text-muted hover:text-primary transition-colors p-1"
                  aria-label={`Edit ${sub.subjectName}`}
                >
                  <Palette size={16} />
                </button>
                <button 
                  onClick={() => handleDeleteClick(sub._id)}
                  className="text-text-muted hover:text-danger transition-colors p-1"
                  aria-label={`Delete ${sub.subjectName}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <p className="text-[10px] font-bold text-text-muted uppercase">Faculty</p>
              <p className="text-sm font-bold text-text-main">{sub.teacherName || 'Not Assigned'}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-xl border border-border">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Safe Bunks</p>
                <p className="text-lg font-black text-success">{sub.insights.safeBunks}</p>
              </div>
              <div className="p-3 bg-background rounded-xl border border-border">
                <p className="text-[9px] font-bold text-text-muted uppercase tracking-wider mb-1">Need for 75%</p>
                <p className="text-lg font-black text-primary">{sub.insights.neededClasses}</p>
              </div>
            </div>

            <div className="space-y-2">
               <div className="flex justify-between text-[11px] font-bold">
                 <span className="text-text-muted">Attendance Progress</span>
                 <span className={parseFloat(sub.insights.attendance) < 75 ? 'text-danger' : 'text-text-main'}>
                   {sub.insights.attendance}%
                 </span>
               </div>
               <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-border">
                 <div 
                   className={`h-full rounded-full transition-all duration-500 ${parseFloat(sub.insights.attendance) < 75 ? 'bg-danger' : 'bg-success'}`} 
                   style={{ width: `${sub.insights.attendance}%` }}
                 ></div>
               </div>
            </div>

            <div className={`text-[10px] px-3 py-1.5 rounded-lg font-bold text-center border ${
              sub.insights.recommendation === 'Safe to skip' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {sub.insights.recommendation}
            </div>
          </motion.div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full py-24 text-center bg-card rounded-3xl border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/5 text-primary/40 rounded-full flex items-center justify-center mb-4">
              <BookOpen size={32} />
            </div>
            <p className="text-sm font-black text-text-main uppercase tracking-widest">No subjects yet</p>
            <p className="text-xs text-text-muted mt-2 font-medium">Add your first subject to start tracking attendance and bunk insights.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
            >
              Add Subject Now
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Subject"
        message="Are you sure you want to delete this subject? All attendance records, bunk analysis, and insights for this subject will be permanently removed."
        confirmText="Delete Subject"
        isDangerous={true}
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 w-full max-w-sm shadow-xl border border-border"
          >
            <h3 className="text-lg font-bold mb-4">{editingSubject ? 'Edit Subject' : 'Add New Subject'}</h3>
            <form onSubmit={handleAddSubject} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Subject Name</label>
                <input
                  type="text"
                  value={newSubject.subjectName}
                  onChange={(e) => setNewSubject({ ...newSubject, subjectName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="e.g. Data Structures"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Teacher Name</label>
                <input
                  type="text"
                  value={newSubject.teacherName}
                  onChange={(e) => setNewSubject({ ...newSubject, teacherName: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="e.g. Prof. Smith"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Type</label>
                <select
                  value={newSubject.type}
                  onChange={(e) => setNewSubject({ ...newSubject, type: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                >
                  <option value="Theory">Theory</option>
                  <option value="Practical">Practical</option>
                  <option value="Tutorial">Tutorial</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Color Identity</label>
                <div className="flex gap-2">
                  {['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewSubject({ ...newSubject, color: c })}
                      className={`w-7 h-7 rounded-full transition-all ${newSubject.color === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''}`}
                      style={{ backgroundColor: c }}
                      aria-label={`Select color ${c}`}
                      title={`Select color ${c}`}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingSubject(null); }}
                  className="flex-1 py-2 bg-background text-text-main border border-border font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newSubject.subjectName.trim()}
                  className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : (editingSubject ? 'Save Changes' : 'Add Subject')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Subjects;
