import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Users, FileText, Megaphone, Trash2, UserMinus, Plus, Shield, ArrowLeft, Send, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService, GroupData } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const GroupDashboard = () => {
  const { groupId } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [activeTab, setActiveTab] = useState<'announcements' | 'assignments' | 'members'>('announcements');
  const [newAnnouncement, setNewAnnouncement] = useState('');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', deadline: '', priority: 'Medium' });
  const [submitting, setSubmitting] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);

  useEffect(() => {
    const fetchGroupData = async () => {
      if (groupId) {
        const data = await dataService.getGroup(groupId);
        if (!data) {
          navigate('/groups');
          return;
        }
        setGroup(data);
      }
    };
    fetchGroupData();
  }, [groupId, navigate]);

  if (!group || !user) return null;

  const isAdmin = group.adminId === user.id;

  const handlePostAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin || !newAnnouncement.trim()) return;

    setSubmitting(true);
    try {
      const announcement = {
        id: Date.now().toString(),
        text: newAnnouncement.trim(),
        author: user.name || 'Anonymous',
        date: new Date().toISOString()
      };

      const updatedGroup = {
        ...group,
        sharedAnnouncements: [announcement, ...group.sharedAnnouncements]
      };
      await dataService.saveGroup(group.groupId, updatedGroup);
      setGroup(updatedGroup);
      setNewAnnouncement('');
      showToast('Announcement posted!', 'success');
    } catch (err) {
      showToast('Failed to post announcement', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignment.title.trim()) {
      showToast('Assignment title is required', 'error');
      return;
    }
    if (!newAssignment.deadline) {
      showToast('Deadline is required', 'error');
      return;
    }
    
    const deadlineDate = new Date(newAssignment.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deadlineDate < today) {
      showToast('Deadline cannot be in the past', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const assignment = {
        id: Date.now().toString(),
        ...newAssignment,
        author: user.name || 'Anonymous',
        status: 'Pending'
      };

      const updatedGroup = {
        ...group,
        sharedAssignments: [assignment, ...group.sharedAssignments]
      };
      await dataService.saveGroup(group.groupId, updatedGroup);
      setGroup(updatedGroup);
      setNewAssignment({ title: '', deadline: '', priority: 'Medium' });
      setShowAddAssignmentModal(false);
      showToast('Assignment shared with group!', 'success');
    } catch (err) {
      showToast('Failed to share assignment', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDeleteGroup = async () => {
    if (!isAdmin || !group) return;
    try {
      for (const m of group.members) {
        const userData = await dataService.getUserData(m.userId);
        const updatedGroups = (userData.groups || []).filter(id => id !== group.groupId);
        await dataService.updateSection(m.userId, 'groups', updatedGroups);
      }

      await dataService.deleteGroup(group.groupId);
      showToast('Group deleted', 'success');
      navigate('/groups');
    } catch (err) {
      showToast('Error deleting group', 'error');
    }
  };

  const confirmRemoveMember = async () => {
    if (!isAdmin || !memberToRemove || !group) return;
    try {
      const updatedMembers = group.members.filter(m => m.userId !== memberToRemove);
      const updatedGroup = { ...group, members: updatedMembers };
      await dataService.saveGroup(group.groupId, updatedGroup);
      
      const userData = await dataService.getUserData(memberToRemove);
      const updatedGroups = (userData.groups || []).filter(id => id !== group.groupId);
      await dataService.updateSection(memberToRemove, 'groups', updatedGroups);
      
      setGroup(updatedGroup);
      showToast('Member removed', 'success');
    } catch (err) {
      showToast('Error removing member', 'error');
    } finally {
      setShowRemoveMemberConfirm(false);
      setMemberToRemove(null);
    }
  };

  const confirmLeaveGroup = async () => {
    if (isAdmin || !group) return;
    try {
      const updatedMembers = group.members.filter(m => m.userId !== user.id);
      const updatedGroup = { ...group, members: updatedMembers };
      await dataService.saveGroup(group.groupId, updatedGroup);

      const userData = await dataService.getUserData(user.id);
      const updatedGroups = (userData.groups || []).filter(id => id !== group.groupId);
      await dataService.updateSection(user.id, 'groups', updatedGroups);

      showToast(`You left ${group.groupName}`, 'success');
      navigate('/groups');
    } catch (err) {
      showToast('Error leaving group', 'error');
    } finally {
      setShowLeaveConfirm(false);
    }
  };

  return (
    <Layout>
      <header className="mb-8">
        <button 
          onClick={() => navigate('/groups')}
          className="text-text-muted hover:text-primary transition-colors flex items-center gap-1 text-xs font-bold uppercase mb-4"
        >
          <ArrowLeft size={14} /> Back to Groups
        </button>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-text-main tracking-tight">{group.groupName}</h2>
              <span className="px-2 py-0.5 bg-slate-100 border border-border rounded text-[10px] font-black uppercase text-text-muted select-all">
                ID: {group.groupId}
              </span>
            </div>
            <p className="text-sm text-text-muted font-medium mt-1">Collab Dashboard for study materials and updates.</p>
          </div>
          <div className="flex gap-2">
            {isAdmin ? (
              <button 
                onClick={() => setShowDeleteConfirm(true)}
                className="px-4 py-2 bg-red-50 text-danger border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <Trash2 size={14} /> Delete Group
              </button>
            ) : (
              <button 
                onClick={() => setShowLeaveConfirm(true)}
                className="px-4 py-2 bg-red-50 text-danger border border-red-100 rounded-xl text-xs font-bold hover:bg-red-100 transition-all flex items-center gap-2"
              >
                <UserMinus size={14} /> Leave Group
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto whitespace-nowrap">
        {[
          { id: 'announcements', label: 'Announcements', icon: Megaphone },
          { id: 'assignments', label: 'Shared Assignments', icon: FileText },
          { id: 'members', label: 'Member List', icon: Users }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-1 py-3 border-b-2 transition-all text-sm font-bold ${
              activeTab === tab.id 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-muted hover:text-text-main hover:border-border'
            }`}
          >
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      <div className="max-w-4xl">
        <AnimatePresence mode="wait">
          {activeTab === 'announcements' && (
            <motion.div
              key="announcements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {isAdmin && (
                <form onSubmit={handlePostAnnouncement} className="bg-card p-6 rounded-3xl border-2 border-primary/10 shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 font-black uppercase text-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div className="flex-1 space-y-3">
                      <textarea
                        value={newAnnouncement}
                        onChange={(e) => setNewAnnouncement(e.target.value)}
                        placeholder="Share an update with the group..."
                        className="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium outline-none placeholder:text-text-muted/50 min-h-[100px] resize-none"
                      />
                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          disabled={!newAnnouncement.trim()}
                          className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-black shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          <Send size={16} /> Post Update
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              <div className="space-y-4">
                {group.sharedAnnouncements.length === 0 ? (
                  <div className="py-12 text-center bg-background rounded-3xl border border-border border-dashed">
                    <Megaphone size={32} className="mx-auto text-slate-200 mb-2" />
                    <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No announcements yet</p>
                  </div>
                ) : (
                  group.sharedAnnouncements.map(ann => (
                    <div key={ann.id} className="bg-card p-6 rounded-3xl border border-border shadow-sm">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase">
                            {ann.author.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-main">{ann.author}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase">{new Date(ann.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-text-main font-medium leading-relaxed bg-slate-50 p-4 rounded-xl">
                        {ann.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'assignments' && (
            <motion.div
              key="assignments"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex justify-end mb-2">
                <button 
                  onClick={() => setShowAddAssignmentModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded-xl text-xs font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
                >
                  <Plus size={14} /> Post Shared Task
                </button>
              </div>

              {group.sharedAssignments.length === 0 ? (
                <div className="py-12 text-center bg-background rounded-3xl border border-border border-dashed">
                  <FileText size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">No shared assignments</p>
                </div>
              ) : (
                group.sharedAssignments.map(task => (
                  <div key={task.id} className="bg-card p-5 rounded-3xl border border-border shadow-sm flex items-center justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        task.priority === 'High' ? 'bg-red-50 text-danger' : 
                        task.priority === 'Medium' ? 'bg-amber-50 text-warning' : 'bg-success/10 text-success'
                      }`}>
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-text-main">{task.title}</h4>
                        <div className="flex items-center gap-3 mt-1 text-[10px] text-text-muted font-bold uppercase tracking-widest">
                          <span>DUE: {new Date(task.deadline).toLocaleDateString()}</span>
                          <span>•By: {task.author}</span>
                          <span className={`px-1.5 py-0.5 rounded ${
                            task.priority === 'High' ? 'bg-red-50 text-danger' : 'bg-slate-100 text-text-muted'
                          }`}>{task.priority}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="px-3 py-1 bg-slate-50 border border-border rounded-full text-[10px] font-black uppercase text-text-muted">Personal Copy Only</span>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden"
            >
              <div className="divide-y divide-border">
                {group.members.map((m) => (
                  <div key={m.userId} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-xs font-black uppercase text-primary">
                        {m.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main flex items-center gap-2">
                          {m.name}
                          {m.userId === group.adminId && (
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-[8px] font-black uppercase tracking-tighter">Admin</span>
                          )}
                        </p>
                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Student</p>
                      </div>
                    </div>
                    
                    {isAdmin && m.userId !== user.id && (
                      <button 
                        onClick={() => { setMemberToRemove(m.userId); setShowRemoveMemberConfirm(true); }}
                        className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                        title="Remove Member"
                      >
                        <UserMinus size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Shared Assignment Modal */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border"
          >
            <h3 className="text-xl font-black text-text-main mb-2">Share Task</h3>
            <p className="text-xs text-text-muted font-medium mb-6">Create an assignment that everyone in the group can see.</p>
            
            <form onSubmit={handleAddAssignment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Task Title</label>
                <input
                  type="text"
                  value={newAssignment.title}
                  onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                  placeholder="e.g. Lab Report #3"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Deadline Date</label>
                <input
                  type="date"
                  value={newAssignment.deadline}
                  onChange={(e) => setNewAssignment({ ...newAssignment, deadline: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewAssignment({ ...newAssignment, priority: p })}
                      className={`flex-1 py-1.5 rounded-lg border text-[10px] font-black uppercase transition-all ${
                        newAssignment.priority === p ? 'bg-primary text-white border-primary shadow-md' : 'bg-slate-50 text-text-muted border-border'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddAssignmentModal(false)}
                  className="flex-1 py-3 bg-slate-50 text-text-main border border-border font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Post Task'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDeleteGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? All shared data will be lost for everyone and members will be removed. This cannot be undone."
        confirmText="Delete Everyone's Data"
        isDangerous={true}
      />

      <ConfirmModal 
        isOpen={showLeaveConfirm}
        onClose={() => setShowLeaveConfirm(false)}
        onConfirm={confirmLeaveGroup}
        title="Leave Group"
        message="Are you sure you want to leave this group? You will no longer see shared assignments or announcements."
        confirmText="Leave Group"
        isDangerous={true}
      />

      <ConfirmModal 
        isOpen={showRemoveMemberConfirm}
        onClose={() => { setShowRemoveMemberConfirm(false); setMemberToRemove(null); }}
        onConfirm={confirmRemoveMember}
        title="Remove Member"
        message="Are you sure you want to remove this student from the group?"
        confirmText="Remove Member"
        isDangerous={true}
      />
    </Layout>
  );
};

export default GroupDashboard;
