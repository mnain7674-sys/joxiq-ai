const platform = require("./platformService");
const aiOps = require("./aiOpsService");
const billing = require("./billingService");
const security = require("./securityOpsService");
const learning = require("./learningOpsService");
const health = require("./systemHealthOpsService");
const analytics = require("./analyticsOpsService");
const reportService = require("./reportService");
const { logAdminAction } = require("./auditLogService");

/**
 * Tool definitions in Anthropic/OpenAI/Gemini tool-use format.
 */
const TOOLS = [
  { name: "get_user_statistics", description: "Get total/new user counts (today, this week, this month)", input_schema: { type: "object", properties: {} } },
  { name: "get_active_users_online", description: "Get count of users currently active", input_schema: { type: "object", properties: {} } },
  { name: "get_user_growth_report", description: "Get daily new-user counts over a period", input_schema: { type: "object", properties: { days: { type: "number" } } } },
  { name: "get_ai_usage_report", description: "Get AI request counts (today and all-time)", input_schema: { type: "object", properties: {} } },
  { name: "get_token_usage_report", description: "Get AI token consumption (today and all-time)", input_schema: { type: "object", properties: {} } },
  { name: "get_model_usage_report", description: "Get AI usage broken down by provider (Gemini/ChatGPT/Claude)", input_schema: { type: "object", properties: {} } },
  { name: "get_subscription_stats", description: "Get active/new/cancelled subscription counts", input_schema: { type: "object", properties: {} } },
  { name: "get_revenue_report", description: "Get revenue for a period", input_schema: { type: "object", properties: { period: { type: "string", enum: ["today", "weekly", "monthly"] } } } },
  { name: "get_security_report", description: "Get unacknowledged security alerts and failed logins today", input_schema: { type: "object", properties: {} } },
  { name: "get_error_report", description: "Get error counts (today and total)", input_schema: { type: "object", properties: {} } },
  { name: "get_uptime_report", description: "Get server/system uptime percentage", input_schema: { type: "object", properties: {} } },
  { name: "get_feature_popularity", description: "Get feature usage ranking, most/least used", input_schema: { type: "object", properties: {} } },
  { name: "get_learning_engagement", description: "Get learning platform engagement (completions, active students)", input_schema: { type: "object", properties: {} } },
  { name: "generate_report", description: "Generate a full daily/weekly/monthly platform report", input_schema: { type: "object", properties: { period: { type: "string", enum: ["daily", "weekly", "monthly"] } }, required: ["period"] } },
  { name: "predict_growth", description: "Predict user growth for the next 30 days", input_schema: { type: "object", properties: {} } },
];

const TOOL_IMPLEMENTATIONS = {
  get_user_statistics: () => platform.getUserStatistics(),
  get_active_users_online: () => platform.getActiveUsersOnline(),
  get_user_growth_report: (input) => platform.getUserGrowthReport(input?.days || 30),
  get_ai_usage_report: () => aiOps.getAiUsageReport(),
  get_token_usage_report: () => aiOps.getTokenUsageReport(),
  get_model_usage_report: () => aiOps.getModelUsageReport(),
  get_subscription_stats: () => billing.getSubscriptionStats(),
  get_revenue_report: (input) => billing.getRevenueReport(input?.period || "today"),
  get_security_report: () => security.getSecurityReport(),
  get_error_report: () => health.getErrorReport(),
  get_uptime_report: () => health.getUptimeReport(),
  get_feature_popularity: () => analytics.getFeaturePopularity(),
  get_learning_engagement: () => learning.getLearningEngagementReport(),
  generate_report: (input) => reportService.generateReport(input?.period || "daily"),
  predict_growth: () => analytics.predictGrowth(),
};

/**
 * Runs a full tool-use turn: sends the admin's message + tool definitions to
 * your LLM, executes whichever tool(s) it picks, sends the results back for
 * a final natural-language answer.
 */
async function askAssistant(adminId, message, callLLM) {
  if (typeof callLLM !== "function") {
    // Built-in intelligent fallback engine when LLM wrapper function is omitted
    const queryLower = (message || "").toLowerCase();
    let data;
    let title = "";

    if (queryLower.includes("user") || queryLower.includes("ইউজার") || queryLower.includes("ব্যবহারকারী")) {
      data = await TOOL_IMPLEMENTATIONS.get_user_statistics();
      title = "📊 User Statistics Summary";
    } else if (queryLower.includes("revenue") || queryLower.includes("income") || queryLower.includes("টাকা") || queryLower.includes("আয়")) {
      data = await TOOL_IMPLEMENTATIONS.get_revenue_report({ period: "today" });
      title = "💰 Revenue Report";
    } else if (queryLower.includes("ai") || queryLower.includes("token") || queryLower.includes("model")) {
      data = await TOOL_IMPLEMENTATIONS.get_ai_usage_report();
      title = "🤖 AI System Operations";
    } else if (queryLower.includes("security") || queryLower.includes("alert") || queryLower.includes("নিরাপত্তা")) {
      data = await TOOL_IMPLEMENTATIONS.get_security_report();
      title = "🛡️ Security Operations Center";
    } else if (queryLower.includes("report") || queryLower.includes("রিপোর্ট")) {
      data = await TOOL_IMPLEMENTATIONS.generate_report({ period: "daily" });
      title = "📈 Daily Platform Performance Report";
    } else {
      data = await TOOL_IMPLEMENTATIONS.get_user_statistics();
      title = "📊 JOXIQ System Overview";
    }

    await logAdminAction(adminId, "ai_assistant_query", { message });
    return {
      text: `${title}\n\n${JSON.stringify(data, null, 2)}`
    };
  }

  const systemPrompt = "You are the JOXIQ AI platform's admin assistant. Use the provided tools to answer questions " +
    "with real data. If a tool returns { available: false }, tell the admin the data isn't available yet — never " +
    "invent numbers. Answer in the same language the admin used (English or Bangla).";

  const messages = [{ role: "user", content: message }];
  let response = await callLLM({ system: systemPrompt, messages, tools: TOOLS });

  while (response && response.stop_reason === "tool_use") {
    const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
    const toolResults = [];
    for (const block of toolUseBlocks) {
      const impl = TOOL_IMPLEMENTATIONS[block.name];
      const result = impl ? await impl(block.input || {}) : { available: false, reason: `Unknown tool: ${block.name}` };
      toolResults.push({ type: "tool_result", tool_use_id: block.id, content: JSON.stringify(result) });
    }
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
    response = await callLLM({ system: systemPrompt, messages, tools: TOOLS });
  }

  const finalText = response?.content ? response.content.filter((b) => b.type === "text").map((b) => b.text).join("\n") : "I processed your request using system tools.";
  await logAdminAction(adminId, "ai_assistant_query", { message });
  return { text: finalText };
}

module.exports = { askAssistant, TOOLS, TOOL_IMPLEMENTATIONS };
