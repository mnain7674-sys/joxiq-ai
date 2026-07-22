/**
 * OpenAI Provider Implementation for JOXIQ AI
 * Supports GPT-5 mini, GPT-4o, GPT-4o-mini, and custom OpenAI-compatible endpoints.
 * 
 * HOW TO CONNECT OPENAI API:
 * 1. Obtain an API key from OpenAI Platform (https://platform.openai.com/api-keys)
 * 2. Add OPENAI_API_KEY="your_api_key_here" to your .env file or AI Studio Secrets
 * 3. The AI Router will automatically detect the key and route gpt-* requests to OpenAI!
 */

import { envConfig } from "../config/env.js";
import {
  IAIProvider,
  AIProviderId,
  ChatMessage,
  ChatOptions,
  StreamChunk,
} from "./types.js";

export class OpenAIProvider implements IAIProvider {
  id: AIProviderId = "openai";
  displayName = "OpenAI";
  defaultModel = "gpt-5-mini";
  supportedModels = [
    "gpt-5-mini",
    "gpt-4o",
    "gpt-4o-mini",
    "gpt-3.5-turbo",
    "o1-mini",
    "o3-mini",
  ];

  isAvailable(): boolean {
    return envConfig.isProviderConfigured("openai");
  }

  /**
   * Format messages into OpenAI Chat Completion API specification
   */
  private formatMessages(messages: ChatMessage[], systemInstruction?: string) {
    const formatted: any[] = [];

    if (systemInstruction) {
      formatted.push({
        role: "system",
        content: systemInstruction,
      });
    }

    for (const msg of messages) {
      let contentStr = msg.content || "";

      if (msg.document && msg.document.content) {
        contentStr = `[Attached Document: ${msg.document.name}]\n${msg.document.content}\n\n${contentStr}`;
      }

      // Handle multimodal vision content if image is present
      if (msg.image && msg.image.data && msg.image.mimeType) {
        const mime = msg.image.mimeType;
        const base64 = msg.image.data.startsWith("data:")
          ? msg.image.data
          : `data:${mime};base64,${msg.image.data}`;

        formatted.push({
          role: msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
          content: [
            { type: "text", text: contentStr },
            {
              type: "image_url",
              image_url: { url: base64 },
            },
          ],
        });
      } else {
        formatted.push({
          role: msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
          content: contentStr,
        });
      }
    }

    return formatted;
  }

  async *generateStream(
    messages: ChatMessage[],
    options?: ChatOptions
  ): AsyncGenerator<StreamChunk, void, unknown> {
    const apiKey = envConfig.openaiApiKey;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables or Secrets to use GPT models."
      );
    }

    const modelName = options?.model || this.defaultModel;
    const formattedMessages = this.formatMessages(messages, options?.systemInstruction);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
        max_tokens: options?.maxTokens || 4096,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API request failed (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error("No response body returned from OpenAI API stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(":")) continue;

          if (trimmed === "data: [DONE]") {
            return;
          }

          if (trimmed.startsWith("data: ")) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              const deltaText = data.choices?.[0]?.delta?.content;
              if (deltaText) {
                yield {
                  text: deltaText,
                  providerUsed: "openai",
                  modelUsed: modelName,
                };
              }
            } catch (e) {
              // Ignore malformed SSE chunks
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async generateContent(
    messages: ChatMessage[],
    options?: ChatOptions
  ): Promise<string> {
    const apiKey = envConfig.openaiApiKey;
    if (!apiKey) {
      throw new Error(
        "OpenAI API key is missing. Please add OPENAI_API_KEY to your environment variables or Secrets."
      );
    }

    const modelName = options?.model || this.defaultModel;
    const formattedMessages = this.formatMessages(messages, options?.systemInstruction);

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: formattedMessages,
        temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
        max_tokens: options?.maxTokens || 4096,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenAI API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "";
  }
}
