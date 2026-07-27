const { randomUUID } = require("crypto");
const { read, write } = require("../utils/db");
const ds1 = require("./dataSourceService");
const ds2 = require("./dataSourceService2");

function rangeFor(period) {
  const now = new Date();
  if (period === "daily") { const s = ds1.startOfDay(now); return { start: s, end: new Date(s.getTime() + 86400000) }; }
  if (period === "weekly") { const s = ds1.daysAgo(7); return { start: s, end: now }; }
  if (period === "monthly") { const s = ds1.daysAgo(30); return { start: s, end: now }; }
  throw new Error(`Unknown period: ${period}`);
}

function countInRange(collection, dateField, start, end) {
  return read(collection).filter((r) => {
    const t = new Date(r[dateField] || 0);
    return t >= start && t < end;
  }).length;
}

/** Dashboard Automation: Daily/Weekly/Monthly + User Growth/Revenue/AI Usage/Token/Feature/Error/Security/Performance/Learning reports */
function generateReport(period) {
  const { start, end } = rangeFor(period);
  const newUsers = countInRange("users", "createdAt", start, end);
  const newConversations = countInRange("conversations", "createdAt", start, end);
  const aiRequests = countInRange("usage_events", "timestamp", start, end);
  const errors = countInRange("error_log", "loggedAt", start, end);
  const crashes = countInRange("crash_reports", "reportedAt", start, end);
  const payments = read("payments").filter((p) => p.status === "success" && new Date(p.verifiedAt) >= start && new Date(p.verifiedAt) < end);
  const revenue = payments.reduce((s, p) => s + (p.amount || 0), 0);
  const tokenEntries = read("token_usage").filter((t) => new Date(t.timestamp) >= start && new Date(t.timestamp) < end);
  const tokens = tokenEntries.reduce((s, t) => s + (t.totalTokens || 0), 0);
  const feedback = read("feedback").filter((f) => new Date(f.submittedAt) >= start && new Date(f.submittedAt) < end);
  const progress = read("progress").filter((p) => new Date(p.completedAt) >= start && new Date(p.completedAt) < end);

  const report = {
    id: randomUUID(),
    period,
    rangeStart: start.toISOString(),
    rangeEnd: end.toISOString(),
    newUsers, newConversations, aiRequests, errors, crashes,
    revenue, tokensUsed: tokens, feedbackCount: feedback.length, learningUnitsCompleted: progress.length,
    generatedAt: new Date().toISOString(),
  };

  const all = read("generated_reports");
  all.push(report);
  write("generated_reports", all);

  const text = `**${period.charAt(0).toUpperCase() + period.slice(1)} Report**\n\n` +
    `👤 New users: ${newUsers}\n` +
    `💬 New conversations: ${newConversations}\n` +
    `🤖 AI requests: ${aiRequests}\n` +
    `🔢 Tokens used: ${tokens}\n` +
    `💰 Revenue: ${revenue}\n` +
    `🐞 Errors: ${errors}  💥 Crashes: ${crashes}\n` +
    `💬 Feedback received: ${feedback.length}\n` +
    `📚 Learning units completed: ${progress.length}`;

  return { text, data: report };
}

/** Smart Capability: compare today vs previous day for a given metric collection. */
function compareToYesterday(collection, dateField) {
  const today = ds1.startOfDay();
  const yesterday = ds1.daysAgo(1);
  const todayCount = countInRange(collection, dateField, today, new Date(today.getTime() + 86400000));
  const yesterdayCount = countInRange(collection, dateField, yesterday, today);
  const change = yesterdayCount === 0 ? null : Number((((todayCount - yesterdayCount) / yesterdayCount) * 100).toFixed(1));
  return { today: todayCount, yesterday: yesterdayCount, percentChange: change };
}

/** Smart Capability: detect sudden traffic increase (>50% jump vs yesterday). */
function detectTrafficSpike() {
  const cmp = compareToYesterday("usage_events", "timestamp");
  return { spike: cmp.percentChange !== null && cmp.percentChange > 50, ...cmp };
}

/** Smart Capability: detect abnormal token usage (>75% jump vs yesterday). */
function detectAbnormalTokenUsage() {
  const cmp = compareToYesterday("token_usage", "timestamp");
  return { abnormal: cmp.percentChange !== null && cmp.percentChange > 75, ...cmp };
}

/** Smart Capability: detect inactive features (no usage in last 7 days). */
function detectInactiveFeatures(allFeatureNames) {
  const weekAgo = ds1.daysAgo(7);
  const recentEvents = read("usage_events").filter((e) => new Date(e.timestamp) >= weekAgo);
  const activeFeatures = new Set(recentEvents.map((e) => e.eventName));
  return allFeatureNames.filter((f) => !activeFeatures.has(f));
}

/** Smart Capability: identify trending features (usage growth this week vs last week). */
function getTrendingFeatures() {
  const thisWeekStart = ds1.daysAgo(7);
  const lastWeekStart = ds1.daysAgo(14);
  const events = read("usage_events");
  const thisWeek = {}, lastWeek = {};
  events.forEach((e) => {
    const t = new Date(e.timestamp);
    if (t >= thisWeekStart) thisWeek[e.eventName] = (thisWeek[e.eventName] || 0) + 1;
    else if (t >= lastWeekStart) lastWeek[e.eventName] = (lastWeek[e.eventName] || 0) + 1;
  });
  const trending = Object.keys(thisWeek)
    .map((f) => ({ feature: f, thisWeek: thisWeek[f], lastWeek: lastWeek[f] || 0, growth: thisWeek[f] - (lastWeek[f] || 0) }))
    .filter((f) => f.growth > 0)
    .sort((a, b) => b.growth - a.growth);
  return trending.slice(0, 5);
}

module.exports = { generateReport, compareToYesterday, detectTrafficSpike, detectAbnormalTokenUsage, detectInactiveFeatures, getTrendingFeatures };
