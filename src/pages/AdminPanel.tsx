import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Users, 
  BookOpen, 
  FileText, 
  PieChart, 
  ShieldAlert, 
  Trash2, 
  UserPlus, 
  TrendingUp,
  LayoutDashboard,
  Zap,
  Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService, UserData } from '../services/dataService';

const AdminPanel = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSubjects: 0,
    totalAssignments: 0,
    plans: { free: 0, pro: 0, premium: 0 }
  });
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Access Control
    if (user && user.email !== 'admin@smarttracker.com') {
      navigate('/dashboard');
      return;
    }

    loadAdminData();
  }, [user, navigate]);

  const loadAdminData = async () => {
    setLoading(true);
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const aggregatedUsers: any[] = [];
    let subjectsCount = 0;
    let assignmentsCount = 0;
    const planCounts = { free: 0, pro: 0, premium: 0 };

    for (const u of mockUsers) {
      const data = await dataService.getUserData(u.id);
      subjectsCount += (data.subjects || []).length;
      assignmentsCount += (data.assignments || []).length;
      
      const plan = (data.plan || 'free') as keyof typeof planCounts;
      if (planCounts[plan] !== undefined) {
        planCounts[plan]++;
      }

      aggregatedUsers.push({
        ...u,
        plan: data.plan || 'free',
        subjectsCount: (data.subjects || []).length,
        assignmentsCount: (data.assignments || []).length
      });
    }

    setStats({
      totalUsers: mockUsers.length,
      totalSubjects: subjectsCount,
      totalAssignments: assignmentsCount,
      plans: planCounts
    });
    setUsersList(aggregatedUsers);
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === user?.id) {
      alert("You cannot delete your own admin account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    // Remove from mock_users
    const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
    const updatedUsers = mockUsers.filter((u: any) => u.id !== userId);
    localStorage.setItem('mock_users', JSON.stringify(updatedUsers));

    // Remove user data using dataService
    await dataService.clearUserData(userId);

    await loadAdminData();
  };

  const handleChangePlan = async (userId: string, newPlan: string) => {
    await dataService.setUserData(userId, { plan: newPlan });
    await loadAdminData();
  };

  if (loading) return <div className="flex items-center justify-center h-screen bg-background">Loading Admin Dashboard...</div>;

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'primary' },
    { title: 'Total Subjects', value: stats.totalSubjects, icon: BookOpen, color: 'indigo' },
    { title: 'Total Assignments', value: stats.totalAssignments, icon: FileText, color: 'warning' },
    { title: 'Pro/Premium Ratio', value: `${((stats.plans.pro + stats.plans.premium) / (stats.totalUsers || 1) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'success' },
  ];

  return (
    <Layout>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-text-main tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-primary" size={24} /> Admin Control Center
          </h2>
          <p className="text-sm text-text-muted font-medium">Global platform analytics and user management.</p>
        </div>
        <div className="flex gap-2 text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
          <Zap size={12} className="fill-primary" /> System Online
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card p-6 rounded-2xl border border-border shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-${stat.color}/10 text-${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold text-text-muted uppercase tracking-wider">{stat.title}</span>
            </div>
            <div className="text-3xl font-black text-text-main">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Plan Distribution */}
        <div className="lg:col-span-1 bg-card p-6 rounded-2xl border border-border shadow-sm h-fit">
          <h3 className="text-sm font-bold text-text-main mb-6 flex items-center gap-2 uppercase tracking-widest">
            <PieChart size={16} /> Plan Distribution
          </h3>
          <div className="space-y-4">
            {[
              { name: 'Free', count: stats.plans.free, color: 'slate' },
              { name: 'Pro', count: stats.plans.pro, color: 'primary' },
              { name: 'Premium', count: stats.plans.premium, color: 'warning' }
            ].map((p, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-text-muted">{p.name} Plan</span>
                  <span className="text-text-main">{p.count} users</span>
                </div>
                <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-border/50">
                  <div 
                    className={`h-full bg-${p.color === 'primary' ? 'primary' : p.color === 'warning' ? 'warning' : 'slate-400'}`} 
                    style={{ width: `${(p.count / (stats.totalUsers || 1) * 100)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Table */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border shadow-sm overflow-hidden min-h-[400px]">
          <div className="px-6 py-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-text-main uppercase tracking-widest flex items-center gap-2">
              <Users size={16} /> User Management
            </h3>
            <span className="text-[10px] font-black text-text-muted">{usersList.length} total users</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-slate-50/30">
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">User</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Plan</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest">Data</th>
                  <th className="px-6 py-3 text-[10px] font-black text-text-muted uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {usersList.map((u, i) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-primary text-[10px] font-black shadow-sm">
                          {u.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-main">{u.name}</p>
                          <p className="text-[10px] text-text-muted font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={u.plan}
                        onChange={(e) => handleChangePlan(u.id, e.target.value)}
                        className={`text-[10px] font-black uppercase px-2 py-1 rounded-full border border-border outline-none cursor-pointer focus:ring-2 focus:ring-primary/20 ${
                          u.plan === 'premium' ? 'bg-amber-50 text-warning border-amber-200' :
                          u.plan === 'pro' ? 'bg-indigo-50 text-primary border-indigo-200' :
                          'bg-slate-50 text-text-muted'
                        }`}
                      >
                        <option value="free">Free</option>
                        <option value="pro">Pro</option>
                        <option value="premium">Premium</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                         <div className="text-center">
                            <p className="text-xs font-black text-text-main">{u.subjectsCount}</p>
                            <p className="text-[8px] uppercase font-black text-text-muted">Subjects</p>
                         </div>
                         <div className="text-center border-l border-border pl-3">
                            <p className="text-xs font-black text-text-main">{u.assignmentsCount}</p>
                            <p className="text-[8px] uppercase font-black text-text-muted">Tasks</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                         onClick={() => handleDeleteUser(u.id)}
                         className="p-2 text-text-muted hover:text-danger hover:bg-red-50 rounded-lg transition-all"
                         title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminPanel;
