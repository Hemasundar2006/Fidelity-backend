import express from 'express';
import { login, me, logout, registerUser, getAllUsers, patientLogin } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';

const router = express.Router();

router.post('/login', auditMiddleware('login', 'User'), login);
router.post('/patient/login', patientLogin);
router.post('/logout', logout);
router.get('/me', protect, me);

// Example route for admin to create users
router.post('/register', protect, authorize('admin'), registerUser);

router.get('/users', protect, authorize('admin'), getAllUsers);

export default router;
