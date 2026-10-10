import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import Patient from '../models/Patient.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('Not authorized, no token', 401, 'UNAUTHORIZED'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-passwordHash');
    if (!req.user) {
      return next(new AppError('Not authorized, user not found', 401, 'UNAUTHORIZED'));
    }

    // Auto-resolve hospitalRef if not set on user
    if (!req.user.hospitalRef && req.user.role !== 'superadmin') {
      const hosp = await Hospital.findOne({ adminRef: req.user._id });
      if (hosp) {
        req.user.hospitalRef = hosp._id;
        await User.findByIdAndUpdate(req.user._id, { hospitalRef: hosp._id });
      } else if (req.user.createdBy) {
        const creator = await User.findById(req.user.createdBy);
        if (creator && creator.hospitalRef) {
          req.user.hospitalRef = creator.hospitalRef;
          await User.findByIdAndUpdate(req.user._id, { hospitalRef: creator.hospitalRef });
        }
      }
    }

    next();
  } catch (error) {
    return next(new AppError('Not authorized, token failed', 401, 'UNAUTHORIZED'));
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(`User role ${req.user.role} is not authorized to access this route`, 403, 'FORBIDDEN'));
    }
    next();
  };
};

export const optionalProtect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select('-passwordHash');
    if (req.user && !req.user.hospitalRef && req.user.role !== 'superadmin') {
      const hosp = await Hospital.findOne({ adminRef: req.user._id });
      if (hosp) {
        req.user.hospitalRef = hosp._id;
      }
    }
  } catch (err) {
    // proceed unauthenticated
  }
  next();
});

export const checkConsent = (type) => asyncHandler(async (req, res, next) => {
  if (!req.user) return next();

  if (['superadmin', 'admin', 'doctor', 'nurse', 'lab', 'receptionist'].includes(req.user.role)) {
    return next();
  }

  const patientId = req.params.id || req.body.patient;
  if (!patientId) return next();

  // Allow patient to access their own records
  if (req.user.role === 'patient') {
    if (req.user.patientRef && req.user.patientRef.toString() === patientId.toString()) {
      return next();
    }
  }

  const patient = await Patient.findById(patientId);
  if (!patient) return next(new AppError('Patient not found', 404, 'NOT_FOUND'));

  const consent = patient.consents?.find(c => c.type === type && c.granted);
  if (!consent) {
    if (req.user.role === 'patient' && req.user.patientRef && req.user.patientRef.toString() === patient._id.toString()) {
      return next();
    }
    if (type === 'ml_usage') return next(new AppError('ML usage consent required', 403, 'CONSENT_REQUIRED'));
    if (type === 'treatment') return next(new AppError('Treatment consent required', 403, 'CONSENT_REQUIRED'));
    if (type === 'data_sharing') return next(new AppError('Data sharing consent required', 403, 'CONSENT_REQUIRED'));
  }
  
  next();
});

