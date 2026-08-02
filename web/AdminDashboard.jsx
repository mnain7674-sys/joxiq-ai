import React, { useState, useEffect, useRef } from "react";

export default function AdminDashboard({ backendUrl = "" }) {
  const [token, setToken] = useState(() => localStorage.getItem("joxiq_admin_token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [stats, setStats] = useState(null);
  const [messages, setMessages] = useState([{ role: "assistant", text: "Hi, ask me about users, revenue, AI usage, or security." }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  async function authedFetch(path, options = {}) {
    const res = await fetch(`${backendUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...options.headers },
    });
    if (res.status === 401) { setToken(null); localStorage.removeItem("joxiq_admin_token"); throw new Error("Session expired, please log in again"); }
    return res.json();
  }

  useEffect(() => {
    if (!token) return;
    authedFetch("/api/admin/users/statistics").then(setStats).catch(() => {});
  }, [token]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      localStorage.setItem("joxiq_admin_token", data.token);
      setToken(data.token);
    } catch (err) {
      setLoginError(err.message);
    }
  }

  function handleLogout() {
    localStorage.removeItem("joxiq_admin_token");
    setToken(null);
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;
    setMessages((m) => [...m, { role: "admin", text }]);
    setInput("");
    setLoading(true);
    try {
      const data = await authedFetch("/api/admin/assistant/chat", { method: "POST", body: JSON.stringify({ message: text }) });
      setMessages((m) => [...m, { role: "assistant", text: data.text || data.error || "No response." }]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div style={styles.loginPage}>
        <form onSubmit={handleLogin} style={styles.loginCard}>
          <h2 style={styles.loginTitle}>JOXIQ AI Admin Login</h2>
          <input style={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input style={styles.input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {loginError && <div style={styles.errorText}>{loginError}</div>}
          <button style={styles.sendButton} type="submit">Log In</button>
        </form>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <span style={styles.title}>JOXIQ AI Admin</span>
        <button style={styles.logoutButton} onClick={handleLogout}>Log out</button>
      </div>

      <div style={styles.cardsRow}>
        <StatCard label="Total Users" value={stats?.totalUsers ?? "—"} />
        <StatCard label="New Today" value={stats?.newToday ?? "—"} />
        <StatCard label="New This Week" value={stats?.newThisWeek ?? "—"} />
      </div>

      <div style={styles.chatContainer}>
        <div style={styles.chatHeader}><div style={styles.headerDot} /><span style={styles.headerTitle}>AI Admin Assistant</span></div>
        <div style={styles.messages} ref={scrollRef}>
          {messages.map((m, i) => (
            <div key={i} style={{ ...styles.bubbleRow, justifyContent: m.role === "admin" ? "flex-end" : "flex-start" }}>
              <div style={m.role === "admin" ? styles.bubbleAdmin : styles.bubbleAssistant}>{m.text}</div>
            </div>
          ))}
          {loading && <div style={styles.bubbleRow}><div style={styles.bubbleAssistant}>Thinking…</div></div>}
        </div>
        <div style={styles.inputRow}>
          <input style={styles.chatInput} value={input} placeholder="Ask about users, revenue, security…" onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendMessage()} />
          <button style={styles.sendButton} onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return <div style={styles.statCard}><div style={styles.statValue}>{value}</div><div style={styles.statLabel}>{label}</div></div>;
}

const styles = {
  loginPage: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "system-ui, sans-serif" },
  loginCard: { background: "#fff", padding: "32px", borderRadius: "12px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", display: "flex", flexDirection: "column", gap: "12px", width: "320px" },
  loginTitle: { margin: 0, marginBottom: "8px", fontSize: "18px", color: "#111827" },
  input: { border: "1px solid #d1d5db", borderRadius: "8px", padding: "10px 12px", fontSize: "14px" },
  errorText: { color: "#dc2626", fontSize: "13px" },
  page: { fontFamily: "system-ui, sans-serif", padding: "20px", maxWidth: "900px" },
  topBar: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" },
  title: { fontSize: "20px", fontWeight: 700, color: "#111827" },
  logoutButton: { background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: "8px", padding: "6px 14px", cursor: "pointer" },
  cardsRow: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  statCard: { flex: "1 1 180px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px" },
  statValue: { fontSize: "26px", fontWeight: 700, color: "#111827" },
  statLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  chatContainer: { display: "flex", flexDirection: "column", height: "500px", border: "1px solid #e2e2e2", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" },
  chatHeader: { display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", background: "#111827", color: "#fff" },
  headerDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" },
  headerTitle: { fontWeight: 600, fontSize: "15px" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "10px" },
  bubbleRow: { display: "flex" },
  bubbleAdmin: { background: "#2563eb", color: "#fff", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", maxWidth: "80%", fontSize: "14px" },
  bubbleAssistant: { background: "#fff", border: "1px solid #e5e7eb", color: "#111827", padding: "10px 14px", borderRadius: "14px 14px 14px 2px", maxWidth: "85%", fontSize: "14px", whiteSpace: "pre-wrap" },
  inputRow: { display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb", background: "#fff" },
  chatInput: { flex: 1, border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 10px", fontSize: "14px" },
  sendButton: { background: "#2563eb", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 18px", fontWeight: 600, cursor: "pointer" },
};
