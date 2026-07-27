const { read } = require("../utils/db");
const { startOfDay } = require("./dataSourceService");

// ---- Analytics Database ----
function getAnalyticsSummary() {
  const events = read("usage_events");
  if (!events.length) return { available: false, reason: "No analytics data found" };
  const byEvent = {};
  events.forEach((e) => (byEvent[e.eventName] = (byEvent[e.eventName] || 0) + 1));
  return { available: true, totalEvents: events.length, breakdown: byEvent };
}

// ---- Feedback Database ----
function getFeedbackSummary() {
  const feedback = read("feedback");
  if (!feedback.length) return { available: false, reason: "No feedback records found" };
  const counts = { positive: 0, neutral: 0, negative: 0 };
  feedback.forEach((f) => { if (counts[f.sentiment] !== undefined) counts[f.sentiment]++; });
  return { available: true, totalFeedback: feedback.length, sentimentBreakdown: counts };
}

// ---- Error Logs ----
function getErrorLogs(limit = 20) {
  const errors = read("error_log");
  if (!errors.length) return { available: false, reason: "No error logs found" };
  const today = startOfDay();
  const todayErrors = errors.filter((e) => new Date(e.loggedAt) >= today);
  return { available: true, errorsToday: todayErrors.length, totalErrors: errors.length, recent: errors.slice(-limit).reverse() };
}

// ---- Crash Logs ----
function getCrashLogs(limit = 20) {
  const crashes = read("crash_reports");
  if (!crashes.length) return { available: false, reason: "No crash logs found" };
  const today = startOfDay();
  const todayCrashes = crashes.filter((c) => new Date(c.reportedAt) >= today);
  return { available: true, crashesToday: todayCrashes.length, totalCrashes: crashes.length, recent: crashes.slice(-limit).reverse() };
}

// ---- Activity Logs ----
function getActivityLogs(limit = 50) {
  const activity = read("recent_activity");
  if (!activity.length) return { available: false, reason: "No activity logs found" };
  return { available: true, recent: activity.slice(-limit).reverse() };
}

// ---- Server Status ----
function getServerStatus() {
  const checks = read("health_checks");
  if (!checks.length) return { available: false, reason: "No server health data found" };
  const recent = checks.slice(-20);
  const upCount = recent.filter((c) => c.up).length;
  return { available: true, uptimePercent: Number(((upCount / recent.length) * 100).toFixed(1)), recentChecks: recent.reverse() };
}

// ---- API Usage Logs ----
function getApiUsageStats() {
  const usage = read("api_usage");
  if (!usage.length) return { available: false, reason: "No API usage logs found" };
  const today = startOfDay();
  const todayUsage = usage.filter((u) => new Date(u.calledAt) >= today);
  return { available: true, callsToday: todayUsage.length, callsAllTime: usage.length };
}

// ---- System Configuration ----
function getSystemConfig() {
  const flags = read("feature_flags");
  if (!flags.length) return { available: false, reason: "No system configuration found" };
  return { available: true, featureFlags: flags.map((f) => ({ name: f.flagName, enabled: f.enabled, rollout: f.rolloutPercent })) };
}

// ---- Feature Usage Statistics ----
function getFeatureUsageStats() {
  const events = read("usage_events");
  if (!events.length) return { available: false, reason: "No feature usage data found" };
  const byFeature = {};
  events.forEach((e) => (byFeature[e.eventName] = (byFeature[e.eventName] || 0) + 1));
  const sorted = Object.entries(byFeature).sort((a, b) => b[1] - a[1]);
  return {
    available: true,
    mostUsed: sorted[0] ? { feature: sorted[0][0], count: sorted[0][1] } : null,
    leastUsed: sorted[sorted.length - 1] ? { feature: sorted[sorted.length - 1][0], count: sorted[sorted.length - 1][1] } : null,
    allFeatures: sorted.map(([feature, count]) => ({ feature, count })),
  };
}

// ---- Learning Platform Statistics ----
function getLearningStats() {
  const progress = read("progress");
  if (!progress.length) return { available: false, reason: "No learning platform data found" };
  const avgScore = progress.reduce((s, p) => s + p.score, 0) / progress.length;
  return { available: true, totalUnitsCompleted: progress.length, averageScore: Number(avgScore.toFixed(1)) };
}

// ---- Notification System ----
function getNotificationStats() {
  const notifications = read("notifications");
  if (!notifications.length) return { available: false, reason: "No notification records found" };
  return {
    available: true,
    totalScheduled: notifications.length,
    pending: notifications.filter((n) => n.status === "pending").length,
    sent: notifications.filter((n) => n.status === "sent").length,
  };
}

// ---- Reports Database ----
function getGeneratedReports(limit = 10) {
  const reports = read("generated_reports");
  if (!reports.length) return { available: false, reason: "No generated reports found" };
  return { available: true, recent: reports.slice(-limit).reverse() };
}

// ---- Security Logs ----
function getSecurityLogs() {
  const alerts = read("security_alerts");
  const attempts = read("login_attempts");
  if (!alerts.length && !attempts.length) return { available: false, reason: "No security logs found" };
  const today = startOfDay();
  return {
    available: true,
    alertsToday: alerts.filter((a) => new Date(a.raisedAt) >= today).length,
    unacknowledgedAlerts: alerts.filter((a) => !a.acknowledged).length,
    failedLoginsToday: attempts.filter((a) => !a.success && new Date(a.attemptedAt) >= today).length,
  };
}

// ---- Active users online (approximated from recent activity in last 5 min) ----
function getActiveUsersOnline(windowMs = 5 * 60 * 1000) {
  const activity = read("recent_activity");
  if (!activity.length) return { available: false, reason: "No activity data found" };
  const cutoff = Date.now() - windowMs;
  const recentUserIds = new Set(activity.filter((a) => new Date(a.at).getTime() >= cutoff).map((a) => a.userId));
  return { available: true, activeUsersOnline: recentUserIds.size };
}

module.exports = {
  getAnalyticsSummary, getFeedbackSummary, getErrorLogs, getCrashLogs,
  getActivityLogs, getServerStatus, getApiUsageStats, getSystemConfig,
  getFeatureUsageStats, getLearningStats, getNotificationStats,
  getGeneratedReports, getSecurityLogs, getActiveUsersOnline,
};
