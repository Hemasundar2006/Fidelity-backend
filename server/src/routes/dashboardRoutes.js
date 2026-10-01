import express from 'express';
import { protect, authorize, checkConsent } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);

export default router;
