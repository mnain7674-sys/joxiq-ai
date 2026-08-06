/**
 * Production Token Optimization Engine for JOXIQ AI
 * 
 * Features:
 * 1. Automatic Token Controller (Input, Output, Total, Cost, User/Daily/Monthly tracking)
 * 2. Automatic Smart Cache Engine (Firestore 'ai_cache' collection with query hashing & TTL)
 * 3. Automatic Knowledge Search Engine (Firebase 'knowledge_base' collection lookup)
 * 4. Automatic Request Classifier & Strategy Selection (Simple, Medium, Complex)
 * 5. Automatic Conversation Summarizer & Compression (Firebase 'conversation_summaries')
 * 6. Automatic Anomaly Monitoring & Logging (Firebase 'system_monitoring_logs', 'optimization_logs')
 * 7. Real-Time Analytics Engine (Cache hit rates, cost savings, response times, model distribution)
 */

import { db, doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc } from "../lib/firebase.js";
import { ChatMessage, ChatOptions, RequestCategory, ComplexityLevel, UserPlanTier } from "./types.js";
import { MODEL_COSTS } from "./decisionEngine.js";

// Local memory cache for sub-millisecond hot lookups
const memoryCache = new Map<string, { response: string; expiresAt: number; category: string }>();

export interface OptimizationResult {
  isCached: boolean;
  cachedResponse?: string;
  source: "smart_cache" | "knowledge_base" | "llm_model";
  taskCategory: RequestCategory;
  complexity: ComplexityLevel;
  tokensSaved: number;
  costSavedUSD: number;
  confidenceScore?: number;
}

export interface AnalyticsSummary {
  totalRequests: number;
  cacheHits: number;
  cacheMisses: number;
  cacheHitRate: number; // percentage (0-100)
  knowledgeHits: number;
  totalTokensProcessed: number;
  totalTokensSaved: number;
  totalCostUSD: number;
  totalCostSavedUSD: number;
  averageResponseTimeMs: number;
  complexityBreakdown: {
    simple: number;
    medium: number;
    complex: number;
  };
  modelDistribution: Record<string, number>;
  latestLogs: Array<{
    id: string;
    timestamp: string;
    type: string;
    details: string;
    tokens: number;
    costUSD: number;
  }>;
}

export class ProductionTokenEngine {
  /**
   * 1. Automatic Token Estimator & Character Heuristics
   */
  public estimateTokens(text: string): number {
    if (!text) return 0;
    // ~3.8 characters per token for English and mixed programming code
    return Math.ceil(text.trim().length / 3.8);
  }

  /**
   * Estimates total input tokens for a chat payload
   */
  public estimateInputTokens(messages: ChatMessage[], systemInstruction?: string): number {
    let count = this.estimateTokens(systemInstruction || "");
    for (const msg of messages) {
      count += this.estimateTokens(msg.content || "");
      if (msg.document?.content) {
        count += this.estimateTokens(msg.document.content);
      }
      if (msg.image?.data) {
        count += 500; // Standard vision model baseline
      }
    }
    return count;
  }

  /**
   * Calculates exact USD cost for token usage based on model rates per 1,000 tokens
   */
  public calculateCost(model: string, inputTokens: number, outputTokens: number): number {
    const totalTokens = inputTokens + outputTokens;
    const ratePer1k = MODEL_COSTS[model] || 0.0001;
    return (totalTokens / 1000) * ratePer1k;
  }

  /**
   * Normalizes prompt query to create a deterministic hash signature for caching & knowledge search
   */
  public generateQueryHash(text: string): string {
    const clean = text
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, " ")
      .trim();

    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      const char = clean.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `q_${Math.abs(hash).toString(36)}_${clean.slice(0, 20).replace(/\s+/g, "_")}`;
  }

  /**
   * 2. Automatic Smart Cache Search (Firebase + Local Hot Cache)
   */
  public async lookupCache(query: string): Promise<{ hit: boolean; response?: string; category?: string }> {
    const hash = this.generateQueryHash(query);
    const now = Date.now();

    // Check Memory Hot Cache
    if (memoryCache.has(hash)) {
      const item = memoryCache.get(hash)!;
      if (item.expiresAt > now) {
        console.info(`[Token Engine] Smart Cache HIT (Memory Hot Storage) for hash: ${hash}`);
        return { hit: true, response: item.response, category: item.category };
      } else {
        memoryCache.delete(hash);
      }
    }

    // Check Firestore 'ai_cache' collection
    try {
      const cacheRef = doc(db, "ai_cache", hash);
      const snap = await getDoc(cacheRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data.expiresAt > now) {
          // Store in local hot cache for next call
          memoryCache.set(hash, {
            response: data.response,
            expiresAt: data.expiresAt,
            category: data.category || "simple_text"
          });
          console.info(`[Token Engine] Smart Cache HIT (Firestore Storage) for hash: ${hash}`);
          return { hit: true, response: data.response, category: data.category };
        } else {
          // Expired - delete automatically
          await deleteDoc(cacheRef);
        }
      }
    } catch (err) {
      console.warn("[Token Engine] Cache lookup warning:", err);
    }

    return { hit: false };
  }

  /**
   * Saves reusable response to Firestore 'ai_cache' with TTL (default 7 days)
   */
  public async saveToCache(
    query: string,
    response: string,
    category: RequestCategory = "simple_text",
    ttlDays = 7
  ): Promise<void> {
    if (!query || !response || query.length < 5 || response.length < 10) return;

    const hash = this.generateQueryHash(query);
    const expiresAt = Date.now() + ttlDays * 24 * 60 * 60 * 1000;

    // Save to Memory Hot Cache
    memoryCache.set(hash, { response, expiresAt, category });

    // Save to Firestore
    try {
      const cacheRef = doc(db, "ai_cache", hash);
      await setDoc(cacheRef, {
        hash,
        query: query.slice(0, 300),
        response,
        category,
        expiresAt,
        createdAt: new Date().toISOString()
      }, { merge: true });
    } catch (err) {
      console.warn("[Token Engine] Failed to write to ai_cache in Firestore:", err);
    }
  }

  /**
   * 3. Automatic Knowledge Search Engine (Firebase 'knowledge_base')
   */
  public async searchKnowledgeBase(query: string): Promise<{ match: boolean; content?: string; confidenceScore?: number }> {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery || cleanQuery.length < 3) return { match: false };

    try {
      const kbCol = collection(db, "knowledge_base");
      const snap = await getDocs(kbCol);
      if (snap.empty) {
        // Pre-seed core Knowledge Base entries in Firestore if empty
        await this.seedDefaultKnowledgeBase();
        return this.searchKnowledgeBase(query);
      }

      let bestMatch: { content: string; score: number } | null = null;

      snap.forEach((docSnap) => {
        const item = docSnap.data();
        const keywords: string[] = item.keywords || [];
        const question: string = (item.question || "").toLowerCase();

        let score = 0;
        if (question && cleanQuery.includes(question) || question.includes(cleanQuery)) {
          score += 0.9;
        }

        const matches = keywords.filter(kw => cleanQuery.includes(kw.toLowerCase()));
        if (keywords.length > 0) {
          score += (matches.length / keywords.length) * 0.7;
        }

        if (score > 0.7 && (!bestMatch || score > bestMatch.score)) {
          bestMatch = { content: item.answer || item.content, score: Math.min(1.0, score) };
        }
      });

      if (bestMatch && (bestMatch as any).score >= 0.75) {
        console.info(`[Token Engine] Knowledge Base MATCH (Score: ${(bestMatch as any).score})`);
        return { match: true, content: (bestMatch as any).content, confidenceScore: (bestMatch as any).score };
      }
    } catch (err) {
      console.warn("[Token Engine] Knowledge base search warning:", err);
    }

    return { match: false };
  }

  /**
   * Seeds default platform Knowledge Base into Firestore for instant token-free Q&A
   */
  private async seedDefaultKnowledgeBase(): Promise<void> {
    try {
      const defaults = [
        {
          id: "kb_julkar_profile",
          question: "who created joxiq ai / who is julkar nain mahi",
          keywords: ["creator", "founder", "julkar", "mahi", "who made", "built", "owner"],
          answer: "JOXIQ AI was created and developed by Julkar Nain Mahi, a passionate student and AI enthusiast living in Qatar. His mission is to build intelligent, accessible tools that help students, creators, and developers achieve more.",
          category: "platform_info"
        },
        {
          id: "kb_joxiq_name",
          question: "what is joxiq ai",
          keywords: ["what is joxiq", "about joxiq", "name", "platform"],
          answer: "JOXIQ AI is a full-stack production AI ecosystem featuring multi-model routing (Gemini, GPT, Claude), automated token cost optimization, an interactive AI Learning Academy, and administrative controls.",
          category: "platform_info"
        },
        {
          id: "kb_subscription_plans",
          question: "subscription plans pricing",
          keywords: ["price", "pricing", "plan", "subscription", "cost", "pro", "ultra", "free"],
          answer: "JOXIQ AI offers 4 plan tiers: Free (25,000 monthly tokens), Pro ($19.99/mo, 300,000 tokens), Annual ($199/yr, 300,000 tokens/mo), and Ultra ($49.99/mo, 1,000,000 monthly tokens).",
          category: "billing"
        }
      ];

      for (const item of defaults) {
        await setDoc(doc(db, "knowledge_base", item.id), {
          ...item,
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("[Token Engine] Failed to seed knowledge_base:", err);
    }
  }

  /**
   * 4. Automatic Request Complexity Analysis & Strategy Selection
   */
  public classifyComplexity(messages: ChatMessage[]): {
    complexity: ComplexityLevel;
    category: RequestCategory;
    maxOutputTokens: number;
    recommendedModel: string;
  } {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user");
    const text = (lastUserMsg?.content || "").trim();
    const len = text.length;

    const hasCode = text.includes("```") || /function|class|import|interface|const\s+\w+/i.test(text);
    const hasMath = /[\$\\\{\}\^_\+\=\/]/g.test(text);
    const hasDoc = messages.some(m => m.document || m.image);

    let category: RequestCategory = "simple_text";
    if (hasDoc) category = "document_pdf";
    else if (hasCode) category = "simple_coding";
    else if (len > 1500) category = "research_paper";

    let complexity: ComplexityLevel = "easy";
    let maxOutputTokens = 800;
    let recommendedModel = "gemini-2.5-flash";

    if (len > 1200 || (hasCode && len > 500) || hasMath) {
      complexity = "hard";
      maxOutputTokens = 2048;
      recommendedModel = "gpt-4o";
    } else if (len > 300 || hasCode) {
      complexity = "medium";
      maxOutputTokens = 1200;
      recommendedModel = "gpt-5-mini";
    }

    return { complexity, category, maxOutputTokens, recommendedModel };
  }

  /**
   * 5. Automatic Conversation Summarization & Compression
   */
  public async compressConversation(messages: ChatMessage[]): Promise<ChatMessage[]> {
    if (messages.length <= 6) return messages;

    const systemInstruction = messages.find(m => m.role === "system");
    const nonSystem = messages.filter(m => m.role !== "system");

    // Keep the latest 4 messages untouched
    const recent = nonSystem.slice(-4);
    const older = nonSystem.slice(0, nonSystem.length - 4);

    if (older.length === 0) return messages;

    // Summarize older messages
    const summaryText = older
      .map(m => `${m.role.toUpperCase()}: ${m.content.slice(0, 150)}...`)
      .join(" | ");

    const summaryMessage: ChatMessage = {
      role: "assistant",
      content: `[Automated Conversation Summary]: Previously discussed: ${summaryText.slice(0, 400)}.`
    };

    // Store summary log in Firestore 'conversation_summaries'
    try {
      const summaryRef = doc(collection(db, "conversation_summaries"));
      await setDoc(summaryRef, {
        summaryText: summaryMessage.content,
        originalMessagesCount: older.length,
        savedTokensEstimated: this.estimateInputTokens(older),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.warn("[Token Engine] Summary log warning:", err);
    }

    const result: ChatMessage[] = [];
    if (systemInstruction) result.push(systemInstruction);
    result.push(summaryMessage);
    result.push(...recent);

    return result;
  }

  /**
   * 6. Automatic Anomaly Monitoring & Logging
   */
  public async logOptimization(record: {
    userId?: string;
    userEmail?: string;
    actionType: "cache_hit" | "knowledge_hit" | "llm_call";
    queryText: string;
    modelUsed: string;
    inputTokens: number;
    outputTokens: number;
    tokensSaved: number;
    estimatedCostUSD: number;
    costSavedUSD: number;
    responseTimeMs: number;
    complexity: ComplexityLevel;
  }): Promise<void> {
    try {
      const optCol = collection(db, "optimization_logs");
      const optDoc = doc(optCol);
      const timestamp = new Date().toISOString();

      const docData = {
        userId: record.userId || "anonymous",
        userEmail: record.userEmail || "anonymous@joxiq.ai",
        actionType: record.actionType || "llm_call",
        queryText: record.queryText || "",
        modelUsed: record.modelUsed || "unknown",
        inputTokens: record.inputTokens ?? 0,
        outputTokens: record.outputTokens ?? 0,
        tokensSaved: record.tokensSaved ?? 0,
        estimatedCostUSD: record.estimatedCostUSD ?? 0,
        costSavedUSD: record.costSavedUSD ?? 0,
        responseTimeMs: record.responseTimeMs ?? 0,
        complexity: record.complexity || "easy",
        id: optDoc.id,
        timestamp,
        dateKey: timestamp.split("T")[0],
        monthKey: timestamp.slice(0, 7)
      };

      await setDoc(optDoc, docData);

      // Anomaly Check (Response latency > 4000ms or high token usage > 4000 tokens)
      const input = record.inputTokens ?? 0;
      const output = record.outputTokens ?? 0;
      const latency = record.responseTimeMs ?? 0;

      if (latency > 4000 || (input + output) > 4000) {
        const anomalyRef = doc(collection(db, "ai_anomalies"));
        await setDoc(anomalyRef, {
          type: latency > 4000 ? "HIGH_LATENCY" : "TOKEN_SPIKE",
          details: `Model ${record.modelUsed || "unknown"} latency: ${latency}ms, Tokens: ${input + output}`,
          modelUsed: record.modelUsed || "unknown",
          userEmail: record.userEmail || "anonymous@joxiq.ai",
          timestamp
        });
      }
    } catch (err) {
      console.warn("[Token Engine] Failed to write optimization log:", err);
    }
  }

  /**
   * 7. Real-Time Production Analytics Engine
   */
  public async getEngineAnalytics(): Promise<AnalyticsSummary> {
    let totalRequests = 0;
    let cacheHits = 0;
    let cacheMisses = 0;
    let knowledgeHits = 0;
    let totalTokensProcessed = 0;
    let totalTokensSaved = 0;
    let totalCostUSD = 0;
    let totalCostSavedUSD = 0;
    let totalLatencyMs = 0;

    const complexityBreakdown = { simple: 0, medium: 0, complex: 0 };
    const modelDistribution: Record<string, number> = {};
    const latestLogs: AnalyticsSummary["latestLogs"] = [];

    try {
      const optCol = collection(db, "optimization_logs");
      const snap = await getDocs(optCol);

      snap.forEach(docSnap => {
        const d = docSnap.data();
        totalRequests++;

        if (d.actionType === "cache_hit") {
          cacheHits++;
          totalTokensSaved += d.tokensSaved || 0;
          totalCostSavedUSD += d.costSavedUSD || 0;
        } else if (d.actionType === "knowledge_hit") {
          knowledgeHits++;
          totalTokensSaved += d.tokensSaved || 0;
          totalCostSavedUSD += d.costSavedUSD || 0;
        } else {
          cacheMisses++;
        }

        const totalReqTokens = (d.inputTokens || 0) + (d.outputTokens || 0);
        totalTokensProcessed += totalReqTokens;
        totalCostUSD += d.estimatedCostUSD || 0;
        totalLatencyMs += d.responseTimeMs || 0;

        const comp = d.complexity || "easy";
        if (comp === "easy" || comp === "simple") complexityBreakdown.simple++;
        else if (comp === "medium") complexityBreakdown.medium++;
        else complexityBreakdown.complex++;

        const m = d.modelUsed || "cache";
        modelDistribution[m] = (modelDistribution[m] || 0) + 1;

        latestLogs.push({
          id: d.id || docSnap.id,
          timestamp: d.timestamp || new Date().toISOString(),
          type: d.actionType || "llm_call",
          details: `[${(d.actionType || "llm").toUpperCase()}] ${d.queryText ? d.queryText.slice(0, 45) : "Request"}... (${d.modelUsed || "cache"})`,
          tokens: totalReqTokens,
          costUSD: d.estimatedCostUSD || 0
        });
      });

      latestLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch (err) {
      console.warn("[Token Engine] Failed to fetch analytics from Firestore:", err);
    }

    const cacheHitRate = totalRequests > 0 ? Math.round(((cacheHits + knowledgeHits) / totalRequests) * 100) : 0;
    const averageResponseTimeMs = totalRequests > 0 ? Math.round(totalLatencyMs / totalRequests) : 0;

    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      cacheHitRate,
      knowledgeHits,
      totalTokensProcessed,
      totalTokensSaved,
      totalCostUSD,
      totalCostSavedUSD,
      averageResponseTimeMs,
      complexityBreakdown,
      modelDistribution,
      latestLogs: latestLogs.slice(0, 20)
    };
  }
}

export const productionTokenEngine = new ProductionTokenEngine();
