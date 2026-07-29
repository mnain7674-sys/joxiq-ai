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
    monthlyTokenLimit: 25000, // 25,000 tokens/month
    maxOutputTokensPerRequest: 800,
    description: "Essential AI tools for students and curious learners.",
    adsEnabled: true,
    pdfLimitMB: 2,
    dailyImageQuestions: 5,
    features: [
      "25,000 Tokens per Month",
      "Core AI Models",
      "Standard Response Speed",
      "Limited Messages & File Uploads",
      "Limited Image Generation (5/day)",
      "Limited Memory & Context",
      "Limited AI Vision & PDF Analysis (up to 2MB)",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash"],
  },
  pro: {
    id: "pro",
    name: "Pro Plan",
    priceQAR: 36,
    billingCycle: "monthly",
    formattedPrice: "36 QAR / mo",
    monthlyTokenLimit: 300000, // 300,000 tokens/month
    maxOutputTokensPerRequest: 2048,
    popular: true,
    badge: "Most Popular",
    description: "Complete AI toolkit for dedicated students and learners.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "300,000 Tokens per Month",
      "Standard AI Models",
      "Faster Response Speed & Priority Processing",
      "High Message Limit & High File Upload Limit",
      "High Image Generation Limit",
      "Extended Memory & Multi-turn context",
      "Full AI Vision & Full PDF/Document Analysis (up to 10MB)",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  annual: {
    id: "annual",
    name: "Annual Value Plan",
    priceQAR: 300,
    billingCycle: "yearly",
    formattedPrice: "300 QAR / yr",
    monthlyTokenLimit: 300000, // 300,000 tokens/month
    maxOutputTokensPerRequest: 2048,
    badge: "Save 30%",
    description: "Best long-term value package with Pro plan capabilities.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "300,000 Tokens per Month",
      "Same complete features as Pro plan (300 QAR/yr)",
      "Standard AI Models & Faster Response Speed",
      "High Message Limit & High File Upload Limit",
      "High Image Generation Limit",
      "Extended Memory & Full AI Vision / PDF Analysis",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  ultra: {
    id: "ultra",
    name: "Ultra Power Plan",
    priceQAR: 99,
    billingCycle: "monthly",
    formattedPrice: "99 QAR / mo",
    monthlyTokenLimit: 1000000, // 1,000,000 tokens/month
    maxOutputTokensPerRequest: 4096,
    badge: "Maximum Power",
    description: "Ultimate high-capacity AI experience for advanced research and heavy coding.",
    adsEnabled: false,
    pdfLimitMB: 50,
    dailyImageQuestions: "unlimited",
    features: [
      "1,000,000 Tokens per Month (1 Million Tokens)",
      "Premium AI Models",
      "Fastest Response Speed & Highest Processing Priority",
      "Highest Message Limit & Highest File Upload Limit",
      "Highest Image Generation Limit",
      "Advanced Memory & Long-context reasoning",
      "Full AI Vision with Priority Processing",
      "Full PDF & Document Analysis with Priority Processing (up to 50MB)",
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
