import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList, ScrollView,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AdminScreen({ backendUrl = "" }) {
  const [token, setToken] = useState(null);
  const [checkingStorage, setCheckingStorage] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([{ id: "welcome", role: "assistant", text: "Hi, ask me about users, revenue, AI usage, or security." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem("joxiq_admin_token").then((t) => { setToken(t); setCheckingStorage(false); });
  }, []);

  async function authedFetch(path, options = {}) {
    const res = await fetch(`${backendUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 401) { await AsyncStorage.removeItem("joxiq_admin_token"); setToken(null); throw new Error("Session expired, please log in again"); }
    return res.json();
  }

  useEffect(() => {
    if (!token) return;
    authedFetch("/api/admin/users/statistics").then(setStats).catch(() => {});
  }, [token]);

  async function handleLogin() {
    setLoginError("");
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      await AsyncStorage.setItem("joxiq_admin_token", data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  async function handleLogout() {
    await AsyncStorage.removeItem("joxiq_admin_token");
    setToken(null);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { id: `a-${Date.now()}`, role: "admin", text }]);
    setInput("");
    setLoading(true);
    try {
      const data = await authedFetch("/api/admin/assistant/chat", { method: "POST", body: JSON.stringify({ message: text }) });
      setMessages((m) => [...m, { id: `r-${Date.now()}`, role: "assistant", text: data.text || data.error || "No response." }]);
    } catch (e) {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "assistant", text: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  if (checkingStorage) return <View style={styles.center}><ActivityIndicator size="large" color="#2563eb" /></View>;

  if (!token) {
    return (
      <View style={styles.loginContainer}>
        <Text style={styles.loginTitle}>JOXIQ AI Admin Login</Text>
        <TextInput style={styles.loginInput} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextInput style={styles.loginInput} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        {loginError ? <Text style={styles.errorText}>{loginError}</Text> : null}
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>Log In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined} keyboardVerticalOffset={80}>
      <View style={styles.topBar}>
        <Text style={styles.title}>JOXIQ AI Admin</Text>
        <TouchableOpacity onPress={handleLogout}><Text style={styles.logoutText}>Log out</Text></TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsRow} contentContainerStyle={{ paddingHorizontal: 12 }}>
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="New Today" value={stats?.newToday ?? "—"} />
        <StatCard label="New This Week" value={stats?.newThisWeek ?? "—"} />
      </ScrollView>

      <View style={styles.header}><View style={styles.headerDot} /><Text style={styles.headerTitle}>AI Admin Assistant</Text></View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, { justifyContent: item.role === "admin" ? "flex-end" : "flex-start" }]}>
            <View style={item.role === "admin" ? styles.bubbleAdmin : styles.bubbleAssistant}>
              <Text style={item.role === "admin" ? styles.bubbleTextAdmin : styles.bubbleTextAssistant}>{item.text}</Text>
            </View>
          </View>
        )}
      />

      {loading && <View style={styles.loadingRow}><ActivityIndicator size="small" color="#2563eb" /></View>}

      <View style={styles.inputRow}>
        <TextInput style={styles.input} value={input} onChangeText={setInput} placeholder="Ask about users, revenue…" placeholderTextColor="#9ca3af" onSubmitEditing={sendMessage} />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

function StatCard({ label, value }) {
  return <View style={styles.statCard}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  loginContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, backgroundColor: "#f9fafb" },
  loginTitle: { fontSize: 20, fontWeight: "700", marginBottom: 20, color: "#111827" },
  loginInput: { width: "100%", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 14 },
  errorText: { color: "#dc2626", fontSize: 13, marginBottom: 8 },
  loginButton: { backgroundColor: "#2563eb", borderRadius: 8, paddingVertical: 12, paddingHorizontal: 32, marginTop: 8 },
  loginButtonText: { color: "#fff", fontWeight: "600" },
  container: { flex: 1, backgroundColor: "#f9fafb" },
  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16 },
  title: { fontSize: 18, fontWeight: "700", color: "#111827" },
  logoutText: { color: "#2563eb", fontSize: 14 },
  statsRow: { maxHeight: 90 },
  statCard: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 14, marginRight: 10, minWidth: 110 },
  statValue: { fontSize: 22, fontWeight: "700", color: "#111827" },
  statLabel: { fontSize: 11, color: "#6b7280", marginTop: 4 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#111827", marginTop: 10 },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e", marginRight: 8 },
  headerTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
  messages: { padding: 16 },
  bubbleRow: { flexDirection: "row", marginBottom: 10 },
  bubbleAdmin: { backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderBottomRightRadius: 2, maxWidth: "80%" },
  bubbleAssistant: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderBottomLeftRadius: 2, maxWidth: "85%" },
  bubbleTextAdmin: { color: "#fff", fontSize: 14 },
  bubbleTextAssistant: { color: "#111827", fontSize: 14 },
  loadingRow: { paddingVertical: 6, alignItems: "center" },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff" },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, color: "#111827" },
  sendButton: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10, justifyContent: "center" },
  sendButtonText: { color: "#fff", fontWeight: "600" },
});
