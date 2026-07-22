/**
 * Intelligent Smart AI Router for JOXIQ AI
 * 
 * Features:
 * 1. Automatic Request Classification (Image -> Gemini, Document/PDF -> Claude, General/Tutor/Coding -> GPT-5)
 * 2. Provider Availability Checks & Graceful Fallback (Falls back to Gemini if OpenAI/Claude keys are missing)
 * 3. User Tier Support (Free vs Premium model selection)
 * 4. Modular & Extensible (Easy to add future AI models like DeepSeek, Mistral, Llama)
 * 
 * =========================================================================
 * HOW TO ADD FUTURE AI PROVIDERS:
 * 1. Create a new provider file in `src/ai/your_provider.ts` implementing `IAIProvider`
 * 2. Add environment variable getter in `src/config/env.ts`
 * 3. Register the provider in constructor: `this.registerProvider(new YourProvider())`
 * 4. Update classification rules in `classifyRequest()` if needed.
 * =========================================================================
 */

import { GeminiProvider } from "./gemini.js";
import { OpenAIProvider } from "./openai.js";
import { ClaudeProvider } from "./claude.js";
import { aiDecisionEngine } from "./decisionEngine.js";
import { tokenOptimizer } from "./tokenOptimizer.js";
import { costOptimizationAgent } from "./costOptimizationAgent.js";
import {
  IAIProvider,
  AIProviderId,
  ChatMessage,
  ChatOptions,
  StreamChunk,
  RouteDecision,
  UserPlanTier,
} from "./types.js";

export class AIRouter {
  private providers: Map<AIProviderId, IAIProvider> = new Map();

  constructor() {
    // Register default AI Providers
    this.registerProvider(new GeminiProvider());
    this.registerProvider(new OpenAIProvider());
    this.registerProvider(new ClaudeProvider());
  }

  /**
   * Register an AI Provider module
   */
  public registerProvider(provider: IAIProvider) {
    this.providers.set(provider.id, provider);
  }

  /**
   * Get a registered provider by ID
   */
  public getProvider(id: AIProviderId): IAIProvider | undefined {
    return this.providers.get(id);
  }

  /**
   * Returns list of all registered providers
   */
  public getAllProviders(): IAIProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Evaluates classification using AI Decision Engine and validates API availability with graceful fallback
   */
  public classifyRequest(
    messages: ChatMessage[],
    options?: ChatOptions
  ): RouteDecision {
    const rawDecision = aiDecisionEngine.evaluateDecision(messages, options);
    const targetProvider = this.providers.get(rawDecision.providerId);
    const isAvailable = targetProvider ? targetProvider.isAvailable() : false;

    if (isAvailable) {
      return {
        ...rawDecision,
        isFallback: false,
      };
    } else {
      // Graceful Fallback to Google Gemini Flash
      const fallbackProvider = this.providers.get("gemini")!;
      return {
        providerId: "gemini",
        model: fallbackProvider.defaultModel,
        reason: `${rawDecision.reason} (Falling back to Gemini Flash as ${rawDecision.providerId.toUpperCase()}_API_KEY is not configured)`,
        taskCategory: rawDecision.taskCategory,
        complexity: rawDecision.complexity,
        userTier: rawDecision.userTier,
        estimatedCostPer1k: 0.000075,
        maxOutputTokens: rawDecision.maxOutputTokens,
        isFallback: true,
        fallbackReason: `API key for ${rawDecision.providerId} missing in backend environment variables. Set ${rawDecision.providerId.toUpperCase()}_API_KEY in .env to unlock.`,
      };
    }
  }

  /**
   * Determine the best provider based on explicit requested model/provider or Smart Router classification
   */
  public selectProvider(
    messages: ChatMessage[],
    options?: ChatOptions
  ): {
    provider: IAIProvider;
    modelToUse: string;
    routeDecision: RouteDecision;
  } {
    const explicitModel = options?.model;
    const explicitProvider = options?.provider;

    // If explicit provider or non-default model requested, honor explicit request
    if (explicitProvider && this.providers.has(explicitProvider)) {
      const p = this.providers.get(explicitProvider)!;
      if (p.isAvailable()) {
        const decision: RouteDecision = {
          providerId: p.id,
          model: explicitModel || p.defaultModel,
          reason: `Explicitly requested provider '${explicitProvider}'.`,
          taskCategory: "simple_text",
          complexity: "easy",
          userTier: options?.userTier || "free",
          estimatedCostPer1k: 0.0001,
          maxOutputTokens: options?.maxTokens || 1024,
          isFallback: false,
        };
        return { provider: p, modelToUse: decision.model, routeDecision: decision };
      }
    }

    if (explicitModel && explicitModel.trim() !== "") {
      const rawModel = explicitModel.toLowerCase();
      let targetId: AIProviderId = "gemini";
      if (rawModel.includes("gpt") || rawModel.includes("openai")) targetId = "openai";
      else if (rawModel.includes("claude") || rawModel.includes("haiku")) targetId = "claude";

      const p = this.providers.get(targetId);
      if (p && p.isAvailable()) {
        const decision: RouteDecision = {
          providerId: p.id,
          model: explicitModel,
          reason: `Explicitly requested model '${explicitModel}'.`,
          taskCategory: "simple_text",
          complexity: "easy",
          userTier: options?.userTier || "free",
          estimatedCostPer1k: 0.0001,
          maxOutputTokens: options?.maxTokens || 1024,
          isFallback: false,
        };
        return { provider: p, modelToUse: explicitModel, routeDecision: decision };
      }
    }

    // Otherwise, execute Decision Engine classification algorithm
    const decision = this.classifyRequest(messages, options);
    const chosenProvider = this.providers.get(decision.providerId) || this.providers.get("gemini")!;

    return {
      provider: chosenProvider,
      modelToUse: decision.model,
      routeDecision: decision,
    };
  }

  /**
   * Routes streaming chat request through Decision Engine & Token Optimizer
   */
  async *routeStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    // 1. Optimize input messages context window
    const windowMessages = tokenOptimizer.optimizeMessages(messages, 10);

    // 2. Automatically compress last user prompt via Cost Optimization Agent to eliminate token fluff
    const optimizedMessages = windowMessages.map((msg, index) => {
      if (index === windowMessages.length - 1 && msg.role === "user" && msg.content) {
        const compressed = costOptimizationAgent.optimizePrompt(msg.content);
        if (compressed.savedTokens > 0) {
          console.info(`[Cost Optimization Agent] Compressed user prompt: saved ${compressed.savedTokens} tokens (${compressed.savingsPercentage}%)`);
          return {
            ...msg,
            content: compressed.optimizedText,
          };
        }
      }
      return msg;
    });

    const { provider, modelToUse, routeDecision } = this.selectProvider(optimizedMessages, options);

    console.info(`[Smart AIRouter] Selected ${provider.displayName} (${modelToUse}). Category: ${routeDecision.taskCategory}. Reason: ${routeDecision.reason}`);

    // Yield initial metadata chunk with route decision
    yield {
      providerUsed: provider.id,
      modelUsed: modelToUse,
      routeInfo: routeDecision,
    };

    const effectiveOptions: ChatOptions = {
      ...options,
      model: modelToUse,
      maxTokens: routeDecision.maxOutputTokens,
    };

    let fullGeneratedText = "";

    for await (const chunk of provider.generateStream(optimizedMessages, effectiveOptions)) {
      if (chunk.text) {
        fullGeneratedText += chunk.text;
      }
      yield chunk;
    }

    // Calculate final Token Usage Record for tracking
    const inputText = optimizedMessages.map((m) => m.content + (m.document?.content || "")).join(" ");
    const tokenUsage = tokenOptimizer.calculateUsageRecord({
      userId: options?.userId,
      userEmail: options?.userEmail,
      modelUsed: modelToUse,
      providerUsed: provider.id,
      requestType: routeDecision.taskCategory,
      complexity: routeDecision.complexity,
      inputText,
      outputText: fullGeneratedText,
    });

    yield {
      tokenUsage: {
        inputTokens: tokenUsage.inputTokens,
        outputTokens: tokenUsage.outputTokens,
        totalTokens: tokenUsage.totalTokens,
        estimatedCost: tokenUsage.estimatedCost,
      },
      isDone: true,
    };
  }

  /**
   * Routes non-streaming chat request through Decision Engine & Token Optimizer
   */
  async routeGenerate(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const optimizedMessages = tokenOptimizer.optimizeMessages(messages, 10);
    const { provider, modelToUse, routeDecision } = this.selectProvider(optimizedMessages, options);

    const effectiveOptions: ChatOptions = {
      ...options,
      model: modelToUse,
      maxTokens: routeDecision.maxOutputTokens,
    };

    return await provider.generateContent(optimizedMessages, effectiveOptions);
  }
}

// Global Singleton Instance
export const aiRouter = new AIRouter();
