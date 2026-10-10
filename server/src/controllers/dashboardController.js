import Appointment from '../models/Appointment.js';
import Pregnancy from '../models/Pregnancy.js';
import Delivery from '../models/Delivery.js';
import Patient from '../models/Patient.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  let patientQuery = { isDeleted: false };
  if (req.user.role !== 'superadmin' && req.user.hospitalRef) {
    patientQuery.hospitalRef = req.user.hospitalRef;
  } else if (req.user.role !== 'superadmin') {
    // Missing hospitalRef but not superadmin -> 0 stats
    return res.json({
      success: true,
      data: { todaysAppointments: 0, totalAppointments: 0, activePregnancies: 0, highRiskPregnancies: 0, totalPatients: 0, deliveriesCount: 0, highRiskList: [] }
    });
  }

  const patientIds = await Patient.find(patientQuery).distinct('_id');

  const baseQuery = { isDeleted: false, patient: { $in: patientIds } };

  const todaysAppointments = await Appointment.countDocuments({
    ...baseQuery,
    slotStart: { $gte: today, $lte: endOfDay }
  });

  const totalAppointments = await Appointment.countDocuments(baseQuery);
  const activePregnancies = await Pregnancy.countDocuments({ ...baseQuery, status: 'ongoing' });
  const highRiskPregnancies = await Pregnancy.countDocuments({ ...baseQuery, status: 'ongoing', riskLevel: 'high' });
  const totalPatients = await Patient.countDocuments(patientQuery);
  const deliveriesCount = await Delivery.countDocuments(baseQuery);

  // Real high risk pregnancies list from DB
  const highRiskDocs = await Pregnancy.find({ ...baseQuery, status: 'ongoing', riskLevel: 'high' })
    .populate('patient', 'name motherId phone bloodGroup')
    .sort('-createdAt')
    .limit(10);

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
      highRiskList
    }
  });
});
