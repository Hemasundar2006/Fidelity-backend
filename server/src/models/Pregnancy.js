import mongoose from 'mongoose';

const pregnancySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  pregnancyNo: { type: Number, required: true },
  lmp: { type: Date, required: true },
  edd: { type: Date, required: true },
  conception: { type: String, enum: ['natural', 'ivf', 'iui'], default: 'natural' },
  cycleRef: { type: mongoose.Schema.Types.ObjectId, ref: 'FertilityCycle' },
  status: { type: String, enum: ['ongoing', 'delivered', 'miscarriage', 'terminated'], default: 'ongoing' },
  riskLevel: { type: String, enum: ['low', 'mid', 'high'], default: 'low' },
  riskFactors: [String],
  lastRiskPredictionId: { type: mongoose.Schema.Types.ObjectId, ref: 'MlPrediction' },
  antenatalVisits: [{
    visitDate: Date,
    gestationWeeks: Number,
    bpSys: Number,
    bpDia: Number,
    weightKg: Number,
    hb: Number,
    bloodSugar: Number,
    fundalHeightCm: Number,
    fetalHeartRate: Number,
    scanNotes: String,
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    nextVisit: Date
  }],
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

pregnancySchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Pregnancy', pregnancySchema);
