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

  const todaysAppointments = await Appointment.countDocuments({
    slotStart: { $gte: today, $lte: endOfDay },
    isDeleted: false
  });

  const totalAppointments = await Appointment.countDocuments({ isDeleted: false });
  const activePregnancies = await Pregnancy.countDocuments({ status: 'ongoing', isDeleted: false });
  const highRiskPregnancies = await Pregnancy.countDocuments({ status: 'ongoing', riskLevel: 'high', isDeleted: false });
  const totalPatients = await Patient.countDocuments({ isDeleted: false });
  const deliveriesCount = await Delivery.countDocuments({ isDeleted: false });

  // Real high risk pregnancies list from DB
  const highRiskDocs = await Pregnancy.find({ status: 'ongoing', riskLevel: 'high', isDeleted: false })
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
