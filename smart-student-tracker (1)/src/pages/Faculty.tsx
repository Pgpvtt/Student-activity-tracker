import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, Mail, BookOpen, Search } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const Faculty = () => {
  const [faculty, setFaculty] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return;
      try {
        const userFaculty = await dataService.getCollection(user.id, 'faculty');
        setFaculty(Array.isArray(userFaculty) ? userFaculty : []);
      } catch (error) {
        console.error('Error fetching faculty:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFaculty();
  }, [user]);

  const filteredFaculty = faculty.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.subjects.some((s: string) => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Faculty Directory</h2>
          <p className="text-text-muted text-sm">List of teachers and their assigned subjects.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input
          type="text"
          placeholder="Search by name or subject..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((teacher) => (
          <motion.div
            key={teacher._id}
            whileHover={{ y: -4 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-lg">
                {teacher.name.charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-text-main">{teacher.name}</h3>
                <p className="text-xs text-text-muted">{teacher.designation || 'Faculty Member'}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <BookOpen size={16} className="text-primary mt-0.5" />
                <div>
                  <p className="text-[10px] font-bold text-text-muted uppercase">Subjects</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {teacher.subjects.map((s: string) => (
                      <span key={s} className="px-2 py-0.5 bg-background border border-border rounded text-[10px] font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              {teacher.email && (
                <div className="flex items-center gap-3">
                  <Mail size={16} className="text-primary" />
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Email</p>
                    <p className="text-xs font-medium">{teacher.email}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
        
        {filteredFaculty.length === 0 && (
          <div className="col-span-full py-20 text-center bg-background rounded-2xl border border-dashed border-border">
            <Users size={40} className="mx-auto text-text-muted/30 mb-4" />
            <p className="text-text-muted font-bold">No faculty members found.</p>
            <p className="text-xs text-text-muted mt-1">Upload a timetable PDF to automatically populate this list.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Faculty;
