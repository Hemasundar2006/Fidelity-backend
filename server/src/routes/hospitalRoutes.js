import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { registerHospital, getHospitals, approveHospital } from '../controllers/hospitalController.js';

const router = express.Router();

// Public route for hospital to register
router.post('/register', registerHospital);

// Super admin routes to view and approve hospitals
router.use(protect);
router.use(authorize('superadmin'));

router.route('/')
  .get(getHospitals);

router.route('/:id/approve')
  .patch(approveHospital);

export default router;
