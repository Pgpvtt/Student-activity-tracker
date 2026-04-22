import { Response } from 'express';
import { Subject } from '../models/Subject.js';
import { Assignment } from '../models/Assignment.js';
import { AuthRequest } from '../middleware/auth.js';

export const getDashboardData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const subjects = await Subject.find({ userId });
    const assignments = await Assignment.find({ userId, status: 'Pending' })
      .populate('subjectId', 'subjectName color')
      .sort({ deadline: 1 });

    // Overall Attendance
    let totalClasses = 0;
    let attendedClasses = 0;
    const lowAttendanceSubjects: any[] = [];

    subjects.forEach(sub => {
      totalClasses += sub.totalClasses;
      attendedClasses += sub.attendedClasses;
      
      const attendance = sub.totalClasses === 0 ? 0 : (sub.attendedClasses / sub.totalClasses) * 100;
      if (attendance < 75) {
        lowAttendanceSubjects.push({
          id: sub._id,
          name: sub.subjectName,
          attendance: attendance.toFixed(1)
        });
      }
    });

    const overallAttendance = totalClasses === 0 ? 0 : (attendedClasses / totalClasses) * 100;

    // Upcoming Assignments (next 5)
    const upcomingAssignments = assignments.slice(0, 5);

    // Urgent Assignments (deadline within 48h)
    const now = new Date();
    const fortyEightHoursLater = new Date(now.getTime() + 48 * 60 * 60 * 1000);
    const urgentAssignments = assignments.filter(a => new Date(a.deadline) <= fortyEightHoursLater);

    res.json({
      overallAttendance: overallAttendance.toFixed(1),
      lowAttendanceCount: lowAttendanceSubjects.length,
      lowAttendanceSubjects,
      pendingTasksCount: assignments.length,
      urgentTasksCount: urgentAssignments.length,
      upcomingAssignments,
      urgentAssignments
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
