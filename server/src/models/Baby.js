import mongoose from 'mongoose';

const babySchema = new mongoose.Schema({
  babyId: { type: String, required: true, unique: true, index: true },
  mother: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  delivery: { type: mongoose.Schema.Types.ObjectId, ref: 'Delivery' },
  name: { type: String },
  sex: { type: String, enum: ['male', 'female', 'other'], required: true },
  dob: { type: Date, required: true },
  birthWeightKg: Number,
  birthLengthCm: Number,
  headCircCm: Number,
  apgar: { min1: Number, min5: Number },
  gestationWeeks: Number,
  bloodGroup: { type: String },
  abhaId: String,
  credentials: {
    qr: { publicId: String, url: String },
    cardFile: { publicId: String, url: String },
    issuedAt: Date,
    qrToken: String
  },
  guardians: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    relation: { type: String, enum: ['mother', 'father', 'other'] },
    canView: { type: Boolean, default: true }
  }],
  growth: [{
    date: Date,
    weightKg: Number,
    heightCm: Number,
    headCircCm: Number,
    percentile: Number
  }],
  vaccinations: [{
    vaccine: String,
    dose: String,
    dueDate: Date,
    givenDate: Date,
    batchNo: String,
    givenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['due', 'given', 'overdue'], default: 'due' }
  }],
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

babySchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Baby', babySchema);
