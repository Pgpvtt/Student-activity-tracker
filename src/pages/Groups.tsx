import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Plus, ListFilter, Search, ArrowRight, Shield, Calendar, FileText, Trash2, UserMinus, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService, GroupData } from '../services/dataService';
import { useToast } from '../context/ToastContext';

const Groups = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [userGroups, setUserGroups] = useState<GroupData[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupIdToJoin, setGroupIdToJoin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchGroups = async () => {
      if (user) {
        const userData = await dataService.getUserData(user.id);
        const groupIds = userData.groups || [];
        const groupsPromises = groupIds.map(id => dataService.getGroup(id));
        const groupsResults = await Promise.all(groupsPromises);
        const validGroups = groupsResults.filter((g): g is GroupData => g !== null);
        setUserGroups(validGroups);
      }
    };
    fetchGroups();
  }, [user]);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!groupName.trim()) {
      setError('Group name is required');
      return;
    }

    setSubmitting(true);
    try {
      const newGroupId = 'GRP-' + Math.random().toString(36).substr(2, 6).toUpperCase();
      const newGroup: GroupData = {
        groupId: newGroupId,
        groupName: groupName.trim(),
        adminId: user.id,
        members: [{ userId: user.id, name: user.name || 'Anonymous' }],
        sharedAssignments: [],
        sharedAnnouncements: []
      };

      await dataService.saveGroup(newGroupId, newGroup);
      
      const userData = await dataService.getUserData(user.id);
      const updatedGroups = [...(userData.groups || []), newGroupId];
      await dataService.updateSection(user.id, 'groups', updatedGroups);

      showToast('Group created successfully!', 'success');
      setGroupName('');
      setShowCreateModal(false);
      setUserGroups([...userGroups, newGroup]);
      navigate(`/groups/${newGroupId}`);
    } catch (err) {
      showToast('Failed to create group', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!groupIdToJoin.trim()) {
      setError('Group ID is required');
      return;
    }

    setSubmitting(true);
    try {
      const group = await dataService.getGroup(groupIdToJoin.trim());
      if (!group) {
        setError('Group not found');
        return;
      }

      if (group.members.some(m => m.userId === user.id)) {
        setError('You are already a member of this group');
        return;
      }

      const updatedGroup = {
        ...group,
        members: [...group.members, { userId: user.id, name: user.name || 'Anonymous' }]
      };
      await dataService.saveGroup(group.groupId, updatedGroup);

      const userData = await dataService.getUserData(user.id);
      const updatedGroups = [...(userData.groups || []), group.groupId];
      await dataService.updateSection(user.id, 'groups', updatedGroups);

      showToast(`Joined ${group.groupName}!`, 'success');
      setGroupIdToJoin('');
      setShowJoinModal(false);
      setUserGroups([...userGroups, updatedGroup]);
      navigate(`/groups/${group.groupId}`);
    } catch (err) {
      showToast('Failed to join group', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
            <Users className="text-primary" size={24} /> Study Groups
          </h2>
          <p className="text-sm text-text-muted font-medium">Collaborate with classmates on assignments and resources.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { setShowJoinModal(true); setError(''); }}
            className="px-4 py-2.5 bg-slate-100 text-text-main border border-border rounded-xl text-sm font-bold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Join Group
          </button>
          <button 
            onClick={() => { setShowCreateModal(true); setError(''); }}
            className="px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all flex items-center gap-2"
          >
            <Plus size={18} /> Create Group
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userGroups.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-card rounded-3xl border border-border border-dashed">
            <Users size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-sm font-bold text-text-muted uppercase tracking-[0.2em]">No groups joined yet</p>
            <p className="text-xs text-text-muted mt-2">Create a new group or join one using a Group ID.</p>
          </div>
        ) : (
          userGroups.map((group, i) => (
            <motion.div
              key={group.groupId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card p-6 rounded-3xl border border-border shadow-sm hover:shadow-md transition-all group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4">
                {group.adminId === user?.id && (
                  <Shield size={16} className="text-primary" title="You are the Admin" />
                )}
              </div>
              
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-4 font-black">
                {group.groupName.charAt(0).toUpperCase()}
              </div>

              <h3 className="text-lg font-bold text-text-main mb-1 truncate pr-6">{group.groupName}</h3>
              <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4">ID: {group.groupId}</p>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 3).map((m, idx) => (
                    <div key={idx} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-card flex items-center justify-center text-[8px] font-black uppercase">
                      {m.name.charAt(0)}
                    </div>
                  ))}
                  {group.members.length > 3 && (
                    <div className="w-6 h-6 rounded-full bg-slate-100 border-2 border-card flex items-center justify-center text-[8px] font-black">
                      +{group.members.length - 3}
                    </div>
                  )}
                </div>
                <span className="text-[10px] text-text-muted font-bold">{group.members.length} Members</span>
              </div>

              <Link 
                to={`/groups/${group.groupId}`}
                className="w-full py-2.5 bg-slate-50 border border-border rounded-xl text-xs font-bold text-text-main flex items-center justify-center gap-2 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
              >
                Enter Group <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border"
          >
            <h3 className="text-xl font-black text-text-main mb-2">Create New Group</h3>
            <p className="text-xs text-text-muted font-medium mb-6">Set a name and invite your friends to collaborate.</p>
            
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                  placeholder="e.g. Computer Science A"
                  autoFocus
                />
              </div>
              
              {error && <p className="text-[10px] font-bold text-danger text-center">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 bg-slate-50 text-text-main border border-border font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Join Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-3xl p-8 w-full max-w-sm shadow-2xl border border-border"
          >
            <h3 className="text-xl font-black text-text-main mb-2">Join a Group</h3>
            <p className="text-xs text-text-muted font-medium mb-6">Enter the Group ID shared by the admin.</p>
            
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-text-muted uppercase tracking-widest px-1">Group ID</label>
                <input
                  type="text"
                  value={groupIdToJoin}
                  onChange={(e) => setGroupIdToJoin(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none text-sm font-bold"
                  placeholder="e.g. GRP-A1B2C3"
                  autoFocus
                />
              </div>

              {error && <p className="text-[10px] font-bold text-danger text-center">{error}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJoinModal(false)}
                  className="flex-1 py-3 bg-slate-50 text-text-main border border-border font-bold rounded-xl text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Join'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Groups;
