/**
 * Anthropic Claude Provider Implementation for JOXIQ AI
 * Supports Claude 3 Haiku, Claude 3.5 Sonnet, Claude 3 Opus, etc.
 * 
 * HOW TO CONNECT CLAUDE API:
 * 1. Obtain an API key from Anthropic Console (https://console.anthropic.com)
 * 2. Add ANTHROPIC_API_KEY="your_api_key_here" to your .env file or AI Studio Secrets
 * 3. The AI Router will automatically detect the key and route claude-* requests to Anthropic!
 */

import { envConfig } from "../config/env.js";
import {
  IAIProvider,
  AIProviderId,
  ChatMessage,
  ChatOptions,
  StreamChunk,
} from "./types.js";

export class ClaudeProvider implements IAIProvider {
  id: AIProviderId = "claude";
  displayName = "Anthropic Claude";
  defaultModel = "claude-3-haiku-20240307";
  supportedModels = [
    "claude-3-haiku-20240307",
    "claude-3-haiku",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
  ];

  isAvailable(): boolean {
    return envConfig.isProviderConfigured("claude");
  }

  /**
   * Format messages into Anthropic Messages API specification
   */
  private formatMessages(messages: ChatMessage[]) {
    const formatted: any[] = [];

    for (const msg of messages) {
      // System instructions are passed separately in options.systemInstruction for Anthropic
      if (msg.role === "system") continue;

      let contentStr = msg.content || "";

      if (msg.document && msg.document.content) {
        contentStr = `[Attached Document: ${msg.document.name}]\n${msg.document.content}\n\n${contentStr}`;
      }

      if (msg.image && msg.image.data && msg.image.mimeType) {
        const mime = msg.image.mimeType;
        const base64Data = msg.image.data.replace(/^data:image\/\w+;base64,/, "");

        formatted.push({
          role: msg.role === "model" || msg.role === "assistant" ? "assistant" : "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mime,
                data: base64Data,
              },
            },
            { type: "text", text: contentStr },
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
    const apiKey = envConfig.claudeApiKey;
    if (!apiKey) {
      throw new Error(
        "Anthropic Claude API key is missing. Please set ANTHROPIC_API_KEY in environment variables or Secrets to use Claude models."
      );
    }

    const modelName = options?.model || this.defaultModel;
    const formattedMessages = this.formatMessages(messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        system: options?.systemInstruction,
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
        stream: true,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API request failed (${response.status}): ${errText}`);
    }

    if (!response.body) {
      throw new Error("No response body returned from Claude API stream.");
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
          if (!trimmed || !trimmed.startsWith("data: ")) continue;

          const dataStr = trimmed.slice(6);
          if (dataStr === "[DONE]") return;

          try {
            const event = JSON.parse(dataStr);
            if (
              event.type === "content_block_delta" &&
              event.delta &&
              event.delta.text
            ) {
              yield {
                text: event.delta.text,
                providerUsed: "claude",
                modelUsed: modelName,
              };
            }
          } catch (e) {
            // Ignore non-JSON or partial heartbeat events
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
    const apiKey = envConfig.claudeApiKey;
    if (!apiKey) {
      throw new Error(
        "Anthropic Claude API key is missing. Please set ANTHROPIC_API_KEY in environment variables or Secrets."
      );
    }

    const modelName = options?.model || this.defaultModel;
    const formattedMessages = this.formatMessages(messages);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: modelName,
        system: options?.systemInstruction,
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 4096,
        temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API request failed (${response.status}): ${errText}`);
    }

    const data = await response.json();
    if (data.content && Array.isArray(data.content)) {
      return data.content
        .filter((part: any) => part.type === "text")
        .map((part: any) => part.text)
        .join("\n");
    }

    return "";
  }
}
