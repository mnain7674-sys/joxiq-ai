import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD6JiZYZQE3tP3Opskq5Gshg34B-UAPbiA",
  authDomain: "joxiq-ai.firebaseapp.com",
  projectId: "joxiq-ai",
  storageBucket: "joxiq-ai.firebasestorage.app",
  messagingSenderId: "698536954361",
  appId: "1:698536954361:web:c7f2c1bcdb01f5cee5d528",
  measurementId: "G-NRTW7JK3XB"
};

export const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((error) => {
  console.error("Auth persistence error:", error);
});
export const db = getFirestore(app);
export { doc, getDoc, setDoc, updateDoc, collection, getDocs };
export const googleProvider = new GoogleAuthProvider();

export async function syncUserToFirestore(user: { uid?: string; email: string; displayName?: string; isPro?: boolean }) {
  try {
    const userRef = doc(db, "users", user.email);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        id: user.uid || `u-${Date.now()}`,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        role: user.email === "mnain7674@gmail.com" ? "Owner Admin" : "Standard User",
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
        lastLogin: "Just now",
        subscriptionStatus: user.email === "mnain7674@gmail.com" ? "Pro VIP 👑" : "Free",
        tokensUsed: "0",
      });
    } else {
      await updateDoc(userRef, {
        lastLogin: "Just now",
      });
    }
  } catch (error) {
    console.error("Error syncing user to Firestore:", error);
  }
}
export async function logTokenUsageToFirestore(usage: {
  userId: string;
  userEmail: string;
  modelUsed: string;
  providerUsed: string;
  requestType: string;
  complexity: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  timestamp: number;
  dateKey?: string;
}) {
  try {
    const aiUsageCol = collection(db, "ai_usage");
    const docRef = doc(aiUsageCol);
    await setDoc(docRef, {
      ...usage,
      id: docRef.id,
      dateKey: usage.dateKey || new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString()
    });

    // Increment user total token count in user document
    if (usage.userId && usage.userId !== "anonymous") {
      const userRef = doc(db, "users", usage.userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const currentUsed = parseInt(userSnap.data().tokensUsed || "0", 10);
        await updateDoc(userRef, {
          tokensUsed: (currentUsed + usage.totalTokens).toString()
        });
      }
    }
  } catch (error) {
    console.error("Failed to log token usage to Firestore:", error);
  }
}

export async function getUsageMetricsFromFirestore() {
  try {
    const aiUsageCol = collection(db, "ai_usage");
    const snap = await getDocs(aiUsageCol);
    
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalTokens = 0;
    let totalCostUSD = 0;

    const costByModel: Record<string, number> = {};
    const countByFeature: Record<string, number> = {};
    const tokensByUser: Record<string, { email: string; tokens: number; cost: number; requests: number }> = {};
    const logs: any[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const tokens = data.totalTokens || 0;
      const cost = data.estimatedCost || 0;
      const model = data.modelUsed || "unknown";
      const requestType = data.requestType || "general";
      const userKey = data.userEmail || data.userId || "anonymous";

      totalInputTokens += data.inputTokens || 0;
      totalOutputTokens += data.outputTokens || 0;
      totalTokens += tokens;
      totalCostUSD += cost;

      costByModel[model] = (costByModel[model] || 0) + cost;
      countByFeature[requestType] = (countByFeature[requestType] || 0) + 1;

      if (!tokensByUser[userKey]) {
        tokensByUser[userKey] = { email: userKey, tokens: 0, cost: 0, requests: 0 };
      }
      tokensByUser[userKey].tokens += tokens;
      tokensByUser[userKey].cost += cost;
      tokensByUser[userKey].requests += 1;

      logs.push(data);
    });

    return {
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      totalCostUSD,
      totalRequests: snap.size,
      costByModel,
      countByFeature,
      tokensByUser,
      logs: logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
    };
  } catch (error) {
    console.error("Failed to fetch usage metrics from Firestore:", error);
    return null;
  }
}
