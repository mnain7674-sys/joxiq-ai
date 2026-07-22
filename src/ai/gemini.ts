/**
 * Google Gemini Provider Implementation for JOXIQ AI
 * Powered by @google/genai SDK
 */

import { GoogleGenAI } from "@google/genai";
import { envConfig } from "../config/env.js";
import {
  IAIProvider,
  AIProviderId,
  ChatMessage,
  ChatOptions,
  StreamChunk,
} from "./types.js";

export class GeminiProvider implements IAIProvider {
  id: AIProviderId = "gemini";
  displayName = "Google Gemini";
  defaultModel = "gemini-2.5-flash";
  supportedModels = [
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-pro",
    "gemini-1.5-flash",
  ];

  private client: GoogleGenAI | null = null;

  private getClient(): GoogleGenAI {
    if (!this.client) {
      const apiKey = envConfig.geminiApiKey;
      if (!apiKey) {
        throw new Error(
          "Gemini API key is not configured. Please set GEMINI_API_KEY in environment variables or Secrets."
        );
      }
      this.client = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "joxiq-ai-service",
          },
        },
      });
    }
    return this.client;
  }

  isAvailable(): boolean {
    return envConfig.isProviderConfigured("gemini");
  }

  /**
   * Converts generic ChatMessage array to Gemini SDK format
   */
  private formatContents(messages: ChatMessage[]) {
    return messages.map((msg) => {
      const parts: any[] = [];
      let msgText = msg.content || "";

      if (msg.document && msg.document.content) {
        msgText = `[Attached Document: ${msg.document.name} (${msg.document.size || ""})]\n=== DOCUMENT CONTENT START ===\n${msg.document.content}\n=== DOCUMENT CONTENT END ===\n\n${msgText}`;
      }

      if (msgText) {
        parts.push({ text: msgText });
      }

      if (msg.image && msg.image.data && msg.image.mimeType) {
        parts.push({
          inlineData: {
            mimeType: msg.image.mimeType,
            data: msg.image.data.replace(/^data:image\/\w+;base64,/, ""),
          },
        });
      }

      return {
        role: msg.role === "assistant" ? "model" : "user",
        parts,
      };
    });
  }

  async *generateStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const ai = this.getClient();
    const contents = this.formatContents(messages);
    const modelName = options?.model || this.defaultModel;

    const tools = options?.useSearch ? [{ googleSearch: {} }] : undefined;
    const config: any = {
      systemInstruction: options?.systemInstruction,
      temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
      tools,
    };

    let responseStream;

    try {
      responseStream = await ai.models.generateContentStream({
        model: modelName,
        contents,
        config,
      });
    } catch (primaryError: any) {
      console.warn(`[GeminiProvider] Model ${modelName} stream failed, attempting fallback to gemini-2.5-flash...`, primaryError);
      try {
        responseStream = await ai.models.generateContentStream({
          model: "gemini-2.5-flash",
          contents,
          config,
        });
      } catch (secondaryError: any) {
        console.warn(`[GeminiProvider] Fallback failed, trying gemini-2.0-flash...`, secondaryError);
        responseStream = await ai.models.generateContentStream({
          model: "gemini-2.0-flash",
          contents,
          config,
        });
      }
    }

    for await (const chunk of responseStream) {
      const text = chunk.text;
      const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks;
      const searchQueries = chunk.candidates?.[0]?.groundingMetadata?.webSearchQueries;

      const streamChunk: StreamChunk = {
        providerUsed: "gemini",
        modelUsed: modelName,
      };

      if (text) {
        streamChunk.text = text;
      }

      if (groundingChunks || searchQueries) {
        streamChunk.grounding = {
          chunks: groundingChunks || [],
          queries: searchQueries || [],
        };
      }

      if (streamChunk.text || streamChunk.grounding) {
        yield streamChunk;
      }
    }
  }

  async generateContent(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const ai = this.getClient();
    const contents = this.formatContents(messages);
    const modelName = options?.model || this.defaultModel;

    const config: any = {
      systemInstruction: options?.systemInstruction,
      temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
    };

    let response;
    try {
      response = await ai.models.generateContent({
        model: modelName,
        contents,
        config,
      });
    } catch (error: any) {
      console.warn(`[GeminiProvider] Model ${modelName} failed, retrying with gemini-2.5-flash...`, error);
      response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents,
        config,
      });
    }

    return response.text || "";
  }
}
