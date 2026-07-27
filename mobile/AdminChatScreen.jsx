import React, { useState, useRef } from "react";
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";

export default function AdminChatScreen({ backendUrl, adminId }) {
  const [messages, setMessages] = useState([
    { id: "welcome", role: "assistant", text: "Hi, I'm your JOXIQ AI Admin Assistant. Ask me about users, revenue, errors, server health, or type 'help'." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const listRef = useRef(null);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    const adminMsg = { id: `a-${Date.now()}`, role: "admin", text };
    setMessages((m) => [...m, adminMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/admin-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Id": adminId },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { id: `r-${Date.now()}`, role: "assistant", text: data.text || data.error || "No response." }]);
    } catch (e) {
      setMessages((m) => [...m, { id: `e-${Date.now()}`, role: "assistant", text: `⚠️ Connection error: ${e.message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <View style={styles.headerDot} />
        <Text style={styles.headerTitle}>JOXIQ AI Admin Assistant</Text>
      </View>

      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messages}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => (
          <View style={[styles.bubbleRow, { justifyContent: item.role === "admin" ? "flex-end" : "flex-start" }]}>
            <View style={item.role === "admin" ? styles.bubbleAdmin : styles.bubbleAssistant}>
              <Text style={item.role === "admin" ? styles.bubbleTextAdmin : styles.bubbleTextAssistant}>
                {item.text}
              </Text>
            </View>
          </View>
        )}
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color="#2563eb" />
        </View>
      )}

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Ask about users, revenue, errors…"
          placeholderTextColor="#9ca3af"
          multiline
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage} disabled={loading}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 16, paddingVertical: 14, backgroundColor: "#111827" },
  headerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#22c55e", marginRight: 8 },
  headerTitle: { color: "#fff", fontWeight: "600", fontSize: 16 },
  messages: { padding: 16, gap: 10 },
  bubbleRow: { flexDirection: "row", marginBottom: 10 },
  bubbleAdmin: { backgroundColor: "#2563eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderBottomRightRadius: 2, maxWidth: "80%" },
  bubbleAssistant: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderBottomLeftRadius: 2, maxWidth: "85%" },
  bubbleTextAdmin: { color: "#fff", fontSize: 14 },
  bubbleTextAssistant: { color: "#111827", fontSize: 14 },
  loadingRow: { paddingVertical: 6, alignItems: "center" },
  inputRow: { flexDirection: "row", gap: 8, padding: 12, borderTopWidth: 1, borderTopColor: "#e5e7eb", backgroundColor: "#fff", alignItems: "flex-end" },
  input: { flex: 1, borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, maxHeight: 100, color: "#111827" },
  sendButton: { backgroundColor: "#2563eb", borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10 },
  sendButtonText: { color: "#fff", fontWeight: "600" },
});
