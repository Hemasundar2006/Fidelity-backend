import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role: String,
  action: { type: String, enum: ['read', 'create', 'update', 'delete', 'login', 'consent_change'], required: true },
  entity: { type: String, required: true },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  ip: String,
  timestamp: { type: Date, default: Date.now }
});

auditLogSchema.index({ entityId: 1, timestamp: -1 });

export default mongoose.model('AuditLog', auditLogSchema);
