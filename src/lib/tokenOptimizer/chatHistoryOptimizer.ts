import { estimateTokens } from "./tokenOptimizerCore.js";

/**
 * #2 Send only the chat history that matters — keep the most recent
 * N messages, drop the rest (they get folded into a summary instead, see below).
 */
export function trimChatHistory(messages: any[], keepRecent = 6) {
  if (!messages || messages.length <= keepRecent) return { recent: messages || [], older: [] };
  return { recent: messages.slice(-keepRecent), older: messages.slice(0, -keepRecent) };
}

/**
 * #3 Summarize old conversation — wire summarizeFn to a CHEAP/mini model call
 * (this summarization itself should use the cheapest model, per point #9/#10).
 * Only re-summarizes when the old-message set has actually grown, so you're
 * not re-summarizing on every single turn.
 */
export async function getOrUpdateSummary(
  conversationId: string,
  olderMessages: any[],
  summarizeFn: (text: string) => Promise<string>,
  cache: any
): Promise<string> {
  if (!olderMessages || !olderMessages.length) return "";
  const cached = cache.get(conversationId);
  if (cached && cached.messageCount === olderMessages.length) return cached.summary;

  if (typeof summarizeFn !== "function") {
    throw new Error("Pass summarizeFn(text) wrapping a CHEAP/mini model call for summarization");
  }
  const transcript = olderMessages.map((m) => `${m.role || "user"}: ${m.content || m.text || ""}`).join("\n");
  const summary = await summarizeFn(
    `Summarize the important facts, decisions, and context from this conversation in 2-4 sentences. ` +
    `Be factual and concise:\n\n${transcript}`
  );
  cache.set(conversationId, { summary, messageCount: olderMessages.length });
  return summary;
}

/** Simple in-memory cache for conversation summaries. Swap for Redis/DB in production. */
export function createSummaryCache() {
  const store = new Map<string, any>();
  return {
    get: (id: string) => store.get(id),
    set: (id: string, val: any) => store.set(id, val),
  };
}

/**
 * #11 Store useful memory in a small, structured form — not full transcripts.
 * Example: { userId: "u1", facts: ["Preferred answer style: short and simple"] }
 */
export function formatMemoryForPrompt(memoryFacts: string[]): string {
  if (!memoryFacts || !memoryFacts.length) return "";
  return `Known user context: ${memoryFacts.join("; ")}.`;
}

/**
 * #12 Avoid repeating the same instruction/content in multiple places.
 * Call this before sending a prompt to catch accidental duplication.
 */
export function detectDuplicateContent(promptParts: string[]): number[] {
  const seen = new Set<string>();
  const duplicates: number[] = [];
  promptParts.forEach((part, i) => {
    if (!part) return;
    const normalized = part.trim().toLowerCase();
    if (normalized && seen.has(normalized)) duplicates.push(i);
    seen.add(normalized);
  });
  return duplicates;
}
