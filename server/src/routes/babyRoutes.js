import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { validateRequest, babyRegistrationSchema } from '../utils/zodSchemas.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { getBaby, getBabies, updateBaby, verifyBaby, addGrowth, updateVaccination, addBabyVisit, addBabyReport, registerBaby } from '../controllers/babyController.js';

const router = express.Router();

router.get('/verify', verifyBaby); // Public

router.route('/')
  .get(protect, auditMiddleware('read', 'Baby'), getBabies)
  .post(protect, authorize('admin', 'receptionist', 'doctor', 'nurse'), validateRequest(babyRegistrationSchema), auditMiddleware('create', 'Baby'), registerBaby);

router.route('/:babyId')
  .get(protect, auditMiddleware('read', 'Baby'), getBaby)
  .patch(protect, authorize('admin', 'doctor', 'nurse'), auditMiddleware('update', 'Baby'), updateBaby);

router.post('/:babyId/growth', protect, authorize('doctor', 'nurse'), auditMiddleware('create', 'BabyGrowth'), addGrowth);
router.patch('/:babyId/vaccinations/:vaccId', protect, authorize('doctor', 'nurse'), auditMiddleware('update', 'BabyVaccination'), updateVaccination);
router.post('/:babyId/visits', protect, authorize('doctor'), auditMiddleware('create', 'Visit'), addBabyVisit);
router.post('/:babyId/reports', protect, authorize('doctor', 'lab'), auditMiddleware('create', 'LabReport'), addBabyReport);

export default router;
