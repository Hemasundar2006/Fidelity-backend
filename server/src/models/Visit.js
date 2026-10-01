import mongoose from 'mongoose';

const visitSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  baby: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby' },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  visitDate: { type: Date, required: true },
  complaint: { type: String },
  vitals: {
    bpSys: Number,
    bpDia: Number,
    pulse: Number,
    tempC: Number,
    weightKg: Number,
    spo2: Number
  },
  diagnosis: [String],
  notes: String,
  prescription: [{
    drug: String,
    dose: String,
    frequency: String,
    durationDays: Number,
    instructions: String
  }],
  followUpDate: Date,
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

visitSchema.index({ patient: 1, visitDate: -1 });

visitSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Visit', visitSchema);
