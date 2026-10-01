import mongoose from 'mongoose';

const labReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  baby: { type: mongoose.Schema.Types.ObjectId, ref: 'Baby' },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  testType: { type: String, required: true, index: true },
  category: { type: String, enum: ['blood', 'urine', 'scan', 'hormone', 'other'], required: true },
  collectedAt: Date,
  reportedAt: Date,
  results: [{
    parameter: String,
    value: Number,
    unit: String,
    refRange: String,
    flag: { type: String, enum: ['normal', 'low', 'high'] }
  }],
  files: [{
    publicId: String,
    url: String,
    format: String,
    bytes: Number
  }],
  remarks: String,
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

labReportSchema.index({ patient: 1, testType: 1, reportedAt: -1 });

labReportSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('LabReport', labReportSchema);
