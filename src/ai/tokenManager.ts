/**
 * Token Management & Cost Protection Engine for JOXIQ AI
 * 
 * Responsibilities:
 * 1. Track every user's monthly input/output token consumption and estimated API cost
 * 2. Enforce plan quotas (Free: 100k, Pro: 1.5M, Annual: 1.5M, Ultra: 6M)
 * 3. Provide early warning alerts (>80% quota consumed)
 * 4. Automatically block excessive usage to protect company against API loss
 * 5. Log detailed usage records into Firestore
 */

import { UserPlanTier, TokenUsageRecord } from "./types.js";
import { SUBSCRIPTION_PLANS, SubscriptionPlanId } from "../config/subscriptionPlans.js";
import { logTokenUsageToFirestore } from "../lib/firebase.js";

export interface QuotaStatus {
  planTier: UserPlanTier;
  monthlyTokenLimit: number;
  tokensUsed: number;
  tokensRemaining: number;
  percentageUsed: number;
  isLimitReached: boolean;
  isWarningThreshold: boolean;
  warningMessage?: string;
  upgradeRecommendation?: string;
}

export class TokenManager {
  /**
   * Retrieves current monthly token quota status for a given user
   */
  public getQuotaStatus(
    planTier: UserPlanTier,
    tokensUsedCurrentMonth: number
  ): QuotaStatus {
    const planKey = (planTier in SUBSCRIPTION_PLANS ? planTier : "free") as SubscriptionPlanId;
    const plan = SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.free;

    const monthlyTokenLimit = plan.monthlyTokenLimit;
    const tokensUsed = Math.max(0, tokensUsedCurrentMonth);
    const tokensRemaining = Math.max(0, monthlyTokenLimit - tokensUsed);
    const percentageUsed = Math.min(100, Math.round((tokensUsed / monthlyTokenLimit) * 100));

    const isLimitReached = tokensUsed >= monthlyTokenLimit;
    const isWarningThreshold = percentageUsed >= 80 && !isLimitReached;

    let warningMessage: string | undefined = undefined;
    let upgradeRecommendation: string | undefined = undefined;

    if (isLimitReached) {
      warningMessage = `Monthly token quota exhausted (${tokensUsed.toLocaleString()} / ${monthlyTokenLimit.toLocaleString()} tokens used). Please upgrade your subscription plan to continue asking questions.`;
      upgradeRecommendation = planTier === "free" ? "pro" : planTier === "pro" || planTier === "annual" ? "ultra" : undefined;
    } else if (isWarningThreshold) {
      warningMessage = `Warning: You have used ${percentageUsed}% of your monthly token limit (${tokensUsed.toLocaleString()} / ${monthlyTokenLimit.toLocaleString()} tokens). Upgrade to avoid interruption.`;
      upgradeRecommendation = planTier === "free" ? "pro" : "ultra";
    }

    return {
      planTier,
      monthlyTokenLimit,
      tokensUsed,
      tokensRemaining,
      percentageUsed,
      isLimitReached,
      isWarningThreshold,
      warningMessage,
      upgradeRecommendation,
    };
  }

  /**
   * Evaluates whether a user is permitted to send a new AI request
   */
  public validateRequestQuota(
    planTier: UserPlanTier,
    tokensUsedCurrentMonth: number
  ): { allowed: boolean; errorReason?: string; upgradeTarget?: string } {
    const status = this.getQuotaStatus(planTier, tokensUsedCurrentMonth);

    if (status.isLimitReached) {
      return {
        allowed: false,
        errorReason: status.warningMessage,
        upgradeTarget: status.upgradeRecommendation,
      };
    }

    return { allowed: true };
  }

  /**
   * Persists token usage record to Firestore and updates user aggregate state
   */
  public async logUsage(usage: TokenUsageRecord): Promise<void> {
    try {
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
      });
    } catch (err) {
      console.error("[TokenManager] Failed to log usage record to Firestore:", err);
    }
  }
}

export const tokenManager = new TokenManager();
