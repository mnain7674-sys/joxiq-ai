import * as core from "./tokenOptimizerCore.js";
import * as historyOpt from "./chatHistoryOptimizer.js";
import * as ragOpt from "./ragOptimizer.js";
import * as usageTracker from "./usageTracker.js";

const summaryCache = historyOpt.createSummaryCache();

export interface AskOptimizedParams {
  userId?: string;
  conversationId?: string;
  userMessage: string;
  chatHistory?: any[];
  ragChunks?: any[];
  memoryFacts?: string[];
  lengthPreset?: "short" | "balanced" | "detailed";
  callModel: (params: {
    systemPrompt: string;
    context: string;
    recentMessages: any[];
    userMessage: string;
    model: string;
    provider?: string;
    maxOutputTokens: number;
  }) => Promise<string>;
  summarizeFn?: (text: string) => Promise<string>;
}

/**
 * The main entry point — implements the guide's #17 processing flow:
 *   1. Read the user's question
 *   2. Decide task difficulty
 *   3. Choose the cheapest suitable model
 *   4. Add only relevant chat history / memory / RAG
 *   5. Set an output limit that matches the task
 *   6. Ask for a direct answer
 *   7. Track token usage
 *
 * Call this instead of calling your Gemini/Claude/ChatGPT API directly.
 */
export async function askOptimized({
  userId,
  conversationId = "default",
  userMessage,
  chatHistory = [],
  ragChunks = [],
  memoryFacts = [],
  lengthPreset = "balanced",
  callModel,
  summarizeFn,
}: AskOptimizedParams) {
  if (typeof callModel !== "function") {
    throw new Error("Pass callModel({ systemPrompt, context, recentMessages, userMessage, model, maxOutputTokens }) wrapping your AI provider call");
  }

  // Step 2: classify difficulty
  const complexity = core.classifyComplexity(userMessage);

  // Step 3: pick the cheapest model that can do the job
  const model = core.selectModel(complexity);

  // Step 4a: trim chat history to recent messages + summarize the rest
  const { recent, older } = historyOpt.trimChatHistory(chatHistory, 6);
  const chatHistorySummary = older.length && summarizeFn
    ? await historyOpt.getOrUpdateSummary(conversationId, older, summarizeFn, summaryCache)
    : "";

  // Step 4b: select only the best RAG chunks, if any were provided
  const ragResult = ragChunks.length ? ragOpt.selectBestChunks(ragChunks, { topN: 3 }) : { selected: [] };

  // Step 4c: compact memory
  const memoryLine = historyOpt.formatMemoryForPrompt(memoryFacts);

  // Step 5: output limit matched to complexity + user's length preference
  const baseLimit = core.getOutputLimit(complexity);
  const { instruction: lengthInstruction, outputLimit } = core.applyLengthPreset(baseLimit, lengthPreset);

  // Step 6: assemble a lean, non-duplicated prompt
  const formatHint = core.suggestFormatHint(userMessage);
  const systemPrompt = [core.SYSTEM_PROMPT, lengthInstruction, formatHint].filter(Boolean).join(" ");

  const contextParts = [
    chatHistorySummary && `Earlier context: ${chatHistorySummary}`,
    memoryLine,
    ragResult.selected.length && `Relevant reference material:\n${ragResult.selected.map((c: any) => c.text || c.content || "").join("\n---\n")}`,
  ].filter(Boolean);

  const duplicateIndexes = historyOpt.detectDuplicateContent([systemPrompt, ...contextParts]);
  if (duplicateIndexes.length) console.warn("Duplicate content detected in prompt parts:", duplicateIndexes);

  // Call the model with everything trimmed down
  const outputText = await callModel({
    systemPrompt,
    context: contextParts.join("\n\n"),
    recentMessages: recent,
    userMessage,
    model: model.model,
    provider: model.provider,
    maxOutputTokens: outputLimit,
  });

  // Step 7: track usage
  const breakdown = usageTracker.buildTokenBreakdown({
    systemPrompt,
    chatHistorySummary,
    recentMessages: recent,
    ragChunks: ragResult.selected,
    userMessage,
    outputText,
  });
  usageTracker.recordUsage(userId || "anonymous", breakdown, model.model);

  return { text: outputText, complexity, modelUsed: model, tokenBreakdown: breakdown };
}

export const getUsageStats = usageTracker.getUsageStats;

export default {
  askOptimized,
  getUsageStats,
};
