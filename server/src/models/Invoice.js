import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  items: [{
    name: String,
    qty: Number,
    amountPaise: Number
  }],
  totalPaise: { type: Number, required: true },
  paidPaise: { type: Number, default: 0 },
  status: { type: String, enum: ['unpaid', 'partial', 'paid'], default: 'unpaid' },
  insurance: {
    provider: String,
    claimNo: String
  },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

invoiceSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Invoice', invoiceSchema);
