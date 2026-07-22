/**
 * AI Decision Engine for JOXIQ AI
 * 
 * Analyzes incoming request details:
 * 1. Request Type (Image, PDF/Document, Coding, Research, Simple Text, AI Tutor)
 * 2. Complexity Level (Easy, Medium, Hard)
 * 3. Token Cost & Plan Tier Rules (Free, Premium, Pro)
 */

import {
  ChatMessage,
  ChatOptions,
  RequestCategory,
  ComplexityLevel,
  UserPlanTier,
  RouteDecision,
  PlanLimits,
} from "./types.js";

// Plan Limits Configuration
export const PLAN_LIMITS: Record<UserPlanTier, PlanLimits> = {
  free: {
    tier: "free",
    dailyTokenLimit: 50000,
    maxOutputTokens: 800,
    pdfAnalysisAllowed: true, // Auto-fallback if key missing
    advancedReasoningAllowed: false,
    customSystemInstructionsAllowed: true,
  },
  premium: {
    tier: "premium",
    dailyTokenLimit: 250000,
    maxOutputTokens: 2048,
    pdfAnalysisAllowed: true,
    advancedReasoningAllowed: true,
    customSystemInstructionsAllowed: true,
  },
  pro: {
    tier: "pro",
    dailyTokenLimit: 1000000,
    maxOutputTokens: 4096,
    pdfAnalysisAllowed: true,
    advancedReasoningAllowed: true,
    customSystemInstructionsAllowed: true,
  },
};

// Model Cost per 1K Tokens (In USD) for Cost-Optimal Routing
export const MODEL_COSTS: Record<string, number> = {
  "gpt-5-mini": 0.00015,
  "gpt-4o-mini": 0.00015,
  "gpt-4o": 0.0025,
  "gemini-2.5-flash": 0.000075,
  "gemini-2.0-flash": 0.000075,
  "gemini-1.5-pro": 0.00125,
  "claude-3-haiku-20240307": 0.00025,
  "claude-3-5-sonnet-20241022": 0.003,
};

export class AIDecisionEngine {
  /**
   * Analyzes request complexity based on length, code blocks, math symbols, and vocabulary
   */
  public analyzeComplexity(messages: ChatMessage[]): ComplexityLevel {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const text = (lastUserMsg?.content || "").trim();

    const codeBlockCount = (text.match(/```/g) || []).length / 2;
    const isLongText = text.length > 1200;
    const mathSymbols = (text.match(/[\$\\\{\}\^_\+\=\/]/g) || []).length;
    const complexKeywords = [
      "architecture", "algorithm", "refactor", "proof", "derivation",
      "optimize", "distributed", "concurrency", "security vulnerability",
      "data structure", "async", "typescript interface", "system design"
    ];

    const hasComplexKeyword = complexKeywords.some((kw) => text.toLowerCase().includes(kw));

    if (codeBlockCount >= 2 || (isLongText && hasComplexKeyword) || mathSymbols > 15) {
      return "hard";
    }

    if (codeBlockCount === 1 || isLongText || hasComplexKeyword || mathSymbols > 5) {
      return "medium";
    }

    return "easy";
  }

  /**
   * Identifies granular request category
   */
  public analyzeRequestType(messages: ChatMessage[]): RequestCategory {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const text = (lastUserMsg?.content || "").toLowerCase();

    // 1. Image Multimodal Input
    const hasImage = messages.some(
      (m) => m.image?.data || (m.content && m.content.toLowerCase().includes("[attached image"))
    );
    if (hasImage) return "image_multimodal";

    // 2. PDF / Document Input
    const hasDocument = messages.some(
      (m) =>
        m.document ||
        (m.content && m.content.toLowerCase().includes("=== document content start ==="))
    );
    if (hasDocument || text.includes("pdf") || text.includes("document")) return "document_pdf";

    // 3. Coding Task
    if (
      text.includes("```") ||
      text.includes("code") ||
      text.includes("function") ||
      text.includes("bug") ||
      text.includes("script") ||
      text.includes("api") ||
      text.includes("html") ||
      text.includes("css") ||
      text.includes("react")
    ) {
      return "simple_coding";
    }

    // 4. Research / Long Summarization
    if (
      text.length > 2000 ||
      text.includes("summarize") ||
      text.includes("research paper") ||
      text.includes("report") ||
      text.includes("business plan")
    ) {
      return "research_paper";
    }

    // 5. AI Tutor
    if (
      text.includes("explain") ||
      text.includes("teach me") ||
      text.includes("grammar") ||
      text.includes("translate") ||
      text.includes("math") ||
      text.includes("how to solve")
    ) {
      return "ai_tutor";
    }

    return "simple_text";
  }

  /**
   * Evaluates decision rules and selects cost-optimal model and provider
   */
  public evaluateDecision(
    messages: ChatMessage[],
    options?: ChatOptions
  ): {
    providerId: "gemini" | "openai" | "claude";
    model: string;
    reason: string;
    taskCategory: RequestCategory;
    complexity: ComplexityLevel;
    userTier: UserPlanTier;
    estimatedCostPer1k: number;
    maxOutputTokens: number;
  } {
    const userTier: UserPlanTier = options?.userTier || "free";
    const limits = PLAN_LIMITS[userTier] || PLAN_LIMITS.free;
    const category = this.analyzeRequestType(messages);
    const complexity = this.analyzeComplexity(messages);

    let providerId: "gemini" | "openai" | "claude" = "openai";
    let model = "gpt-5-mini";
    let reason = "Simple text question routed to cost-optimal GPT-5 mini.";

    switch (category) {
      case "image_multimodal":
        providerId = "gemini";
        model = userTier === "pro" ? "gemini-1.5-pro" : "gemini-2.5-flash";
        reason = "Image input detected. Gemini Flash selected for ultra-fast visual understanding.";
        break;

      case "document_pdf":
      case "research_paper":
        providerId = "claude";
        model = userTier === "pro" ? "claude-3-5-sonnet-20241022" : "claude-3-haiku-20240307";
        reason = "PDF/Document uploaded. Claude Haiku selected for high-precision text analysis.";
        break;

      case "simple_coding":
        if (complexity === "hard" && (userTier === "premium" || userTier === "pro")) {
          providerId = "openai";
          model = "gpt-4o";
          reason = "Advanced coding or complex reasoning task. GPT-4o selected for high intelligence.";
        } else {
          providerId = "openai";
          model = "gpt-5-mini";
          reason = "Simple coding request. Cost-effective GPT-5 mini selected.";
        }
        break;

      case "ai_tutor":
      case "simple_text":
      default:
        providerId = "openai";
        model = "gpt-5-mini";
        reason = "General question / AI Tutor session. GPT-5 mini selected.";
        break;
    }

    const maxOutputTokens = Math.min(
      options?.maxTokens || limits.maxOutputTokens,
      limits.maxOutputTokens
    );

    const costPer1k = MODEL_COSTS[model] || 0.0001;

    return {
      providerId,
      model,
      reason,
      taskCategory: category,
      complexity,
      userTier,
      estimatedCostPer1k: costPer1k,
      maxOutputTokens,
    };
  }
}

export const aiDecisionEngine = new AIDecisionEngine();
