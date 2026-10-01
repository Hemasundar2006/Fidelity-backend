import Patient from '../models/Patient.js';
import Visit from '../models/Visit.js';
import LabReport from '../models/LabReport.js';
import Pregnancy from '../models/Pregnancy.js';
import Delivery from '../models/Delivery.js';
import AuditLog from '../models/AuditLog.js';
import { generateId } from '../services/idGenerator.js';
import { generateQR } from '../services/qrService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const registerPatient = asyncHandler(async (req, res) => {
  const { phone, dob } = req.body;
  const existing = await Patient.findOne({ phone, dob, isDeleted: false });
  if (existing) {
    throw new AppError('Patient with this phone and DOB already exists', 409, 'CONFLICT');
  }

  const motherId = await generateId('MOM');
  const qr = await generateQR(motherId, `fidelity/patients/${motherId}`);

  const patient = await Patient.create({
    ...req.body,
    motherId,
    qr,
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: { _id: patient._id, motherId, qr }
  });
});

export const getPatients = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const query = { isDeleted: false };
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { motherId: { $regex: q, $options: 'i' } },
      { phone: { $regex: q, $options: 'i' } }
    ];
  }

  const patients = await Patient.find(query)
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
    
  const total = await Patient.countDocuments(query);

  res.json({
    success: true,
    data: patients,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

export const getPatientById = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) throw new AppError('Not found', 404);
  res.json({ success: true, data: patient });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: patient });
});

export const getPatientTimeline = asyncHandler(async (req, res) => {
  const pid = req.params.id;
  const visits = await Visit.find({ patient: pid }).lean();
  const reports = await LabReport.find({ patient: pid }).lean();
  const deliveries = await Delivery.find({ patient: pid }).lean();

  let timeline = [];
  visits.forEach(v => timeline.push({ type: 'visit', date: v.visitDate, title: 'Clinical Visit', summary: v.complaint, refId: v._id }));
  reports.forEach(r => timeline.push({ type: 'report', date: r.reportedAt, title: `Lab Report: ${r.testType}`, summary: r.remarks, refId: r._id }));
  deliveries.forEach(d => timeline.push({ type: 'delivery', date: d.deliveredAt, title: `Delivery (${d.type})`, summary: d.maternalOutcome, refId: d._id }));

  timeline.sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json({ success: true, data: timeline });
});

export const getPatientSummary = asyncHandler(async (req, res) => {
  // Without ML service: just return recent history
  const pid = req.params.id;
  const visits = await Visit.find({ patient: pid }).sort('-visitDate').limit(5).lean();
  const reports = await LabReport.find({ patient: pid }).sort('-reportedAt').limit(5).lean();
  const preg = await Pregnancy.findOne({ patient: pid, status: 'ongoing' }).lean();

  const bullets = [];
  if (preg) bullets.push({ text: `Active pregnancy: ${preg.riskLevel} risk.`, sourceType: 'pregnancy', sourceId: preg._id });
  visits.forEach(v => bullets.push({ text: `Visit on ${v.visitDate}: ${v.complaint}`, sourceType: 'visit', sourceId: v._id }));
  reports.forEach(r => bullets.push({ text: `Report ${r.testType}: ${r.results.map(res => res.flag).join(',')}`, sourceType: 'labReport', sourceId: r._id }));

  res.json({ success: true, data: { bullets, generatedAt: new Date() } });
});

export const getAccessLog = asyncHandler(async (req, res) => {
  const logs = await AuditLog.find({ entityId: req.params.id }).sort('-timestamp').populate('user', 'name role');
  res.json({ success: true, data: logs });
});

export const addConsent = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  patient.consents.push({ ...req.body, grantedAt: new Date() });
  await patient.save();
  res.json({ success: true, data: patient });
});

export const removeConsent = asyncHandler(async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  const consent = patient.consents.id(req.params.consentId);
  if (consent) {
    consent.granted = false;
    consent.revokedAt = new Date();
    await patient.save();
  }
  res.json({ success: true, data: patient });
});

export const addVisit = asyncHandler(async (req, res) => {
  const visit = await Visit.create({ ...req.body, patient: req.params.id, doctor: req.user._id });
  res.status(201).json({ success: true, data: visit });
});

export const getVisits = asyncHandler(async (req, res) => {
  const visits = await Visit.find({ patient: req.params.id }).sort('-visitDate');
  res.json({ success: true, data: visits });
});

export const checkDuplicateTest = asyncHandler(async (req, res) => {
  const { testType } = req.query;
  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const existing = await LabReport.findOne({ 
    patient: req.params.id, 
    testType, 
    reportedAt: { $gte: fourteenDaysAgo }
  });

  if (existing) {
    const daysAgo = Math.floor((new Date() - existing.reportedAt) / (1000 * 60 * 60 * 24));
    return res.json({ success: true, warnings: [{ code: 'DUPLICATE_TEST', lastReportId: existing._id, daysAgo }] });
  }
  res.json({ success: true, warnings: [] });
});

export const addReport = asyncHandler(async (req, res) => {
  // auto-set flags based on refRange
  const results = req.body.results || [];
  results.forEach(r => {
    if (r.refRange && r.value) {
      const parts = r.refRange.split('-');
      if (parts.length === 2) {
        const min = parseFloat(parts[0]);
        const max = parseFloat(parts[1]);
        if (!isNaN(min) && !isNaN(max)) {
          if (r.value < min) r.flag = 'low';
          else if (r.value > max) r.flag = 'high';
          else r.flag = 'normal';
        }
      }
    }
  });

  const report = new LabReport({ ...req.body, results, patient: req.params.id, orderedBy: req.user._id });
  await report.save();

  // Call checkDuplicate again to attach warning in response if needed (but API spec says just return it or add to response)
  res.status(201).json({ success: true, data: report });
});

export const getReports = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = { patient: req.params.id, isDeleted: false };
  if (category) query.category = category;
  
  const reports = await LabReport.find(query).sort('-reportedAt');
  res.json({ success: true, data: reports });
});

export const addPregnancy = asyncHandler(async (req, res) => {
  const { lmp, conception } = req.body;
  
  const activePregnancy = await Pregnancy.findOne({ patient: req.params.id, status: 'ongoing' });
  if (activePregnancy) throw new AppError('Only one ongoing pregnancy allowed', 409);

  const prevPregnancies = await Pregnancy.countDocuments({ patient: req.params.id });
  
  const lmpDate = new Date(lmp);
  const eddDate = new Date(lmpDate);
  eddDate.setDate(eddDate.getDate() + 280);

  const pregnancy = await Pregnancy.create({
    patient: req.params.id,
    pregnancyNo: prevPregnancies + 1,
    lmp: lmpDate,
    edd: eddDate,
    conception,
    createdBy: req.user._id
  });

  res.status(201).json({ success: true, data: { pregnancyNo: pregnancy.pregnancyNo, edd: pregnancy.edd, status: pregnancy.status, _id: pregnancy._id } });
});
