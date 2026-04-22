import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Clock, Calendar, Trash2, CheckCircle, XCircle, MinusCircle, AlertCircle, Info, Upload, FileText, Image as ImageIcon, Check, X, Zap, BookOpen, FlaskConical, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const [timetable, setTimetable] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadConfirm, setShowUploadConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<any[]>([]);
  const [previewSubjects, setPreviewSubjects] = useState<any[]>([]);
  const [previewLabs, setPreviewLabs] = useState<any[]>([]);
  const [previewFaculty, setPreviewFaculty] = useState<any[]>([]);
  const [validityDate, setValidityDate] = useState('2026-04-15');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [viewMode, setViewMode] = useState<'List' | 'Grid'>('Grid');
  const [newEntry, setNewEntry] = useState({
    subjectId: '',
    day: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    type: 'Mandatory'
  });
  const { user } = useAuth();
  const { showToast } = useToast();

  const PERIODS = [
    { id: 1, time: '09:00 - 10:00' },
    { id: 2, time: '10:00 - 11:00' },
    { id: 3, time: '11:00 - 12:00' },
    { id: 4, time: '12:00 - 01:00' },
    { id: 5, time: '01:30 - 02:30' },
    { id: 6, time: '02:30 - 03:30' },
    { id: 7, time: '03:30 - 04:30' },
  ];

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
      setTimetable((userData.timetable || []).map((t: any) => ({
        ...t,
        subject: userSubjects.find((s: any) => s._id === t.subjectId)
      })));

      if (userData.timetableMetadata?.validityDate) {
        setValidityDate(userData.timetableMetadata.validityDate);
      }
      
      if (userSubjects.length > 0 && !newEntry.subjectId) {
        setNewEntry(prev => ({ ...prev, subjectId: userSubjects[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching timetable data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      simulateParsing(file);
    }
  };

  const simulateParsing = (file: File) => {
    setIsParsing(true);
    setTimeout(() => {
      // Mock extracted data from PDF
      const mockSubjects = [
        { _id: 's1', subjectName: 'Computer Networks', teacherName: 'Dr. Sarah Smith', type: 'Theory', color: '#4f46e5' },
        { _id: 's2', subjectName: 'Operating Systems', teacherName: 'Prof. James Wilson', type: 'Theory', color: '#10b981' },
        { _id: 's3', subjectName: 'Database Management', teacherName: 'Dr. Emily Brown', type: 'Theory', color: '#f59e0b' },
        { _id: 's4', subjectName: 'Software Engineering', teacherName: 'Mr. Robert Davis', type: 'Theory', color: '#ef4444' },
      ];

      const mockLabs = [
        { _id: 'l1', name: 'OS Lab', group: 'G1', room: 'Lab 204', faculty: 'Prof. James Wilson', schedule: 'Monday 02:30 - 04:30' },
        { _id: 'l2', name: 'DBMS Lab', group: 'G2', room: 'Lab 105', faculty: 'Dr. Emily Brown', schedule: 'Wednesday 11:00 - 01:00' },
      ];

      const mockFaculty = [
        { _id: 'f1', name: 'Dr. Sarah Smith', email: 'sarah.smith@univ.edu', subjects: ['Computer Networks'] },
        { _id: 'f2', name: 'Prof. James Wilson', email: 'j.wilson@univ.edu', subjects: ['Operating Systems', 'OS Lab'] },
        { _id: 'f3', name: 'Dr. Emily Brown', email: 'emily.b@univ.edu', subjects: ['Database Management', 'DBMS Lab'] },
        { _id: 'f4', name: 'Mr. Robert Davis', email: 'r.davis@univ.edu', subjects: ['Software Engineering'] },
      ];

      const mockTimetable = [
        { _id: 't1', subjectId: 's1', day: 'Monday', startTime: '09:00', endTime: '10:00', type: 'Mandatory' },
        { _id: 't2', subjectId: 's2', day: 'Monday', startTime: '10:00', endTime: '11:00', type: 'Mandatory' },
        { _id: 't3', subjectId: 's3', day: 'Tuesday', startTime: '11:00', endTime: '12:00', type: 'Mandatory' },
        { _id: 't4', subjectId: 's4', day: 'Wednesday', startTime: '09:00', endTime: '10:00', type: 'Mandatory' },
        { _id: 't5', subjectId: 's1', day: 'Thursday', startTime: '10:00', endTime: '11:00', type: 'Mandatory' },
        { _id: 't6', subjectId: 's2', day: 'Friday', startTime: '09:00', endTime: '10:00', type: 'Mandatory' },
      ];

      setPreviewSubjects(mockSubjects);
      setPreviewLabs(mockLabs);
      setPreviewFaculty(mockFaculty);
      setUploadPreview(mockTimetable);
      setValidityDate('2026-04-20');
      setIsParsing(false);
    }, 2500);
  };

  const handleConfirmUploadClick = () => {
    if (!validityDate) {
      showToast('Please select a validity date', 'error');
      return;
    }

    const selectedDate = new Date(validityDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate <= today) {
      showToast('Validity date must be in the future', 'error');
      return;
    }

    setShowUploadConfirm(true);
  };

  const confirmUpload = async () => {
    if (!user) return;
    setSubmitting(true);
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      
      // Save Subjects
      userData.subjects = previewSubjects.map(s => ({
        ...s,
        userId,
        totalClasses: 0,
        attendedClasses: 0
      }));

      // Save Faculty
      userData.faculty = previewFaculty.map(f => ({ ...f, userId }));

      // Save Labs
      userData.practicals = previewLabs.map(l => ({ ...l, userId }));

      // Save Timetable
      userData.timetable = uploadPreview.map(entry => ({
        ...entry,
        _id: Date.now().toString() + Math.random(),
        userId,
        status: undefined
      }));

      // Save Metadata
      userData.timetableMetadata = { validityDate };
      
      await dataService.setUserData(userId, userData);
      
      showToast('University timetable imported successfully!', 'success');
      setShowUploadModal(false);
      setShowUploadConfirm(false);
      setUploadedFile(null);
      await fetchData();
    } catch (err) {
      showToast('Error importing timetable', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!newEntry.subjectId) {
      showToast('Please select a subject', 'error');
      return;
    }

    if (newEntry.startTime >= newEntry.endTime) {
      showToast('End time must be after start time', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      
      const entry = {
        _id: Date.now().toString(),
        userId,
        ...newEntry
      };
      if (!userData.timetable) userData.timetable = [];
      userData.timetable.push(entry);
      await dataService.setUserData(userId, userData);
      
      showToast('Class added to timetable', 'success');
      setShowAddModal(false);
      await fetchData();
    } catch (err) {
      showToast('Error saving timetable entry', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setEntryToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!user || !entryToDelete) return;
    try {
      const userId = user.id;
      const userData = await dataService.getUserData(userId);
      userData.timetable = (userData.timetable || []).filter((t: any) => t._id !== entryToDelete);
      await dataService.setUserData(userId, userData);
      showToast('Class removed from timetable', 'success');
      await fetchData();
    } catch (err) {
      showToast('Error removing entry', 'error');
    } finally {
      setShowDeleteConfirm(false);
      setEntryToDelete(null);
    }
  };

  const markStatus = async (id: string, status: 'Attended' | 'Bunked' | 'Leave') => {
    if (!user) return;
    const userId = user.id;
    const userData = await dataService.getUserData(userId);
    
    // Update Timetable Entry Status
    const entry = (userData.timetable || []).find((t: any) => t._id === id);
    if (!entry) return;

    const oldStatus = entry.status;
    entry.status = status;

    // Update Subject Attendance
    const subject = (userData.subjects || []).find((s: any) => s._id === entry.subjectId);
    
    if (subject) {
      // Revert old status if exists
      if (oldStatus === 'Attended') {
        subject.attendedClasses = Math.max(0, subject.attendedClasses - 1);
        subject.totalClasses = Math.max(0, subject.totalClasses - 1);
      } else if (oldStatus === 'Bunked') {
        subject.totalClasses = Math.max(0, subject.totalClasses - 1);
      }

      // Apply new status
      if (status === 'Attended') {
        subject.attendedClasses += 1;
        subject.totalClasses += 1;
        userData.streak = (userData.streak || 0) + 1;
      } else if (status === 'Bunked') {
        subject.totalClasses += 1;
        userData.streak = 0;
      }
    }
    
    await dataService.setUserData(userId, userData);
    await fetchData();
  };

  const updatePreviewEntry = (id: string, field: string, value: string) => {
    setUploadPreview(prev => prev.map(entry => 
      entry._id === id ? { ...entry, [field]: value } : entry
    ));
  };

  const removePreviewEntry = (id: string) => {
    setUploadPreview(prev => prev.filter(entry => entry._id !== id));
  };

  const addPreviewEntry = () => {
    const newEntry = {
      _id: Date.now().toString(),
      subjectId: previewSubjects[0]?._id || '',
      day: 'Monday',
      startTime: '09:00',
      endTime: '10:00',
      type: 'Mandatory'
    };
    setUploadPreview(prev => [...prev, newEntry]);
  };

  const getAnalytics = () => {
    const total = timetable.length;
    const attended = timetable.filter(t => t.status === 'Attended').length;
    const bunked = timetable.filter(t => t.status === 'Bunked').length;
    const leaves = timetable.filter(t => t.status === 'Leave').length;
    const tracked = attended + bunked;
    const attendancePercent = tracked > 0 ? ((attended / tracked) * 100).toFixed(1) : '0.0';

    return { total, attended, bunked, leaves, attendancePercent };
  };

  const analytics = getAnalytics();

  if (loading) return <div className="flex items-center justify-center h-screen bg-background"><Loader2 size={32} className="animate-spin text-primary" /></div>;

  return (
    <Layout>
      <ConfirmModal 
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={confirmDelete}
        title="Remove Class"
        message="Are you sure you want to remove this class from your timetable? This will not delete the subject itself."
        confirmText="Remove Class"
        isDangerous={true}
      />
      <ConfirmModal 
        isOpen={showUploadConfirm}
        onClose={() => setShowUploadConfirm(false)}
        onConfirm={confirmUpload}
        title="Confirm Timetable Upload"
        message="Are you sure you want to import this timetable? This will REPLACE all your current subjects, faculty, labs, and schedule. This action cannot be undone."
        confirmText="Yes, Import Everything"
        isDangerous={true}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Weekly Timetable</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-text-muted text-sm">Organize your classes and track daily attendance.</p>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded border border-primary/20">
              Valid from: {new Date(validityDate).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-background border border-border rounded-xl p-1 mr-2">
            <button 
              onClick={() => setViewMode('Grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'Grid' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              Grid
            </button>
            <button 
              onClick={() => setViewMode('List')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'List' ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text-main'}`}
            >
              List
            </button>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-card text-primary border border-primary/20 px-4 py-2.5 rounded-xl font-bold shadow-sm hover:bg-primary/5 transition-all flex items-center gap-2 text-sm"
          >
            <Upload size={18} /> Bulk Upload
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary text-white px-4 py-2.5 rounded-xl font-bold shadow-sm hover:opacity-90 transition-all flex items-center gap-2 text-sm"
          >
            <Plus size={18} /> Add Class
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Total Scheduled</p>
          <p className="text-2xl font-bold">{analytics.total}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Attended</p>
          <p className="text-2xl font-bold text-success">{analytics.attended}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Bunked</p>
          <p className="text-2xl font-bold text-danger">{analytics.bunked}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Leaves</p>
          <p className="text-2xl font-bold text-warning">{analytics.leaves}</p>
        </div>
        <div className="bg-card p-4 rounded-xl border border-border shadow-sm">
          <p className="text-[10px] font-bold text-text-muted uppercase mb-1">Timetable Attendance</p>
          <p className="text-2xl font-bold text-primary">{analytics.attendancePercent}%</p>
        </div>
      </section>

      {viewMode === 'Grid' ? (
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border">
                <th className="p-4 text-xs font-bold uppercase text-text-muted border-r border-border min-w-[100px]">Day / Period</th>
                {PERIODS.map(p => (
                  <th key={p.id} className="p-4 text-center min-w-[150px] border-r border-border last:border-r-0">
                    <p className="text-[10px] font-bold text-text-muted uppercase">Period {p.id}</p>
                    <p className="text-[11px] font-bold text-text-main">{p.time}</p>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DAYS.map(day => (
                <tr key={day}>
                  <td className="p-4 font-bold text-sm bg-slate-50 border-r border-border">{day}</td>
                  {PERIODS.map(p => {
                    const slotStart = p.time.split(' - ')[0];
                    const entry = timetable.find(t => t.day === day && t.startTime === slotStart);
                    return (
                      <td key={p.id} className="p-2 border-r border-border last:border-r-0 min-h-[100px]">
                        {entry ? (
                          <motion.div 
                            whileHover={{ scale: 1.02 }}
                            className={`p-3 rounded-xl border h-full flex flex-col justify-between transition-all ${
                              entry.status === 'Attended' ? 'bg-success/5 border-success/20' :
                              entry.status === 'Bunked' ? 'bg-danger/5 border-danger/20' :
                              'bg-background border-border'
                            }`}
                          >
                            <div>
                              <p className="text-xs font-bold text-text-main leading-tight mb-1">{entry.subject?.subjectName}</p>
                              <p className="text-[9px] text-text-muted font-bold">{entry.subject?.teacherName}</p>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                              <span className={`text-[8px] font-black uppercase px-1 rounded ${entry.type === 'Mandatory' ? 'bg-red-100 text-danger' : 'bg-blue-100 text-primary'}`}>
                                {entry.type}
                              </span>
                              <div className="flex gap-1">
                                <button onClick={() => markStatus(entry._id, 'Attended')} className={`p-1 rounded ${entry.status === 'Attended' ? 'text-success' : 'text-text-muted hover:text-success'}`}><CheckCircle size={12} /></button>
                                <button onClick={() => markStatus(entry._id, 'Bunked')} className={`p-1 rounded ${entry.status === 'Bunked' ? 'text-danger' : 'text-text-muted hover:text-danger'}`}><XCircle size={12} /></button>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="h-full min-h-[60px] flex items-center justify-center">
                            <span className="text-[10px] text-text-muted/30 font-bold italic">Free</span>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {DAYS.map(day => (
            <div key={day} className="space-y-4">
              <h3 className="font-bold text-sm flex items-center gap-2 px-2">
                <Calendar size={16} className="text-primary" />
                {day}
              </h3>
              <div className="space-y-3">
                {timetable.filter(t => t.day === day).length > 0 ? (
                  timetable.filter(t => t.day === day).sort((a, b) => a.startTime.localeCompare(b.startTime)).map(entry => (
                    <motion.div
                      key={entry._id}
                      whileHover={{ x: 4 }}
                      className={`bg-card rounded-2xl p-4 border border-border shadow-sm relative ${
                        entry.status === 'Attended' ? 'border-l-4 border-l-success' :
                        entry.status === 'Bunked' ? 'border-l-4 border-l-danger' :
                        entry.status === 'Leave' ? 'border-l-4 border-l-warning' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-sm">{entry.subject?.subjectName || 'Unknown Subject'}</h4>
                          <div className="flex items-center gap-2 text-[10px] text-text-muted font-bold mt-1">
                            <Clock size={12} />
                            {entry.startTime} - {entry.endTime}
                            <span className={`px-1.5 py-0.5 rounded border ${
                              entry.type === 'Mandatory' ? 'bg-red-50 text-danger border-red-100' : 'bg-blue-50 text-primary border-blue-100'
                            }`}>
                              {entry.type}
                            </span>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteClick(entry._id)}
                          className="text-text-muted hover:text-danger transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => markStatus(entry._id, 'Attended')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            entry.status === 'Attended' ? 'bg-success text-white border-success' : 'bg-background text-text-main border-border hover:bg-success/10'
                          }`}
                        >
                          <CheckCircle size={12} /> Attended
                        </button>
                        <button
                          onClick={() => markStatus(entry._id, 'Bunked')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            entry.status === 'Bunked' ? 'bg-danger text-white border-danger' : 'bg-background text-text-main border-border hover:bg-danger/10'
                          }`}
                        >
                          <XCircle size={12} /> Bunked
                        </button>
                        <button
                          onClick={() => markStatus(entry._id, 'Leave')}
                          className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border transition-all flex items-center justify-center gap-1 ${
                            entry.status === 'Leave' ? 'bg-warning text-white border-warning' : 'bg-background text-text-main border-border hover:bg-warning/10'
                          }`}
                        >
                          <MinusCircle size={12} /> Leave
                        </button>
                      </div>

                      {/* Prediction Logic for this class */}
                      {entry.subject && entry.status !== 'Attended' && (
                        <div className="mt-3 pt-3 border-t border-border">
                          <div className="flex items-start gap-2">
                            <Info size={12} className="text-primary mt-0.5" />
                            <div className="text-[9px] leading-tight font-medium">
                              {(() => {
                                const s = entry.subject;
                                const currentAtt = s.totalClasses > 0 ? (s.attendedClasses / s.totalClasses) * 100 : 0;
                                const ifSkip = ((s.attendedClasses) / (s.totalClasses + 1)) * 100;
                                
                                let needed = 0;
                                if (currentAtt < 75) {
                                  needed = Math.ceil((0.75 * s.totalClasses - s.attendedClasses) / 0.25);
                                }

                                return (
                                  <>
                                    <p>If you skip: Attendance drops to <span className="text-danger font-bold">{ifSkip.toFixed(1)}%</span></p>
                                    {needed > 0 && <p className="mt-1 text-primary">Attend next <span className="font-bold">{needed}</span> classes to reach 75%.</p>}
                                  </>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))
                ) : (
                  <div className="py-8 text-center bg-background rounded-xl border border-dashed border-border">
                    <p className="text-[10px] text-text-muted font-bold italic">No classes scheduled.</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-5xl rounded-2xl p-6 border border-border shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-bold">Upload University Timetable</h3>
                <p className="text-xs text-text-muted">Supports PDF, Image, and Excel formats.</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-text-muted hover:text-text-main">
                <X size={24} />
              </button>
            </div>

            {!uploadedFile ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center gap-4 hover:border-primary/50 transition-all cursor-pointer relative group">
                    <input type="file" accept="application/pdf" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-danger group-hover:scale-110 transition-transform">
                      <FileText size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-sm">Upload PDF</p>
                      <p className="text-xs text-text-muted mt-1">Official Timetable</p>
                    </div>
                  </div>
                  {/* ... other upload options ... */}
                </div>
              </div>
            ) : isParsing ? (
              <div className="py-20 flex flex-col items-center justify-center gap-6">
                {/* ... parsing loader ... */}
              </div>
            ) : (
              <div className="space-y-8">
                {/* Section 1: Timetable Preview */}
                <div>
                  <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-primary" />
                    1. Weekly Schedule Preview
                  </h4>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 border-b border-border">
                        <tr>
                          <th className="px-4 py-3 font-bold text-xs uppercase text-text-muted">Subject</th>
                          <th className="px-4 py-3 font-bold text-xs uppercase text-text-muted">Day</th>
                          <th className="px-4 py-3 font-bold text-xs uppercase text-text-muted">Time</th>
                          <th className="px-4 py-3 font-bold text-xs uppercase text-text-muted">Type</th>
                          <th className="px-4 py-3 font-bold text-xs uppercase text-text-muted w-10"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {uploadPreview.map((entry) => (
                          <tr key={entry._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-4 py-3">
                              <select 
                                value={entry.subjectId}
                                onChange={(e) => updatePreviewEntry(entry._id, 'subjectId', e.target.value)}
                                className="bg-transparent border-none font-bold text-sm focus:ring-0 w-full"
                              >
                                {previewSubjects.map(s => <option key={s._id} value={s._id}>{s.subjectName}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <select 
                                value={entry.day}
                                onChange={(e) => updatePreviewEntry(entry._id, 'day', e.target.value)}
                                className="bg-transparent border-none text-sm focus:ring-0 w-full"
                              >
                                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <input type="time" value={entry.startTime} onChange={(e) => updatePreviewEntry(entry._id, 'startTime', e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 p-0" />
                                <span className="text-text-muted">-</span>
                                <input type="time" value={entry.endTime} onChange={(e) => updatePreviewEntry(entry._id, 'endTime', e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 p-0" />
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <select value={entry.type} onChange={(e) => updatePreviewEntry(entry._id, 'type', e.target.value)} className="bg-transparent border-none text-xs focus:ring-0 w-full">
                                <option value="Mandatory">Mandatory</option>
                                <option value="Optional">Optional</option>
                              </select>
                            </td>
                            <td className="px-4 py-3">
                              <button onClick={() => removePreviewEntry(entry._id)} className="text-text-muted hover:text-danger p-1"><Trash2 size={14} /></button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Section 2: Subjects & Faculty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <BookOpen size={18} className="text-primary" />
                      2. Extracted Subjects & Faculty
                    </h4>
                    <div className="space-y-3">
                      {previewSubjects.map(s => (
                        <div key={s._id} className="p-3 bg-background border border-border rounded-xl flex justify-between items-center">
                          <div>
                            <p className="font-bold text-sm">{s.subjectName}</p>
                            <p className="text-[10px] text-text-muted font-bold uppercase">{s.teacherName}</p>
                          </div>
                          <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded">{s.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm mb-4 flex items-center gap-2">
                      <FlaskConical size={18} className="text-primary" />
                      3. Lab Sessions & Groups
                    </h4>
                    <div className="space-y-3">
                      {previewLabs.map(l => (
                        <div key={l._id} className="p-3 bg-background border border-border rounded-xl">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-bold text-sm">{l.name}</p>
                            <span className="text-[10px] font-bold bg-success/10 text-success px-2 py-0.5 rounded">{l.group}</span>
                          </div>
                          <p className="text-[10px] text-text-muted font-bold uppercase">{l.room} • {l.faculty}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <AlertCircle size={20} className="text-primary" />
                    <div>
                      <p className="font-bold text-sm">Validity Date</p>
                      <p className="text-xs text-text-muted">When does this timetable become effective?</p>
                    </div>
                  </div>
                  <input 
                    type="date" 
                    value={validityDate} 
                    onChange={(e) => setValidityDate(e.target.value)}
                    className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={handleConfirmUploadClick} className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2">
                    <Check size={18} /> Confirm & Save University Timetable
                  </button>
                  <button onClick={() => { setUploadedFile(null); setUploadPreview([]); }} className="px-6 bg-slate-100 text-text-main py-3 rounded-xl font-bold text-sm hover:bg-slate-200 transition-all">
                    Re-upload
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card w-full max-w-md rounded-2xl p-6 border border-border shadow-2xl"
          >
            <h3 className="text-lg font-bold mb-4">Add Class to Timetable</h3>
            <form onSubmit={handleAddEntry} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-text-muted uppercase">Subject</label>
                <select
                  value={newEntry.subjectId}
                  onChange={(e) => setNewEntry({ ...newEntry, subjectId: e.target.value })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                >
                  {subjects.map(s => (
                    <option key={s._id} value={s._id}>{s.subjectName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Day</label>
                  <select
                    value={newEntry.day}
                    onChange={(e) => setNewEntry({ ...newEntry, day: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Class Type</label>
                  <select
                    value={newEntry.type}
                    onChange={(e) => setNewEntry({ ...newEntry, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="Mandatory">Mandatory</option>
                    <option value="Optional">Optional</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">Start Time</label>
                  <input
                    type="time"
                    value={newEntry.startTime}
                    onChange={(e) => setNewEntry({ ...newEntry, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-text-muted uppercase">End Time</label>
                  <input
                    type="time"
                    value={newEntry.endTime}
                    onChange={(e) => setNewEntry({ ...newEntry, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !newEntry.subjectId}
                  className="flex-1 bg-primary text-white py-2 rounded-lg font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 size={16} className="animate-spin" /> : 'Add Class'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 text-text-main py-2 rounded-lg font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </Layout>
  );
};

export default Timetable;
