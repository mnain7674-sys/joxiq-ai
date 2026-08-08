/**
 * JOXIQ AI — Token Optimization Core
 * Implements the guide: "How to Reduce AI Token Usage Without Losing
 * the Information the User Needs"
 */

// ---- #1 Token estimation (rough, no API call needed) ----
// English averages ~4 chars/token; this is a fast local estimate, not exact.
export function estimateTokens(text?: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// ---- #5 Classify question complexity → matches the guide's table ----
export function classifyComplexity(question: string): "simple" | "normal" | "detailed" | "complex" {
  if (!question) return "simple";
  const wordCount = question.trim().split(/\s+/).length;
  const complexSignals = /\b(analyze|debug|architecture|compare all|comprehensive|detailed report|deep dive)\b/i;
  const detailedSignals = /\b(explain how|explain why|walk me through|pros and cons|step by step)\b/i;
  const normalSignals = /\b(vs\.?|versus|difference between|explain)\b/i;

  if (complexSignals.test(question) || wordCount > 60) return "complex";
  if (detailedSignals.test(question) || wordCount > 25) return "detailed";
  if (normalSignals.test(question) || wordCount > 8) return "normal";
  return "simple";
}

// ---- #5 Output token limit per complexity (from the guide's table) ----
export const OUTPUT_LIMITS = {
  simple: 150,
  normal: 500,
  detailed: 1200,
  complex: 2000,
};

export function getOutputLimit(complexity: keyof typeof OUTPUT_LIMITS): number {
  return OUTPUT_LIMITS[complexity] || OUTPUT_LIMITS.normal;
}

// ---- #9 Model routing — cheap model for easy tasks, strong model only when needed ----
export const MODEL_ROUTING = {
  simple: { provider: "gemini", model: "gemini-2.0-flash" },      // mini/cheap
  normal: { provider: "gemini", model: "gemini-2.0-flash" },      // standard
  detailed: { provider: "gemini", model: "gemini-2.5-flash" },    // stronger
  complex: { provider: "gemini", model: "gemini-2.5-flash" },     // strongest
};

export function selectModel(complexity: keyof typeof MODEL_ROUTING) {
  return MODEL_ROUTING[complexity] || MODEL_ROUTING.normal;
}

// ---- #15 Answer-length presets the user can pick from ----
export const LENGTH_PRESETS = {
  short: { instruction: "Give a direct, one-to-two sentence answer only.", outputLimitMultiplier: 0.4 },
  balanced: { instruction: "Give the answer plus the most important supporting explanation.", outputLimitMultiplier: 1 },
  detailed: { instruction: "Give a full explanation with examples and steps where useful.", outputLimitMultiplier: 2 },
};

export function applyLengthPreset(baseLimit: number, presetName: keyof typeof LENGTH_PRESETS = "balanced") {
  const preset = LENGTH_PRESETS[presetName] || LENGTH_PRESETS.balanced;
  return { instruction: preset.instruction, outputLimit: Math.round(baseLimit * preset.outputLimitMultiplier) };
}

// ---- #4, #19 Short, single-source-of-truth system prompt ----
// Point #12: don't repeat this instruction elsewhere in the prompt.
export const SYSTEM_PROMPT = "Answer the user's exact request directly. Include all information needed to " +
  "complete the request. Do not add unrelated background, repeated points, or a long introduction. " +
  "Keep the answer concise by default, but give more detail when the task needs it or the user asks for it.";

// ---- #13 Prefer compact output formats when the content is comparative/tabular ----
export function suggestFormatHint(question: string): string | null {
  if (!question) return null;
  if (/\b(compare|vs\.?|versus|difference between)\b/i.test(question)) {
    return "If comparing items, use a short table (Item / Key differences) instead of long paragraphs.";
  }
  if (/\b(steps|how to|list)\b/i.test(question)) {
    return "If listing steps or items, use a short bullet list instead of prose.";
  }
  return null;
}
