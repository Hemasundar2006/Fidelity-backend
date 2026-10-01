import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  motherId: { type: String, unique: true, required: true, index: true },
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  gender: { type: String, enum: ['female'], default: 'female' },
  phone: { type: String, required: true, index: true },
  email: { type: String },
  abhaId: { type: String },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
  address: {
    line1: String, city: String, state: String, pincode: String
  },
  partner: { name: String, phone: String, dob: Date, bloodGroup: String },
  emergencyContact: { name: String, phone: String, relation: String },
  photo: { publicId: String, url: String },
  idProof: {
    type: { type: String, enum: ['aadhaar', 'voter', 'other'] },
    publicId: String,
    url: String
  },
  qr: { publicId: String, url: String },
  medicalHistory: {
    allergies: [String],
    conditions: [String],
    surgeries: [String],
    medications: [String]
  },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },
  consents: [{
    type: { type: String, enum: ['treatment', 'data_sharing', 'ml_usage', 'baby_data_access'] },
    granted: Boolean,
    grantedAt: Date,
    revokedAt: Date,
    signedBy: String,
    method: { type: String, enum: ['in_person', 'portal'] }
  }],
  isDeleted: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

patientSchema.pre(/^find/, function() {
  if (this.getFilter().isDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
});

export default mongoose.model('Patient', patientSchema);
