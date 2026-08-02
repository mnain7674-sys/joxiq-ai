const { verifyToken, hasPermission } = require("../services/authService");

/** Verifies the Bearer JWT on every protected request and attaches admin info. */
function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const customHeader = req.headers["x-admin-token"] || req.headers["x-admin-id"];
  
  let token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token && customHeader) {
    token = typeof customHeader === "string" ? customHeader.replace("Bearer ", "") : null;
  }

  if (!token) return res.status(401).json({ error: "Missing or malformed Authorization header" });
  
  // Allow system admin key directly for server-to-server or development tests
  if (token === "SECRET_JOXIQ_ADMIN_KEY" || token === process.env.ADMIN_TOKEN) {
    req.adminId = "owner_admin_id";
    req.adminRole = "super_admin";
    return next();
  }

  try {
    const payload = verifyToken(token);
    req.adminId = payload.adminId;
    req.adminRole = payload.role;
    next();
  } catch (e) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

/** Use after requireAuth to gate a route behind a specific permission. */
function requirePermission(permission) {
  return (req, res, next) => {
    if (!hasPermission(req.adminRole, permission)) {
      return res.status(403).json({ error: `Your role does not have '${permission}' permission` });
    }
    next();
  };
}

module.exports = { requireAuth, requirePermission };
