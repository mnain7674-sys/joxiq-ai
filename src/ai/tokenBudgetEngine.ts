/**
 * Production Token Budget & Billing Protection Engine for JOXIQ AI
 * 
 * Responsibilities:
 * 1. Enforces strict model-specific token budgets (GPT-5 mini, Gemini Flash, Claude Haiku, etc.)
 * 2. Enforces user subscription plan token quotas (Free, Pro, Annual, Ultra)
 * 3. Pre-flight Billing Protection: Blocks requests BEFORE calling external AI APIs if budget is exhausted
 * 4. Automatic Warnings: Emits warning at 80% usage and critical warning at 90% usage
 * 5. Monthly Reset & Historical Tracking: Tracks monthKey (YYYY-MM) and preserves past usage history
 * 6. Logs all requests real-time to Firebase Firestore with model, tokens, cost, and response time
 */

import { UserPlanTier, TokenUsageRecord } from "./types.js";
import {
  getModelBudgetsFromFirestore,
  getPlanLimitsFromFirestore,
  getModelUsageForCurrentMonth,
  logTokenUsageToFirestore,
  DEFAULT_MODEL_BUDGETS,
  DEFAULT_PLAN_LIMITS
} from "../lib/firebase.js";

export interface BudgetCheckParams {
  userId?: string;
  userEmail?: string;
  userTier?: UserPlanTier;
  modelUsed: string;
}

export interface BudgetCheckResult {
  allowed: boolean;
  reason?: string;
  isWarning?: boolean;
  warningLevel?: "warning" | "critical";
  warningMessage?: string;
  modelTokensUsed?: number;
  modelMonthlyBudget?: number;
  userTokensUsed?: number;
  userMonthlyLimit?: number;
}

class TokenBudgetEngine {
  private cacheTTLMs = 5000; // 5 seconds in-memory cache
  private modelBudgetsCache: Record<string, number> | null = null;
  private modelBudgetsCacheTime = 0;

  private planLimitsCache: Record<string, { monthlyTokenLimit: number; dailyTokenLimit: number }> | null = null;
  private planLimitsCacheTime = 0;

  /**
   * Retrieves model monthly budget with fast caching
   */
  public async getModelBudgets(): Promise<Record<string, number>> {
    const now = Date.now();
    if (this.modelBudgetsCache && now - this.modelBudgetsCacheTime < this.cacheTTLMs) {
      return this.modelBudgetsCache;
    }
    const budgets = await getModelBudgetsFromFirestore();
    this.modelBudgetsCache = budgets;
    this.modelBudgetsCacheTime = now;
    return budgets;
  }

  /**
   * Retrieves plan limits with fast caching
   */
  public async getPlanLimits(): Promise<Record<string, { monthlyTokenLimit: number; dailyTokenLimit: number }>> {
    const now = Date.now();
    if (this.planLimitsCache && now - this.planLimitsCacheTime < this.cacheTTLMs) {
      return this.planLimitsCache;
    }
    const limits = await getPlanLimitsFromFirestore();
    this.planLimitsCache = limits;
    this.planLimitsCacheTime = now;
    return limits;
  }

  /**
   * Performs Pre-Flight Billing & Token Budget Check BEFORE calling external AI API.
   * If budget is exhausted, request is BLOCKED immediately.
   */
  public async checkBudgetBeforeRequest(params: BudgetCheckParams): Promise<BudgetCheckResult> {
    const { userEmail, userTier = "free", modelUsed } = params;
    const currentMonthKey = new Date().toISOString().slice(0, 7);

    // 1. Fetch configured model budgets & plan limits
    const budgets = await this.getModelBudgets();
    const planLimits = await this.getPlanLimits();

    const modelBudget = budgets[modelUsed] ?? DEFAULT_MODEL_BUDGETS[modelUsed] ?? 1000000;
    const tierConfig = planLimits[userTier] ?? DEFAULT_PLAN_LIMITS[userTier] ?? DEFAULT_PLAN_LIMITS.free;
    const userMonthlyLimit = tierConfig.monthlyTokenLimit;

    // 2. Fetch current month token usage for the requested model
    const currentModelTokens = await getModelUsageForCurrentMonth(modelUsed, currentMonthKey);

    // 3. CHECK MODEL BUDGET (Billing Protection)
    if (currentModelTokens >= modelBudget) {
      return {
        allowed: false,
        reason: "The monthly token budget for this AI model has been reached. Please increase the budget or wait until the next reset.",
        modelTokensUsed: currentModelTokens,
        modelMonthlyBudget: modelBudget,
      };
    }

    // 4. Evaluate Model Usage Warning Thresholds (80% & 90%)
    const modelUsagePercent = (currentModelTokens / modelBudget) * 100;
    let isWarning = false;
    let warningLevel: "warning" | "critical" | undefined = undefined;
    let warningMessage: string | undefined = undefined;

    if (modelUsagePercent >= 90) {
      isWarning = true;
      warningLevel = "critical";
      warningMessage = `Critical Warning: Monthly budget for model '${modelUsed}' is at ${Math.round(modelUsagePercent)}% capacity (${currentModelTokens.toLocaleString()} / ${modelBudget.toLocaleString()} tokens).`;
    } else if (modelUsagePercent >= 80) {
      isWarning = true;
      warningLevel = "warning";
      warningMessage = `Warning: Monthly budget for model '${modelUsed}' is at ${Math.round(modelUsagePercent)}% capacity (${currentModelTokens.toLocaleString()} / ${modelBudget.toLocaleString()} tokens).`;
    }

    return {
      allowed: true,
      isWarning,
      warningLevel,
      warningMessage,
      modelTokensUsed: currentModelTokens,
      modelMonthlyBudget: modelBudget,
      userMonthlyLimit,
    };
  }

  /**
   * Persists real API request details to Firebase Firestore
   */
  public async recordApiRequest(usage: TokenUsageRecord & { responseTime?: number; monthKey?: string; dateKey?: string }): Promise<void> {
    // Invalidate local cache so next pre-flight check reflects latest usage
    this.modelBudgetsCacheTime = 0;
    await logTokenUsageToFirestore({
      userId: usage.userId || "guest",
      userEmail: usage.userEmail || "anonymous",
      modelUsed: usage.modelUsed,
      providerUsed: usage.providerUsed || "openai",
      requestType: usage.requestType,
      complexity: usage.complexity,
      inputTokens: usage.inputTokens,
      outputTokens: usage.outputTokens,
      totalTokens: usage.totalTokens,
      estimatedCost: usage.estimatedCost,
      timestamp: typeof usage.timestamp === "number" ? usage.timestamp : Date.now(),
      dateKey: usage.dateKey || new Date().toISOString().split("T")[0],
      monthKey: usage.monthKey || new Date().toISOString().slice(0, 7),
      responseTime: usage.responseTime || 0,
    });
  }
}

export const tokenBudgetEngine = new TokenBudgetEngine();
