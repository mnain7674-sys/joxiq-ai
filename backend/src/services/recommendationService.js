const ds2 = require("./dataSourceService2");

/** Smart Capability: Recommend platform improvements based on real detected signals. */
function recommendPlatformImprovements() {
  const recs = [];
  const feedback = ds2.getFeedbackSummary();
  if (feedback.available && feedback.sentimentBreakdown.negative > feedback.sentimentBreakdown.positive) {
    recs.push("Negative feedback outweighs positive — review recent feedback comments for recurring complaints.");
  }
  const featureUsage = ds2.getFeatureUsageStats();
  if (featureUsage.available && featureUsage.leastUsed) {
    recs.push(`"${featureUsage.leastUsed.feature}" has low usage — consider improving its discoverability or reviewing if it's needed.`);
  }
  return recs.length ? recs : ["No specific improvement signals detected from current data."];
}

/** Smart Capability: Recommend performance optimizations. */
function recommendPerformanceOptimizations() {
  const recs = [];
  const server = ds2.getServerStatus();
  if (server.available && server.uptimePercent < 99) {
    recs.push(`Server uptime is ${server.uptimePercent}% — investigate recent downtime causes.`);
  }
  const errors = ds2.getErrorLogs();
  if (errors.available && errors.errorsToday > 10) {
    recs.push(`${errors.errorsToday} errors logged today — review the error log for a common root cause.`);
  }
  return recs.length ? recs : ["No performance issues detected from current data."];
}

/** Smart Capability: Recommend security improvements. */
function recommendSecurityImprovements() {
  const recs = [];
  const security = ds2.getSecurityLogs();
  if (security.available) {
    if (security.unacknowledgedAlerts > 0) recs.push(`${security.unacknowledgedAlerts} security alerts are unacknowledged — review them.`);
    if (security.failedLoginsToday > 20) recs.push(`${security.failedLoginsToday} failed logins today — possible brute-force attempts, consider rate limiting.`);
  }
  return recs.length ? recs : ["No security issues detected from current data."];
}

module.exports = { recommendPlatformImprovements, recommendPerformanceOptimizations, recommendSecurityImprovements };
