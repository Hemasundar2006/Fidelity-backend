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
import jwt from 'jsonwebtoken';

export const registerPatient = asyncHandler(async (req, res) => {
  const { phone, dob } = req.body;
  const existing = await Patient.findOne({ phone, dob, isDeleted: false });
  if (existing) {
    throw new AppError('Patient with this phone and DOB already exists', 409, 'CONFLICT');
  }

  const motherId = await generateId('MOM');
  const qr = await generateQR(motherId, `fidelity/patients/${motherId}`);

  // Normalize consents if sent as object { treatment: true, data_sharing: true, ... }
  let consents = req.body.consents;
  if (consents && typeof consents === 'object' && !Array.isArray(consents)) {
    consents = Object.entries(consents).map(([type, granted]) => ({
      type,
      granted: Boolean(granted),
      grantedAt: new Date(),
      method: 'in_person'
    }));
  }

  // Normalize medicalHistory strings into arrays if strings were provided
  let medicalHistory = { ...req.body.medicalHistory };
  if (medicalHistory) {
    ['allergies', 'conditions', 'surgeries', 'medications'].forEach(key => {
      if (typeof medicalHistory[key] === 'string') {
        medicalHistory[key] = medicalHistory[key]
          ? medicalHistory[key].split(',').map(s => s.trim()).filter(Boolean)
          : [];
      }
    });
  }

  // Normalize partner empty fields to prevent CastError on Date
  let partner = { ...req.body.partner };
  if (partner) {
    if (!partner.dob) delete partner.dob;
    if (!partner.bloodGroup) delete partner.bloodGroup;
  }

  // Normalize idProof
  let idProof = req.body.idProof;
  if (idProof && !idProof.type) {
    idProof = { ...idProof, type: 'aadhaar' };
  }

  const patient = await Patient.create({
    ...req.body,
    consents,
    medicalHistory,
    partner,
    idProof,
    motherId,
    qr,
    hospitalRef: req.user.hospitalRef,
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

  // Tenant Isolation
  if (req.user.role !== 'superadmin' && req.user.hospitalRef) {
    query.hospitalRef = req.user.hospitalRef;
  } else if (req.user.role !== 'superadmin') {
    // Failsafe: if they have no hospitalRef and are not superadmin, they should see nothing.
    return res.json({ success: true, data: [], meta: { page: 1, limit: Number(limit), total: 0 } });
  }

  // Doctor Isolation
  if (req.user.role === 'doctor') {
    query.assignedDoctor = req.user._id;
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
  const patient = await Patient.findById(req.params.id)
    .populate('hospitalRef', 'hospitalName email mobile')
    .populate('assignedDoctor', 'name email specialization');
  if (!patient) throw new AppError('Not found', 404);

  const patientObj = patient.toObject();
  const ongoingPregnancy = await Pregnancy.findOne({ patient: req.params.id, status: 'ongoing' }).lean();
  if (ongoingPregnancy) {
    patientObj.ongoingPregnancy = ongoingPregnancy;
    patientObj.riskLevel = ongoingPregnancy.riskLevel || patientObj.riskLevel || 'low';
    patientObj.currentPregnancy = {
      ...(patientObj.currentPregnancy || {}),
      riskLevel: ongoingPregnancy.riskLevel || 'low',
      edd: ongoingPregnancy.edd,
      lmp: ongoingPregnancy.lmp,
      antenatalVisits: ongoingPregnancy.antenatalVisits || []
    };
  }

  res.json({ success: true, data: patientObj });
});

export const updatePatient = asyncHandler(async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, { new: true })
    .populate('hospitalRef', 'hospitalName email mobile')
    .populate('assignedDoctor', 'name email specialization');
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
  const { vitals, notes, followUpDate, riskLevel, riskFactors, visitDate, weeks } = req.body;
  
  const visit = await Visit.create({
    ...req.body,
    patient: req.params.id,
    doctor: req.user?._id,
    visitDate: visitDate || new Date()
  });

  // Synchronize with active Pregnancy record
  try {
    let pregnancy = await Pregnancy.findOne({ patient: req.params.id, status: 'ongoing' });
    if (!pregnancy) {
      // Create initial pregnancy tracker if not present
      const edd = new Date();
      edd.setDate(edd.getDate() + (40 - (weeks || 12)) * 7);
      const lmp = new Date();
      lmp.setDate(lmp.getDate() - (weeks || 12) * 7);
      pregnancy = new Pregnancy({
        patient: req.params.id,
        pregnancyNo: 1,
        lmp,
        edd,
        status: 'ongoing',
        createdBy: req.user?._id
      });
    }

    if (riskLevel) pregnancy.riskLevel = riskLevel;
    if (Array.isArray(riskFactors) && riskFactors.length > 0) {
      pregnancy.riskFactors = riskFactors;
    }

    // Append antenatal visit record
    pregnancy.antenatalVisits.push({
      visitDate: visitDate || new Date(),
      gestationWeeks: weeks || vitals?.weeks || 12,
      bpSys: vitals?.bpSys,
      bpDia: vitals?.bpDia,
      weightKg: vitals?.weightKg,
      hb: vitals?.hb,
      bloodSugar: vitals?.bloodSugar,
      fetalHeartRate: vitals?.fhr,
      scanNotes: notes,
      doctor: req.user?._id,
      nextVisit: followUpDate
    });

    await pregnancy.save();

    // Update Patient model top-level risk level and current pregnancy status
    await Patient.findByIdAndUpdate(req.params.id, {
      ...(riskLevel ? { riskLevel } : {}),
      ...(followUpDate ? { nextVisitDate: followUpDate } : {}),
      'currentPregnancy.riskLevel': riskLevel || 'low',
      'currentPregnancy.gestationWeeks': weeks || vitals?.weeks || 12,
      'currentPregnancy.edd': pregnancy.edd,
      'currentPregnancy.lastVisitDate': visitDate || new Date(),
      'vitals.bpSys': vitals?.bpSys,
      'vitals.bpDia': vitals?.bpDia,
      'vitals.weightKg': vitals?.weightKg,
      'vitals.hb': vitals?.hb
    });
  } catch (syncErr) {
    console.warn('Failed to sync pregnancy visit:', syncErr.message);
  }

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
    if (r.refRange && r.value !== undefined && r.value !== null && r.value !== '') {
      const num = parseFloat(r.value);
      if (!isNaN(num)) {
        const parts = String(r.refRange).split('-');
        if (parts.length === 2) {
          const min = parseFloat(parts[0]);
          const max = parseFloat(parts[1]);
          if (!isNaN(min) && !isNaN(max)) {
            if (num < min) r.flag = 'low';
            else if (num > max) r.flag = 'high';
            else r.flag = 'normal';
          }
        }
      } else if (!r.flag) {
        r.flag = 'normal';
      }
    } else if (!r.flag) {
      r.flag = 'normal';
    }
  });

  const report = new LabReport({
    ...req.body,
    results,
    patient: req.params.id,
    orderedBy: req.user?._id || req.body.orderedBy,
    createdBy: req.user?._id,
    reportedAt: req.body.reportedAt || new Date(),
    collectedAt: req.body.collectedAt || new Date()
  });
  await report.save();

  res.status(201).json({ success: true, data: report });
});

export const getReports = asyncHandler(async (req, res) => {
  const { category } = req.query;
  const query = { patient: req.params.id, isDeleted: false };
  if (category) query.category = category;
  
  const reports = await LabReport.find(query)
    .populate('orderedBy', 'name email role')
    .sort('-reportedAt');
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

export const loginPatient = async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    
    // Find patient by phone
    const patient = await Patient.findOne({ phone });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'No patient found with this mobile number' });
    }
    
    // Create JWT for patient
    const token = jwt.sign(
      { id: patient._id, role: 'patient', name: patient.name, hospitalId: patient.hospital },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(200).json({
      success: true,
      token,
      data: patient
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error logging in patient', error: error.message });
  }
};
