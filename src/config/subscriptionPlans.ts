/**
 * Subscription Plans & Token Quotas for JOXIQ AI
 * Currency: QAR (Qatari Riyal)
 * 1 QAR ≈ 0.275 USD
 */

export type SubscriptionPlanId = "free" | "pro" | "annual" | "ultra";

export interface SubscriptionPlanDetails {
  id: SubscriptionPlanId;
  name: string;
  priceQAR: number;
  billingCycle: "forever" | "monthly" | "yearly";
  formattedPrice: string;
  monthlyTokenLimit: number;
  maxOutputTokensPerRequest: number;
  badge?: string;
  popular?: boolean;
  description: string;
  features: string[];
  allowedModels: string[];
  pdfLimitMB: number;
  dailyImageQuestions: number | "unlimited";
  adsEnabled: boolean;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionPlanId, SubscriptionPlanDetails> = {
  free: {
    id: "free",
    name: "Free Plan",
    priceQAR: 0,
    billingCycle: "forever",
    formattedPrice: "Free",
    monthlyTokenLimit: 100000, // ~3,300 tokens/day
    maxOutputTokensPerRequest: 800,
    description: "Essential AI tools for students and curious learners.",
    adsEnabled: true,
    pdfLimitMB: 2,
    dailyImageQuestions: 5,
    features: [
      "Basic AI access (GPT-5 mini & Gemini Flash)",
      "Limited daily questions",
      "Ads enabled",
      "Limited image question solving (5/day)",
      "Small PDF analysis (up to 2MB)",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash"],
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    priceQAR: 36,
    billingCycle: "monthly",
    formattedPrice: "36 QAR / mo",
    monthlyTokenLimit: 1500000, // ~50,000 tokens/day
    maxOutputTokensPerRequest: 2048,
    popular: true,
    badge: "Most Popular",
    description: "Complete AI toolkit for dedicated students and learners.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "AI Tutor & Homework helper",
      "English learning assistant & Grammar correction",
      "MCQ / CQ question generator",
      "Study planner & basic coding helper",
      "Image question solving (Unlimited)",
      "Small PDF document analysis (up to 10MB)",
      "Ad-Free experience & faster response times",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  annual: {
    id: "annual",
    name: "Annual Value Plan",
    priceQAR: 300,
    billingCycle: "yearly",
    formattedPrice: "300 QAR / yr",
    monthlyTokenLimit: 1500000, // Same features & limits as Pro
    maxOutputTokensPerRequest: 2048,
    badge: "Save 30%",
    description: "Best long-term value package with Pro plan capabilities.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "Same complete features as Pro plan",
      "300 QAR/year (Save 132 QAR vs monthly Pro)",
      "AI Tutor, Homework Help & English Assistant",
      "MCQ/CQ Generator & Study Planner",
      "Image Question Solving & Small PDF Analysis",
      "Controlled usage limits for sustained cost protection",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  ultra: {
    id: "ultra",
    name: "Ultra Power Plan",
    priceQAR: 99,
    billingCycle: "monthly",
    formattedPrice: "99 QAR / mo",
    monthlyTokenLimit: 6000000, // ~200,000 tokens/day
    maxOutputTokensPerRequest: 4096,
    badge: "Maximum Power",
    description: "Ultimate high-capacity AI experience for advanced research and heavy coding.",
    adsEnabled: false,
    pdfLimitMB: 50,
    dailyImageQuestions: "unlimited",
    features: [
      "Everything in Pro & Annual plans",
      "4x Higher AI monthly token limit (6 Million tokens)",
      "Large PDF & long document research analysis (up to 50MB)",
      "Advanced research assistant & Coding mentor",
      "Voice tutor capabilities",
      "Access to flagship models (Claude 3.5 Sonnet & GPT-4o)",
      "Priority server processing & ultra-fast generation",
    ],
    allowedModels: [
      "gpt-5-mini",
      "gpt-4o",
      "gemini-2.5-flash",
      "gemini-1.5-pro",
      "claude-3-haiku-20240307",
      "claude-3-5-sonnet-20241022",
    ],
  },
};

// Exchange rate helper (1 QAR = 0.275 USD)
export const QAR_TO_USD_RATE = 0.275;

export function qarToUSD(qar: number): number {
  return Number((qar * QAR_TO_USD_RATE).toFixed(2));
}
