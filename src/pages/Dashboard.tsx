import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, AlertCircle, Clock, CheckCircle, XCircle, Zap, Info } from 'lucide-react';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const Dashboard = () => {
  const [data, setData] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const userId = user.id;
        const userData = await dataService.getUserData(userId);
        
        // Process Subjects
        const userSubjects = (userData.subjects || []).map((s: any) => {
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
        
        // Fetch Timetable for Today
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const userTodayClasses = (userData.timetable || [])
          .filter((t: any) => t.day === today)
          .map((t: any) => ({
            ...t,
            subject: userSubjects.find((s: any) => s._id === t.subjectId)
          }))
          .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
        
        setTodayClasses(userTodayClasses);

        const pendingAssignments = (userData.assignments || []).filter((a: any) => a.status === 'Pending');
        const overdueAssignments = pendingAssignments.filter((a: any) => new Date(a.deadline) < new Date());

        const overallTotal = userSubjects.reduce((acc: number, s: any) => acc + s.totalClasses, 0);
        const overallAttended = userSubjects.reduce((acc: number, s: any) => acc + s.attendedClasses, 0);
        const overallAttendance = overallTotal > 0 ? ((overallAttended / overallTotal) * 100).toFixed(1) : '0.0';

        setData({
          overallAttendance,
          pendingTasksCount: pendingAssignments.length,
          lowAttendanceCount: userSubjects.filter((s: any) => parseFloat(s.insights.attendance) < 75).length,
          upcomingAssignments: pendingAssignments.slice(0, 5),
          overdueCount: overdueAssignments.length,
          streak: userData.streak || 0
        });
        setSubjects(userSubjects);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const markTimetableAttendance = async (id: string, status: 'Attended' | 'Bunked') => {
    if (!user) return;
    const userId = user.id;
    const userData = await dataService.getUserData(userId);
    
    const entryIndex = (userData.timetable || []).findIndex((t: any) => t._id === id);
    if (entryIndex === -1) return;

    const entry = userData.timetable[entryIndex];
    const oldStatus = entry.status;
    entry.status = status;

    const subjectIndex = (userData.subjects || []).findIndex((s: any) => s._id === entry.subjectId);
    
    if (subjectIndex !== -1) {
      const subject = userData.subjects[subjectIndex];
      if (oldStatus === 'Attended') {
        subject.attendedClasses = Math.max(0, subject.attendedClasses - 1);
        subject.totalClasses = Math.max(0, subject.totalClasses - 1);
      } else if (oldStatus === 'Bunked') {
        subject.totalClasses = Math.max(0, subject.totalClasses - 1);
      }

      if (status === 'Attended') {
        subject.attendedClasses += 1;
        subject.totalClasses += 1;
        userData.streak = (userData.streak || 0) + 1;
        if (userData.streak > (userData.bestStreak || 0)) {
          userData.bestStreak = userData.streak;
        }
      } else if (status === 'Bunked') {
        subject.totalClasses += 1;
        userData.streak = 0;
      }
    }
    
    await dataService.saveUserData(userId, userData);
    window.location.reload(); 
  };

  const markAttendance = async (subjectId: string, status: 'present' | 'absent') => {
    if (!user) return;
    const userId = user.id;
    const userData = await dataService.getUserData(userId);

    const subjectIndex = (userData.subjects || []).findIndex((s: any) => s._id === subjectId);
    if (subjectIndex !== -1) {
      const sub = userData.subjects[subjectIndex];
      sub.totalClasses += 1;
      if (status === 'present') {
        sub.attendedClasses += 1;
        userData.streak = (userData.streak || 0) + 1;
        if (userData.streak > (userData.bestStreak || 0)) {
          userData.bestStreak = userData.streak;
        }
      } else {
        userData.streak = 0;
      }
      
      await dataService.saveUserData(userId, userData);

      // Re-process local state for UI update
      const updatedUserSubjects = userData.subjects.map((s: any) => {
        const attendance = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
        
        let safeBunks = 0;
        let neededClasses = 0;
        if (attendance >= 75) {
          safeBunks = Math.floor((s.attendedClasses - 0.75 * s.totalClasses) / 0.75);
        } else {
          neededClasses = Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25);
        }

        return {
          ...s,
          insights: {
            attendance: attendance.toFixed(1),
            safeBunks,
            neededClasses,
            riskLevel: attendance < 75 ? 'High' : attendance < 85 ? 'Medium' : 'Low',
            recommendation: attendance < 75 ? 'Attend next class' : safeBunks > 0 ? 'Safe to skip' : 'Attend next class'
          }
        };
      });

      setSubjects(updatedUserSubjects);
      const overallTotal = updatedUserSubjects.reduce((acc: number, s: any) => acc + s.totalClasses, 0);
      const overallAttended = updatedUserSubjects.reduce((acc: number, s: any) => acc + s.attendedClasses, 0);

      setData((prev: any) => ({
        ...prev,
        overallAttendance: overallTotal > 0 ? ((overallAttended / overallTotal) * 100).toFixed(1) : '0.0',
        lowAttendanceCount: updatedUserSubjects.filter((s: any) => parseFloat(s.insights.attendance) < 75).length,
        streak: userData.streak
      }));
    }
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-text-main">
            Good Morning! 👋
          </h2>
          <p className="text-text-muted text-sm font-medium">Here's your academic status for the week.</p>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
          <Zap size={18} className="text-warning fill-warning" />
          <div>
            <p className="text-[10px] font-bold text-text-muted uppercase">Study Streak</p>
            <p className="text-sm font-bold">{data?.streak || 0} Days</p>
          </div>
        </div>
      </header>

      {/* Today's Smart Plan */}
      <section className="mb-8">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={20} className="text-primary" />
            <h3 className="font-bold text-lg text-primary">Today's Smart Plan</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Attend Next</p>
              <div className="space-y-2">
                {subjects.filter(s => s.insights.recommendation === 'Attend next class').slice(0, 2).map(s => (
                  <div key={s._id} className="flex items-center gap-2 text-sm font-semibold">
                    <div className="w-1.5 h-1.5 rounded-full bg-danger" />
                    {s.subjectName}
                  </div>
                ))}
                {subjects.filter(s => s.insights.recommendation === 'Attend next class').length === 0 && (
                  <p className="text-xs text-text-muted italic">All clear!</p>
                )}
              </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Safe to Skip</p>
              <div className="space-y-2">
                {subjects.filter(s => s.insights.recommendation === 'Safe to skip').slice(0, 2).map(s => (
                  <div key={s._id} className="flex items-center gap-2 text-sm font-semibold">
                    <div className="w-1.5 h-1.5 rounded-full bg-success" />
                    {s.subjectName}
                  </div>
                ))}
                {subjects.filter(s => s.insights.recommendation === 'Safe to skip').length === 0 && (
                  <p className="text-xs text-text-muted italic">No safe bunks yet.</p>
                )}
              </div>
            </div>
            <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-sm">
              <p className="text-[10px] font-bold text-text-muted uppercase mb-2">Top Priority Task</p>
              {data?.upcomingAssignments?.[0] ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold truncate">{data.upcomingAssignments[0].title}</p>
                  <p className="text-[10px] text-text-muted">Due {new Date(data.upcomingAssignments[0].deadline).toLocaleDateString()}</p>
                </div>
              ) : (
                <p className="text-xs text-text-muted italic">No pending tasks.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Today's Classes */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base font-bold">Today's Schedule</h3>
          <button className="text-[12px] text-primary cursor-pointer font-bold uppercase tracking-tight hover:opacity-80 transition-opacity">Full Timetable</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {todayClasses.map((entry) => (
            <motion.div
              key={entry._id}
              whileHover={{ y: -2 }}
              className={`bg-card p-4 rounded-xl border border-border shadow-sm relative ${
                entry.status === 'Attended' ? 'border-l-4 border-l-success' :
                entry.status === 'Bunked' ? 'border-l-4 border-l-danger' : ''
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-bold text-sm truncate max-w-[120px]">{entry.subject?.subjectName}</h4>
                  <p className="text-[10px] text-text-muted font-bold flex items-center gap-1 mt-0.5">
                    <Clock size={10} /> {entry.startTime} - {entry.endTime}
                  </p>
                </div>
                <div className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded border ${
                  entry.type === 'Mandatory' ? 'bg-red-50 text-danger border-red-100' : 'bg-blue-50 text-primary border-blue-100'
                }`}>
                  {entry.type}
                </div>
              </div>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => markTimetableAttendance(entry._id, 'Attended')}
                  disabled={entry.status === 'Attended'}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    entry.status === 'Attended' ? 'bg-success text-white border-success' : 'bg-background text-text-main border-border hover:bg-success/10'
                  }`}
                >
                  Attended
                </button>
                <button
                  onClick={() => markTimetableAttendance(entry._id, 'Bunked')}
                  disabled={entry.status === 'Bunked'}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
                    entry.status === 'Bunked' ? 'bg-danger text-white border-danger' : 'bg-background text-text-main border-border hover:bg-danger/10'
                  }`}
                >
                  Bunked
                </button>
              </div>
            </motion.div>
          ))}
          {todayClasses.length === 0 && (
            <div className="col-span-full py-8 text-center bg-background rounded-xl border border-dashed border-border">
              <p className="text-xs text-text-muted font-medium italic">No classes scheduled for today.</p>
            </div>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Overall Attendance</div>
          <div className="text-2xl font-bold">{data?.overallAttendance}%</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Pending Tasks</div>
          <div className="text-2xl font-bold">{data?.pendingTasksCount}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">At Risk</div>
          <div className="text-2xl font-bold text-danger">{data?.lowAttendanceCount}</div>
        </div>

        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <div className="text-[10px] text-text-muted uppercase font-bold mb-1">Overdue</div>
          <div className="text-2xl font-bold text-danger">{data?.overdueCount || 0}</div>
        </div>
      </section>

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-bold">Subject Intelligence</h3>
        <button className="text-[12px] text-primary cursor-pointer font-bold uppercase tracking-tight hover:opacity-80 transition-opacity">View All</button>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {subjects.map((sub) => (
          <motion.div
            key={sub._id}
            whileHover={{ y: -4 }}
            className={`bg-card rounded-xl p-5 border border-border relative transition-all shadow-sm ${
              parseFloat(sub.insights.attendance) < 75 ? 'border-t-4 border-t-danger' : 
              parseFloat(sub.insights.attendance) > 85 ? 'border-t-4 border-t-success' : 'border-t-4 border-t-warning'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="font-bold text-sm mb-0.5">{sub.subjectName}</div>
                <div className={`text-[10px] font-bold uppercase ${
                  sub.insights.riskLevel === 'High' ? 'text-danger' : sub.insights.riskLevel === 'Medium' ? 'text-warning' : 'text-success'
                }`}>
                  {sub.insights.riskLevel} Risk
                </div>
              </div>
              <div className={`text-xl font-black ${parseFloat(sub.insights.attendance) < 75 ? 'text-danger' : 'text-text-main'}`}>
                {sub.insights.attendance}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-background p-2 rounded-lg border border-border">
                <p className="text-[9px] font-bold text-text-muted uppercase mb-0.5">Safe Bunks</p>
                <p className="text-sm font-bold text-success">{sub.insights.safeBunks}</p>
              </div>
              <div className="bg-background p-2 rounded-lg border border-border">
                <p className="text-[9px] font-bold text-text-muted uppercase mb-0.5">Need for 75%</p>
                <p className="text-sm font-bold text-primary">{sub.insights.neededClasses}</p>
              </div>
            </div>

            <div className={`text-[10px] px-2.5 py-1 rounded-full font-bold inline-block mb-4 border ${
              sub.insights.recommendation === 'Safe to skip' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'
            }`}>
              {sub.insights.recommendation}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => markAttendance(sub._id, 'present')}
                className="py-2 text-[11px] font-bold border border-border rounded-lg hover:bg-success hover:text-white hover:border-success transition-all active:scale-95"
              >
                Present
              </button>
              <button
                onClick={() => markAttendance(sub._id, 'absent')}
                className="py-2 text-[11px] font-bold border border-border rounded-lg hover:bg-danger hover:text-white hover:border-danger transition-all active:scale-95"
              >
                Absent
              </button>
            </div>
          </motion.div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full py-12 text-center bg-background rounded-2xl border border-dashed border-border">
            <p className="text-text-muted text-sm font-medium italic">No subjects added yet. Go to Subjects page to start!</p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
          <h3 className="font-bold text-sm mb-4">Upcoming Deadlines</h3>
          <div className="space-y-3">
            {data?.upcomingAssignments.map((task: any) => (
              <div key={task._id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border hover:border-primary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${task.priority === 'High' ? 'bg-danger' : task.priority === 'Medium' ? 'bg-warning' : 'bg-success'}`} />
                  <div>
                    <h4 className="text-sm font-bold">{task.title}</h4>
                    <p className="text-[10px] text-text-muted font-medium">{task.subjectId?.subjectName} • Due {new Date(task.deadline).toLocaleDateString()}</p>
                  </div>
                </div>
                {new Date(task.deadline) < new Date() && (
                  <span className="text-[9px] font-black uppercase text-danger bg-red-50 px-2 py-0.5 rounded border border-red-100">Overdue</span>
                )}
              </div>
            ))}
            {data?.upcomingAssignments.length === 0 && (
              <p className="text-text-muted text-xs italic py-4">No pending assignments.</p>
            )}
          </div>
        </div>

        <div className="bg-primary/5 rounded-xl p-5 border border-primary/10">
          <h3 className="font-bold text-sm mb-4 text-primary">Smart Assistant</h3>
          <div className="space-y-3">
            {subjects.filter(s => s.insights.riskLevel === 'High').map(sub => (
              <div key={sub._id} className="bg-card p-4 rounded-xl border border-danger/10 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} className="text-danger" />
                  <p className="text-[11px] font-bold text-danger uppercase">Critical Attention</p>
                </div>
                <p className="text-xs leading-relaxed font-medium">
                  <strong>{sub.subjectName}</strong> is at {sub.insights.attendance}%. You need to attend the next <strong>{sub.insights.neededClasses}</strong> classes to reach 75%.
                </p>
              </div>
            ))}
            <div className="bg-card p-4 rounded-xl border border-primary/10 shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Info size={14} className="text-primary" />
                <p className="text-[11px] font-bold text-primary uppercase">Strategy Tip</p>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                Your study streak is at {data?.streak} days. Keep it up! Consistency is the key to academic mastery.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;
