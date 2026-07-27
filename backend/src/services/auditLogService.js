const { randomUUID } = require("crypto");
const { read, write } = require("../utils/db");

/** Security Rule: All administrator actions must be logged. */
function logAdminAction(adminId, action, details = {}) {
  const all = read("admin_audit_log");
  const entry = { id: randomUUID(), adminId, action, details, at: new Date().toISOString() };
  all.push(entry);
  if (all.length > 50000) all.splice(0, all.length - 50000);
  write("admin_audit_log", all);
  return entry;
}

function getAuditLog(adminId, limit = 100) {
  const all = read("admin_audit_log");
  return (adminId ? all.filter((e) => e.adminId === adminId) : all).slice(-limit).reverse();
}

module.exports = { logAdminAction, getAuditLog };
