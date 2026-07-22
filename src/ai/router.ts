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
import {
  IAIProvider,
  AIProviderId,
  ChatMessage,
  ChatOptions,
  StreamChunk,
  RouteDecision,
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
   * Smartly classifies user messages to pick the optimal AI provider and model.
   * 
   * Roles:
   * - Gemini Flash: Image/multimodal input, photo-to-answer, screenshot/diagrams, fast responses
   * - Claude Haiku: PDF analysis, large document processing, long text summarization, reports
   * - GPT-5 mini: General Q&A, AI Tutor, writing, translation, grammar, coding, math
   */
  public classifyRequest(
    messages: ChatMessage[],
    options?: ChatOptions
  ): RouteDecision {
    const isPremium = options?.userTier === "premium";

    // 1. Check for Multimodal Image Content (Photo, screenshot, diagram)
    const hasImage = messages.some(
      (m) =>
        m.image?.data ||
        (m.content && m.content.toLowerCase().includes("[attached image"))
    );

    if (hasImage) {
      const targetModel = isPremium ? "gemini-1.5-pro" : "gemini-2.5-flash";
      const provider = this.providers.get("gemini")!;
      const isAvailable = provider.isAvailable();

      return {
        providerId: "gemini",
        model: targetModel,
        reason: "Image or screenshot input detected. Google Gemini Flash selected for ultra-fast multimodal analysis.",
        taskCategory: "multimodal_image",
        isFallback: !isAvailable,
        fallbackReason: isAvailable ? undefined : "Gemini API key missing.",
      };
    }

    // 2. Check for PDF / Large Document / Long Text Input
    const hasDocument = messages.some(
      (m) =>
        m.document ||
        (m.content && m.content.toLowerCase().includes("=== document content start ===")) ||
        (m.content && m.content.length > 2500)
    );

    const isDocTaskPrompt = messages.some((m) => {
      const text = (m.content || "").toLowerCase();
      return (
        text.includes("pdf") ||
        text.includes("summarize document") ||
        text.includes("research paper") ||
        text.includes("business plan") ||
        text.includes("report analysis")
      );
    });

    if (hasDocument || isDocTaskPrompt) {
      const targetModel = isPremium ? "claude-3-5-sonnet-20241022" : "claude-3-haiku-20240307";
      const claudeProvider = this.providers.get("claude");
      const isAvailable = claudeProvider ? claudeProvider.isAvailable() : false;

      if (isAvailable) {
        return {
          providerId: "claude",
          model: targetModel,
          reason: "Document, PDF, or long-text research detected. Anthropic Claude Haiku selected for high-precision text analysis.",
          taskCategory: "document_pdf",
          isFallback: false,
        };
      } else {
        // Fallback to Gemini for document tasks if Anthropic key is not configured
        const fallbackProvider = this.providers.get("gemini")!;
        return {
          providerId: "gemini",
          model: fallbackProvider.defaultModel,
          reason: "Document processing requested. Falling back to Gemini Flash (ANTHROPIC_API_KEY not configured).",
          taskCategory: "document_pdf",
          isFallback: true,
          fallbackReason: "Anthropic Claude API key missing in environment. Set ANTHROPIC_API_KEY to unlock Claude Haiku.",
        };
      }
    }

    // 3. General AI Conversation, AI Tutor, Coding, Math, Grammar, Writing
    const targetModel = isPremium ? "gpt-4o" : "gpt-5-mini";
    const openaiProvider = this.providers.get("openai");
    const isOpenAIAvailable = openaiProvider ? openaiProvider.isAvailable() : false;

    if (isOpenAIAvailable) {
      return {
        providerId: "openai",
        model: targetModel,
        reason: "General Q&A / AI Tutor / Coding task detected. OpenAI GPT-5 mini selected.",
        taskCategory: "general_tutor",
        isFallback: false,
      };
    } else {
      // Fallback to Gemini Flash if OpenAI key is not configured yet
      const fallbackProvider = this.providers.get("gemini")!;
      return {
        providerId: "gemini",
        model: fallbackProvider.defaultModel,
        reason: "General AI conversation. Routed to Google Gemini Flash (OPENAI_API_KEY not configured).",
        taskCategory: "general_tutor",
        isFallback: true,
        fallbackReason: "OpenAI API key missing in environment. Set OPENAI_API_KEY to unlock GPT-5 mini.",
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
          taskCategory: "general_tutor",
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
          taskCategory: "general_tutor",
          isFallback: false,
        };
        return { provider: p, modelToUse: explicitModel, routeDecision: decision };
      }
    }

    // Otherwise, execute Smart Classification algorithm
    const decision = this.classifyRequest(messages, options);
    const chosenProvider = this.providers.get(decision.providerId) || this.providers.get("gemini")!;

    return {
      provider: chosenProvider,
      modelToUse: decision.model,
      routeDecision: decision,
    };
  }

  /**
   * Routes streaming chat request through Smart AI Router
   */
  async *routeStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const { provider, modelToUse, routeDecision } = this.selectProvider(messages, options);

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
    };

    yield* provider.generateStream(messages, effectiveOptions);
  }

  /**
   * Routes non-streaming chat request through Smart AI Router
   */
  async routeGenerate(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const { provider, modelToUse } = this.selectProvider(messages, options);

    const effectiveOptions: ChatOptions = {
      ...options,
      model: modelToUse,
    };

    return await provider.generateContent(messages, effectiveOptions);
  }
}

// Global Singleton Instance
export const aiRouter = new AIRouter();
