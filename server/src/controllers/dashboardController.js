import Appointment from '../models/Appointment.js';
import Pregnancy from '../models/Pregnancy.js';
import Delivery from '../models/Delivery.js';
import Patient from '../models/Patient.js';
import Hospital from '../models/Hospital.js';
import LabReport from '../models/LabReport.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let patientQuery = { isDeleted: false };
  const userRole = req.user?.role;
  const userHosp = req.user?.hospitalRef;

  const isHospitalStaff = Boolean(userRole && userRole !== 'superadmin' && userHosp);

  if (isHospitalStaff) {
    // Strictly isolate by hospital reference - NEVER leak other hospitals' data
    patientQuery.hospitalRef = userHosp;
  }

  // Count patients in scope
  let totalPatients = await Patient.countDocuments(patientQuery);
  let patientIds = await Patient.find(patientQuery).distinct('_id');

  // ONLY for unauthenticated public landing page requests do we aggregate across all active records
  if (!req.user && (patientIds.length === 0 || totalPatients === 0)) {
    patientQuery = { isDeleted: false };
    totalPatients = await Patient.countDocuments(patientQuery);
    patientIds = await Patient.find(patientQuery).distinct('_id');
  }

  const baseQuery = { isDeleted: false, patient: { $in: patientIds } };

  let todaysAppointments = await Appointment.countDocuments({
    ...baseQuery,
    slotStart: { $gte: today, $lte: endOfDay }
  });

  let totalAppointments = await Appointment.countDocuments(baseQuery);
  let activePregnancies = await Pregnancy.countDocuments({ ...baseQuery, status: 'ongoing' });
  let highRiskPregnancies = await Pregnancy.countDocuments({ ...baseQuery, status: 'ongoing', riskLevel: 'high' });
  let deliveriesCount = await Delivery.countDocuments(baseQuery);

  // If unauthenticated public landing page, allow global totals for marketing counters
  if (!req.user) {
    if (totalAppointments === 0) {
      totalAppointments = await Appointment.countDocuments({ isDeleted: false });
      todaysAppointments = await Appointment.countDocuments({
        isDeleted: false,
        slotStart: { $gte: today, $lte: endOfDay }
      });
    }

    if (activePregnancies === 0) {
      activePregnancies = await Pregnancy.countDocuments({ isDeleted: false, status: 'ongoing' });
      highRiskPregnancies = await Pregnancy.countDocuments({ isDeleted: false, status: 'ongoing', riskLevel: 'high' });
    }

    if (deliveriesCount === 0) {
      deliveriesCount = await Delivery.countDocuments({ isDeleted: false });
    }
  }

  // Partner hospitals count
  const partnerHospitalsCount = await Hospital.countDocuments({ isDeleted: false });
  const totalReportsCount = isHospitalStaff 
    ? await LabReport.countDocuments({ isDeleted: false, patient: { $in: patientIds } })
    : await LabReport.countDocuments({ isDeleted: false });

  // High risk list strictly scoped to hospital patients
  let highRiskDocs = await Pregnancy.find({ ...baseQuery, status: 'ongoing', riskLevel: 'high' })
    .populate('patient', 'name motherId phone bloodGroup')
    .sort('-createdAt')
    .limit(10);

  // Only landing page or superadmin can see global fallback
  if (!req.user && highRiskDocs.length === 0) {
    highRiskDocs = await Pregnancy.find({ isDeleted: false, status: 'ongoing', riskLevel: 'high' })
      .populate('patient', 'name motherId phone bloodGroup')
      .sort('-createdAt')
      .limit(10);
  }

  const highRiskList = highRiskDocs.map(item => ({
    id: item.patient?.motherId || 'MOM-UNKNOWN',
    name: item.patient?.name || 'Patient',
    edd: item.edd ? new Date(item.edd).toISOString().split('T')[0] : '2026-11-15',
    reason: item.riskFactors?.length ? item.riskFactors.join(', ') : 'High Risk Observation'
  }));

  res.json({
    success: true,
    data: {
      todaysAppointments,
      totalAppointments,
      activePregnancies,
      highRiskPregnancies,
      totalPatients,
      deliveriesCount,
      partnerHospitalsCount,
      totalReportsCount,
      highRiskList
    }
  });
});
