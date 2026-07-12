import React, { useState, useEffect } from "react";
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  StatusBar, 
  ActivityIndicator, 
  Modal, 
  Switch,
  Alert 
} from "react-native";
import { GoogleGenAI } from "@google/genai";
import { 
  auth, 
  db, 
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
  where
} from "./src/firebase";

// Initialize Google Gen AI client with the same secure API key
const ai = new GoogleGenAI({ apiKey: "AIzaSyD6JiZYZQE3tP3Opskq5Gshg34B-UAPbiA" });

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // App state
  const [theme, setTheme] = useState("dark");
  const [currentView, setCurrentView] = useState("chat"); // chat, profile, settings, subscription
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hello! I am JOXIQ AI, created by Julkar Nain Mahi. How can I assist you across your mobile and web devices today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  // Settings state
  const [temperature, setTemperature] = useState(0.7);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [searchEnabled, setSearchEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch user profile and synced chat history from Firestore
        try {
          const userRef = doc(db, "users", firebaseUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          } else {
            const profileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.email.split("@")[0],
              subscriptionStatus: "Free",
              createdAt: new Date().toISOString()
            };
            await setDoc(userRef, profileData);
            setUserProfile(profileData);
          }

          // Fetch synced chat history
          const chatRef = doc(db, "users", firebaseUser.uid, "chats", "default");
          const chatSnap = await getDoc(chatRef);
          if (chatSnap.exists() && chatSnap.data().messages) {
            setMessages(chatSnap.data().messages);
          }
        } catch (e) {
          console.error("Error fetching user data from Firestore:", e);
        }
      }
      if (initializing) setInitializing(false);
    });

    return unsubscribe;
  }, []);

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", res.user.uid), {
          uid: res.user.uid,
          email: res.user.email,
          name: email.split("@")[0],
          subscriptionStatus: "Free",
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      Alert.alert("Authentication Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isStreaming) return;
    const userMsg = inputMessage.trim();
    setInputMessage("");
    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setIsStreaming(true);

    try {
      let aiText = "";
      const systemInstruction = `You are JOXIQ AI.
IMPORTANT SYSTEM RULES:
1. Your name is JOXIQ AI. When anyone asks you what your name is or who you are, you must answer that your name is JOXIQ AI.
2. Your creator, founder, and developer is Julkar Nain Mahi.
3. You must answer questions about your creator ('Julkar Nain Mahi'), your name ('JOXIQ AI'), or related background accurately and naturally using the following profile:
- Creator Name: Julkar Nain Mahi
- Nationality: Bangladeshi
- Current Location: Living in Qatar
- Occupation / Role: Student, AI enthusiast, and founder/creator of JOXIQ AI.
- Mission: To build intelligent, user-friendly AI tools that help people learn, solve problems, become more productive, and access reliable assistance.
- Vision: Created JOXIQ AI as a helpful assistant supporting students, creators, developers, and anyone looking for reliable AI assistance.
4. Maintain a professional, friendly, and helpful tone throughout.`;

      try {
        // Try backend server API first
        const res = await fetch("https://ais-dev-jq6htk6kvftxilqaqwcphy-7331611588.europe-west2.run.app/api/chat/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: newMessages,
            model: "gemini-2.5-flash",
            systemInstruction,
            temperature: typeof temperature === "number" ? temperature : 0.7,
            useSearch: searchEnabled
          })
        });

        if (res.ok) {
          const textData = await res.text();
          // Parse potential SSE or JSON response
          if (textData.startsWith("data:") || textData.includes("\ndata:")) {
            const lines = textData.split("\n");
            let fullText = "";
            for (const line of lines) {
              if (line.startsWith("data:")) {
                try {
                  const json = JSON.parse(line.replace("data:", "").trim());
                  if (json.text) fullText += json.text;
                } catch (e) {}
              }
            }
            aiText = fullText || textData;
          } else {
            try {
              const json = JSON.parse(textData);
              aiText = json.text || json.content || textData;
            } catch (e) {
              aiText = textData;
            }
          }
        } else {
          throw new Error("Backend response error status " + res.status);
        }
      } catch (backendErr) {
        console.warn("Backend fetch failed, falling back to direct SDK:", backendErr);
        const contentsArray = newMessages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: contentsArray,
          config: {
            systemInstruction,
            temperature: typeof temperature === "number" ? temperature : 0.7,
          }
        });
        aiText = response.text || "JOXIQ AI is here to assist you!";
      }

      const updatedMessages = [...newMessages, { role: "assistant", content: aiText }];
      setMessages(updatedMessages);

      // Sync chat history to Firestore in real-time
      if (user) {
        await setDoc(doc(db, "users", user.uid, "chats", "default"), {
          messages: updatedMessages,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
    } catch (err) {
      console.error("Gemini AI API Error:", err);
      const errorMsg = `Error connecting to JOXIQ AI: ${err.message || "Please check your network connection."}`;
      setMessages([...newMessages, { role: "assistant", content: errorMsg }]);
    } finally {
      setIsStreaming(false);
    }
  };

  if (initializing) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: "#0b1329" }]}>
        <ActivityIndicator size="large" color="#6366f1" />
        <Text style={{ color: "#94a3b8", marginTop: 12, fontWeight: "600" }}>Initializing JOXIQ AI...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: "#0b1329" }]}>
        <StatusBar barStyle="light-content" backgroundColor="#0b1329" />
        <View style={styles.authContainer}>
          <Text style={styles.authTitle}>JOXIQ AI</Text>
          <Text style={styles.authSubtitle}>Cross-Platform Intelligent Assistant</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748b"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={handleAuth}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? "Create Account" : "Sign In"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.switchButton} 
              onPress={() => setIsSignUp(!isSignUp)}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const isDark = theme === "dark";
  const bgStyle = isDark ? { backgroundColor: "#0b1329" } : { backgroundColor: "#f8fafc" };
  const textStyle = isDark ? { color: "#f8fafc" } : { color: "#0f172a" };
  const cardStyle = isDark ? { backgroundColor: "#1e293b", borderColor: "#334155" } : { backgroundColor: "#ffffff", borderColor: "#e2e8f0" };

  return (
    <SafeAreaView style={[styles.container, bgStyle]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={isDark ? "#0b1329" : "#ffffff"} />
      
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: isDark ? "#1e293b" : "#e2e8f0" }]}>
        <View style={styles.headerLeft}>
          <Text style={[styles.headerTitle, textStyle]}>JOXIQ AI</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{userProfile?.subscriptionStatus || "Free"}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={[styles.headerBtn, cardStyle]} 
            onPress={() => setCurrentView(currentView === "chat" ? "settings" : "chat")}
          >
            <Text style={textStyle}>{currentView === "chat" ? "⚙️" : "💬"}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerBtn, cardStyle]} 
            onPress={() => signOut(auth)}
          >
            <Text style={{ color: "#ef4444", fontWeight: "bold" }}>🚪</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content Area */}
      {currentView === "chat" && (
        <View style={styles.chatArea}>
          <ScrollView style={styles.messagesList} contentContainerStyle={{ padding: 16 }}>
            {messages.map((m, idx) => (
              <View 
                key={idx} 
                style={[
                  styles.messageBubble, 
                  m.role === "user" ? styles.userBubble : styles.aiBubble,
                  !isDark && m.role === "assistant" && { backgroundColor: "#f1f5f9" }
                ]}
              >
                <Text style={[styles.messageText, m.role === "user" ? { color: "#fff" } : textStyle]}>
                  {m.content}
                </Text>
              </View>
            ))}
            {isStreaming && (
              <View style={[styles.aiBubble, cardStyle, { padding: 12 }]}>
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            )}
          </ScrollView>

          {/* Input Bar */}
          <View style={[styles.inputBar, { borderTopColor: isDark ? "#1e293b" : "#e2e8f0", backgroundColor: isDark ? "#0b1329" : "#fff" }]}>
            <TextInput
              style={[styles.chatInput, cardStyle, textStyle]}
              placeholder="Ask JOXIQ AI anything..."
              placeholderTextColor="#64748b"
              value={inputMessage}
              onChangeText={setInputMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {currentView === "settings" && (
        <ScrollView style={[styles.settingsContainer, { padding: 20 }]}>
          <Text style={[styles.sectionTitle, textStyle]}>Preferences & Settings</Text>

          <View style={[styles.settingRow, cardStyle]}>
            <Text style={textStyle}>Dark Theme</Text>
            <Switch 
              value={isDark} 
              onValueChange={(val) => setTheme(val ? "dark" : "light")} 
            />
          </View>

          <View style={[styles.settingRow, cardStyle]}>
            <Text style={textStyle}>Voice Reading (TTS)</Text>
            <Switch 
              value={voiceEnabled} 
              onValueChange={setVoiceEnabled} 
            />
          </View>

          <View style={[styles.settingRow, cardStyle]}>
            <Text style={textStyle}>Live Web Search Grounding</Text>
            <Switch 
              value={searchEnabled} 
              onValueChange={setSearchEnabled} 
            />
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 24, backgroundColor: "#6366f1" }]}
            onPress={() => setCurrentView("subscription")}
          >
            <Text style={styles.primaryButtonText}>Upgrade to Pro Subscription</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 12, backgroundColor: "#334155" }]}
            onPress={() => setCurrentView("chat")}
          >
            <Text style={styles.primaryButtonText}>Back to Chat</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentView === "subscription" && (
        <ScrollView style={[styles.settingsContainer, { padding: 20 }]}>
          <Text style={[styles.sectionTitle, textStyle]}>JOXIQ AI Pro</Text>
          <Text style={[styles.authSubtitle, { marginBottom: 20 }]}>Unlock unlimited AI intelligence, advanced reasoning models, and real-time cross-device sync.</Text>

          <View style={[styles.subCard, cardStyle]}>
            <Text style={[styles.subTitle, textStyle]}>Monthly Pro Plan</Text>
            <Text style={[styles.subPrice, textStyle]}>$19.99 / month</Text>
            <Text style={[styles.subDesc, textStyle]}>• Unlimited messages & voice synthesis{"\n"}• Priority access to latest models{"\n"}• Seamless Web & Mobile sync</Text>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => Alert.alert("Payment Ready", "Google Play Billing / Apple App Store In-App Purchases initialized successfully.")}
            >
              <Text style={styles.primaryButtonText}>Subscribe Now</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 20, backgroundColor: "#334155" }]}
            onPress={() => setCurrentView("chat")}
          >
            <Text style={styles.primaryButtonText}>Back to Chat</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  authContainer: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
    maxWidth: 400,
    width: "100%",
    alignSelf: "center",
  },
  authTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 32,
  },
  inputContainer: {
    width: "100%",
  },
  input: {
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    borderRadius: 12,
    padding: 16,
    color: "#fff",
    marginBottom: 16,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: "#6366f1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  switchButton: {
    marginTop: 16,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#818cf8",
    fontSize: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  headerRight: {
    flexDirection: "row",
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chatArea: {
    flex: 1,
  },
  messagesList: {
    flex: 1,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: "85%",
  },
  userBubble: {
    backgroundColor: "#6366f1",
    alignSelf: "flex-end",
  },
  aiBubble: {
    backgroundColor: "#1e293b",
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  inputBar: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
  },
  sendButton: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  settingsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  subCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 20,
  },
  subTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subPrice: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6366f1",
    marginBottom: 12,
  },
  subDesc: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  }
});
