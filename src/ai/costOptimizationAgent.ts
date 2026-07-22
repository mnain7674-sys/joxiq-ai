/**
 * Cost Optimization Agent for JOXIQ AI
 * 
 * Features:
 * 1. Monitor API spending across models and providers
 * 2. Detect unnecessary expensive model usage (e.g. GPT-4o for simple text Q&A)
 * 3. Suggest cheaper, high-performance model alternatives
 * 4. Warn on unusually high token usage spikes / anomalies
 * 5. Automatically optimize prompts to compress input tokens without losing intent
 */

import {
  ChatMessage,
  TokenUsageRecord,
  CostAuditReport,
  CostOptimizationSuggestion,
  CostAnomalyAlert,
  PromptOptimizationResult,
  ComplexityLevel,
  RequestCategory,
} from "./types.js";
import { MODEL_COSTS, aiDecisionEngine } from "./decisionEngine.js";
import { tokenOptimizer } from "./tokenOptimizer.js";

export class CostOptimizationAgent {
  /**
   * Automatically compresses user prompts to eliminate conversational filler and save input tokens.
   */
  public optimizePrompt(rawPrompt: string): PromptOptimizationResult {
    if (!rawPrompt || rawPrompt.trim().length === 0) {
      return {
        originalText: "",
        optimizedText: "",
        originalTokens: 0,
        optimizedTokens: 0,
        savedTokens: 0,
        savingsPercentage: 0,
        removedRedundancies: [],
      };
    }

    const removedRedundancies: string[] = [];
    let text = rawPrompt;

    // Common fluff patterns
    const fillerPatterns: { pattern: RegExp; label: string }[] = [
      { pattern: /^(hello|hi|hey|greetings|dear ai|dear assistant)[\!\,]?\s+/gi, label: "Greeting prefix" },
      { pattern: /\b(could you please|can you please|would you mind|kindly|please be so kind as to)\b/gi, label: "Politeness filler" },
      { pattern: /\b(i was wondering if you could|i would like to ask you to|i am looking for you to)\b/gi, label: "Indirect framing" },
      { pattern: /\b(thank you so much|thanks in advance|i appreciate your help|thank you)\.?$/gi, label: "Closing pleasantry" },
      { pattern: /\b(as an ai language model|as an intelligent assistant)\b/gi, label: "Self-referential prompt padding" },
    ];

    for (const { pattern, label } of fillerPatterns) {
      if (pattern.test(text)) {
        text = text.replace(pattern, " ");
        removedRedundancies.push(label);
      }
    }

    // Collapse multiple blank lines and redundant spaces
    text = text.replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

    const originalTokens = tokenOptimizer.estimateTokens(rawPrompt);
    const optimizedTokens = tokenOptimizer.estimateTokens(text);
    const savedTokens = Math.max(0, originalTokens - optimizedTokens);
    const savingsPercentage = originalTokens > 0 ? Math.round((savedTokens / originalTokens) * 100) : 0;

    return {
      originalText: rawPrompt,
      optimizedText: text,
      originalTokens,
      optimizedTokens,
      savedTokens,
      savingsPercentage,
      removedRedundancies: Array.from(new Set(removedRedundancies)),
    };
  }

  /**
   * Performs pre-flight audit on incoming requests to catch unnecessary expensive model selections.
   */
  public auditPreFlightRequest(
    messages: ChatMessage[],
    requestedModel?: string
  ): {
    shouldDowngrade: boolean;
    recommendedModel: string;
    originalCostPer1k: number;
    recommendedCostPer1k: number;
    costSavingsPercentage: number;
    warningMessage?: string;
  } {
    const complexity = aiDecisionEngine.analyzeComplexity(messages);
    const category = aiDecisionEngine.analyzeRequestType(messages);

    const targetModel = requestedModel || "gpt-5-mini";
    const currentRate = MODEL_COSTS[targetModel] || 0.0001;

    // Check if an expensive model (GPT-4o or Claude 3.5 Sonnet) is requested for easy/medium non-coding tasks
    const isExpensiveModel = targetModel.includes("gpt-4o") || targetModel.includes("sonnet") || targetModel.includes("1.5-pro");
    const isSimpleTask = (complexity === "easy" || complexity === "medium") && (category === "simple_text" || category === "ai_tutor");

    if (isExpensiveModel && isSimpleTask) {
      const recommendedModel = "gpt-5-mini";
      const cheapRate = MODEL_COSTS[recommendedModel] || 0.00015;
      const savings = Math.round(((currentRate - cheapRate) / currentRate) * 100);

      return {
        shouldDowngrade: true,
        recommendedModel,
        originalCostPer1k: currentRate,
        recommendedCostPer1k: cheapRate,
        costSavingsPercentage: savings > 0 ? savings : 90,
        warningMessage: `High-cost model (${targetModel}) selected for low-complexity task (${category}). Switching to ${recommendedModel} can save up to ${savings}% API cost.`,
      };
    }

    return {
      shouldDowngrade: false,
      recommendedModel: targetModel,
      originalCostPer1k: currentRate,
      recommendedCostPer1k: currentRate,
      costSavingsPercentage: 0,
    };
  }

  /**
   * Analyzes historical usage logs from Firestore to detect wasteful spending, model misallocations, and anomalies.
   */
  public analyzeSpendingAndUsage(usageLogs: TokenUsageRecord[]): CostAuditReport {
    let totalSpentUSD = 0;
    let totalTokensProcessed = 0;
    let unnecessaryExpensiveCallsCount = 0;
    let estimatedSavingsPotentialUSD = 0;
    let highTokenAnomalyCount = 0;

    const alerts: CostAnomalyAlert[] = [];
    const recommendations: CostOptimizationSuggestion[] = [];

    // Grouping for velocity
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;
    let past24hSpent = 0;

    for (const log of usageLogs) {
      const logCost = log.estimatedCost || 0;
      const logTokens = log.totalTokens || 0;
      const model = log.modelUsed || "gpt-5-mini";
      const complexity: ComplexityLevel = log.complexity || "easy";
      const category: RequestCategory = log.requestType || "simple_text";

      totalSpentUSD += logCost;
      totalTokensProcessed += logTokens;

      if (log.timestamp && now - Number(log.timestamp) <= oneDayMs) {
        past24hSpent += logCost;
      }

      // 1. Detect Unnecessary Expensive Model Usage
      const isExpensive = model.includes("gpt-4o") || model.includes("sonnet") || model.includes("1.5-pro");
      if (isExpensive && (complexity === "easy" || category === "simple_text")) {
        unnecessaryExpensiveCallsCount++;
        const cheaperRate = MODEL_COSTS["gpt-5-mini"] || 0.00015;
        const cheaperCost = (logTokens / 1000) * cheaperRate;
        estimatedSavingsPotentialUSD += Math.max(0, logCost - cheaperCost);
      }

      // 2. Detect High Token Usage Anomalies (> 3,500 tokens per single call)
      if (logTokens > 3500) {
        highTokenAnomalyCount++;
        alerts.push({
          id: `anomaly-${log.timestamp}-${Math.random().toString(36).substring(2, 7)}`,
          timestamp: Number(log.timestamp) || now,
          userEmail: log.userEmail || "anonymous",
          modelUsed: model,
          tokensConsumed: logTokens,
          costUSD: logCost,
          severity: logTokens > 8000 ? "critical" : "warning",
          message: `Unusually high token spike: ${logTokens.toLocaleString()} tokens consumed in a single request by ${log.userEmail || "user"}.`,
        });
      }
    }

    // Projected Monthly Spending (24h velocity * 30 days or average)
    const projectedMonthlySpentUSD = past24hSpent > 0 ? past24hSpent * 30 : totalSpentUSD * 1.5;

    // 3. Generate Actionable Optimization Recommendations
    if (unnecessaryExpensiveCallsCount > 0) {
      recommendations.push({
        id: "rec-auto-downgrade",
        type: "model_downgrade",
        title: "Enable Automatic Cost-Optimal Model Routing",
        description: `Detected ${unnecessaryExpensiveCallsCount} requests where expensive flagship models were used for basic Q&A. Auto-routing simple tasks to GPT-5 mini or Gemini Flash will cut spending instantly.`,
        suggestedAlternativeModel: "gpt-5-mini",
        estimatedSavingsPercentage: 85,
        impactLevel: "high",
      });
    }

    if (highTokenAnomalyCount > 0) {
      recommendations.push({
        id: "rec-token-trimming",
        type: "prompt_trimming",
        title: "Activate Context Window Pruning & Prompt Compression",
        description: `Identified ${highTokenAnomalyCount} high-token queries. Enforcing context trimming (max 10 recent messages) and filler removal reduces input token overhead by ~25%.`,
        estimatedSavingsPercentage: 25,
        impactLevel: "medium",
      });
    }

    // Default proactive recommendation
    recommendations.push({
      id: "rec-caching",
      type: "caching",
      title: "Semantic Prompt Response Caching",
      description: "Cache identical system instructions and frequent student Q&A responses to eliminate redundant LLM inference calls.",
      estimatedSavingsPercentage: 15,
      impactLevel: "low",
    });

    return {
      totalSpentUSD,
      projectedMonthlySpentUSD,
      totalTokensProcessed,
      unnecessaryExpensiveCallsCount,
      estimatedSavingsPotentialUSD,
      highTokenAnomalyCount,
      recommendations,
      alerts: alerts.slice(0, 10), // Return top 10 recent alerts
    };
  }
}

export const costOptimizationAgent = new CostOptimizationAgent();
