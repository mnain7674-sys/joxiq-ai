import React, { useState, useRef, useEffect } from "react";

export default function AdminChatWidget({ backendUrl, adminId }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm your JOXIQ AI Admin Assistant. Ask me about users, revenue, errors, server health, or type 'help'." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "admin", text }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${backendUrl}/api/admin-assistant/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Id": adminId },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.text || data.error || "No response." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ Connection error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerDot} />
        <span style={styles.headerTitle}>JOXIQ AI Admin Assistant</span>
      </div>

      <div style={styles.messages} ref={scrollRef}>
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.bubbleRow, justifyContent: m.role === "admin" ? "flex-end" : "flex-start" }}>
            <div style={m.role === "admin" ? styles.bubbleAdmin : styles.bubbleAssistant}>
              {m.text.split("\n").map((line, j) => (
                <div key={j}>{renderLine(line)}</div>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div style={styles.bubbleRow}>
            <div style={styles.bubbleAssistant}>Thinking…</div>
          </div>
        )}
      </div>

      <div style={styles.inputRow}>
        <textarea
          style={styles.input}
          value={input}
          placeholder="Ask about users, revenue, errors, server health…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
        />
        <button style={styles.sendButton} onClick={sendMessage} disabled={loading}>
          Send
        </button>
      </div>
    </div>
  );
}

function renderLine(line) {
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) =>
    p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>
  );
}

const styles = {
  container: {
    display: "flex", flexDirection: "column", height: "600px", width: "100%", maxWidth: "480px",
    border: "1px solid #e2e2e2", borderRadius: "12px", overflow: "hidden", fontFamily: "system-ui, sans-serif",
    boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
  },
  header: {
    display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px",
    background: "#111827", color: "#fff",
  },
  headerDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" },
  headerTitle: { fontWeight: 600, fontSize: "15px" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "10px" },
  bubbleRow: { display: "flex" },
  bubbleAdmin: { background: "#2563eb", color: "#fff", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", maxWidth: "80%", fontSize: "14px", whiteSpace: "pre-wrap" },
  bubbleAssistant: { background: "#fff", border: "1px solid #e5e7eb", color: "#111827", padding: "10px 14px", borderRadius: "14px 14px 14px 2px", maxWidth: "85%", fontSize: "14px", whiteSpace: "pre-wrap" },
  inputRow: { display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb", background: "#fff" },
  input: { flex: 1, resize: "none", border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 10px", fontSize: "14px", fontFamily: "inherit" },
  sendButton: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "0 18px", fontWeight: 600, cursor: "pointer" },
};
