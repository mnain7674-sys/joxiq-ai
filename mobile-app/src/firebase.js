import { initializeApp, getApps } from "firebase/app";
import { 
  initializeAuth, 
  getReactNativePersistence, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const db = getFirestore(app);

export { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp 
};
