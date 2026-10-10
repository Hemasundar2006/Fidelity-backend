import Appointment from '../models/Appointment.js';
import User from '../models/User.js';
import Patient from '../models/Patient.js';
import { generateId } from '../services/idGenerator.js';
import { sendAppointmentConfirmation } from '../services/notificationService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * Public: Get list of active doctors for appointment booking
 */
export const getDoctors = asyncHandler(async (req, res) => {
  const doctors = await User.find({ role: 'doctor', isActive: true })
    .select('_id name email specialization')
    .sort('name');
  
  res.json({ success: true, data: doctors });
});

/**
 * Public: Get real live OPD status & doctor roster for landing page
 */
export const getPublicOpdSummary = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const todaysAppointmentsCount = await Appointment.countDocuments({
    slotStart: { $gte: today, $lte: endOfDay },
    isDeleted: false
  });

  const doctors = await User.find({ role: 'doctor', isActive: true })
    .select('_id name email specialization')
    .sort('name');

  const totalBookedAppointments = await Appointment.countDocuments({ isDeleted: false });

  res.json({
    success: true,
    data: {
      todaysAppointmentsCount,
      activeDoctorsCount: doctors.length,
      doctors,
      totalBookedAppointments,
      opdStatus: 'Active',
      updatedAt: new Date()
    }
  });
});

/**
 * Public: Get available 30-min time slots for a given doctor & date
 */
export const getAvailableSlots = asyncHandler(async (req, res) => {
  const { doctor, date } = req.query;

  if (!doctor || !date) {
    throw new AppError('Doctor ID and Date (YYYY-MM-DD) are required', 400);
  }

  // Parse day range in local/UTC
  const targetDate = new Date(date);
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Fetch all booked appointments for this doctor on this day
  const bookedAppointments = await Appointment.find({
    doctor,
    status: { $ne: 'cancelled' },
    isDeleted: false,
    slotStart: { $gte: startOfDay, $lte: endOfDay }
  }).select('slotStart slotEnd');

  // Define clinical hours: 09:00 to 17:00 (Break: 13:00 to 14:00)
  const slotDefinitions = [
    { start: '09:00', end: '09:30', period: 'Morning' },
    { start: '09:30', end: '10:00', period: 'Morning' },
    { start: '10:00', end: '10:30', period: 'Morning' },
    { start: '10:30', end: '11:00', period: 'Morning' },
    { start: '11:00', end: '11:30', period: 'Morning' },
    { start: '11:30', end: '12:00', period: 'Morning' },
    { start: '12:00', end: '12:30', period: 'Morning' },
    { start: '12:30', end: '13:00', period: 'Morning' },
    // Lunch break 13:00 - 14:00
    { start: '14:00', end: '14:30', period: 'Afternoon' },
    { start: '14:30', end: '15:00', period: 'Afternoon' },
    { start: '15:00', end: '15:30', period: 'Afternoon' },
    { start: '15:30', end: '16:00', period: 'Afternoon' },
    { start: '16:00', end: '16:30', period: 'Afternoon' },
    { start: '16:30', end: '17:00', period: 'Afternoon' }
  ];

  // Helper to format time into 12-hour AM/PM string
  const format12Hour = (time24) => {
    const [h, m] = time24.split(':').map(Number);
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${suffix}`;
  };

  const slots = slotDefinitions.map(def => {
    const [startH, startM] = def.start.split(':').map(Number);
    const [endH, endM] = def.end.split(':').map(Number);

    const slotStartDate = new Date(targetDate);
    slotStartDate.setHours(startH, startM, 0, 0);

    const slotEndDate = new Date(targetDate);
    slotEndDate.setHours(endH, endM, 0, 0);

    // Check if any existing appointment overlaps this slot
    const isBooked = bookedAppointments.some(appt => {
      const bookedStart = new Date(appt.slotStart).getTime();
      const bookedEnd = new Date(appt.slotEnd).getTime();
      return (
        (slotStartDate.getTime() >= bookedStart && slotStartDate.getTime() < bookedEnd) ||
        (slotEndDate.getTime() > bookedStart && slotEndDate.getTime() <= bookedEnd) ||
        (slotStartDate.getTime() <= bookedStart && slotEndDate.getTime() >= bookedEnd)
      );
    });

    return {
      time: format12Hour(def.start),
      displayRange: `${format12Hour(def.start)} - ${format12Hour(def.end)}`,
      slotStart: slotStartDate.toISOString(),
      slotEnd: slotEndDate.toISOString(),
      period: def.period,
      available: !isBooked
    };
  });

  res.json({
    success: true,
    data: {
      date,
      doctor,
      slots,
      totalSlots: slots.length,
      availableCount: slots.filter(s => s.available).length
    }
  });
});

/**
 * Public: Book an appointment from the Landing Page
 */
export const publicBookAppointment = asyncHandler(async (req, res) => {
  const {
    patientName,
    doctor,
    date,
    time,
    type = 'consultation',
    reason = 'General OPD Consultation'
  } = req.body;

  const phone = req.body.phone || req.body.patientPhone;
  const email = req.body.email || req.body.patientEmail;
  let slotStart = req.body.slotStart;
  let slotEnd = req.body.slotEnd;

  // If slotStart is not directly passed, derive it from date and time
  if (!slotStart && date && time) {
    const match = time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const meridiem = match[3]?.toUpperCase();
      if (meridiem === 'PM' && hours < 12) hours += 12;
      if (meridiem === 'AM' && hours === 12) hours = 0;

      const s = new Date(date);
      s.setHours(hours, minutes, 0, 0);
      slotStart = s.toISOString();

      const e = new Date(s.getTime() + 30 * 60 * 1000);
      slotEnd = e.toISOString();
    }
  }

  if (!patientName || !phone || !doctor || !slotStart || !slotEnd) {
    throw new AppError('Patient name, phone number, doctor, and slot time are required', 400);
  }

  // 1. Verify doctor exists and is active
  const doctorUser = await User.findById(doctor);
  if (!doctorUser || doctorUser.role !== 'doctor') {
    throw new AppError('Selected doctor was not found or is unavailable', 404);
  }

  const requestedStart = new Date(slotStart);
  const requestedEnd = new Date(slotEnd);

  // 2. Real-time Overlap Conflict Check
  const conflict = await Appointment.findOne({
    doctor,
    status: { $ne: 'cancelled' },
    isDeleted: false,
    $or: [
      { slotStart: { $lt: requestedEnd, $gte: requestedStart } },
      { slotEnd: { $gt: requestedStart, $lte: requestedEnd } },
      { slotStart: { $lte: requestedStart }, slotEnd: { $gte: requestedEnd } }
    ]
  });

  if (conflict) {
    throw new AppError('This time slot is no longer available. Please select another slot.', 409);
  }

  // 3. Find or auto-create patient by phone number
  let patient = await Patient.findOne({ phone, isDeleted: false });
  if (!patient) {
    const motherId = await generateId('MOM');
    patient = await Patient.create({
      name: patientName,
      phone,
      email: email || undefined,
      dob: new Date('1996-01-01'), // Default baseline DOB
      motherId,
      status: 'active'
    });
  }

  // 4. Calculate day token number for the doctor
  const startOfDay = new Date(requestedStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(requestedStart);
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = await Appointment.countDocuments({
    doctor,
    slotStart: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  });
  const tokenNo = todayCount + 1;

  // 5. Generate human-readable booking reference
  const dateStr = requestedStart.toISOString().slice(0, 10).replace(/-/g, '');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const bookingReference = `APT-${dateStr}-${randSuffix}`;

  // 6. Create Appointment
  const appointment = await Appointment.create({
    patient: patient._id,
    doctor,
    slotStart: requestedStart,
    slotEnd: requestedEnd,
    type,
    reason,
    tokenNo,
    source: 'online',
    bookingReference,
    patientName,
    patientPhone: phone,
    patientEmail: email,
    status: 'booked'
  });

  // 7. Dispatch SMS & Email notifications asynchronously
  const notifResult = await sendAppointmentConfirmation({
    patientName,
    phone,
    email,
    doctorName: doctorUser.name,
    slotStart: requestedStart,
    tokenNo,
    bookingReference,
    type
  });

  res.status(201).json({
    success: true,
    data: {
      ...appointment.toObject(),
      doctor: {
        _id: doctorUser._id,
        name: doctorUser.name,
        specialization: doctorUser.specialization || 'Obstetrics & Gynaecology'
      },
      patient: {
        _id: patient._id,
        name: patient.name,
        motherId: patient.motherId,
        phone: patient.phone
      },
      notifications: notifResult
    }
  });
});

/**
 * Receptionist & Staff: Create internal booking
 */
export const createAppointment = asyncHandler(async (req, res) => {
  const { doctor, slotStart, slotEnd } = req.body;

  if (doctor && slotStart && slotEnd) {
    const conflict = await Appointment.findOne({
      doctor,
      status: { $ne: 'cancelled' },
      isDeleted: false,
      $or: [
        { slotStart: { $lt: new Date(slotEnd), $gte: new Date(slotStart) } },
        { slotEnd: { $gt: new Date(slotStart), $lte: new Date(slotEnd) } }
      ]
    });
    if (conflict) {
      throw new AppError('Conflict: Doctor already has an appointment during this time', 409);
    }
  }

  const startOfDay = new Date(slotStart);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(slotStart);
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = await Appointment.countDocuments({
    doctor,
    slotStart: { $gte: startOfDay, $lte: endOfDay },
    isDeleted: false
  });

  const appointment = await Appointment.create({
    ...req.body,
    tokenNo: req.body.tokenNo || (todayCount + 1),
    createdBy: req.user?._id
  });

  res.status(201).json({ success: true, data: appointment });
});

/**
 * Receptionist, Doctor & Staff: List appointments with patient & doctor info
 */
export const getAppointments = asyncHandler(async (req, res) => {
  const { date, doctor, status } = req.query;
  const filter = { isDeleted: false };

  // Tenant Isolation
  if (req.user && req.user.role !== 'superadmin' && req.user.hospitalRef) {
    const patientIds = await Patient.find({ hospitalRef: req.user.hospitalRef }).distinct('_id');
    filter.patient = { $in: patientIds };
  } else if (req.user && req.user.role !== 'superadmin') {
    return res.json({ success: true, data: [] });
  }

  if (doctor && doctor !== 'All') {
    filter.doctor = doctor;
  }
  if (status) {
    filter.status = status;
  }
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    filter.slotStart = { $gte: d, $lte: end };
  }

  const appointments = await Appointment.find(filter)
    .populate('patient', 'name motherId phone bloodGroup')
    .populate('doctor', 'name email specialization')
    .sort('slotStart');

  // Format clean response with fallbacks for online guest bookings
  const formatted = appointments.map(apt => {
    const pName = apt.patient?.name || apt.patientName || 'Guest Patient';
    const pId = apt.patient?.motherId || 'Online Registration';
    const pPhone = apt.patient?.phone || apt.patientPhone || '';
    const dName = apt.doctor?.name || 'Assigned Specialist';
    const timeStr = new Date(apt.slotStart).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return {
      ...apt.toObject(),
      displayTime: timeStr,
      patientDisplayName: pName,
      patientDisplayId: pId,
      patientPhone: pPhone,
      doctorDisplayName: dName
    };
  });

  res.json({ success: true, data: formatted });
});

/**
 * Receptionist & Staff: Update appointment status (e.g. check-in, complete)
 */
export const updateAppointment = asyncHandler(async (req, res) => {
  const appointment = await Appointment.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('patient', 'name motherId phone')
   .populate('doctor', 'name email specialization');

  if (!appointment) {
    throw new AppError('Appointment not found', 404);
  }

  res.json({ success: true, data: appointment });
});
