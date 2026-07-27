/**
 * Rule-based intent matcher — no paid LLM call needed for routing.
 * Each intent lists English + Bangla trigger patterns and the
 * `dataSource` permission key it requires (checked in adminAuthService).
 */
const INTENTS = [
  { id: "daily_summary", dataSource: "analytics", patterns: [/today.*summary/i, /summary.*today/i, /আজকের.*সারাংশ/, /আজকের.*রিপোর্ট/] },
  { id: "new_users_today", dataSource: "users", patterns: [/new users? today/i, /today.*new users?/i, /আজকের.*নতুন.*ইউজার/, /নতুন.*ইউজার/] },
  { id: "active_users_online", dataSource: "users", patterns: [/active users? online/i, /how many.*online/i, /অনলাইন.*ইউজার/] },
  { id: "ai_requests_today", dataSource: "ai_usage", patterns: [/total ai requests?/i, /ai requests? today/i, /আজকের.*এআই.*রিকোয়েস্ট/] },
  { id: "token_usage_today", dataSource: "token_usage", patterns: [/today.*token/i, /token usage/i, /আজকের.*টোকেন/] },
  { id: "revenue_today", dataSource: "analytics", patterns: [/today.*revenue/i, /revenue today/i, /আজকের.*আয়/, /আজকের.*রেভিনিউ/] },
  { id: "new_subscriptions", dataSource: "analytics", patterns: [/new subscriptions?/i, /নতুন.*সাবস্ক্রিপশন/] },
  { id: "cancelled_subscriptions", dataSource: "analytics", patterns: [/cancell?ed subscriptions?/i, /বাতিল.*সাবস্ক্রিপশন/] },
  { id: "most_used_feature", dataSource: "feature_usage", patterns: [/most used feature/i, /which feature.*most/i, /সবচেয়ে বেশি ব্যবহৃত ফিচার/] },
  { id: "least_used_feature", dataSource: "feature_usage", patterns: [/least used feature/i, /which feature.*least/i, /সবচেয়ে কম ব্যবহৃত ফিচার/] },
  { id: "most_active_users", dataSource: "users", patterns: [/most active users?/i, /সবচেয়ে সক্রিয় ইউজার/] },
  { id: "error_logs_today", dataSource: "error_logs", patterns: [/today.*error/i, /error logs? today/i, /আজকের.*এরর/] },
  { id: "crash_reports_today", dataSource: "crash_logs", patterns: [/today.*crash/i, /crash reports? today/i, /আজকের.*ক্র্যাশ/] },
  { id: "server_health", dataSource: "server_status", patterns: [/server health/i, /server status/i, /সার্ভার.*স্বাস্থ্য/, /সার্ভার.*স্ট্যাটাস/] },
  { id: "api_usage", dataSource: "api_usage", patterns: [/api usage/i, /এপিআই.*ব্যবহার/] },
  { id: "database_status", dataSource: "server_status", patterns: [/database status/i, /ডাটাবেজ.*স্ট্যাটাস/] },
  { id: "storage_usage", dataSource: "server_status", patterns: [/storage usage/i, /স্টোরেজ.*ব্যবহার/] },
  { id: "user_growth", dataSource: "users", patterns: [/user growth/i, /ইউজার.*বৃদ্ধি/] },
  { id: "weekly_report", dataSource: "reports", patterns: [/weekly report/i, /সাপ্তাহিক রিপোর্ট/] },
  { id: "monthly_report", dataSource: "reports", patterns: [/monthly report/i, /মাসিক রিপোর্ট/] },
  { id: "system_performance", dataSource: "server_status", patterns: [/system performance/i, /সিস্টেম.*পারফরম্যান্স/] },
  { id: "security_alerts", dataSource: "security", patterns: [/security alerts?/i, /সিকিউরিটি.*এলার্ট/] },
  { id: "feedback_summary", dataSource: "feedback", patterns: [/feedback summary/i, /user feedback/i, /ফিডব্যাক.*সারাংশ/] },
  { id: "ai_performance_report", dataSource: "ai_usage", patterns: [/ai performance/i, /এআই.*পারফরম্যান্স/] },
];

function matchIntent(message) {
  for (const intent of INTENTS) {
    if (intent.patterns.some((p) => p.test(message))) return intent;
  }
  return null;
}

module.exports = { INTENTS, matchIntent };
