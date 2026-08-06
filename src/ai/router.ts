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
import { productionTokenEngine } from "./productionTokenEngine.js";
import { checkAndTriggerAiAnomalyAlert } from "../services/aiEmailAlertService.js";
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
    const startTime = Date.now();
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const userQuery = lastUserMsg?.content || "";

    // Step A: Check Smart Cache
    if (userQuery.length > 3) {
      const cacheResult = await productionTokenEngine.lookupCache(userQuery);
      if (cacheResult.hit && cacheResult.response) {
        console.info(`[AIRouter] Smart Cache HIT for query: "${userQuery.slice(0, 30)}..."`);
        const durationMs = Date.now() - startTime;
        const savedTokens = productionTokenEngine.estimateTokens(userQuery) + productionTokenEngine.estimateTokens(cacheResult.response);
        const savedCost = (savedTokens / 1000) * 0.00015;

        // Yield metadata and cached response
        yield {
          providerUsed: "gemini",
          modelUsed: "smart-cache",
          routeInfo: {
            providerId: "gemini",
            model: "smart-cache",
            reason: "Instant response returned from Production Smart Cache Engine",
            taskCategory: "simple_text",
            complexity: "easy",
            userTier: options?.userTier || "free",
            estimatedCostPer1k: 0,
            maxOutputTokens: 1024,
            isFallback: false
          }
        };

        yield { text: cacheResult.response };

        // Log optimization telemetry
        productionTokenEngine.logOptimization({
          userId: options?.userId,
          userEmail: options?.userEmail,
          actionType: "cache_hit",
          queryText: userQuery,
          modelUsed: "smart-cache",
          inputTokens: 0,
          outputTokens: 0,
          tokensSaved: savedTokens,
          estimatedCostUSD: 0,
          costSavedUSD: savedCost,
          responseTimeMs: durationMs,
          complexity: "easy"
        }).catch(e => console.error("Cache log error:", e));

        yield {
          tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 },
          isDone: true
        };
        return;
      }

      // Step B: Check Knowledge Base
      const kbResult = await productionTokenEngine.searchKnowledgeBase(userQuery);
      if (kbResult.match && kbResult.content) {
        console.info(`[AIRouter] Knowledge Base MATCH (Confidence: ${kbResult.confidenceScore})`);
        const durationMs = Date.now() - startTime;
        const savedTokens = productionTokenEngine.estimateTokens(userQuery) + productionTokenEngine.estimateTokens(kbResult.content);
        const savedCost = (savedTokens / 1000) * 0.00015;

        yield {
          providerUsed: "gemini",
          modelUsed: "knowledge-base",
          routeInfo: {
            providerId: "gemini",
            model: "knowledge-base",
            reason: `Answer retrieved from Verified Knowledge Base (Confidence: ${Math.round((kbResult.confidenceScore || 0.8) * 100)}%)`,
            taskCategory: "simple_text",
            complexity: "easy",
            userTier: options?.userTier || "free",
            estimatedCostPer1k: 0,
            maxOutputTokens: 1024,
            isFallback: false
          }
        };

        yield { text: kbResult.content };

        // Automatically store in Smart Cache for future fast hits
        productionTokenEngine.saveToCache(userQuery, kbResult.content, "simple_text").catch(e => console.error("Cache write error:", e));

        productionTokenEngine.logOptimization({
          userId: options?.userId,
          userEmail: options?.userEmail,
          actionType: "knowledge_hit",
          queryText: userQuery,
          modelUsed: "knowledge-base",
          inputTokens: 0,
          outputTokens: 0,
          tokensSaved: savedTokens,
          estimatedCostUSD: 0,
          costSavedUSD: savedCost,
          responseTimeMs: durationMs,
          complexity: "easy"
        }).catch(e => console.error("Knowledge log error:", e));

        yield {
          tokenUsage: { inputTokens: 0, outputTokens: 0, totalTokens: 0, estimatedCost: 0 },
          isDone: true
        };
        return;
      }
    }

    // Step C: Conversation History Optimization & Summarization
    const compressedMessages = await productionTokenEngine.compressConversation(messages);
    const windowMessages = tokenOptimizer.optimizeMessages(compressedMessages, 10);

    // Step D: Compress prompt fluff
    const optimizedMessages = windowMessages.map((msg, index) => {
      if (index === windowMessages.length - 1 && msg.role === "user" && msg.content) {
        const compressed = costOptimizationAgent.optimizePrompt(msg.content);
        if (compressed.savedTokens > 0) {
          console.info(`[Cost Optimization Agent] Compressed prompt: saved ${compressed.savedTokens} tokens`);
          return { ...msg, content: compressed.optimizedText };
        }
      }
      return msg;
    });

    const { provider, modelToUse, routeDecision } = this.selectProvider(optimizedMessages, options);

    console.info(`[Smart AIRouter] Selected ${provider.displayName} (${modelToUse}). Category: ${routeDecision.taskCategory}`);

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

    try {
      for await (const chunk of provider.generateStream(optimizedMessages, effectiveOptions)) {
        if (chunk.text) {
          fullGeneratedText += chunk.text;
        }
        yield chunk;
      }

      const durationMs = Date.now() - startTime;
      checkAndTriggerAiAnomalyAlert({
        latencyMs: durationMs,
        model: modelToUse
      }).catch(err => console.error("Anomaly check error:", err));
    } catch (err: any) {
      checkAndTriggerAiAnomalyAlert({
        error: err.message || String(err),
        model: modelToUse
      }).catch(e => console.error("Anomaly error alert check error:", e));
      throw err;
    }

    // Calculate Token Usage & Cost
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

    // Save to Smart Cache if applicable
    if (userQuery.length > 5 && fullGeneratedText.length > 15 && routeDecision.taskCategory !== "image_multimodal") {
      productionTokenEngine.saveToCache(userQuery, fullGeneratedText, routeDecision.taskCategory).catch(e => console.error("Cache save error:", e));
    }

    // Log optimization metrics to Firestore
    productionTokenEngine.logOptimization({
      userId: options?.userId,
      userEmail: options?.userEmail,
      actionType: "llm_call",
      queryText: userQuery,
      modelUsed: modelToUse,
      inputTokens: tokenUsage.inputTokens,
      outputTokens: tokenUsage.outputTokens,
      tokensSaved: 0,
      estimatedCostUSD: tokenUsage.estimatedCost,
      costSavedUSD: 0,
      responseTimeMs: Date.now() - startTime,
      complexity: routeDecision.complexity
    }).catch(e => console.error("Optimization log error:", e));

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
    const startTime = Date.now();
    const lastUserMsg = [...messages].reverse().find(m => m.role === "user");
    const userQuery = lastUserMsg?.content || "";

    if (userQuery.length > 3) {
      const cacheResult = await productionTokenEngine.lookupCache(userQuery);
      if (cacheResult.hit && cacheResult.response) {
        return cacheResult.response;
      }
      const kbResult = await productionTokenEngine.searchKnowledgeBase(userQuery);
      if (kbResult.match && kbResult.content) {
        return kbResult.content;
      }
    }

    const compressed = await productionTokenEngine.compressConversation(messages);
    const optimizedMessages = tokenOptimizer.optimizeMessages(compressed, 10);
    const { provider, modelToUse, routeDecision } = this.selectProvider(optimizedMessages, options);

    const effectiveOptions: ChatOptions = {
      ...options,
      model: modelToUse,
      maxTokens: routeDecision.maxOutputTokens,
    };

    try {
      const res = await provider.generateContent(optimizedMessages, effectiveOptions);
      const durationMs = Date.now() - startTime;
      checkAndTriggerAiAnomalyAlert({
        latencyMs: durationMs,
        model: modelToUse
      }).catch(err => console.error("Anomaly check error:", err));

      if (userQuery.length > 5 && res.length > 15) {
        productionTokenEngine.saveToCache(userQuery, res, routeDecision.taskCategory).catch(e => console.error("Cache save error:", e));
      }
      return res;
    } catch (err: any) {
      checkAndTriggerAiAnomalyAlert({
        error: err.message || String(err),
        model: modelToUse
      }).catch(e => console.error("Anomaly error alert check error:", e));
      throw err;
    }
  }
}

// Global Singleton Instance
export const aiRouter = new AIRouter();
