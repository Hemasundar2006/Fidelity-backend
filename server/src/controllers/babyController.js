import Baby from '../models/Baby.js';
import Visit from '../models/Visit.js';
import LabReport from '../models/LabReport.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import jwt from 'jsonwebtoken';

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
