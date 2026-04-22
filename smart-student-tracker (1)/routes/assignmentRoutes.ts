import express from 'express';
import { addAssignment, getAssignments, updateAssignmentStatus } from '../controllers/assignmentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', addAssignment);
router.get('/', getAssignments);
router.patch('/:id/status', updateAssignmentStatus);

export default router;
