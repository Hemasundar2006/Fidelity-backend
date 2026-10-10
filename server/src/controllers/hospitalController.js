import Hospital from '../models/Hospital.js';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';
import asyncHandler from '../utils/asyncHandler.js';
import bcrypt from 'bcrypt';

export const registerHospital = asyncHandler(async (req, res, next) => {
  const { hospitalName, email, mobile, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return next(new AppError('Passwords do not match', 400, 'BAD_REQUEST'));
  }

  // Check if hospital already exists
  const existingHospital = await Hospital.findOne({ email });
  if (existingHospital) {
    return next(new AppError('Hospital with this email already registered', 400, 'BAD_REQUEST'));
  }

  // Also check if a User already exists with this email
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('Email already in use by a user', 400, 'BAD_REQUEST'));
  }

  const passwordHash = await bcrypt.hash(password, 10);
  
  const hospital = await Hospital.create({
    hospitalName,
    email,
    mobile,
    passwordHash
  });

  const user = await User.create({
    name: hospitalName,
    email: email,
    mobile: mobile,
    passwordHash: passwordHash,
    role: 'admin',
    isApproved: false,
    isActive: true,
    hospitalRef: hospital._id
  });

  hospital.adminRef = user._id;
  await hospital.save();

  res.status(201).json({
    success: true,
    data: {
      _id: hospital._id,
      hospitalName: hospital.hospitalName,
      email: hospital.email,
      status: hospital.status
    }
  });
});

export const getHospitals = asyncHandler(async (req, res) => {
  const hospitals = await Hospital.find({ isDeleted: false })
    .select('-passwordHash')
    .populate('adminRef', 'lastLogin name email');
  res.json({ success: true, data: hospitals });
});

export const approveHospital = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body; // should be 'approved' or 'rejected'

  const hospital = await Hospital.findById(id);
  if (!hospital) {
    return next(new AppError('Hospital not found', 404, 'NOT_FOUND'));
  }

  if (hospital.status === 'approved') {
    return next(new AppError('Hospital is already approved', 400, 'BAD_REQUEST'));
  }

  hospital.status = status;
  
  if (status === 'approved') {
    // Approve the existing admin user
    if (hospital.adminRef) {
      await User.findByIdAndUpdate(hospital.adminRef, { isApproved: true });
    }
  } else if (status === 'rejected') {
    // Revoke approval for admin user
    if (hospital.adminRef) {
      await User.findByIdAndUpdate(hospital.adminRef, { isApproved: false });
    }
  }
  
  await hospital.save();

  res.json({
    success: true,
    data: {
      _id: hospital._id,
      hospitalName: hospital.hospitalName,
      email: hospital.email,
      status: hospital.status,
      adminRef: hospital.adminRef
    }
  });
});
