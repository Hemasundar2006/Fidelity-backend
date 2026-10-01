import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { getPregnancy, addAntenatalVisit, deliverBaby } from '../controllers/pregnancyController.js';

const router = express.Router();

router.route('/:id')
  .get(protect, auditMiddleware('read', 'Pregnancy'), getPregnancy);

router.post('/:id/antenatal-visits', protect, authorize('doctor', 'nurse'), auditMiddleware('update', 'Pregnancy'), addAntenatalVisit);
router.post('/:id/delivery', protect, authorize('doctor'), auditMiddleware('create', 'Delivery'), deliverBaby);

export default router;
