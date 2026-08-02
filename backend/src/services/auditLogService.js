const { AuditLog } = require("../models/opsModels");

async function logAdminAction(adminId, action, details = {}) {
  try {
    return await AuditLog.create({ adminId, action, details });
  } catch (err) {
    return null;
  }
}

async function getAuditLog(adminId, limit = 100) {
  try {
    const query = adminId ? { adminId } : {};
    return await AuditLog.find(query).sort({ at: -1 }).limit(limit).lean();
  } catch (err) {
    return [];
  }
}

module.exports = { logAdminAction, getAuditLog };
