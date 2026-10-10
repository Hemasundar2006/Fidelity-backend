import express from 'express';
import { optionalProtect } from '../middleware/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', optionalProtect, getDashboardStats);

export default router;
