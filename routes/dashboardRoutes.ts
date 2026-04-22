import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authMiddleware, getDashboardData);

export default router;
