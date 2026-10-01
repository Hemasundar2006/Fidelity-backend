import jwt from 'jsonwebtoken';
import User from '../models/User.js';
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

export const checkConsent = (type) => asyncHandler(async (req, res, next) => {
  if (['admin', 'doctor', 'nurse', 'receptionist'].includes(req.user.role)) {
    // Treating staff passes if they have treatment consent, we can be more strict if needed
    // Let's check patient's consent
  }

  const patientId = req.params.id || req.body.patient;
  if (!patientId) return next();

  const patient = await Patient.findById(patientId);
  if (!patient) return next(new AppError('Patient not found', 404, 'NOT_FOUND'));

  const consent = patient.consents.find(c => c.type === type && c.granted);
  if (!consent && !['admin'].includes(req.user.role)) {
    // Exception for own access?
    if (req.user.role === 'patient' && req.user.patientRef && req.user.patientRef.toString() === patient._id.toString()) {
      return next();
    }
    // Doctors need treatment consent, ML needs ml_usage, etc.
    if (type === 'ml_usage' && !consent) return next(new AppError('ML usage consent required', 403, 'CONSENT_REQUIRED'));
    if (type === 'treatment' && !consent) return next(new AppError('Treatment consent required', 403, 'CONSENT_REQUIRED'));
    if (type === 'data_sharing' && !consent) return next(new AppError('Data sharing consent required', 403, 'CONSENT_REQUIRED'));
  }
  
  next();
});
