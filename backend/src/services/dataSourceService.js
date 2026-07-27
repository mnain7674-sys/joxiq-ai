const { read } = require("../utils/db");

/**
 * Every function here reads ONLY real stored data via db.js.
 * If a collection is empty/missing, functions return { available: false }
 * instead of fabricating numbers — per the "never invent data" security rule.
 */

function startOfDay(d = new Date()) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
function daysAgo(n) { const x = new Date(); x.setDate(x.getDate() - n); return startOfDay(x); }

// ---- Users Database ----
function getUserStats() {
  const users = read("users"); // expected shape: [{ id, createdAt, lastActiveAt, ... }]
  if (!users.length) return { available: false, reason: "No user records found" };
  const today = startOfDay();
  const newToday = users.filter((u) => new Date(u.createdAt) >= today).length;
  const activeToday = users.filter((u) => u.lastActiveAt && new Date(u.lastActiveAt) >= today).length;
  return { available: true, totalUsers: users.length, newUsersToday: newToday, activeUsersToday: activeToday };
}

// ---- Authentication Data ----
function getAuthStats() {
  const attempts = read("login_attempts");
  if (!attempts.length) return { available: false, reason: "No authentication records found" };
  const today = startOfDay();
  const todayAttempts = attempts.filter((a) => new Date(a.attemptedAt) >= today);
  return {
    available: true,
    loginsToday: todayAttempts.filter((a) => a.success).length,
    failedLoginsToday: todayAttempts.filter((a) => !a.success).length,
  };
}

// ---- Chat History ----
function getChatHistoryStats() {
  const conversations = read("conversations");
  if (!conversations.length) return { available: false, reason: "No chat history found" };
  const today = startOfDay();
  const newToday = conversations.filter((c) => new Date(c.createdAt) >= today).length;
  const totalMessages = conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0);
  return { available: true, totalConversations: conversations.length, newConversationsToday: newToday, totalMessages };
}

// ---- AI Usage Logs ----
function getAiUsageStats() {
  const events = read("usage_events");
  if (!events.length) return { available: false, reason: "No AI usage logs found" };
  const today = startOfDay();
  const todayEvents = events.filter((e) => new Date(e.timestamp) >= today);
  return { available: true, totalRequestsToday: todayEvents.length, totalRequestsAllTime: events.length };
}

// ---- Token Usage Records ----
function getTokenUsageStats() {
  const usage = read("token_usage");
  if (!usage.length) return { available: false, reason: "No token usage records found" };
  const today = startOfDay();
  const todayUsage = usage.filter((u) => new Date(u.timestamp) >= today);
  const sum = (arr) => arr.reduce((s, u) => s + (u.totalTokens || (u.inputTokens || 0) + (u.outputTokens || 0)), 0);
  return { available: true, tokensToday: sum(todayUsage), tokensAllTime: sum(usage) };
}

// ---- Subscription Records ----
function getSubscriptionStats() {
  const subs = read("subscriptions");
  if (!subs.length) return { available: false, reason: "No subscription records found" };
  const today = startOfDay();
  const newToday = subs.filter((s) => s.createdAt && new Date(s.createdAt) >= today).length;
  const cancelledToday = subs.filter((s) => s.status === "cancelled" && s.updatedAt && new Date(s.updatedAt) >= today).length;
  return {
    available: true,
    activeSubscriptions: subs.filter((s) => s.status === "active" && s.plan !== "free").length,
    newSubscriptionsToday: newToday,
    cancelledSubscriptionsToday: cancelledToday,
  };
}

// ---- Payment Records / Revenue ----
function getRevenueStats() {
  const payments = read("payments");
  if (!payments.length) return { available: false, reason: "No payment records found" };
  const today = startOfDay();
  const successful = payments.filter((p) => p.status === "success");
  const todayRevenue = successful.filter((p) => new Date(p.verifiedAt) >= today).reduce((s, p) => s + (p.amount || 0), 0);
  const totalRevenue = successful.reduce((s, p) => s + (p.amount || 0), 0);
  return { available: true, revenueToday: todayRevenue, totalRevenue, currency: successful[0]?.currency || "USD" };
}

module.exports = {
  getUserStats, getAuthStats, getChatHistoryStats, getAiUsageStats,
  getTokenUsageStats, getSubscriptionStats, getRevenueStats,
  startOfDay, daysAgo,
};
