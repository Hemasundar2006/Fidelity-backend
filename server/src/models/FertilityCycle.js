import mongoose from 'mongoose';

const fertilityCycleSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true, index: true },
  cycleNo: { type: Number, required: true },
  protocol: String,
  startDate: Date,
  retrieval: {
    date: Date,
    eggsCount: Number
  },
  fertilisation: {
    count: Number
  },
  embryos: [{
    label: String,
    grade: String,
    stage: String,
    status: { type: String, enum: ['fresh', 'frozen', 'transferred', 'discarded'] },
    storage: String
  }],
  transferDate: Date,
  outcome: { type: String, enum: ['ongoing', 'positive', 'negative'] },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

fertilityCycleSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('FertilityCycle', fertilityCycleSchema);
