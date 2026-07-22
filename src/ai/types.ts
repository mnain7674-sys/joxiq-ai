/**
 * Unified AI Service Type Definitions for JOXIQ AI
 */

export type AIProviderId = "gemini" | "openai" | "claude";

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
  userTier?: "free" | "premium"; // User subscription tier
}

export interface RouteDecision {
  providerId: AIProviderId;
  model: string;
  reason: string;
  taskCategory: "multimodal_image" | "document_pdf" | "general_tutor" | "coding_math" | "fallback";
  isFallback: boolean;
  fallbackReason?: string;
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
  isDone?: boolean;
  error?: string;
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
