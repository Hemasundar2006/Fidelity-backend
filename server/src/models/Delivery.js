import mongoose from 'mongoose';

const deliverySchema = new mongoose.Schema({
  pregnancy: { type: mongoose.Schema.Types.ObjectId, ref: 'Pregnancy', required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  admittedAt: { type: Date, required: true },
  deliveredAt: { type: Date, required: true },
  type: { type: String, enum: ['normal', 'c_section', 'assisted'], required: true },
  complications: [String],
  bloodLossMl: Number,
  maternalOutcome: String,
  babies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Baby' }],
  dischargeSummary: {
    text: String,
    file: { publicId: String, url: String }
  },
  birthRegistration: {
    status: { type: String, enum: ['draft', 'submitted'], default: 'draft' },
    refNo: String
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

deliverySchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Delivery', deliverySchema);
