/**
 * JOXIQ AI Personalization & Adaptive Response System
 * Tracks user patterns (tone, expertise level, preferred length, interests)
 * and dynamically customizes AI system instructions with Firestore persistence.
 */

import { db, doc, getDoc, setDoc } from "../lib/firebase.js";

export interface UserProfile {
  userId: string;
  tone: "formal" | "casual" | "neutral";
  expertiseLevel: "beginner" | "intermediate" | "expert" | "unknown";
  preferredLength: "short" | "medium" | "detailed";
  interests: Record<string, number>;
  messageCount: number;
  avgMessageLength: number;
}

const FORMAL_MARKERS = ["please", "kindly", "sir", "madam", "aponi", "korben", "dhonnobad", "onugroho"];
const CASUAL_MARKERS = ["lol", "bro", "vai", "hehe", "tui", "ki obostha", "dost"];

const EXPERT_MARKERS = [
  "api", "database", "algorithm", "architecture", "deploy", "framework",
  "optimize", "kubernetes", "docker", "sql", "async", "endpoint",
];
const BEGINNER_MARKERS = [
  "kivabe shuru", "bujhi na", "sohoj kore bolo", "prothom bar",
  "ki eta", "shikhte chai",
];

const INTEREST_KEYWORDS: Record<string, string[]> = {
  coding: ["code", "programming", "python", "javascript", "developer", "typescript", "react"],
  business: ["business", "startup", "marketing", "shop", "customer", "sales", "revenue"],
  language_learning: ["english", "grammar", "vocabulary", "speaking", "language shikha", "bangla"],
  study: ["exam", "study", "porashuna", "school", "college", "university", "math"],
  health: ["health", "diet", "exercise", "workout", "medicine", "fitness"],
};

export class PersonalizationEngine {
  private _profiles: Map<string, UserProfile> = new Map();

  public async getProfile(userId: string): Promise<UserProfile> {
    if (this._profiles.has(userId)) {
      return this._profiles.get(userId)!;
    }

    // Attempt loading from Firestore 'user_profiles'
    try {
      const docRef = doc(db, "user_profiles", userId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as UserProfile;
        this._profiles.set(userId, data);
        return data;
      }
    } catch (e) {
      console.warn("[PersonalizationEngine] Firestore fetch warning:", e);
    }

    const newProfile: UserProfile = {
      userId,
      tone: "neutral",
      expertiseLevel: "unknown",
      preferredLength: "medium",
      interests: {},
      messageCount: 0,
      avgMessageLength: 0,
    };
    this._profiles.set(userId, newProfile);
    return newProfile;
  }

  public async updateFromMessage(userId: string, message: string): Promise<UserProfile> {
    const profile = await this.getProfile(userId);
    const lowered = message.toLowerCase();

    // ---- Tone Analysis ----
    let formalHits = 0;
    for (const w of FORMAL_MARKERS) {
      if (lowered.includes(w)) formalHits++;
    }

    let casualHits = 0;
    for (const w of CASUAL_MARKERS) {
      if (lowered.includes(w)) casualHits++;
    }

    if (formalHits > casualHits) {
      profile.tone = "formal";
    } else if (casualHits > formalHits) {
      profile.tone = "casual";
    }

    // ---- Expertise Level Analysis ----
    if (EXPERT_MARKERS.some((w) => lowered.includes(w))) {
      profile.expertiseLevel = "expert";
    } else if (BEGINNER_MARKERS.some((w) => lowered.includes(w))) {
      profile.expertiseLevel = "beginner";
    }

    // ---- Preferred Length Analysis ----
    const wordCount = message.trim().split(/\s+/).filter(Boolean).length;
    profile.messageCount += 1;
    profile.avgMessageLength =
      (profile.avgMessageLength * (profile.messageCount - 1) + wordCount) / profile.messageCount;

    if (profile.avgMessageLength < 8) {
      profile.preferredLength = "short";
    } else if (profile.avgMessageLength > 30) {
      profile.preferredLength = "detailed";
    } else {
      profile.preferredLength = "medium";
    }

    // ---- Interests Analysis ----
    for (const [tag, keywords] of Object.entries(INTEREST_KEYWORDS)) {
      if (keywords.some((kw) => lowered.includes(kw))) {
        profile.interests[tag] = (profile.interests[tag] || 0) + 1;
      }
    }

    this._profiles.set(userId, profile);

    // Save to Firestore 'user_profiles'
    try {
      const docRef = doc(db, "user_profiles", userId);
      await setDoc(docRef, profile, { merge: true });
    } catch (e) {
      console.warn("[PersonalizationEngine] Firestore save warning:", e);
    }

    return profile;
  }

  public async buildPersonalizedInstruction(userId: string): Promise<string> {
    const profile = await this.getProfile(userId);
    const lines: string[] = [];

    if (profile.tone === "formal") {
      lines.push("Ei user formal bhabe kotha bole - shomman kore, formal tone-e uttor din.");
    } else if (profile.tone === "casual") {
      lines.push("Ei user casual/bondhusulov bhabe kotha bole - relax, friendly tone use korun.");
    }

    if (profile.expertiseLevel === "expert") {
      lines.push("Ei user technical/experienced - detail-e jaan, jargon thik ache, basic jinis explain korar dorkar nei.");
    } else if (profile.expertiseLevel === "beginner") {
      lines.push("Ei user beginner - shohoj bhasha use korun, jargon ekrale seta explain kore din, step-by-step bujhan.");
    }

    if (profile.preferredLength === "short") {
      lines.push("Ei user chotto, to-the-point answer pochondo kore - beshi lomba na kore mul kotha shorashori bolun.");
    } else if (profile.preferredLength === "detailed") {
      lines.push("Ei user detailed answer pochondo kore - proyojon-e example soho bistarito bolte paren.");
    }

    const sortedInterests = Object.entries(profile.interests)
      .sort((a, b) => b[1] - a[1])
      .map(([tag]) => tag)
      .slice(0, 2);

    if (sortedInterests.length > 0) {
      lines.push(`Ei user-er agroher bishoy: ${sortedInterests.join(", ")} - proyojon hole eguloar shathe relate kore bolun.`);
    }

    if (lines.length === 0) {
      return "";
    }

    return "\n\nEi specific user-er jonno extra guideline:\n- " + lines.join("\n- ");
  }
}

export const personalizationEngine = new PersonalizationEngine();
