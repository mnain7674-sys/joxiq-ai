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
  priceUSD: number;
  billingCycle: "forever" | "monthly" | "yearly";
  formattedPrice: string;
  formattedPriceQR: string;
  formattedPriceUSD: string;
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
    name: "Starter Plan",
    priceQAR: 0,
    priceUSD: 0,
    billingCycle: "forever",
    formattedPrice: "Free ($0.00 USD / 0 QR)",
    formattedPriceQR: "0 QR",
    formattedPriceUSD: "$0.00 USD",
    monthlyTokenLimit: 25000, // 25,000 tokens/month
    maxOutputTokensPerRequest: 800,
    description: "Essential AI capabilities for casual research, quick answers, and foundational queries.",
    adsEnabled: true,
    pdfLimitMB: 2,
    dailyImageQuestions: 5,
    features: [
      "25,000 High-Speed Monthly Tokens",
      "Access to Core AI Models",
      "Standard Query & Document Processing",
      "Basic PDF & Image Analysis (Up to 2MB)",
      "Daily Image Generation Allowance (5 / day)",
      "Standard Response Speed & Encryption",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash"],
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceQAR: 36,
    priceUSD: 9.90,
    billingCycle: "monthly",
    formattedPrice: "36 QR ($9.90 USD) / mo",
    formattedPriceQR: "36 QR / mo",
    formattedPriceUSD: "$9.90 USD / mo",
    monthlyTokenLimit: 300000, // 300,000 tokens/month
    maxOutputTokensPerRequest: 2048,
    popular: true,
    badge: "Most Popular",
    description: "Advanced productivity suite designed for students, researchers, and busy professionals.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "300,000 Premium Monthly Tokens",
      "Full Access to Pro-Tier AI Engine & Vision",
      "Priority Processing with Ultra-Low Latency",
      "Expanded PDF & High-Res Document Analysis (Up to 10MB)",
      "Unlimited AI Image Generation & Vision Inquiries",
      "Extended Context Memory & Multi-turn Reasoning",
      "Ad-Free Clean Workspace Experience",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  annual: {
    id: "annual",
    name: "Annual Pro",
    priceQAR: 300,
    priceUSD: 82.50,
    billingCycle: "yearly",
    formattedPrice: "300 QR ($82.50 USD) / yr",
    formattedPriceQR: "300 QR / yr",
    formattedPriceUSD: "$82.50 USD / yr",
    monthlyTokenLimit: 300000, // 300,000 tokens/month
    maxOutputTokensPerRequest: 2048,
    badge: "Save 30%",
    description: "Maximum value subscription offering full Pro features at a 30% discounted annual rate.",
    adsEnabled: false,
    pdfLimitMB: 10,
    dailyImageQuestions: "unlimited",
    features: [
      "300,000 Premium Monthly Tokens",
      "Save 30% Compared to Monthly Billing ($82.50/yr or 300 QR)",
      "Complete Pro Suite Features",
      "Priority 24/7 Dedicated Support Channel",
      "Unlimited Document & PDF Analysis (Up to 10MB)",
      "Multi-Device Cross-Platform Synchronization",
      "Ad-Free & Custom Workspace Personalization",
    ],
    allowedModels: ["gpt-5-mini", "gemini-2.5-flash", "claude-3-haiku-20240307"],
  },
  ultra: {
    id: "ultra",
    name: "Ultra",
    priceQAR: 99,
    priceUSD: 27.20,
    billingCycle: "monthly",
    formattedPrice: "99 QR ($27.20 USD) / mo",
    formattedPriceQR: "99 QR / mo",
    formattedPriceUSD: "$27.20 USD / mo",
    monthlyTokenLimit: 1000000, // 1,000,000 tokens/month
    maxOutputTokensPerRequest: 4096,
    badge: "Maximum Power",
    description: "Unrestricted high-throughput engine tailored for heavy developers, power users, and data analysts.",
    adsEnabled: false,
    pdfLimitMB: 50,
    dailyImageQuestions: "unlimited",
    features: [
      "1,000,000 High-Capacity Monthly Tokens (1 Million)",
      "Top-Tier Premium Models (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)",
      "Highest Processing Priority & Dedicated VIP Compute Nodes",
      "Large File & Heavy PDF Analysis (Up to 50MB)",
      "Advanced Memory & Complex Code Generation Capabilities",
      "Unlimited Visual Analysis & AI Vision Inquiries",
      "24/7 VIP Concierge & Fast-Track Feature Access",
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
