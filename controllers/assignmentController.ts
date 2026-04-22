import { Response } from 'express';
import { Assignment } from '../models/Assignment.js';
import { AuthRequest } from '../middleware/auth.js';

export const addAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectId, title, deadline, priority } = req.body;
    const assignment = new Assignment({
      userId: req.user?.id,
      subjectId,
      title,
      deadline,
      priority
    });
    await assignment.save();
    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const assignments = await Assignment.find({ userId: req.user?.id })
      .populate('subjectId', 'subjectName color')
      .sort({ deadline: 1 });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateAssignmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const assignment = await Assignment.findOneAndUpdate(
      { _id: id, userId: req.user?.id },
      { status },
      { new: true }
    );
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};
