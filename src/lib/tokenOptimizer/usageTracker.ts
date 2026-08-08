import { estimateTokens } from "./tokenOptimizerCore.js";

/**
 * #16 Track where tokens are being used — breaks a request down by
 * component so you can see exactly what's expensive (usually chat history).
 */
export function buildTokenBreakdown({
  systemPrompt,
  chatHistorySummary,
  recentMessages,
  ragChunks,
  userMessage,
  outputText,
}: {
  systemPrompt?: string;
  chatHistorySummary?: string;
  recentMessages?: any[];
  ragChunks?: any[];
  userMessage?: string;
  outputText?: string;
}) {
  const breakdown: any = {
    systemPrompt: estimateTokens(systemPrompt || ""),
    chatHistorySummary: estimateTokens(chatHistorySummary || ""),
    recentMessages: estimateTokens((recentMessages || []).map((m) => m.content || m.text || "").join(" ")),
    ragChunks: estimateTokens((ragChunks || []).map((c) => c.text || c.content || "").join(" ")),
    userMessage: estimateTokens(userMessage || ""),
    output: estimateTokens(outputText || ""),
  };
  breakdown.totalInput =
    breakdown.systemPrompt +
    breakdown.chatHistorySummary +
    breakdown.recentMessages +
    breakdown.ragChunks +
    breakdown.userMessage;
  breakdown.totalOutput = breakdown.output;
  breakdown.total = breakdown.totalInput + breakdown.totalOutput;

  // Flags the single biggest contributor — usually chat history, per the guide.
  const inputParts: Record<string, number> = {
    systemPrompt: breakdown.systemPrompt,
    chatHistorySummary: breakdown.chatHistorySummary,
    recentMessages: breakdown.recentMessages,
    ragChunks: breakdown.ragChunks,
  };
  breakdown.biggestContributor = Object.entries(inputParts).sort((a, b) => b[1] - a[1])[0][0];

  return breakdown;
}

/** In-memory usage log. Swap for your real token_usage database table in production. */
const usageLog: any[] = [];

export function recordUsage(userId: string, breakdown: any, model: string) {
  usageLog.push({ userId, model, ...breakdown, timestamp: new Date().toISOString() });
  if (usageLog.length > 10000) usageLog.shift();
}

export function getUsageStats(userId?: string) {
  const entries = userId ? usageLog.filter((e) => e.userId === userId) : usageLog;
  if (!entries.length) return { available: false, reason: "No usage recorded yet" };
  const avgBreakdown: Record<string, number> = {};
  ["systemPrompt", "chatHistorySummary", "recentMessages", "ragChunks", "userMessage", "output"].forEach((key) => {
    avgBreakdown[key] = Math.round(entries.reduce((s, e) => s + (e[key] || 0), 0) / entries.length);
  });
  return {
    available: true,
    requestCount: entries.length,
    avgBreakdown,
    totalTokensUsed: entries.reduce((s, e) => s + (e.total || 0), 0),
  };
}
