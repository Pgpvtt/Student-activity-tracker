import { Response } from 'express';
import { Subject } from '../models/Subject.js';
import { AuthRequest } from '../middleware/auth.js';

export const addSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectName, color } = req.body;
    const subject = new Subject({
      userId: req.user?.id,
      subjectName,
      color
    });
    await subject.save();
    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await Subject.find({ userId: req.user?.id });
    
    const subjectsWithInsights = subjects.map(sub => {
      const total = sub.totalClasses || 0;
      const attended = sub.attendedClasses || 0;
      const attendance = total === 0 ? 0 : (attended / total) * 100;
      
      // Smart Insights Logic
      // 1. Safe Bunk: floor(attendedClasses - 0.75 * totalClasses)
      const safeBunk = Math.max(0, Math.floor(attended - 0.75 * total));
      
      // 2. Classes Needed to Reach 75%: max(0, ceil((0.75 * totalClasses - attendedClasses) / 0.25))
      const needed = Math.max(0, Math.ceil((0.75 * total - attended) / 0.25));
      
      let recommendation = "";
      if (attendance < 75) {
        recommendation = "Attend next class to avoid a performance warning.";
      } else if (safeBunk > 0) {
        recommendation = "Safe to skip today's session if you need to catch up on assignments.";
      } else {
        recommendation = "Better attend today to maintain your buffer.";
      }

      return {
        ...sub.toObject(),
        insights: {
          attendance: attendance.toFixed(1),
          safeBunk,
          needed,
          recommendation
        }
      };
    });

    res.json(subjectsWithInsights);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const markAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, status } = req.body; // status: 'present' or 'absent'
    const subject = await Subject.findOne({ _id: subjectId, userId: req.user?.id });
    
    if (!subject) return res.status(404).json({ message: 'Subject not found' });

    subject.totalClasses += 1;
    if (status === 'present') {
      subject.attendedClasses += 1;
    }

    await subject.save();

    // Return updated insights
    const total = subject.totalClasses;
    const attended = subject.attendedClasses;
    const attendance = (attended / total) * 100;
    const safeBunk = Math.max(0, Math.floor(attended - 0.75 * total));
    const needed = Math.max(0, Math.ceil((0.75 * total - attended) / 0.25));
    
    res.json({
      ...subject.toObject(),
      insights: {
        attendance: attendance.toFixed(1),
        safeBunk,
        needed
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
