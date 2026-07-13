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

export async function syncUserToFirestore(user: { uid: string; email: string | null; displayName: string | null; isPro?: boolean }) {
  if (!user || !user.email) return;
  const userRef = doc(db, "users", user.uid || user.email);
  const snap = await getDoc(userRef);
  const now = new Date().toISOString();
  
  if (!snap.exists()) {
    await setDoc(userRef, {
      id: user.uid || user.email,
      uid: user.uid,
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      role: user.email.toLowerCase() === "mnain7674@gmail.com" ? "Owner Admin" : "Standard User",
      status: "Active",
      createdAt: now,
      lastLogin: now,
      subscriptionStatus: user.isPro ? "Pro" : "Free",
      tokensUsed: "150"
    });
    try {
      await setDoc(doc(collection(db, "audit_logs")), {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: Date.now(),
        user: user.email,
        action: "USER_SIGNUP",
        status: "SUCCESS",
        ip: "Web Client"
      });
    } catch (e) {
      console.error("Failed to log signup audit", e);
    }
  } else {
    await updateDoc(userRef, {
      uid: user.uid,
      lastLogin: now,
      ...(user.displayName ? { name: user.displayName } : {})
    });
    try {
      await setDoc(doc(collection(db, "audit_logs")), {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestamp: Date.now(),
        user: user.email,
        action: "USER_LOGIN",
        status: "SUCCESS",
        ip: "Web Client"
      });
    } catch (e) {
      console.error("Failed to log login audit", e);
    }
  }
}
