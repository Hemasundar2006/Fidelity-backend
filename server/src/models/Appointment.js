import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  slotStart: { type: Date, required: true },
  slotEnd: { type: Date, required: true },
  type: { type: String, enum: ['consultation', 'antenatal', 'followup', 'paediatric'], required: true },
  status: { type: String, enum: ['booked', 'checked_in', 'completed', 'cancelled', 'no_show'], default: 'booked' },
  source: { type: String, enum: ['online', 'reception'], default: 'reception' },
  bookingReference: { type: String },
  patientName: { type: String },
  patientPhone: { type: String },
  patientEmail: { type: String },
  tokenNo: { type: Number },
  reason: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

appointmentSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Appointment', appointmentSchema);
