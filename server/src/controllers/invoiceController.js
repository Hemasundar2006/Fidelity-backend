import Invoice from '../models/Invoice.js';
import { generateId } from '../services/idGenerator.js';
import asyncHandler from '../utils/asyncHandler.js';

export const createInvoice = asyncHandler(async (req, res) => {
  const invoiceNo = await generateId('INV');
  const { patient, items, totalPaise, insurance } = req.body;
  
  const invoice = await Invoice.create({
    invoiceNo,
    patient,
    items,
    totalPaise,
    insurance,
    createdBy: req.user._id
  });
  
  res.status(201).json({ success: true, data: invoice });
});

export const getInvoices = asyncHandler(async (req, res) => {
  const { patient } = req.query;
  const filter = { isDeleted: false };
  if (patient) filter.patient = patient;

  // Patient can only view own invoices
  if (req.user.role === 'patient') {
    filter.patient = req.user.patientRef;
  }

  const invoices = await Invoice.find(filter).sort('-createdAt');
  res.json({ success: true, data: invoices });
});

export const updatePayment = asyncHandler(async (req, res) => {
  const { paidPaise } = req.body;
  const invoice = await Invoice.findById(req.params.id);
  
  if (!invoice) return res.status(404).json({ success: false, error: { message: 'Not found' }});

  invoice.paidPaise = (invoice.paidPaise || 0) + paidPaise;
  if (invoice.paidPaise >= invoice.totalPaise) {
    invoice.status = 'paid';
  } else if (invoice.paidPaise > 0) {
    invoice.status = 'partial';
  }

  await invoice.save();
  res.json({ success: true, data: invoice });
});
