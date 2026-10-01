import Pregnancy from '../models/Pregnancy.js';
import Delivery from '../models/Delivery.js';
import Baby from '../models/Baby.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { generateId } from '../services/idGenerator.js';
import { generateBabyQRToken, generateQR } from '../services/qrService.js';
import { generateVaccineSchedule } from '../services/vaccineService.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

export const getPregnancy = asyncHandler(async (req, res) => {
  const pregnancy = await Pregnancy.findById(req.params.id);
  res.json({ success: true, data: pregnancy });
});

export const addAntenatalVisit = asyncHandler(async (req, res) => {
  const pregnancy = await Pregnancy.findById(req.params.id);
  if (!pregnancy) throw new AppError('Pregnancy not found', 404);

  const { visitDate, gestationWeeks, bpSys, bpDia, weightKg, hb, bloodSugar, fundalHeightCm, fetalHeartRate, scanNotes, nextVisit } = req.body;
  
  pregnancy.antenatalVisits.push({
    visitDate, gestationWeeks, bpSys, bpDia, weightKg, hb, bloodSugar, fundalHeightCm, fetalHeartRate, scanNotes, doctor: req.user._id, nextVisit
  });

  // Rule fallback for high risk (No ML)
  let riskLevel = 'low';
  let topFactors = [];
  if (bpSys >= 140 || bpDia >= 90) topFactors.push('bpSys');
  if (bloodSugar >= 7.8) topFactors.push('bloodSugar');
  if (hb < 10) topFactors.push('hb');

  if (topFactors.length > 0) {
    riskLevel = 'high';
  }

  pregnancy.riskLevel = riskLevel;
  pregnancy.riskFactors = topFactors;
  await pregnancy.save();

  res.json({
    success: true,
    data: {
      visitAdded: true,
      risk: {
        label: riskLevel,
        topFactors,
        source: 'rule'
      }
    }
  });
});

export const deliverBaby = asyncHandler(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const pregnancy = await Pregnancy.findById(req.params.id).session(session);
    if (!pregnancy) throw new AppError('Pregnancy not found', 404);
    if (pregnancy.status === 'delivered') throw new AppError('Already delivered', 409);

    const { admittedAt, deliveredAt, type, complications, bloodLossMl, maternalOutcome, babies: babiesInput } = req.body;

    const delivery = new Delivery({
      pregnancy: pregnancy._id,
      patient: pregnancy.patient,
      doctor: req.user._id,
      admittedAt,
      deliveredAt,
      type,
      complications,
      bloodLossMl,
      maternalOutcome,
      babies: [],
      createdBy: req.user._id
    });

    const createdBabies = [];
    for (const b of babiesInput) {
      const babyId = await generateId('BBY');
      const qrToken = generateBabyQRToken(babyId);
      const qr = await generateQR(babyId, `fidelity/babies/${babyId}`);

      // Dummy Baby Health Card (PDF/PNG could be generated, using QR url for now)
      const cardFile = { publicId: qr.publicId + '_card', url: qr.url }; 
      
      const schedule = generateVaccineSchedule(deliveredAt);

      const baby = new Baby({
        babyId,
        mother: pregnancy.patient,
        delivery: delivery._id,
        sex: b.sex,
        dob: deliveredAt,
        birthWeightKg: b.birthWeightKg,
        birthLengthCm: b.birthLengthCm,
        headCircCm: b.headCircCm,
        apgar: b.apgar,
        gestationWeeks: b.gestationWeeks,
        bloodGroup: b.bloodGroup,
        credentials: { qr, cardFile, issuedAt: new Date(), qrToken },
        vaccinations: schedule,
        createdBy: req.user._id
      });
      await baby.save({ session });
      createdBabies.push(baby);
      delivery.babies.push(baby._id);
    }

    await delivery.save({ session });
    pregnancy.status = 'delivered';
    await pregnancy.save({ session });

    // Guardian Account creation
    // Mother is guardian. Find or create user for mother
    // Not fully robust as it relies on email, but doing temp password
    let tempPassword = Math.random().toString(36).slice(-8);
    let guardianEmail = `guardian_${pregnancy.patient}@example.com`; // fallback
    
    // Create an array to return with babies info
    const babiesRes = createdBabies.map(b => ({
      babyId: b.babyId,
      credentials: b.credentials,
      vaccinations: b.vaccinations
    }));

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      data: {
        deliveryId: delivery._id,
        babies: babiesRes,
        guardianAccount: {
          email: guardianEmail,
          tempPassword
        }
      }
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
});
