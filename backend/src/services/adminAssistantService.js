const { matchIntent } = require("./intentService");
const { hasPermission, requireAdmin } = require("./adminAuthService");
const { logAdminAction } = require("./auditLogService");
const ds1 = require("./dataSourceService");
const ds2 = require("./dataSourceService2");

const NO_DATA_MSG = (reason) => `⚠️ Data unavailable: ${reason}`;

const HANDLERS = {
  daily_summary: () => {
    const users = ds1.getUserStats();
    const ai = ds1.getAiUsageStats();
    const revenue = ds1.getRevenueStats();
    const errors = ds2.getErrorLogs();
    const parts = [];
    parts.push(users.available ? `👤 New users today: ${users.newUsersToday} (total: ${users.totalUsers})` : NO_DATA_MSG(users.reason));
    parts.push(ai.available ? `🤖 AI requests today: ${ai.totalRequestsToday}` : NO_DATA_MSG(ai.reason));
    parts.push(revenue.available ? `💰 Revenue today: ${revenue.revenueToday} ${revenue.currency}` : NO_DATA_MSG(revenue.reason));
    parts.push(errors.available ? `🐞 Errors today: ${errors.errorsToday}` : NO_DATA_MSG(errors.reason));
    return { text: `**Today's JOXIQ AI Summary**\n\n${parts.join("\n")}`, data: { users, ai, revenue, errors } };
  },
  new_users_today: () => {
    const r = ds1.getUserStats();
    return r.available
      ? { text: `👤 ${r.newUsersToday} new users today (total users: ${r.totalUsers}).`, data: r }
      : { text: NO_DATA_MSG(r.reason), data: r };
  },
  active_users_online: () => {
    const r = ds2.getActiveUsersOnline();
    return r.available ? { text: `🟢 ${r.activeUsersOnline} users currently active.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  ai_requests_today: () => {
    const r = ds1.getAiUsageStats();
    return r.available ? { text: `🤖 Total AI requests today: ${r.totalRequestsToday} (all-time: ${r.totalRequestsAllTime}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  token_usage_today: () => {
    const r = ds1.getTokenUsageStats();
    return r.available ? { text: `🔢 Tokens used today: ${r.tokensToday} (all-time: ${r.tokensAllTime}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  revenue_today: () => {
    const r = ds1.getRevenueStats();
    return r.available ? { text: `💰 Revenue today: ${r.revenueToday} ${r.currency} (all-time: ${r.totalRevenue} ${r.currency}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  new_subscriptions: () => {
    const r = ds1.getSubscriptionStats();
    return r.available ? { text: `📈 New subscriptions today: ${r.newSubscriptionsToday} (active total: ${r.activeSubscriptions}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  cancelled_subscriptions: () => {
    const r = ds1.getSubscriptionStats();
    return r.available ? { text: `📉 Cancelled subscriptions today: ${r.cancelledSubscriptionsToday}.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  most_used_feature: () => {
    const r = ds2.getFeatureUsageStats();
    return r.available && r.mostUsed ? { text: `🏆 Most used feature: **${r.mostUsed.feature}** (${r.mostUsed.count} uses).`, data: r } : { text: NO_DATA_MSG(r.reason || "No feature usage recorded yet"), data: r };
  },
  least_used_feature: () => {
    const r = ds2.getFeatureUsageStats();
    return r.available && r.leastUsed ? { text: `📉 Least used feature: **${r.leastUsed.feature}** (${r.leastUsed.count} uses).`, data: r } : { text: NO_DATA_MSG(r.reason || "No feature usage recorded yet"), data: r };
  },
  most_active_users: () => {
    const r = ds2.getActivityLogs(100);
    if (!r.available) return { text: NO_DATA_MSG(r.reason), data: r };
    const counts = {};
    r.recent.forEach((a) => (counts[a.userId] = (counts[a.userId] || 0) + 1));
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    return { text: `👥 Most active users:\n${top.map(([id, c], i) => `${i + 1}. ${id} — ${c} actions`).join("\n")}`, data: { top } };
  },
  error_logs_today: () => {
    const r = ds2.getErrorLogs();
    return r.available ? { text: `🐞 Errors today: ${r.errorsToday} (total logged: ${r.totalErrors}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  crash_reports_today: () => {
    const r = ds2.getCrashLogs();
    return r.available ? { text: `💥 Crashes today: ${r.crashesToday} (total logged: ${r.totalCrashes}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  server_health: () => {
    const r = ds2.getServerStatus();
    return r.available ? { text: `🖥️ Server uptime (recent checks): ${r.uptimePercent}%.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  api_usage: () => {
    const r = ds2.getApiUsageStats();
    return r.available ? { text: `🔌 API calls today: ${r.callsToday} (all-time: ${r.callsAllTime}).`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  database_status: () => {
    const r = ds2.getServerStatus();
    return r.available ? { text: `🗄️ Database/server uptime: ${r.uptimePercent}% over recent checks.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  storage_usage: () => ({ text: "📦 Storage usage: connect this to your actual file/DB storage stats endpoint — not tracked in the current data store.", data: { available: false } }),
  user_growth: () => {
    const r = ds1.getUserStats();
    return r.available ? { text: `📊 Total users: ${r.totalUsers}. New today: ${r.newUsersToday}.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  weekly_report: () => require("./reportService").generateReport("weekly"),
  monthly_report: () => require("./reportService").generateReport("monthly"),
  system_performance: () => {
    const r = ds2.getServerStatus();
    return r.available ? { text: `⚙️ System performance — uptime: ${r.uptimePercent}%.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  security_alerts: () => {
    const r = ds2.getSecurityLogs();
    return r.available ? { text: `🔒 Security alerts today: ${r.alertsToday}. Unacknowledged: ${r.unacknowledgedAlerts}. Failed logins today: ${r.failedLoginsToday}.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  feedback_summary: () => {
    const r = ds2.getFeedbackSummary();
    return r.available ? { text: `💬 Feedback (${r.totalFeedback} total): 👍 ${r.sentimentBreakdown.positive} positive, 😐 ${r.sentimentBreakdown.neutral} neutral, 👎 ${r.sentimentBreakdown.negative} negative.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
  ai_performance_report: () => {
    const r = ds1.getAiUsageStats();
    return r.available ? { text: `🤖 AI requests today: ${r.totalRequestsToday}, all-time: ${r.totalRequestsAllTime}.`, data: r } : { text: NO_DATA_MSG(r.reason), data: r };
  },
};

/**
 * Main entry point. Never fabricates data — every handler above either
 * returns real computed values or a clear "unavailable" message.
 */
async function askAdminAssistant(adminId, message) {
  const role = requireAdmin(adminId); // throws if not a recognized admin

  const intent = matchIntent(message);
  if (!intent) {
    logAdminAction(adminId, "assistant_query_unmatched", { message });
    return { text: "I couldn't match that to a known admin command. Try asking about users, revenue, errors, server health, subscriptions, or type 'help' for a list of commands.", data: null };
  }

  if (!hasPermission(adminId, intent.dataSource)) {
    logAdminAction(adminId, "assistant_query_denied", { message, intent: intent.id });
    return { text: `⛔ Access denied: your role (${role}) does not have permission to view ${intent.dataSource.replace(/_/g, " ")} data.`, data: null };
  }

  const handler = HANDLERS[intent.id];
  if (!handler) {
    logAdminAction(adminId, "assistant_query_no_handler", { message, intent: intent.id });
    return { text: `This command (${intent.id}) is recognized but not yet implemented.`, data: null };
  }

  const result = await handler();
  logAdminAction(adminId, "assistant_query", { message, intent: intent.id });
  return result;
}

module.exports = { askAdminAssistant, HANDLERS };
