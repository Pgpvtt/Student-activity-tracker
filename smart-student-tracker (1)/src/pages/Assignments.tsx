import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, CheckCircle, AlertCircle, Calendar, Trash2, FileText, Palette, Loader2 } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const Assignments = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<string | null>(null);
  const [editingAssignment, setEditingAssignment] = useState<any>(null);
  const [newAssignment, setNewAssignment] = useState({
    subjectId: '',
    title: '',
    deadline: '',
    priority: 'Medium'
  });
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user) return;
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      
      const userSubjects = userData.subjects || [];
      setSubjects(userSubjects);
      
      const rawAssignments = userData.assignments || [];
      const userAssignments = rawAssignments.map((a: any) => ({
        ...a,
        subject: userSubjects.find((s: any) => s._id === a.subjectId)
      }));
      
      // Sort: Overdue first, then by priority, then by date
      const sorted = userAssignments.sort((a: any, b: any) => {
        if (a.status === 'Completed' && b.status !== 'Completed') return 1;
        if (a.status !== 'Completed' && b.status === 'Completed') return -1;
        
        const aOverdue = new Date(a.deadline) < new Date() && a.status === 'Pending';
        const bOverdue = new Date(b.deadline) < new Date() && b.status === 'Pending';
        if (aOverdue && !bOverdue) return -1;
        if (!aOverdue && bOverdue) return 1;

        const priorityMap: any = { 'High': 0, 'Medium': 1, 'Low': 2 };
        if (priorityMap[a.priority] !== priorityMap[b.priority]) {
          return priorityMap[a.priority] - priorityMap[b.priority];
        }
        
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });

      setAssignments(sorted);
      
      if (userSubjects.length > 0 && !newAssignment.subjectId) {
        setNewAssignment(prev => ({ ...prev, subjectId: userSubjects[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      showToast('Error loading assignments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newAssignment.title.trim()) {
      showToast('Assignment title is required', 'error');
      return;
    }

    if (!newAssignment.deadline) {
      showToast('Deadline is required', 'error');
      return;
    }

    // Future date check
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(newAssignment.deadline);
    if (deadlineDate < today) {
      showToast('Deadline cannot be in the past', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      
      if (editingAssignment) {
        userData.assignments = (userData.assignments || []).map((a: any) => 
          a._id === editingAssignment._id ? { ...a, ...newAssignment } : a
        );
        showToast('Assignment updated successfully', 'success');
      } else {
        const newAsgn = {
          _id: Date.now().toString(),
          userId,
          ...newAssignment,
          status: 'Pending'
        };
        if (!userData.assignments) userData.assignments = [];
        userData.assignments.push(newAsgn);
        showToast('Assignment added successfully', 'success');
      }
      
      await dataService.setUserData(userId, userData);
      
      setNewAssignment({ ...newAssignment, title: '', deadline: '' });
      setShowAddModal(false);
      setEditingAssignment(null);
      await fetchData();
    } catch (err) {
      console.error('Error adding/updating assignment:', err);
      showToast('Error saving assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (task: any) => {
    setEditingAssignment(task);
    setNewAssignment({
      subjectId: task.subjectId,
      title: task.title,
      deadline: task.deadline,
      priority: task.priority
    });
    setShowAddModal(true);
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    if (!user) return;
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      userData.assignments = (userData.assignments || []).map((a: any) => {
        if (a._id === id) {
          const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
          if (newStatus === 'Completed') showToast('Goal reached! Task completed.', 'success');
          return { ...a, status: newStatus };
        }
        return a;
      });
      await dataService.setUserData(userId, userData);
      await fetchData();
    } catch (err) {
      console.error('Error updating status:', err);
      showToast('Error updating assignment status', 'error');
    }
  };

  const handleDeleteClick = (id: string) => {
    setAssignmentToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !assignmentToDelete) return;
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      userData.assignments = (userData.assignments || []).filter((a: any) => a._id !== assignmentToDelete);
      await dataService.setUserData(userId, userData);
      showToast('Assignment removed', 'success');
      await fetchData();
    } catch (err) {
      showToast('Error removing assignment', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setAssignmentToDelete(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-background text-primary"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Academic Roadmap</h2>
          <p className="text-text-muted text-sm">Manage your upcoming deadlines and track progress.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 text-sm"
        >
          <Plus size={18} /> New Assignment
        </button>
      </div>

      <div className="space-y-4">
        {assignments.map((task) => {
          const isOverdue = new Date(task.deadline) < new Date() && task.status === 'Pending';
          return (
            <motion.div
              key={task._id}
              whileHover={{ x: 4 }}
              className={`bg-card rounded-2xl p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-sm ${
                task.status === 'Completed' ? 'opacity-60 grayscale-[0.5]' : isOverdue ? 'border-l-4 border-l-danger bg-red-50/30' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm"
                  style={{ backgroundColor: `${task.subjectId?.color}15`, color: task.subjectId?.color }}
                >
                  <Calendar size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block px-2 py-0.5 rounded-lg bg-background text-text-muted text-[9px] font-bold uppercase tracking-wider border border-border">
                      {task.subjectId?.subjectName}
                    </span>
                    {isOverdue && (
                      <span className="text-[9px] font-black uppercase text-danger bg-red-100 px-2 py-0.5 rounded border border-red-200">Overdue</span>
                    )}
                  </div>
                  <h3 className={`text-base font-bold text-text-main ${task.status === 'Completed' ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-text-muted font-bold">
                    <span className={`flex items-center gap-1.5 ${isOverdue ? 'text-danger' : ''}`}>
                      <Clock size={14} /> {new Date(task.deadline).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1.5 ${
                      task.priority === 'High' ? 'text-danger' : task.priority === 'Medium' ? 'text-warning' : 'text-success'
                    }`}>
                      <AlertCircle size={14} /> {task.priority} Priority
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(task)}
                  className="p-2 text-text-muted hover:text-primary transition-colors"
                >
                  <Palette size={18} />
                </button>
                <button
                  onClick={() => toggleStatus(task._id, task.status)}
                  className={`px-5 py-2 rounded-xl font-bold text-xs transition-all border ${
                    task.status === 'Completed' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-background text-text-main border-border hover:bg-primary hover:text-white hover:border-primary'
                  }`}
                >
                  {task.status === 'Completed' ? 'Completed' : 'Mark as Done'}
                </button>
                <button 
                  onClick={() => handleDeleteClick(task._id)}
                  className="p-2 text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          );
        })}
        {assignments.length === 0 && (
          <div className="text-center py-24 bg-card rounded-[2.5rem] border border-dashed border-border flex flex-col items-center">
            <div className="w-16 h-16 bg-primary/5 text-primary/40 rounded-full flex items-center justify-center mb-4">
              <FileText size={32} />
            </div>
            <p className="text-sm font-black text-text-main uppercase tracking-widest">No assignments found</p>
            <p className="text-xs text-text-muted mt-2 font-medium">Stay ahead of the curve by adding your first assignment.</p>
            <button 
              onClick={() => setShowAddModal(true)}
              className="mt-6 px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold hover:opacity-90 transition-all"
            >
              Add Assignment
            </button>
          </div>
        )}
      </div>

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Assignment"
        message="Are you sure you want to remove this assignment? This action cannot be undone."
        confirmText="Delete Assignment"
        isDangerous={true}
      />

      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-xl p-6 w-full max-w-sm shadow-xl border border-border"
          >
            <h3 className="text-lg font-bold mb-4">{editingAssignment ? 'Edit Assignment' : 'New Assignment'}</h3>
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Subject</label>
                <select
                  value={newAssignment.subjectId}
                  onChange={(e) => setNewAssignment({ ...newAssignment, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                >
                  {subjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Assignment Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  placeholder="e.g. Final Project Proposal"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Deadline</label>
                <input
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewAssignment({ ...newAssignment, priority: p })}
                      className={`flex-1 py-1.5 rounded-md font-bold text-[10px] uppercase transition-all border ${newAssignment.priority === p ? 'bg-primary text-white border-primary' : 'bg-background text-text-muted border-border'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingAssignment(null); }}
                  className="flex-1 py-2 bg-background text-text-main border border-border font-semibold rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newAssignment.title.trim() || !newAssignment.deadline}
                  className="flex-1 py-2 bg-primary text-white font-semibold rounded-lg shadow-sm text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : (editingAssignment ? 'Save Changes' : 'Add Assignment')}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Assignments;
