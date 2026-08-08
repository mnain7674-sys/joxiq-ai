import { estimateTokens } from "./tokenOptimizerCore.js";

/**
 * #7, #8 Retrieve only the best chunks — takes a scored list of retrieved
 * chunks (from your existing vector search / RAG pipeline) and keeps only
 * the top N, deduplicating near-identical matches.
 */
export function selectBestChunks(
  scoredChunks: any[],
  { topN = 3, minScore = 0.5, maxTokens = 1500 } = {}
) {
  if (!scoredChunks || !scoredChunks.length) return { selected: [], tokensUsed: 0, droppedCount: 0 };
  const sorted = [...scoredChunks].sort((a, b) => (b.score || 0) - (a.score || 0)).filter((c) => (c.score || 1) >= minScore);
  const deduped = dedupeSimilarChunks(sorted);

  const selected: any[] = [];
  let tokenBudget = 0;
  for (const chunk of deduped) {
    if (selected.length >= topN) break;
    const chunkText = chunk.text || chunk.content || "";
    const chunkTokens = estimateTokens(chunkText);
    if (tokenBudget + chunkTokens > maxTokens) continue;
    selected.push(chunk);
    tokenBudget += chunkTokens;
  }
  return { selected, tokensUsed: tokenBudget, droppedCount: scoredChunks.length - selected.length };
}

/** Removes chunks that are near-duplicates of ones already kept (simple text-overlap check). */
export function dedupeSimilarChunks(chunks: any[], overlapThreshold = 0.85) {
  if (!chunks) return [];
  const kept: any[] = [];
  for (const chunk of chunks) {
    const chunkText = chunk.text || chunk.content || "";
    const isDuplicate = kept.some((k) => textOverlap(k.text || k.content || "", chunkText) > overlapThreshold);
    if (!isDuplicate) kept.push(chunk);
  }
  return kept;
}

export function textOverlap(a: string, b: string): number {
  if (!a || !b) return 0;
  const wordsA = new Set(a.toLowerCase().split(/\s+/));
  const wordsB = new Set(b.toLowerCase().split(/\s+/));
  const intersection = [...wordsA].filter((w) => wordsB.has(w)).length;
  return intersection / Math.min(wordsA.size, wordsB.size || 1);
}

/**
 * #10 Use a cheap model to pre-filter a large document before the strong
 * model sees it. Wire filterFn to a mini/cheap model call.
 */
export async function preFilterLargeDocument(
  question: string,
  fullDocumentText: string,
  filterFn: (prompt: string) => Promise<string>,
  maxSections = 5
) {
  if (typeof filterFn !== "function") {
    throw new Error("Pass filterFn(prompt) wrapping a CHEAP/mini model call");
  }
  const result = await filterFn(
    `From this document, extract only the ${maxSections} sections most relevant to answering: "${question}"\n\n` +
    `Return just the relevant excerpts, nothing else.\n\nDocument:\n${fullDocumentText}`
  );
  return { relevantExcerpts: result };
}
