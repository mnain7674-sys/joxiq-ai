import { db, doc, setDoc, deleteDoc, collection, getDocs } from "./firebase";
import { Conversation, Message } from "../types";

export interface FirestoreChatDocument {
  chatId: string;
  userId: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  lastMessage: string;
  messages: Message[];
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  useSearch?: boolean;
  isFavorite?: boolean;
}

/**
 * Save or update a single conversation in Firestore under users/{userId}/chats/{chatId}
 */
export async function saveChatToFirestore(userId: string, chat: Conversation) {
  if (!userId || !chat || !chat.id) return;
  try {
    const chatRef = doc(db, "users", userId, "chats", chat.id);
    const lastMsgText =
      chat.messages && chat.messages.length > 0
        ? (chat.messages[chat.messages.length - 1].content || "").substring(0, 150)
        : "";

    // Clean payload for Firestore
    const payload: FirestoreChatDocument = {
      chatId: chat.id,
      userId: userId,
      title: chat.title || "New Chat",
      createdAt: chat.timestamp || Date.now(),
      updatedAt: Date.now(),
      lastMessage: lastMsgText,
      messages: (chat.messages || []).map((m) => {
        const cleanMsg: Message = {
          id: m.id || Math.random().toString(36).substring(2, 11),
          role: m.role,
          content: m.content || "",
          timestamp: m.timestamp || Date.now(),
        };
        if (m.image) cleanMsg.image = m.image;
        if (m.document) cleanMsg.document = m.document;
        if (m.pdfExport) cleanMsg.pdfExport = m.pdfExport;
        if (m.grounding) cleanMsg.grounding = m.grounding;
        if (m.rating) cleanMsg.rating = m.rating;
        return cleanMsg;
      }),
      model: chat.model || "gemini-2.5-flash",
      systemInstruction: chat.systemInstruction || "",
      temperature: typeof chat.temperature === "number" ? chat.temperature : 0.7,
      useSearch: typeof chat.useSearch === "boolean" ? chat.useSearch : true,
      isFavorite: !!chat.isFavorite,
    };

    await setDoc(chatRef, payload, { merge: true });
  } catch (err) {
    console.error("Failed to save chat to Firestore:", err);
  }
}

/**
 * Fetch all conversations for a user from users/{userId}/chats sorted by updatedAt descending
 */
export async function loadUserChatsFromFirestore(userId: string): Promise<Conversation[]> {
  if (!userId) return [];
  try {
    const chatsCol = collection(db, "users", userId, "chats");
    const snap = await getDocs(chatsCol);
    const chats: Conversation[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data && data.chatId && Array.isArray(data.messages)) {
        chats.push({
          id: data.chatId,
          title: data.title || "New Chat",
          messages: data.messages || [],
          model: data.model || "gemini-2.5-flash",
          systemInstruction: data.systemInstruction || "",
          temperature: typeof data.temperature === "number" ? data.temperature : 0.7,
          useSearch: typeof data.useSearch === "boolean" ? data.useSearch : true,
          timestamp:
            typeof data.updatedAt === "number"
              ? data.updatedAt
              : typeof data.createdAt === "number"
              ? data.createdAt
              : Date.now(),
          isFavorite: !!data.isFavorite,
        });
      }
    });

    // Sort by timestamp/updatedAt descending
    chats.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    return chats;
  } catch (err) {
    console.error("Failed to load user chats from Firestore:", err);
    return [];
  }
}

/**
 * Delete a single conversation from Firestore
 */
export async function deleteChatFromFirestore(userId: string, chatId: string) {
  if (!userId || !chatId) return;
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await deleteDoc(chatRef);
  } catch (err) {
    console.error("Failed to delete chat from Firestore:", err);
  }
}

/**
 * Rename a chat title in Firestore
 */
export async function renameChatInFirestore(userId: string, chatId: string, newTitle: string) {
  if (!userId || !chatId || !newTitle) return;
  try {
    const chatRef = doc(db, "users", userId, "chats", chatId);
    await setDoc(chatRef, { title: newTitle, updatedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.error("Failed to rename chat in Firestore:", err);
  }
}
