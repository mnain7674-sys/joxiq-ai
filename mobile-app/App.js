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
  Alert,
  Image
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

// Initialize Google Gen AI client safely using environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export default function App() {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  // App state
  const [theme, setTheme] = useState("dark");
  const [currentView, setCurrentView] = useState("chat"); // chat, profile, settings, subscription, education, workspace, languageCoach, history
  const [chats, setChats] = useState([
    {
      id: "default-chat",
      title: "New Chat",
      messages: [
        { role: "assistant", content: "Hello! I am JOXIQ AI, created by Julkar Nain Mahi. How can I assist you across your mobile and web devices today?" }
      ],
      updatedAt: new Date().toISOString()
    }
  ]);
  const [activeChatId, setActiveChatId] = useState("default-chat");
  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];
  const messages = activeChat ? activeChat.messages : [];

  const setMessages = (newMessagesOrUpdater) => {
    setChats(prevChats => {
      return prevChats.map(chat => {
        if (chat.id === activeChatId) {
          const updatedMessages = typeof newMessagesOrUpdater === "function" 
            ? newMessagesOrUpdater(chat.messages) 
            : newMessagesOrUpdater;
          
          // Generate title from first user message if default
          let title = chat.title;
          if (title === "New Chat" && updatedMessages.length > 1) {
            const firstUserMsg = updatedMessages.find(m => m.role === "user");
            if (firstUserMsg) {
              title = firstUserMsg.content.slice(0, 28) + (firstUserMsg.content.length > 28 ? "..." : "");
            }
          }

          return { ...chat, messages: updatedMessages, title, updatedAt: new Date().toISOString() };
        }
        return chat;
      });
    });
  };

  const createNewChat = () => {
    const newId = Math.random().toString(36).substring(2, 9);
    const newChatObj = {
      id: newId,
      title: "New Chat",
      messages: [
        { role: "assistant", content: "Hello! How can I assist you today?" }
      ],
      updatedAt: new Date().toISOString()
    };
    setChats(prev => [newChatObj, ...prev]);
    setActiveChatId(newId);
    setCurrentView("chat");
  };

  const deleteChat = (chatId, e) => {
    if (chats.length <= 1) {
      Alert.alert("Notice", "You need to keep at least one chat.");
      return;
    }
    const filtered = chats.filter(c => c.id !== chatId);
    setChats(filtered);
    if (activeChatId === chatId) {
      setActiveChatId(filtered[0].id);
    }
  };

  // Feature specific states
  const [eduTab, setEduTab] = useState("courses"); // courses, quiz, flashcards
  const [eduTopic, setEduTopic] = useState("");
  const [eduResult, setEduResult] = useState("");
  const [eduLoading, setEduLoading] = useState(false);

  const [workspaceTool, setWorkspaceTool] = useState("resume"); // resume, code, essay, templates
  const [workspaceInput, setWorkspaceInput] = useState("");
  const [workspaceResult, setWorkspaceResult] = useState("");
  const [workspaceLoading, setWorkspaceLoading] = useState(false);

  const [coachLang, setCoachLang] = useState("Spanish");
  const [coachLevel, setCoachLevel] = useState("Beginner");
  const [coachMessage, setCoachMessage] = useState("");
  const [coachChat, setCoachChat] = useState([]);
  const [coachLoading, setCoachLoading] = useState(false);
  const [selectedSubPlan, setSelectedSubPlan] = useState("monthly"); // monthly (36 QR), yearly (300 QR), ultra (99 QR)

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
            if (snap.data().subscriptionStatus === "Pro" || snap.data().isPro) {
              // Pro enabled
            }
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

  // Generate AI Classroom Suite content
  const handleGenerateEducation = async () => {
    if (!eduTopic.trim()) {
      Alert.alert("Error", "Please enter a topic or subject.");
      return;
    }
    setEduLoading(true);
    setEduResult("");
    try {
      const prompt = `Create a comprehensive ${eduTab === "courses" ? "Interactive Course outline with detailed lessons" : eduTab === "quiz" ? "5-question Quiz with answers" : "Flashcard study set"} for the topic: "${eduTopic}". Provide clear headings, formatting, and high-value educational content.`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction: "You are JOXIQ AI Classroom Suite expert tutor." }
      });
      setEduResult(response.text || "Generated successfully.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setEduLoading(false);
    }
  };

  // Generate Workspace Tools content
  const handleGenerateWorkspace = async () => {
    if (!workspaceInput.trim()) {
      Alert.alert("Error", "Please provide input details for the workspace tool.");
      return;
    }
    setWorkspaceLoading(true);
    setWorkspaceResult("");
    try {
      let prompt = "";
      if (workspaceTool === "resume") {
        prompt = `Write a professional ATS-optimized resume summary and bullet points based on: "${workspaceInput}".`;
      } else if (workspaceTool === "code") {
        prompt = `Explain, review, and optimize this code or technical query with examples: "${workspaceInput}".`;
      } else if (workspaceTool === "essay") {
        prompt = `Write a structured, polished professional essay/article based on: "${workspaceInput}".`;
      } else {
        prompt = `Create a smart template / draft based on: "${workspaceInput}".`;
      }

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { systemInstruction: "You are JOXIQ AI Workspace productivity assistant." }
      });
      setWorkspaceResult(response.text || "Generated successfully.");
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setWorkspaceLoading(false);
    }
  };

  // Language Coach Chat
  const handleLanguageCoachSend = async () => {
    if (!coachMessage.trim() || coachLoading) return;
    const msg = coachMessage.trim();
    setCoachMessage("");
    const newChat = [...coachChat, { role: "user", content: msg }];
    setCoachChat(newChat);
    setCoachLoading(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are an expert Language Coach for ${coachLang} at ${coachLevel} level. The user said: "${msg}". Respond in ${coachLang} (with English translation or feedback if helpful), correct any mistakes politely, and continue the conversation.`,
      });
      setCoachChat([...newChat, { role: "assistant", content: response.text || "Keep practicing!" }]);
    } catch (e) {
      Alert.alert("Error", e.message);
    } finally {
      setCoachLoading(false);
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
          <View style={{ width: 64, height: 64, borderRadius: 32, overflow: "hidden", marginBottom: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "#0f172a", padding: 2, alignItems: "center", justifyContent: "center" }}>
            <Image source={require("./assets/icon.png")} style={{ width: "100%", height: "100%", borderRadius: 32 }} resizeMode="cover" />
          </View>
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
          <View style={{ width: 34, height: 34, borderRadius: 17, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)", backgroundColor: "#0f172a", padding: 1, marginRight: 6, alignItems: "center", justifyContent: "center" }}>
            <Image source={require("./assets/icon.png")} style={{ width: "100%", height: "100%", borderRadius: 17 }} resizeMode="cover" />
          </View>
          <Text style={[styles.headerTitle, textStyle]}>JOXIQ AI</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{userProfile?.subscriptionStatus || "Free"}</Text>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={createNewChat} title="New Chat">
            <Text style={{ fontSize: 16 }}>➕</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("history")}>
            <Text style={{ fontSize: 16 }}>📜</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("chat")}>
            <Text style={{ fontSize: 16 }}>💬</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("education")}>
            <Text style={{ fontSize: 16 }}>🎓</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("workspace")}>
            <Text style={{ fontSize: 16 }}>⚡</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("languageCoach")}>
            <Text style={{ fontSize: 16 }}>🗣️</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.navIconBtn, cardStyle]} onPress={() => setCurrentView("settings")}>
            <Text style={{ fontSize: 16 }}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat History View (ChatGPT Style) */}
      {currentView === "history" && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, textStyle, { marginBottom: 0 }]}>📜 Chat History</Text>
            <TouchableOpacity 
              style={{ backgroundColor: "#6366f1", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}
              onPress={createNewChat}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 13 }}>+ New Chat</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.authSubtitle, { marginBottom: 16, textAlign: "left" }]}>Select a conversation to resume or delete chats.</Text>

          {chats.map((c) => (
            <View 
              key={c.id} 
              style={[
                cardStyle, 
                { padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 10, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
                activeChatId === c.id && { borderColor: "#6366f1", borderWidth: 2 }
              ]}
            >
              <TouchableOpacity 
                style={{ flex: 1 }}
                onPress={() => {
                  setActiveChatId(c.id);
                  setCurrentView("chat");
                }}
              >
                <Text style={[textStyle, { fontWeight: "bold", fontSize: 16, marginBottom: 4 }]}>
                  {c.title || "New Chat"}
                </Text>
                <Text style={{ color: "#94a3b8", fontSize: 12 }}>
                  {c.messages.length} messages &bull; {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={{ padding: 8, backgroundColor: "rgba(239, 68, 68, 0.1)", borderRadius: 8 }}
                onPress={(e) => deleteChat(c.id, e)}
              >
                <Text style={{ color: "#ef4444", fontWeight: "bold", fontSize: 14 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

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

      {/* AI Classroom Suite */}
      {currentView === "education" && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={[styles.sectionTitle, textStyle]}>🎓 AI Classroom Suite</Text>
          <Text style={[styles.authSubtitle, { marginBottom: 16, textAlign: "left" }]}>Interactive courses, custom quizzes, and smart flashcard study sets powered by Gemini.</Text>

          <View style={{ flexDirection: "row", marginBottom: 16, gap: 8 }}>
            {["courses", "quiz", "flashcards"].map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, alignItems: "center" },
                  eduTab === tab ? { backgroundColor: "#6366f1", borderColor: "#6366f1" } : cardStyle
                ]}
                onPress={() => setEduTab(tab)}
              >
                <Text style={{ color: eduTab === tab ? "#fff" : (isDark ? "#cbd5e1" : "#475569"), fontWeight: "bold", textTransform: "capitalize" }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, cardStyle, textStyle, { marginBottom: 12 }]}
            placeholder="Enter topic (e.g. Quantum Physics, Spanish History, React Native)"
            placeholderTextColor="#64748b"
            value={eduTopic}
            onChangeText={setEduTopic}
          />

          <TouchableOpacity style={[styles.primaryButton, { marginBottom: 20 }]} onPress={handleGenerateEducation}>
            {eduLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Generate Learning Material</Text>}
          </TouchableOpacity>

          {eduResult ? (
            <View style={[styles.subCard, cardStyle, { marginBottom: 30 }]}>
              <Text style={[styles.subTitle, textStyle, { fontSize: 16, marginBottom: 8 }]}>Generated Result:</Text>
              <Text style={[textStyle, { lineHeight: 22 }]}>{eduResult}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Workspace Tools */}
      {currentView === "workspace" && (
        <ScrollView style={{ flex: 1, padding: 16 }}>
          <Text style={[styles.sectionTitle, textStyle]}>⚡ AI Workspace Tools</Text>
          <Text style={[styles.authSubtitle, { marginBottom: 16, textAlign: "left" }]}>Resume Builder, Code Explainer, Essay Writer, and Smart Templates.</Text>

          <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 16, gap: 8 }}>
            {[
              { id: "resume", label: "📄 Resume" },
              { id: "code", label: "💻 Code" },
              { id: "essay", label: "📝 Essay" },
              { id: "templates", label: "📋 Templates" }
            ].map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
                  workspaceTool === tool.id ? { backgroundColor: "#6366f1", borderColor: "#6366f1" } : cardStyle
                ]}
                onPress={() => setWorkspaceTool(tool.id)}
              >
                <Text style={{ color: workspaceTool === tool.id ? "#fff" : (isDark ? "#cbd5e1" : "#475569"), fontWeight: "bold" }}>
                  {tool.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TextInput
            style={[styles.input, cardStyle, textStyle, { height: 100, textAlignVertical: "top", marginBottom: 12 }]}
            placeholder={
              workspaceTool === "resume" ? "Enter your experience, skills, and target role..." :
              workspaceTool === "code" ? "Paste code snippet or describe technical problem..." :
              workspaceTool === "essay" ? "Enter essay prompt, title, and key points..." :
              "Enter requirements for smart template..."
            }
            placeholderTextColor="#64748b"
            multiline
            value={workspaceInput}
            onChangeText={setWorkspaceInput}
          />

          <TouchableOpacity style={[styles.primaryButton, { marginBottom: 20 }]} onPress={handleGenerateWorkspace}>
            {workspaceLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryButtonText}>Run Workspace Tool</Text>}
          </TouchableOpacity>

          {workspaceResult ? (
            <View style={[styles.subCard, cardStyle, { marginBottom: 30 }]}>
              <Text style={[styles.subTitle, textStyle, { fontSize: 16, marginBottom: 8 }]}>Output Result:</Text>
              <Text style={[textStyle, { lineHeight: 22 }]}>{workspaceResult}</Text>
            </View>
          ) : null}
        </ScrollView>
      )}

      {/* Language Coach */}
      {currentView === "languageCoach" && (
        <View style={{ flex: 1, padding: 16 }}>
          <Text style={[styles.sectionTitle, textStyle]}>🗣️ AI Language Coach</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
            <TextInput
              style={[styles.input, cardStyle, textStyle, { flex: 1, marginBottom: 0 }]}
              placeholder="Language (e.g. Spanish, French)"
              placeholderTextColor="#64748b"
              value={coachLang}
              onChangeText={setCoachLang}
            />
            <TextInput
              style={[styles.input, cardStyle, textStyle, { width: 110, marginBottom: 0 }]}
              placeholder="Level"
              placeholderTextColor="#64748b"
              value={coachLevel}
              onChangeText={setCoachLevel}
            />
          </View>

          <ScrollView style={{ flex: 1, marginBottom: 12 }}>
            {coachChat.length === 0 ? (
              <Text style={{ color: "#94a3b8", textAlign: "center", marginTop: 40 }}>Start chatting with your AI Language Coach in {coachLang}!</Text>
            ) : (
              coachChat.map((m, idx) => (
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
              ))
            )}
            {coachLoading && (
              <View style={[styles.aiBubble, cardStyle, { padding: 12 }]}>
                <ActivityIndicator size="small" color="#6366f1" />
              </View>
            )}
          </ScrollView>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <TextInput
              style={[styles.chatInput, cardStyle, textStyle, { flex: 1 }]}
              placeholder={`Practice ${coachLang}...`}
              placeholderTextColor="#64748b"
              value={coachMessage}
              onChangeText={setCoachMessage}
            />
            <TouchableOpacity style={styles.sendButton} onPress={handleLanguageCoachSend}>
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
            onPress={() => signOut(auth)}
          >
            <Text style={styles.primaryButtonText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {currentView === "subscription" && (
        <ScrollView style={[styles.settingsContainer, { padding: 16 }]}>
          <Text style={[styles.sectionTitle, textStyle]}>🌟 JOXIQ AI Pro & Ultra</Text>
          <Text style={[styles.authSubtitle, { marginBottom: 16, textAlign: "left" }]}>Unlock unlimited AI intelligence, advanced reasoning models, and real-time cross-device sync matching our web platform.</Text>

          {/* Monthly Pro Plan */}
          <TouchableOpacity 
            style={[
              cardStyle, 
              { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
              selectedSubPlan === "monthly" && { borderColor: "#6366f1", borderWidth: 2, backgroundColor: "rgba(99, 102, 241, 0.1)" }
            ]}
            onPress={() => setSelectedSubPlan("monthly")}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[textStyle, { fontWeight: "bold", fontSize: 16 }]}>Monthly Pro</Text>
              <Text style={{ color: "#6366f1", fontWeight: "900", fontSize: 18 }}>36 QR / mo</Text>
            </View>
            <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Unlimited AI messages, Gemini Flash & Pro, Priority Speed & Voice.</Text>
            {selectedSubPlan === "monthly" && <Text style={{ color: "#6366f1", fontWeight: "bold", fontSize: 12 }}>✓ Selected Plan</Text>}
          </TouchableOpacity>

          {/* Annual Pro Plan */}
          <TouchableOpacity 
            style={[
              cardStyle, 
              { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 12 },
              selectedSubPlan === "yearly" && { borderColor: "#f59e0b", borderWidth: 2, backgroundColor: "rgba(245, 158, 11, 0.1)" }
            ]}
            onPress={() => setSelectedSubPlan("yearly")}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[textStyle, { fontWeight: "bold", fontSize: 16 }]}>Annual Pro (Save 30%)</Text>
              <Text style={{ color: "#f59e0b", fontWeight: "900", fontSize: 18 }}>300 QR / yr</Text>
            </View>
            <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>All Monthly Pro features + Custom branding & 24/7 priority support.</Text>
            {selectedSubPlan === "yearly" && <Text style={{ color: "#f59e0b", fontWeight: "bold", fontSize: 12 }}>✓ Selected Plan</Text>}
          </TouchableOpacity>

          {/* JOXIQ Ultra Plan */}
          <TouchableOpacity 
            style={[
              cardStyle, 
              { padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 20 },
              selectedSubPlan === "ultra" && { borderColor: "#8b5cf6", borderWidth: 2, backgroundColor: "rgba(139, 92, 246, 0.15)" }
            ]}
            onPress={() => setSelectedSubPlan("ultra")}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <Text style={[textStyle, { fontWeight: "bold", fontSize: 16 }]}>JOXIQ Ultra</Text>
              <Text style={{ color: "#8b5cf6", fontWeight: "900", fontSize: 18 }}>99 QR / mo</Text>
            </View>
            <Text style={{ color: "#94a3b8", fontSize: 13, marginBottom: 8 }}>Maximum power, Gemini Advanced AI, and dedicated VIP agent node.</Text>
            {selectedSubPlan === "ultra" && <Text style={{ color: "#8b5cf6", fontWeight: "bold", fontSize: 12 }}>✓ Selected Plan</Text>}
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, { marginBottom: 12, backgroundColor: selectedSubPlan === "yearly" ? "#f59e0b" : selectedSubPlan === "ultra" ? "#8b5cf6" : "#6366f1" }]}
            onPress={async () => {
              try {
                if (user) {
                  const planName = selectedSubPlan === "monthly" ? "Monthly Pro" : selectedSubPlan === "yearly" ? "Annual Pro" : "JOXIQ Ultra";
                  const planPrice = selectedSubPlan === "monthly" ? "36 QR" : selectedSubPlan === "yearly" ? "300 QR" : "99 QR";
                  await setDoc(doc(db, "users", user.uid), {
                    subscriptionStatus: "Pro",
                    subscriptionPlan: planName,
                    subscriptionPrice: planPrice,
                    isPro: true,
                    languageCoachPro: true,
                    updatedAt: new Date().toISOString()
                  }, { merge: true });
                  setUserProfile(prev => ({ ...prev, subscriptionStatus: "Pro", subscriptionPlan: planName, isPro: true }));
                  Alert.alert("Success! 🎉", `${planName} (${planPrice}) activated successfully! Fully synced with your website account.`);
                  setCurrentView("chat");
                }
              } catch (e) {
                Alert.alert("Error", e.message);
              }
            }}
          >
            <Text style={styles.primaryButtonText}>Subscribe to {selectedSubPlan === "monthly" ? "Monthly Pro (36 QR)" : selectedSubPlan === "yearly" ? "Annual Pro (300 QR)" : "JOXIQ Ultra (99 QR)"}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.primaryButton, { backgroundColor: "#334155" }]}
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
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  badge: {
    backgroundColor: "#6366f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  badgeText: {
    color: "#fff",
    fontSize: 9,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  headerRight: {
    flexDirection: "row",
    gap: 6,
  },
  navIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
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



