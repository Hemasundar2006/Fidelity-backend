import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { 
  getDoctors,
  getPublicOpdSummary,
  getAvailableSlots,
  publicBookAppointment,
  createAppointment,
  getAppointments,
  updateAppointment 
} from '../controllers/appointmentController.js';

const router = express.Router();

// ==========================================
// Public Routes (For Website Landing Page)
// ==========================================
router.get('/doctors', getDoctors);
router.get('/opd-summary', getPublicOpdSummary);
router.get('/available-slots', getAvailableSlots);
router.post('/public-book', publicBookAppointment);

// ==========================================
// Operational Routes (For Staff & Receptionist Queue)
// ==========================================
router.route('/')
  .post(protect, authorize('admin', 'receptionist'), auditMiddleware('create', 'Appointment'), createAppointment)
  .get(getAppointments);

router.patch('/:id', updateAppointment);

export default router;
