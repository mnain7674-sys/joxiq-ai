import express, { Request, Response } from "express";
import {
  userManagementService as userMgmt,
  aiMonitoringService as aiMonitoring,
  adminDashboardService as dashboard,
  systemMonitoringService as systemMonitoring,
  contentLearningService as contentLearning,
  securityMonitoringService as security,
  maintenanceOpsService as maintenance,
  analyticsInsightsService as analytics,
  smartAiAdminService as smartAi,
  productivityService as productivity
} from "../services/adminV2Services.js";

import {
  getEmailAlertConfig,
  updateEmailAlertConfig,
  sendTestAlertEmail,
  checkAndTriggerAiAnomalyAlert,
  getAlertLogs
} from "../services/aiEmailAlertService.js";

const router = express.Router();

const ok = (fn: (req: Request) => Promise<any> | any) => async (req: Request, res: Response) => {
  try {
    const result = await fn(req);
    res.json(result);
  } catch (e: any) {
    res.status(400).json({ error: e.message || "An error occurred" });
  }
};

// ---- User Management (#1-10) ----
router.get("/users/new", ok((req) => userMgmt.getNewUserReport(Number(req.query.days) || 1)));
router.get("/users/active", ok(() => userMgmt.getActiveUserMonitor()));
router.get("/users/inactive", ok((req) => userMgmt.getInactiveUsers(Number(req.query.days) || 14)));
router.get("/users/growth", ok((req) => userMgmt.getUserGrowthReport(Number(req.query.days) || 30)));
router.get("/users/ranking", ok((req) => userMgmt.getUserRanking(Number(req.query.limit) || 10)));
router.get("/users/:userId/timeline", ok((req) => userMgmt.getUserActivityTimeline(req.params.userId)));
router.get("/users/suspicious", ok(() => userMgmt.getSuspiciousUsers()));
router.get("/users/:userId/login-history", ok((req) => userMgmt.getUserLoginHistory(req.params.userId)));
router.get("/users/search", ok((req) => userMgmt.searchUsers(String(req.query.q || ""))));
router.get("/users/statistics", ok(() => userMgmt.getUserStatistics()));

// ---- AI Monitoring (#11-20) ----
router.get("/ai/usage", ok(() => aiMonitoring.getAiUsageReport()));
router.get("/ai/model-usage", ok(() => aiMonitoring.getModelUsageReport()));
router.get("/ai/token-usage", ok(() => aiMonitoring.getTokenUsageReport()));
router.get("/ai/quality", ok(() => aiMonitoring.getResponseQualityMonitor()));
router.get("/ai/slow-responses", ok(() => aiMonitoring.getSlowResponses()));
router.get("/ai/failed-requests", ok(() => aiMonitoring.getFailedRequests()));
router.get("/ai/summary/:period", ok((req) => aiMonitoring.getAiSummary(req.params.period)));
router.get("/ai/health", ok(() => aiMonitoring.getAiHealthCheck()));

// ---- Admin Dashboard (#21-30) ----
router.get("/dashboard/summary", ok(() => dashboard.getDashboardSummary()));
router.get("/dashboard/report/:period", ok((req) => dashboard.getPeriodReport(req.params.period)));
router.get("/dashboard/overview", ok(() => dashboard.getPlatformOverview()));
router.get("/dashboard/system-stats", ok(() => dashboard.getSystemStatistics()));
router.get("/dashboard/live", ok(() => dashboard.getLiveDashboardSnapshot()));
router.get("/dashboard/insights", ok(() => dashboard.getQuickInsights()));
router.get("/dashboard/performance-score", ok(() => dashboard.getPerformanceScore()));
router.get("/dashboard/growth", ok(() => dashboard.getGrowthAnalytics()));

// ---- System Monitoring (#31-40) ----
router.post("/system/server-status", ok((req) => systemMonitoring.getServerStatus(req.body.url)));
router.get("/system/database-status", ok(() => systemMonitoring.getDatabaseStatus()));
router.get("/system/storage", ok(() => systemMonitoring.getStorageUsage()));
router.get("/system/memory", ok(() => systemMonitoring.getMemoryUsage()));
router.get("/system/cpu", ok(() => systemMonitoring.getCpuUsage()));
router.post("/system/network-status", ok((req) => systemMonitoring.getNetworkStatus(req.body.urls)));
router.get("/system/uptime", ok(() => systemMonitoring.getUptimeTracker()));
router.get("/system/error-count", ok(() => systemMonitoring.getErrorCounter()));
router.get("/system/error-analysis", ok(() => systemMonitoring.analyzeErrorLogs()));
router.get("/system/health-dashboard", ok(() => systemMonitoring.getHealthDashboard()));

// ---- Content & Learning (#41-50) ----
router.get("/learning/courses", ok(() => contentLearning.getCourseStatistics()));
router.get("/learning/quizzes", ok(() => contentLearning.getQuizStatistics()));
router.get("/learning/exams", ok(() => contentLearning.getExamStatistics()));
router.get("/learning/progress", ok(() => contentLearning.getLearningProgressSummary()));
router.get("/learning/popular-courses", ok(() => contentLearning.getPopularCourses()));
router.post("/learning/unused-courses", ok((req) => contentLearning.getUnusedCourses(req.body.allCourseIds)));
router.get("/learning/lesson-completions", ok((req) => contentLearning.getLessonCompletionReport(Number(req.query.days) || 7)));
router.get("/learning/engagement", ok(() => contentLearning.getStudentEngagementReport()));
router.get("/learning/trend", ok(() => contentLearning.getLearningTrend()));
router.get("/learning/:userId/activity", ok((req) => contentLearning.getStudyActivityReport(req.params.userId)));

// ---- Security (#51-60) ----
router.get("/security/failed-logins", ok((req) => security.getFailedLogins(Number(req.query.days) || 1)));
router.get("/security/admin-login-history", ok((req) => security.getAdminLoginHistory(req.query.adminId as string)));
router.get("/security/permission-check", ok((req) => security.checkPermission(req.query.adminId as string, req.query.permission as string)));
router.post("/security/alert", ok((req) => security.raiseSecurityAlert(req.body.reason, req.body.details)));
router.get("/security/devices", ok((req) => security.getDeviceMonitor(req.query.userId as string)));
router.get("/security/sessions", ok(() => security.getSessionMonitor()));
router.get("/security/access-log", ok((req) => security.getAccessLogReport(Number(req.query.days) || 1)));
router.get("/security/suspicious-activity", ok(() => security.getSuspiciousActivityReport()));
router.get("/security/admin-actions", ok((req) => security.getAdminActionLog(req.query.adminId as string)));
router.get("/security/dashboard", ok(() => security.getSecurityDashboard()));

// ---- Maintenance (#61-70) ----
router.post("/maintenance/cache-cleanup", ok(() => maintenance.cleanupCache()));
router.post("/maintenance/db-cleanup/:collection", ok((req) => maintenance.cleanupDatabase(req.params.collection)));
router.post("/maintenance/temp-cleanup", ok((req) => maintenance.cleanupTempFiles(req.body.tempDir)));
router.get("/maintenance/backup-reminder", ok(() => maintenance.checkBackupReminder()));
router.get("/maintenance/restore-check/:backupName", ok((req) => maintenance.checkRestoreIntegrity(req.params.backupName, (req.query.expectedFiles as string)?.split(",") || [])));
router.post("/maintenance/schedule-window", ok((req) => maintenance.scheduleMaintenanceWindow(req.body.startAt, req.body.endAt, req.body.message)));
router.get("/maintenance/window-status", ok(() => maintenance.isInMaintenanceWindow()));
router.get("/maintenance/collection-sizes", ok(() => maintenance.checkCollectionSizes()));
router.post("/maintenance/error-cleanup", ok(() => maintenance.cleanupOldErrors()));
router.post("/maintenance/optimize/:collection", ok((req) => maintenance.optimizeCollection(req.params.collection)));
router.post("/maintenance/run-full", ok(() => maintenance.runFullMaintenance()));

// ---- Analytics (#71-80) ----
router.get("/analytics/most-used", ok(() => analytics.getMostUsedFeature()));
router.get("/analytics/least-used", ok(() => analytics.getLeastUsedFeature()));
router.get("/analytics/peak-time", ok(() => analytics.getPeakUsageTime()));
router.get("/analytics/retention", ok(() => analytics.getUserRetentionReport()));
router.get("/analytics/engagement", ok(() => analytics.getEngagementReport()));
router.get("/analytics/trends/:period", ok((req) => analytics.getTrends(req.params.period)));
router.get("/analytics/growth-prediction", ok(() => analytics.getGrowthPrediction()));
router.get("/analytics/export", ok(() => analytics.exportAnalytics()));

// ---- Smart AI Admin (#81-90) ----
router.post("/ai-admin/chat", ok((req) => smartAi.chatAssistant(req.body.message)));
router.post("/ai-admin/report", ok((req) => smartAi.generateReport(req.body.sections)));
router.post("/ai-admin/summarize", ok((req) => ({ summary: smartAi.summarizeData(req.body.data) })));
router.get("/ai-admin/advice", ok(() => smartAi.getSystemAdvice()));
router.get("/ai-admin/explain-error", ok((req) => smartAi.explainErrors(String(req.query.keyword || ""))));
router.get("/ai-admin/performance-recs", ok(() => smartAi.getPerformanceRecommendations()));
router.get("/ai-admin/db-info/:collection", ok((req) => smartAi.getDatabaseInfo(req.params.collection)));
router.get("/ai-admin/search", ok((req) => smartAi.adminSearch(String(req.query.q || ""))));
router.post("/ai-admin/command", ok((req) => smartAi.processCommand(req.body.message)));
router.get("/ai-admin/dashboard-suggestions", ok(() => smartAi.getSmartDashboardSuggestions()));

// ---- Productivity (#91-100) ----
router.post("/notifications/schedule", ok((req) => productivity.scheduleNotification(req.body.recipient, req.body.title, req.body.body, req.body.sendAt)));
router.get("/notifications/due", ok(() => productivity.getDueNotifications()));
router.post("/tasks/schedule", ok((req) => productivity.scheduleTask(req.body.name, req.body.runAt, req.body.payload)));
router.get("/tasks/due", ok(() => productivity.getDueTasks()));
router.post("/reminders", ok((req) => productivity.setReminder(req.body.adminId, req.body.message, req.body.remindAt)));
router.get("/feedback/trends", ok(() => productivity.analyzeFeedbackTrends()));
router.get("/features/usage-report", ok(() => productivity.getFeatureUsageReport()));
router.get("/platform/summary", ok(() => productivity.getPlatformSummary()));
router.get("/briefing/:period", ok((req) => productivity.getAdminBriefing(req.params.period)));
router.get("/control-center", ok(() => productivity.getAdminControlCenter()));

// ---- AI Anomaly & Email Alerts ----
router.get("/email-alerts/config", ok(() => ({ config: getEmailAlertConfig(), logs: getAlertLogs() })));
router.post("/email-alerts/config", ok((req) => updateEmailAlertConfig(req.body)));
router.post("/email-alerts/test", ok(() => sendTestAlertEmail()));
router.post("/email-alerts/trigger-anomaly", ok((req) => checkAndTriggerAiAnomalyAlert(req.body)));
router.get("/email-alerts/logs", ok(() => getAlertLogs()));

export default router;
