import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import auditMiddleware from '../middleware/auditMiddleware.js';
import { createInvoice, getInvoices, updatePayment } from '../controllers/invoiceController.js';

const router = express.Router();

router.route('/')
  .post(protect, authorize('admin', 'receptionist', 'pharmacy'), auditMiddleware('create', 'Invoice'), createInvoice)
  .get(protect, getInvoices); // Patient can view own, staff can view all

router.patch('/:id/payment', protect, authorize('admin', 'receptionist', 'pharmacy'), auditMiddleware('update', 'Invoice'), updatePayment);

export default router;
