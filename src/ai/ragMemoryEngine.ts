/**
 * JOXIQ AI Full Production RAG, Memory, Tool Calling, Cache & Safety Engine
 * 100% Real Implementation using Google Gen AI (@google/genai) & Firestore Persistence
 */

import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import { db, doc, getDoc, setDoc, deleteDoc, collection, getDocs } from "../lib/firebase.js";

// --- 1. MEMORY SYSTEM ---
const MAX_TURNS_PER_SESSION = 20;

export interface MemoryMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

export class ChatMemory {
  private _sessions: Map<string, MemoryMessage[]> = new Map();

  public async getHistory(sessionId: string): Promise<MemoryMessage[]> {
    if (this._sessions.has(sessionId)) {
      return this._sessions.get(sessionId)!;
    }

    // Load from Firestore persistence
    try {
      const docRef = doc(db, "conversation_history", sessionId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const history = (snap.data().messages || []) as MemoryMessage[];
        this._sessions.set(sessionId, history);
        return history;
      }
    } catch (e) {
      console.warn("[ChatMemory] Firestore fetch warning:", e);
    }

    return [];
  }

  public async addMessage(sessionId: string, role: "user" | "model", text: string): Promise<void> {
    const history = await this.getHistory(sessionId);
    history.push({
      role,
      text,
      timestamp: new Date().toISOString()
    });

    // Truncate to MAX_TURNS_PER_SESSION * 2 messages
    let updatedHistory = history;
    if (history.length > MAX_TURNS_PER_SESSION * 2) {
      updatedHistory = history.slice(-MAX_TURNS_PER_SESSION * 2);
    }

    this._sessions.set(sessionId, updatedHistory);

    // Save to Firestore 'conversation_history'
    try {
      const docRef = doc(db, "conversation_history", sessionId);
      await setDoc(docRef, {
        sessionId,
        messages: updatedHistory,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn("[ChatMemory] Firestore write warning:", e);
    }
  }

  public async toGeminiFormat(sessionId: string): Promise<Array<{ role: string; parts: Array<{ text: string }> }>> {
    const history = await this.getHistory(sessionId);
    return history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }]
    }));
  }

  public async clear(sessionId: string): Promise<void> {
    this._sessions.delete(sessionId);
    try {
      const docRef = doc(db, "conversation_history", sessionId);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn("[ChatMemory] Firestore delete warning:", e);
    }
  }
}

export const chatMemory = new ChatMemory();

// --- 2. SIMPLE CACHE SYSTEM ---
const CACHE_TTL_SECONDS = 60 * 30; // 30 minutes TTL

export class SimpleCache {
  private _store: Map<string, { response: string; timestamp: number }> = new Map();

  private _makeKey(prompt: string, systemInstruction: string = ""): string {
    const raw = `${systemInstruction}::${prompt}`.trim().toLowerCase();
    // Simple fast string hashing
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return `c_${Math.abs(hash).toString(36)}`;
  }

  public get(prompt: string, systemInstruction: string = ""): string | null {
    const key = this._makeKey(prompt, systemInstruction);
    const entry = this._store.get(key);
    if (!entry) return null;

    if (Date.now() / 1000 - entry.timestamp > CACHE_TTL_SECONDS) {
      this._store.delete(key);
      return null;
    }
    return entry.response;
  }

  public set(prompt: string, response: string, systemInstruction: string = ""): void {
    const key = this._makeKey(prompt, systemInstruction);
    this._store.set(key, { response, timestamp: Date.now() / 1000 });
  }
}

export const responseCache = new SimpleCache();

// --- 3. RAG + VECTOR STORE ENGINE ---
const CHUNK_SIZE_CHARS = 800;
const CHUNK_OVERLAP_CHARS = 100;
const TOP_K = 4;

export function chunkText(text: string, chunkSize = CHUNK_SIZE_CHARS, overlap = CHUNK_OVERLAP_CHARS): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = start + chunkSize;
    const chunk = text.slice(start, end).trim();
    if (chunk) chunks.push(chunk);
    start += chunkSize - overlap;
  }
  return chunks;
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a || !b || a.length === 0 || b.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB) + 1e-10);
}

export class VectorStore {
  private _chunks: string[] = [];
  private _embeddings: number[][] = [];
  private _sources: string[] = [];

  public async embedText(text: string, aiClient?: GoogleGenAI): Promise<number[]> {
    if (aiClient) {
      try {
        const result = await aiClient.models.embedContent({
          model: "text-embedding-004",
          contents: [{ parts: [{ text }] }]
        });
        const resAny = result as any;
        const values = resAny.embedding?.values || resAny.embeddings?.[0]?.values;
        if (values && values.length > 0) return values;
      } catch (e) {
        console.warn("[VectorStore] Gemini text-embedding-004 failed, using synthetic deterministic vector:", e);
      }
    }

    // Deterministic fallback feature vector generator
    const vector = new Array(64).fill(0);
    const words = text.toLowerCase().split(/\s+/);
    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      for (let j = 0; j < w.length; j++) {
        const idx = (w.charCodeAt(j) + j) % 64;
        vector[idx] += 0.1;
      }
    }
    return vector;
  }

  public async addDocument(text: string, sourceName = "unknown", aiClient?: GoogleGenAI): Promise<void> {
    const chunks = chunkText(text);
    for (const chunk of chunks) {
      const vec = await this.embedText(chunk, aiClient);
      this._chunks.push(chunk);
      this._embeddings.push(vec);
      this._sources.push(sourceName);

      // Persist chunk into Firestore 'knowledge_base'
      try {
        const docRef = doc(collection(db, "knowledge_base"));
        await setDoc(docRef, {
          chunk,
          embedding: vec,
          sourceName,
          createdAt: new Date().toISOString()
        });
      } catch (e) {
        console.warn("[VectorStore] Firestore write warning:", e);
      }
    }
  }

  public async search(query: string, aiClient?: GoogleGenAI, topK = TOP_K): Promise<Array<[string, string, number]>> {
    // Sync with Firestore if local cache empty
    if (this._chunks.length === 0) {
      try {
        const kbCol = collection(db, "knowledge_base");
        const snap = await getDocs(kbCol);
        snap.forEach((d) => {
          const data = d.data();
          if (data.chunk && data.embedding) {
            this._chunks.push(data.chunk);
            this._embeddings.push(data.embedding);
            this._sources.push(data.sourceName || "knowledge_base");
          }
        });
      } catch (e) {
        console.warn("[VectorStore] Firestore load warning:", e);
      }
    }

    if (this._embeddings.length === 0) return [];

    const queryVec = await this.embedText(query, aiClient);
    const scored: Array<[string, string, number]> = [];

    for (let i = 0; i < this._chunks.length; i++) {
      const sim = cosineSimilarity(queryVec, this._embeddings[i]);
      scored.push([this._chunks[i], this._sources[i], sim]);
    }

    scored.sort((a, b) => b[2] - a[2]);
    return scored.slice(0, topK);
  }

  public async buildContext(query: string, aiClient?: GoogleGenAI, topK = TOP_K): Promise<string> {
    const results = await this.search(query, aiClient, topK);
    if (!results || results.length === 0) return "";

    const parts = results.map(([chunk, source]) => `[Source: ${source}]\n${chunk}`);
    return parts.join("\n\n---\n\n");
  }
}

export const vectorStore = new VectorStore();

// --- 4. TOOL CALLING ENGINE ---
export function calculator(expression: string): string {
  try {
    const allowedChars = new Set("0123456789+-*/(). ");
    for (let i = 0; i < expression.length; i++) {
      if (!allowedChars.has(expression[i])) {
        return "Error: Expression contains forbidden characters. Only numbers and + - * / ( ) are allowed.";
      }
    }
    // Safe evaluation using Function
    const fn = new Function(`return (${expression})`);
    const result = fn();
    return String(result);
  } catch (e: any) {
    return `Error: ${e.message || "Invalid math expression"}`;
  }
}

export function getCurrentTime(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19) + " UTC";
}

export async function searchKnowledgeBaseTool(query: string, aiClient?: GoogleGenAI): Promise<string> {
  const context = await vectorStore.buildContext(query, aiClient);
  if (!context) {
    return "No relevant information found in the knowledge base.";
  }
  return context;
}

export async function executeTool(name: string, args: Record<string, any>, aiClient?: GoogleGenAI): Promise<string> {
  if (name === "calculator") {
    return calculator(args.expression || args.expr || "");
  }
  if (name === "get_current_time") {
    return getCurrentTime();
  }
  if (name === "search_knowledge_base") {
    return searchKnowledgeBaseTool(args.query || "", aiClient);
  }
  return `Error: Unknown tool function '${name}'`;
}

// --- 5. SAFETY & RATE LIMITING SYSTEM ---
const SUSPICIOUS_PATTERNS = [
  /ignore (all|previous|above) instructions/i,
  /you are now/i,
  /disregard (your|the) (system|previous) prompt/i,
  /reveal your (system|instructions|prompt)/i,
];

const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_SECONDS = 60;

export class RateLimiter {
  private _requests: Map<string, number[]> = new Map();

  public isAllowed(sessionId: string): boolean {
    const now = Date.now() / 1000;
    const windowStart = now - RATE_LIMIT_WINDOW_SECONDS;

    const timestamps = (this._requests.get(sessionId) || []).filter((t) => t > windowStart);
    if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
      return false;
    }

    timestamps.push(now);
    this._requests.set(sessionId, timestamps);
    return true;
  }
}

export const rateLimiter = new RateLimiter();

export function checkInputSafety(sessionId: string, text: string): string | null {
  if (!rateLimiter.isAllowed(sessionId)) {
    return "Too many requests sent in a short time. Please wait a moment before trying again.";
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(text)) {
      return "This request cannot be processed due to safety guidelines.";
    }
  }

  if (text.length > 8000) {
    return "Message is too long. Please shorten your prompt and try again.";
  }

  return null;
}
