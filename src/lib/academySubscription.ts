import { ClassItem, CourseModule } from "../types/learning";

export interface AcademyTransaction {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string; // "$14.99"
  planName: string; // "JOXIQ AI Learning Academy Pro"
  paymentMethod: string; // "Visa •••• 4242", "Apple Pay", "PayPal", etc.
  status: "Paid" | "Refunded" | "Failed";
  cardBrand?: string;
  last4?: string;
}

export interface AcademySubscriptionState {
  planId: "learning_academy_pro" | "free";
  planName: string; // "JOXIQ AI Learning Academy Pro"
  price: string; // "$14.99/month"
  status: "Active" | "Expired" | "Cancelled" | "None";
  startDate: string | null;
  expiryDate: string | null; // ISO string
  autoRenew: boolean;
  userEmail: string | null;
  transactions: AcademyTransaction[];
}

const STORAGE_KEY = "joxiq_academy_sub_v1";

const DEFAULT_SUB_STATE: AcademySubscriptionState = {
  planId: "free",
  planName: "Free Learner",
  price: "$0.00",
  status: "None",
  startDate: null,
  expiryDate: null,
  autoRenew: false,
  userEmail: null,
  transactions: [],
};

/**
 * Retrieves the current Academy Subscription state from local storage or defaults.
 * Automatically handles status transitions from Active/Cancelled to Expired if past expiryDate.
 */
export function getAcademySubscription(userEmail?: string): AcademySubscriptionState {
  if (typeof window === "undefined") return DEFAULT_SUB_STATE;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SUB_STATE;

    const parsed: AcademySubscriptionState = JSON.parse(raw);

    // If email provided and doesn't match stored user, allow matching or update
    if (userEmail && parsed.userEmail && parsed.userEmail.toLowerCase() !== userEmail.toLowerCase()) {
      // Return fresh state for different user
      return { ...DEFAULT_SUB_STATE, userEmail };
    }

    // Check expiry
    if (parsed.expiryDate) {
      const expiryTime = new Date(parsed.expiryDate).getTime();
      const now = Date.now();
      if (now > expiryTime && parsed.status !== "None") {
        parsed.status = "Expired";
        parsed.autoRenew = false;
        saveAcademySubscription(parsed);
      }
    }

    return parsed;
  } catch (err) {
    console.error("Error reading academy subscription state:", err);
    return DEFAULT_SUB_STATE;
  }
}

/**
 * Saves Academy Subscription state to local storage and dispatches update event.
 */
export function saveAcademySubscription(state: AcademySubscriptionState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new Event("joxiq_academy_sub_updated"));
  } catch (err) {
    console.error("Error saving academy subscription state:", err);
  }
}

/**
 * Returns true if user has active Learning Academy Pro access.
 */
export function isAcademyProActive(userEmail?: string): boolean {
  const sub = getAcademySubscription(userEmail);
  if (sub.status === "Active") return true;
  if (sub.status === "Cancelled" && sub.expiryDate) {
    // If cancelled, access remains valid until end of billing cycle (expiryDate)
    return new Date(sub.expiryDate).getTime() > Date.now();
  }
  return false;
}

/**
 * Records a successful purchase of JOXIQ AI Learning Academy Pro ($14.99/mo).
 */
export function recordAcademyProPurchase(params: {
  userEmail?: string;
  paymentMethod: string;
  last4?: string;
  cardBrand?: string;
  transactionId?: string;
}): AcademySubscriptionState {
  const now = new Date();
  const expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

  const invoiceNum = `JLA-INV-${Math.floor(100000 + Math.random() * 900000)}`;
  const txId = params.transactionId || `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const currentSub = getAcademySubscription(params.userEmail);

  const newTx: AcademyTransaction = {
    id: txId,
    invoiceNumber: invoiceNum,
    date: now.toISOString().split("T")[0],
    amount: "$14.99",
    planName: "JOXIQ AI Learning Academy Pro",
    paymentMethod: params.paymentMethod,
    status: "Paid",
    cardBrand: params.cardBrand,
    last4: params.last4,
  };

  const updatedSub: AcademySubscriptionState = {
    planId: "learning_academy_pro",
    planName: "JOXIQ AI Learning Academy Pro",
    price: "$14.99/month",
    status: "Active",
    startDate: currentSub.startDate || now.toISOString(),
    expiryDate: expiry.toISOString(),
    autoRenew: true,
    userEmail: params.userEmail || currentSub.userEmail || null,
    transactions: [newTx, ...(currentSub.transactions || [])],
  };

  saveAcademySubscription(updatedSub);
  return updatedSub;
}

/**
 * Cancels auto-renewal for Learning Academy Pro.
 * Access remains active until expiry date.
 */
export function cancelAcademySubscription(userEmail?: string): AcademySubscriptionState {
  const sub = getAcademySubscription(userEmail);
  sub.status = "Cancelled";
  sub.autoRenew = false;
  saveAcademySubscription(sub);
  return sub;
}

/**
 * Renews or resumes Learning Academy Pro subscription.
 */
export function renewAcademySubscription(params: {
  userEmail?: string;
  paymentMethod?: string;
}): AcademySubscriptionState {
  return recordAcademyProPurchase({
    userEmail: params.userEmail,
    paymentMethod: params.paymentMethod || "Saved Payment Method",
  });
}
