const express = require("express");
const router = express.Router();
const { requireAuth, requirePermission } = require("../middleware/authMiddleware");

const platform = require("../services/platformService");
const aiOps = require("../services/aiOpsService");
const billing = require("../services/billingService");
const security = require("../services/securityOpsService");
const learning = require("../services/learningOpsService");
const health = require("../services/systemHealthOpsService");
const analytics = require("../services/analyticsOpsService");
const reportService = require("../services/reportService");
const jobs = require("../services/automationJobsService");
const aiAssistant = require("../services/aiAssistantService");
const auditLog = require("../services/auditLogService");

router.use(requireAuth); // everything below requires a valid JWT or admin key

const ok = (fn) => async (req, res) => {
  try { res.json(await fn(req)); } catch (e) { res.status(400).json({ error: e.message }); }
};

// ---- Platform / Users ----
router.get("/users/statistics", requirePermission("users"), ok(() => platform.getUserStatistics()));
router.get("/users/active", requirePermission("users"), ok(() => platform.getActiveUsersOnline()));
router.get("/users/inactive", requirePermission("users"), ok((req) => platform.getInactiveUsers(Number(req.query.days) || 14)));
router.get("/users/growth", requirePermission("users"), ok((req) => platform.getUserGrowthReport(Number(req.query.days) || 30)));
router.get("/users/retention", requirePermission("users"), ok(() => platform.getUserRetention()));
router.get("/users/:userId/behavior", requirePermission("users"), ok((req) => platform.getUserBehavior(req.params.userId)));
router.get("/users/search", requirePermission("users"), ok((req) => platform.searchUsers(req.query.q || "")));

// ---- AI Ops ----
router.get("/ai/usage", requirePermission("ai_usage"), ok(() => aiOps.getAiUsageReport()));
router.get("/ai/tokens", requirePermission("ai_usage"), ok(() => aiOps.getTokenUsageReport()));
router.get("/ai/models", requirePermission("ai_usage"), ok(() => aiOps.getModelUsageReport()));
router.get("/ai/health", requirePermission("ai_usage"), ok(() => aiOps.getAiHealthCheck()));

// ---- Billing ----
router.get("/billing/subscriptions", requirePermission("billing"), ok(() => billing.getSubscriptionStats()));
router.get("/billing/revenue/:period", requirePermission("billing"), ok((req) => billing.getRevenueReport(req.params.period)));
router.get("/billing/renewals-upcoming", requirePermission("billing"), ok((req) => billing.getUpcomingRenewals(Number(req.query.days) || 3)));

// ---- Security ----
router.get("/security/report", requirePermission("system_health"), ok(() => security.getSecurityReport()));
router.post("/security/spam-check", requirePermission("system_health"), ok((req) => security.scoreSpam(req.body.text)));

// ---- Learning ----
router.get("/learning/:userId/progress", requirePermission("learning"), ok((req) => learning.getProgressSummary(req.params.userId)));
router.get("/learning/:userId/achievements", requirePermission("learning"), ok((req) => learning.checkAchievements(req.params.userId)));
router.get("/learning/engagement", requirePermission("learning"), ok(() => learning.getLearningEngagementReport()));

// ---- System Health ----
router.get("/system/errors", requirePermission("system_health"), ok(() => health.getErrorReport()));
router.get("/system/uptime", requirePermission("system_health"), ok((req) => health.getUptimeReport(req.query.name)));
router.get("/system/resources", requirePermission("system_health"), ok(() => health.getResourceUsage()));

// ---- Analytics ----
router.get("/analytics/feature-popularity", requirePermission("analytics"), ok(() => analytics.getFeaturePopularity()));
router.get("/analytics/peak-hour", requirePermission("analytics"), ok(() => analytics.getPeakUsageHour()));
router.get("/analytics/growth-prediction", requirePermission("analytics"), ok(() => analytics.predictGrowth()));

// ---- Reports ----
router.get("/reports/:period", requirePermission("analytics"), ok((req) => reportService.generateReport(req.params.period)));

// ---- Automation Jobs ----
router.post("/notifications/schedule", requirePermission("users"), ok((req) => jobs.scheduleNotification(req.body.recipient, req.body.title, req.body.body, req.body.sendAt)));
router.get("/notifications/due", requirePermission("users"), ok(() => jobs.getDueNotifications()));
router.post("/system/maintenance-mode", requirePermission("system_health"), ok((req) => jobs.setMaintenanceMode(req.body.enabled, req.body.message)));
router.get("/system/maintenance-mode", ok(() => jobs.getMaintenanceMode()));

// ---- AI Assistant ----
router.post("/assistant/chat", ok(async (req) => {
  const adminId = req.adminId || "owner_admin_id";
  const message = req.body.query || req.body.message || "";
  const result = await aiAssistant.askAssistant(adminId, message);
  return result;
}));

// ---- Audit log ----
router.get("/audit-log", ok((req) => auditLog.getAuditLog(req.query.adminId || req.adminId)));

module.exports = router;
