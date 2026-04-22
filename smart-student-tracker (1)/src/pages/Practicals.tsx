import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FlaskConical, MapPin, Users, Calendar } from 'lucide-react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { dataService } from '../services/dataService';

const Practicals = () => {
  const [labs, setLabs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLabs = async () => {
      if (!user) return;
      try {
        const userLabs = await dataService.getCollection(user.id, 'practicals');
        setLabs(Array.isArray(userLabs) ? userLabs : []);
      } catch (error) {
        console.error('Error fetching labs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLabs();
  }, [user]);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <Layout>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-text-main">Practical & Lab Sessions</h2>
          <p className="text-text-muted text-sm">Manage your lab groups, rooms, and faculty.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {labs.map((lab) => (
          <motion.div
            key={lab._id}
            whileHover={{ y: -4 }}
            className="bg-card rounded-2xl p-6 border border-border shadow-sm flex flex-col md:flex-row gap-6"
          >
            <div className="w-16 h-16 bg-success/10 text-success rounded-2xl flex items-center justify-center flex-shrink-0">
              <FlaskConical size={32} />
            </div>
            
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-bold text-lg text-text-main">{lab.name}</h3>
                <p className="text-xs text-text-muted font-medium">Faculty: {lab.faculty}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center text-primary">
                    <Users size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Group</p>
                    <p className="text-sm font-bold">{lab.group}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-background border border-border rounded-lg flex items-center justify-center text-primary">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-text-muted uppercase">Room</p>
                    <p className="text-sm font-bold">{lab.room}</p>
                  </div>
                </div>
              </div>

              {lab.schedule && (
                <div className="bg-background p-3 rounded-xl border border-border flex items-center gap-3">
                  <Calendar size={16} className="text-text-muted" />
                  <p className="text-xs font-medium text-text-main">{lab.schedule}</p>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {labs.length === 0 && (
          <div className="col-span-full py-20 text-center bg-background rounded-2xl border border-dashed border-border">
            <FlaskConical size={40} className="mx-auto text-text-muted/30 mb-4" />
            <p className="text-text-muted font-bold">No lab sessions found.</p>
            <p className="text-xs text-text-muted mt-1">Upload a timetable PDF to automatically populate this list.</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Practicals;
