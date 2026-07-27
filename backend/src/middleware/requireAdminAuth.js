const { requireAdmin } = require("../services/adminAuthService");

/**
 * Security Rule: Only administrators can access this feature.
 * Expects the caller to pass an admin ID (from your existing session/JWT auth)
 * as `req.headers['x-admin-id']`. Swap this for your real session/JWT check.
 */
function requireAdminAuth(req, res, next) {
  const adminId = req.headers["x-admin-id"];
  if (!adminId) return res.status(401).json({ error: "Missing admin identity" });
  try {
    const role = requireAdmin(adminId);
    req.adminId = adminId;
    req.adminRole = role;
    next();
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
}

module.exports = { requireAdminAuth };
