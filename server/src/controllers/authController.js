import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const signToken = (userId, type = 'access') => {
  const secret = type === 'access' ? process.env.JWT_SECRET : process.env.JWT_REFRESH_SECRET;
  const expiresIn = type === 'access' ? '15m' : '7d';
  return jwt.sign({ userId }, secret, { expiresIn });
};

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email, isDeleted: false });
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401, 'UNAUTHORIZED'));
  }
  if (!user.isActive) {
    return next(new AppError('User account is inactive', 403, 'FORBIDDEN'));
  }

  // Update lastLogin timestamp
  user.lastLogin = new Date();
  await user.save();

  const accessToken = signToken(user._id, 'access');
  const refreshToken = signToken(user._id, 'refresh');

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  res.json({
    success: true,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      hospitalRef: user.hospitalRef,
      accessToken
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('refreshToken', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.json({ success: true, data: {} });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

export const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    return next(new AppError('Please provide all required fields', 400, 'BAD_REQUEST'));
  }

  const existing = await User.findOne({ email });
  if (existing) {
    return next(new AppError('User with this email already exists', 400, 'BAD_REQUEST'));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  let hospitalId = req.user.hospitalRef;
  if (!hospitalId && req.user.role !== 'superadmin') {
    const hosp = await Hospital.findOne({ adminRef: req.user._id });
    if (hosp) {
      hospitalId = hosp._id;
      req.user.hospitalRef = hosp._id;
      await User.findByIdAndUpdate(req.user._id, { hospitalRef: hosp._id });
    }
  }

  // The creator (admin) is req.user
  const user = await User.create({ 
    name, 
    email, 
    passwordHash, 
    role,
    createdBy: req.user._id,
    hospitalRef: hospitalId,
    isActive: true,
    isApproved: true
  });
  
  res.status(201).json({ success: true, data: { _id: user._id, name, email, role } });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  // If superadmin, they can see all users, otherwise restrict to hospital
  const filter = { isDeleted: false };
  if (req.user.role !== 'superadmin') {
    let hospitalId = req.user.hospitalRef;
    if (!hospitalId) {
      const hosp = await Hospital.findOne({ adminRef: req.user._id });
      if (hosp) {
        hospitalId = hosp._id;
        req.user.hospitalRef = hosp._id;
        await User.findByIdAndUpdate(req.user._id, { hospitalRef: hosp._id });
      }
    }

    const emailDomain = req.user.email && req.user.email.includes('@')
      ? req.user.email.split('@')[1]
      : null;

    const orConditions = [{ createdBy: req.user._id }];
    if (hospitalId) {
      orConditions.push({ hospitalRef: hospitalId });
    }
    if (emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'].includes(emailDomain.toLowerCase())) {
      orConditions.push({ email: new RegExp('@' + emailDomain + '$', 'i') });
    }

    filter.$or = orConditions;
  }
  
  const users = await User.find(filter).select('-passwordHash');
  res.json({ success: true, data: users });
});

import Patient from '../models/Patient.js';

export const patientLogin = asyncHandler(async (req, res, next) => {
  const { phone, otp } = req.body;
  if (otp !== '1234') return next(new AppError('Invalid OTP', 401, 'UNAUTHORIZED'));
  
  const patient = await Patient.findOne({ phone, isDeleted: false });
  if (!patient) return next(new AppError('Patient not found', 404, 'NOT_FOUND'));

  // Ensure patient has a User account
  let user = await User.findOne({ patientRef: patient._id });
  if (!user) {
    user = await User.create({
      name: patient.name,
      email: `${patient.phone}@patient.local`,
      passwordHash: await bcrypt.hash('1234', 10),
      role: 'patient',
      patientRef: patient._id
    });
  }

  const accessToken = signToken(user._id, 'access');
  res.json({
    success: true,
    data: { _id: user._id, name: user.name, role: user.role, patientId: patient._id, accessToken }
  });
});
