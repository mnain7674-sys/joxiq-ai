/**
 * Unified AI Service Type Definitions for JOXIQ AI
 */

export type AIProviderId = "gemini" | "openai" | "claude";

export type UserPlanTier = "free" | "pro" | "annual" | "ultra" | "premium";

export type RequestCategory = 
  | "simple_text"
  | "ai_tutor"
  | "image_multimodal"
  | "document_pdf"
  | "simple_coding"
  | "complex_reasoning"
  | "research_paper";

export type ComplexityLevel = "easy" | "medium" | "hard";

export interface ChatMessagePart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string; // Base64 encoded string
  };
}

export interface ChatMessageDocument {
  name: string;
  size?: string;
  content: string;
}

export interface ChatMessageImage {
  data: string;
  mimeType: string;
}

export interface ChatMessage {
  role: "user" | "assistant" | "system" | "model";
  content: string;
  image?: ChatMessageImage;
  document?: ChatMessageDocument;
}

export interface ChatOptions {
  model?: string;
  provider?: AIProviderId;
  systemInstruction?: string;
  temperature?: number;
  maxTokens?: number;
  useSearch?: boolean; // Search grounding (Google Search or web search)
  isAutoRoute?: boolean; // Enable automatic AI Model selection based on input task
  userTier?: UserPlanTier; // User subscription plan
  userId?: string;
  userEmail?: string;
}

export interface RouteDecision {
  providerId: AIProviderId;
  model: string;
  reason: string;
  taskCategory: RequestCategory;
  complexity: ComplexityLevel;
  userTier: UserPlanTier;
  estimatedCostPer1k: number; // in USD
  maxOutputTokens: number;
  isFallback: boolean;
  fallbackReason?: string;
}

export interface TokenUsageRecord {
  id?: string;
  userId: string;
  userEmail: string;
  modelUsed: string;
  providerUsed: AIProviderId;
  requestType: RequestCategory;
  complexity: ComplexityLevel;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number; // in USD
  timestamp: string | number;
  dateKey?: string; // e.g. YYYY-MM-DD
}

export interface PlanLimits {
  tier: UserPlanTier;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  maxOutputTokens: number;
  pdfAnalysisAllowed: boolean;
  advancedReasoningAllowed: boolean;
  customSystemInstructionsAllowed: boolean;
}

export interface StreamChunk {
  text?: string;
  grounding?: {
    chunks?: any[];
    queries?: any[];
  };
  providerUsed?: AIProviderId;
  modelUsed?: string;
  routeInfo?: RouteDecision;
  tokenUsage?: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCost: number;
  };
  isDone?: boolean;
  error?: string;
}

export interface CostAuditReport {
  totalSpentUSD: number;
  projectedMonthlySpentUSD: number;
  totalTokensProcessed: number;
  unnecessaryExpensiveCallsCount: number;
  estimatedSavingsPotentialUSD: number;
  highTokenAnomalyCount: number;
  recommendations: CostOptimizationSuggestion[];
  alerts: CostAnomalyAlert[];
}

export interface CostOptimizationSuggestion {
  id: string;
  type: "model_downgrade" | "prompt_trimming" | "rate_limit" | "caching";
  title: string;
  description: string;
  suggestedAlternativeModel?: string;
  estimatedSavingsPercentage: number;
  impactLevel: "high" | "medium" | "low";
}

export interface CostAnomalyAlert {
  id: string;
  timestamp: number;
  userEmail: string;
  modelUsed: string;
  tokensConsumed: number;
  costUSD: number;
  severity: "critical" | "warning" | "info";
  message: string;
}

export interface PromptOptimizationResult {
  originalText: string;
  optimizedText: string;
  originalTokens: number;
  optimizedTokens: number;
  savedTokens: number;
  savingsPercentage: number;
  removedRedundancies: string[];
}

/**
 * Interface that every AI Provider implementation must fulfill.
 */
export interface IAIProvider {
  /** Provider identifier */
  id: AIProviderId;

  /** Display Name */
  displayName: string;

  /** Default model string for this provider */
  defaultModel: string;

  /** List of supported models by this provider */
  supportedModels: string[];

  /** Check if provider is available (API Key configured) */
  isAvailable(): boolean;

  /** Stream chat responses */
  generateStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown>;

  /** Generate complete non-streaming response */
  generateContent(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string>;
}
