import Baby from '../models/Baby.js';
import Visit from '../models/Visit.js';
import LabReport from '../models/LabReport.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';
import Patient from '../models/Patient.js';
import { generateId } from '../services/idGenerator.js';
import { generateQR } from '../services/qrService.js';

export const registerBaby = asyncHandler(async (req, res) => {
  const { motherId, name, sex, dob, birthWeightKg, birthLengthCm, bloodGroup } = req.body;
  
  if (!motherId) throw new AppError('Mother ID is required', 400);

  const mother = await Patient.findOne({ motherId });
  if (!mother) throw new AppError('Mother not found', 404);

  const newBabyId = await generateId('BBY');
  const qr = await generateQR(newBabyId, `fidelity/babies/${newBabyId}`);

  const baby = await Baby.create({
    babyId: newBabyId,
    mother: mother._id,
    name,
    sex,
    dob,
    birthWeightKg,
    birthLengthCm,
    bloodGroup,
    credentials: { qr },
    createdBy: req.user._id
  });

  res.status(201).json({
    success: true,
    data: { _id: baby._id, babyId: newBabyId, qr: baby.credentials.qr }
  });
});

export const getBabies = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 20 } = req.query;
  const query = { isDeleted: false };
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: 'i' } },
      { babyId: { $regex: q, $options: 'i' } }
    ];
  }

  const babies = await Baby.find(query)
    .populate('mother', 'name motherId phone')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('-createdAt');
    
  const total = await Baby.countDocuments(query);
  
  res.json({
    success: true,
    data: babies,
    meta: { page: Number(page), limit: Number(limit), total }
  });
});

export const verifyBaby = asyncHandler(async (req, res) => {
  const { token } = req.query;
  if (!token) throw new AppError('Token required', 400);

  const decoded = jwt.verify(token, process.env.QR_SECRET);
  const baby = await Baby.findOne({ babyId: decoded.babyId });
  if (!baby) throw new AppError('Baby not found', 404);

  res.json({
    success: true,
    data: {
      babyId: baby.babyId,
      name: baby.name,
      dob: baby.dob
    }
  });
});

export const getBaby = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ babyId: req.params.babyId });
  if (!baby) throw new AppError('Baby not found', 404);
  res.json({ success: true, data: baby });
});

export const updateBaby = asyncHandler(async (req, res) => {
  const baby = await Baby.findOneAndUpdate({ babyId: req.params.babyId }, req.body, { new: true });
  res.json({ success: true, data: baby });
});

export const addGrowth = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ babyId: req.params.babyId });
  baby.growth.push(req.body);
  await baby.save();
  res.json({ success: true, data: baby });
});

export const updateVaccination = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ babyId: req.params.babyId });
  const vac = baby.vaccinations.id(req.params.vaccId);
  if (!vac) throw new AppError('Vaccination not found', 404);
  
  Object.assign(vac, req.body);
  vac.givenBy = req.user._id;
  await baby.save();
  res.json({ success: true, data: baby });
});

export const addBabyVisit = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ babyId: req.params.babyId });
  const visit = await Visit.create({ ...req.body, baby: baby._id, patient: baby.mother, doctor: req.user._id });
  res.status(201).json({ success: true, data: visit });
});

export const addBabyReport = asyncHandler(async (req, res) => {
  const baby = await Baby.findOne({ babyId: req.params.babyId });
  const report = await LabReport.create({ ...req.body, baby: baby._id, patient: baby.mother, orderedBy: req.user._id });
  res.status(201).json({ success: true, data: report });
});
