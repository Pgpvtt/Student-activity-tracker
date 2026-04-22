import express from 'express';
import { addSubject, getSubjects, markAttendance } from '../controllers/subjectController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', addSubject);
router.get('/', getSubjects);
router.post('/mark', markAttendance);

export default router;
