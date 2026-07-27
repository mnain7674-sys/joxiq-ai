const { read, write } = require("../utils/db");

/**
 * Security Rule: Only administrators can access this feature.
 * Roles: 'super_admin' (all permissions), 'admin' (most, no billing/security),
 * 'support' (read-only, no security/payment data).
 */
const PERMISSIONS = {
  super_admin: ["*"],
  admin: [
    "users", "chat_history", "ai_usage", "token_usage", "analytics", "feedback",
    "error_logs", "crash_logs", "activity_logs", "server_status", "api_usage",
    "feature_usage", "learning_stats", "notifications", "reports",
  ],
  support: ["users", "chat_history", "activity_logs", "feedback"],
};

function getAdminRole(adminId) {
  const admins = read("admins");
  const admin = admins.find((a) => a.id === adminId);
  return admin ? admin.role : null;
}

/** Registers an admin (call once during setup / from your existing admin user table). */
function registerAdmin(adminId, name, role = "admin") {
  const all = read("admins");
  const filtered = all.filter((a) => a.id !== adminId);
  filtered.push({ id: adminId, name, role, createdAt: new Date().toISOString() });
  write("admins", filtered);
}

/** Checks whether an admin's role permits access to a given data source. */
function hasPermission(adminId, dataSource) {
  const role = getAdminRole(adminId);
  if (!role) return false;
  const allowed = PERMISSIONS[role] || [];
  return allowed.includes("*") || allowed.includes(dataSource);
}

function requireAdmin(adminId) {
  const role = getAdminRole(adminId);
  if (!role) throw new Error("Access denied: not a recognized administrator");
  return role;
}

module.exports = { registerAdmin, getAdminRole, hasPermission, requireAdmin, PERMISSIONS };
