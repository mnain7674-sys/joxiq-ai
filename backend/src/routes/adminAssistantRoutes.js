const express = require("express");
const router = express.Router();
const { requireAdminAuth } = require("../middleware/requireAdminAuth");
const { askAdminAssistant } = require("../services/adminAssistantService");
const { registerAdmin } = require("../services/adminAuthService");
const { getAuditLog } = require("../services/auditLogService");
const reportService = require("../services/reportService");
const recommendationService = require("../services/recommendationService");

const ok = (fn) => async (req, res) => {
  try { res.json(await fn(req)); } catch (e) { res.status(400).json({ error: e.message }); }
};

// Setup: register an admin (call once from your existing admin user creation flow)
router.post("/admins", ok((req) => { registerAdmin(req.body.adminId, req.body.name, req.body.role); return { registered: true }; }));

// Main chat endpoint — everything below requires admin auth
router.use(requireAdminAuth);

router.post("/chat", ok(async (req) => askAdminAssistant(req.adminId, req.body.message)));

router.get("/audit-log", ok((req) => getAuditLog(req.query.adminId, Number(req.query.limit) || 100)));

router.get("/reports/:period", ok((req) => reportService.generateReport(req.params.period)));

router.get("/insights/traffic-spike", ok(() => reportService.detectTrafficSpike()));
router.get("/insights/abnormal-tokens", ok(() => reportService.detectAbnormalTokenUsage()));
router.post("/insights/inactive-features", ok((req) => ({ inactiveFeatures: reportService.detectInactiveFeatures(req.body.allFeatureNames) })));
router.get("/insights/trending-features", ok(() => reportService.getTrendingFeatures()));

router.get("/recommendations/platform", ok(() => recommendationService.recommendPlatformImprovements()));
router.get("/recommendations/performance", ok(() => recommendationService.recommendPerformanceOptimizations()));
router.get("/recommendations/security", ok(() => recommendationService.recommendSecurityImprovements()));

module.exports = router;
