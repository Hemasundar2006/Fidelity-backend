import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['admin', 'receptionist', 'doctor', 'nurse', 'lab', 'pharmacy', 'patient'], required: true },
  specialization: { type: String },
  patientRef: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  isActive: { type: Boolean, default: true },
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

userSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.passwordHash);
};

export default mongoose.model('User', userSchema);
