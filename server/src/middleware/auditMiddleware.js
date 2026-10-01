import AuditLog from '../models/AuditLog.js';
import asyncHandler from '../utils/asyncHandler.js';

const auditMiddleware = (action, entity) => asyncHandler(async (req, res, next) => {
  // We want to log after the request completes to get the correct entityId if it was a create operation
  const oldJson = res.json;

  res.json = function(data) {
    res.json = oldJson; // restore

    let entityId = req.params.id || req.params.babyId || req.params.invoiceId;
    if (!entityId && data && data.data && data.data._id) {
      entityId = data.data._id;
    }

    if (entityId) {
      AuditLog.create({
        user: req.user ? req.user._id : null,
        role: req.user ? req.user.role : 'system',
        action,
        entity,
        entityId,
        ip: req.ip
      }).catch(err => console.error('AuditLog error:', err));
    }
    
    return res.json.call(res, data);
  };

  next();
});

export default auditMiddleware;
