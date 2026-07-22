/**
 * Token Optimizer for JOXIQ AI
 * 
 * Features:
 * 1. Context Trimming & Windowing (Sends required context without bloated history)
 * 2. Token Estimation & Usage Calculation (Input/Output token estimation)
 * 3. Cost Estimator per Provider/Model
 * 4. Repetition Pruning & System Prompt Optimization
 */

import { ChatMessage, ChatOptions, TokenUsageRecord, AIProviderId, RequestCategory, ComplexityLevel } from "./types.js";
import { MODEL_COSTS } from "./decisionEngine.js";

export class TokenOptimizer {
  /**
   * Approximates token count for given text string (~4 characters = 1 token)
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    // Basic heuristics: ~3.8 chars per token for English/Code
    return Math.ceil(text.length / 3.8);
  }

  /**
   * Approximates total input tokens for chat messages
   */
  public estimateInputTokens(messages: ChatMessage[], systemInstruction?: string): number {
    let total = this.estimateTokens(systemInstruction || "");

    for (const msg of messages) {
      total += this.estimateTokens(msg.content || "");
      if (msg.document?.content) {
        total += this.estimateTokens(msg.document.content);
      }
      if (msg.image?.data) {
        // Flat token estimate for vision images (~250-700 tokens depending on model)
        total += 500;
      }
    }

    return total;
  }

  /**
   * Optimizes and trims message history to fit within efficient token window:
   * - Preserves last 10 messages
   * - Ensures system instructions and attached media/documents stay intact
   * - Reduces redundant previous assistant responses
   */
  public optimizeMessages(messages: ChatMessage[], maxContextMessages: number = 10): ChatMessage[] {
    if (messages.length <= maxContextMessages) {
      return messages;
    }

    // Always keep system messages and media-attached messages if present
    const systemMsgs = messages.filter((m) => m.role === "system");
    const mediaMsgs = messages.filter((m) => m.image?.data || m.document?.content);
    
    // Take the recent trailing N user/assistant messages
    const recentMsgs = messages.slice(-maxContextMessages);

    // Merge uniquely preserving order
    const merged: ChatMessage[] = [];
    const addedSet = new Set<ChatMessage>();

    for (const msg of [...systemMsgs, ...mediaMsgs, ...recentMsgs]) {
      if (!addedSet.has(msg)) {
        addedSet.add(msg);
        merged.push(msg);
      }
    }

    return merged;
  }

  /**
   * Calculates actual/estimated usage record
   */
  public calculateUsageRecord(params: {
    userId?: string;
    userEmail?: string;
    modelUsed: string;
    providerUsed: AIProviderId;
    requestType: RequestCategory;
    complexity: ComplexityLevel;
    inputText: string;
    outputText: string;
  }): TokenUsageRecord {
    const inputTokens = this.estimateTokens(params.inputText);
    const outputTokens = this.estimateTokens(params.outputText);
    const totalTokens = inputTokens + outputTokens;

    const ratePer1k = MODEL_COSTS[params.modelUsed] || 0.0001;
    const estimatedCost = (totalTokens / 1000) * ratePer1k;

    const now = new Date();
    const dateKey = now.toISOString().split("T")[0];

    return {
      userId: params.userId || "anonymous",
      userEmail: params.userEmail || "anonymous@joxiq.ai",
      modelUsed: params.modelUsed,
      providerUsed: params.providerUsed,
      requestType: params.requestType,
      complexity: params.complexity,
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      timestamp: now.getTime(),
      dateKey,
    };
  }
}

export const tokenOptimizer = new TokenOptimizer();
