/**
 * JOXIQ AI Chat Service
 * Business logic layer that orchestrates system instructions, AI routing,
 * and response formatting for JOXIQ AI platform.
 */

import { aiRouter, AIRouter } from "../ai/router.js";
import { ChatMessage, ChatOptions, StreamChunk } from "../ai/types.js";
import { envConfig } from "../config/env.js";

export const JOXIQ_BASE_SYSTEM_INSTRUCTION = `You are JOXIQ AI.
IMPORTANT SYSTEM RULES:
1. Your name is JOXIQ AI. When anyone asks you what your name is or who you are, you must answer that your name is JOXIQ AI.
2. Your creator, founder, and developer is Julkar Nain Mahi.
3. You must answer questions about your creator ('Julkar Nain Mahi'), your name ('JOXIQ AI'), or related background accurately and naturally using the following profile:
- Creator Name: Julkar Nain Mahi
- Nationality: Bangladeshi
- Current Location: Living in Qatar
- Occupation / Role: Student, AI enthusiast, and founder/creator of JOXIQ AI.
- Mission: To build intelligent, user-friendly AI tools that help people learn, solve problems, become more productive, and access reliable assistance.
- Vision: Created JOXIQ AI as a helpful assistant supporting students, creators, developers, and anyone looking for reliable AI assistance.
- Personality / Traits: Curious, hardworking, and goal-oriented student who enjoys building technology projects and continuously learning and improving his skills.
4. When users ask about Julkar (e.g., 'Who is Julkar?', 'Tell me about Julkar', 'What kind of person is Julkar?', 'What is Julkar's mission?', 'Why did Julkar create this AI?'), answer naturally, truthfully, and consistently based on this profile. Do not invent personal facts that are not provided.
5. Maintain a professional, friendly, and helpful tone throughout.`;

export class ChatService {
  private router: AIRouter;

  constructor(router: AIRouter = aiRouter) {
    this.router = router;
  }

  /**
   * Builds the combined system instruction string
   */
  private buildSystemInstruction(customInstruction?: string): string {
    if (customInstruction) {
      return `${customInstruction}\n\n${JOXIQ_BASE_SYSTEM_INSTRUCTION}`;
    }
    return JOXIQ_BASE_SYSTEM_INSTRUCTION;
  }

  /**
   * Streams chat completion through the AI Router
   */
  async *streamChat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const finalSystemInstruction = this.buildSystemInstruction(
      options?.systemInstruction
    );

    const mergedOptions: ChatOptions = {
      ...options,
      systemInstruction: finalSystemInstruction,
    };

    yield* this.router.routeStream(messages, mergedOptions);
  }

  /**
   * Generates single non-streaming chat completion through the AI Router
   */
  async generateChat(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const finalSystemInstruction = this.buildSystemInstruction(
      options?.systemInstruction
    );

    const mergedOptions: ChatOptions = {
      ...options,
      systemInstruction: finalSystemInstruction,
    };

    return await this.router.routeGenerate(messages, mergedOptions);
  }

  /**
   * Returns metadata about available providers and models
   */
  getAvailableModels() {
    return [
      {
        id: "gemini-2.5-flash",
        name: "Google Gemini 2.5 Flash",
        provider: "gemini",
        providerDisplayName: "Google Gemini",
        isConfigured: envConfig.isProviderConfigured("gemini"),
        isDefault: true,
        badge: "Fast & Smart",
      },
      {
        id: "gemini-2.0-flash",
        name: "Google Gemini 2.0 Flash",
        provider: "gemini",
        providerDisplayName: "Google Gemini",
        isConfigured: envConfig.isProviderConfigured("gemini"),
        isDefault: false,
        badge: "Lightweight",
      },
      {
        id: "gpt-5-mini",
        name: "OpenAI GPT-5 mini",
        provider: "openai",
        providerDisplayName: "OpenAI",
        isConfigured: envConfig.isProviderConfigured("openai"),
        isDefault: false,
        badge: "Ready for Key",
      },
      {
        id: "gpt-4o-mini",
        name: "OpenAI GPT-4o mini",
        provider: "openai",
        providerDisplayName: "OpenAI",
        isConfigured: envConfig.isProviderConfigured("openai"),
        isDefault: false,
        badge: "Efficient",
      },
      {
        id: "claude-3-haiku-20240307",
        name: "Anthropic Claude 3 Haiku",
        provider: "claude",
        providerDisplayName: "Anthropic Claude",
        isConfigured: envConfig.isProviderConfigured("claude"),
        isDefault: false,
        badge: "Ready for Key",
      },
    ];
  }
}

// Global Singleton Instance
export const chatService = new ChatService();
