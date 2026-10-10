import express from 'express';
import { login, me, logout, registerUser, getAllUsers, getDoctors, patientLogin } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';

const router = express.Router();

router.post('/login', auditMiddleware('login', 'User'), login);
router.post('/patient/login', patientLogin);
router.post('/logout', logout);
router.get('/me', protect, me);

// Route for admin / superadmin to create users
router.post('/register', protect, authorize('admin', 'superadmin'), registerUser);

router.get('/users', protect, authorize('admin', 'superadmin'), getAllUsers);
router.get('/doctors', protect, authorize('admin', 'superadmin', 'receptionist'), getDoctors);

export default router;
