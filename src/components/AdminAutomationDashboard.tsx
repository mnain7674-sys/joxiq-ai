import React, { useState, useEffect, useRef } from "react";

interface AdminAutomationDashboardProps {
  backendUrl?: string;
}

export function AdminAutomationDashboard({ backendUrl = "" }: AdminAutomationDashboardProps) {
  const [controlCenter, setControlCenter] = useState<any>(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState<string>("overview");
  const [featureResult, setFeatureResult] = useState<any>(null);
  const [featureLoading, setFeatureLoading] = useState<boolean>(false);

  // Email alert states
  const [alertConfig, setAlertConfig] = useState<{
    recipientEmail: string;
    alertsEnabled: boolean;
    latencyThresholdMs: number;
    errorThresholdCount: number;
    emailApiKey?: string;
    provider?: string;
    smtpHost?: string;
    smtpPort?: number;
    smtpUser?: string;
    smtpPass?: string;
  }>({
    recipientEmail: "mnain7674@gmail.com",
    alertsEnabled: true,
    latencyThresholdMs: 2000,
    errorThresholdCount: 3,
    emailApiKey: "",
    provider: "resend",
    smtpHost: "smtp.gmail.com",
    smtpPort: 587,
    smtpUser: "mnain7674@gmail.com",
    smtpPass: "",
  });
  const [showSmtpDetails, setShowSmtpDetails] = useState<boolean>(true);
  const [alertLogs, setAlertLogs] = useState<any[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [emailSaving, setEmailSaving] = useState(false);
  const [emailMsg, setEmailMsg] = useState("");
  const prevLogCountRef = useRef<number>(0);

  // Web Audio API Sound Generator for instant email alert audio chimes
  const playAlertChime = (type: "success" | "warning" = "success") => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      if (type === "warning") {
        // High-priority 2-stage siren pulse for AI anomalies / errors
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = "sawtooth";
        osc1.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc1.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.25);
        gain1.gain.setValueAtTime(0.25, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.25);

        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = "sawtooth";
          osc2.frequency.setValueAtTime(1046.5, ctx.currentTime); // C6
          osc2.frequency.exponentialRampToValueAtTime(523.25, ctx.currentTime + 0.3);
          gain2.gain.setValueAtTime(0.25, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.3);
        }, 300);
      } else {
        // Pleasant ascending 4-note notification chime for email dispatch
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
          gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(ctx.currentTime + idx * 0.1);
          osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
        });
      }
    } catch (err) {
      console.error("Audio alert error:", err);
    }
  };

  const [messages, setMessages] = useState<Array<{ role: string; text: string }>>([
    { role: "assistant", text: "Hi, I am JOXIQ AI Admin Assistant. Ask me about users, AI usage, system stats, security, or maintenance across all 100 features." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchEmailAlertConfig = async () => {
    try {
      const res = await fetch(`${backendUrl}/api/admin-v2/email-alerts/config`);
      const data = await res.json();
      if (data.config) setAlertConfig(data.config);
      if (data.logs) {
        // Play audio alert if new alert log detected in background
        if (soundEnabled && prevLogCountRef.current > 0 && data.logs.length > prevLogCountRef.current) {
          const latestLog = data.logs[0];
          playAlertChime(latestLog?.alertType?.includes("ANOMALY") ? "warning" : "success");
        }
        prevLogCountRef.current = data.logs.length;
        setAlertLogs(data.logs);
      }
    } catch (e) {
      console.error("Email alert config fetch error:", e);
    }
  };

  useEffect(() => {
    fetch(`${backendUrl}/api/admin-v2/control-center`)
      .then((r) => r.json())
      .then(setControlCenter)
      .catch((e) => console.error("Control center fetch error:", e));

    fetchEmailAlertConfig();

    // Auto-poll logs every 15 seconds to sound alert in real-time if an anomaly email is sent
    const interval = setInterval(fetchEmailAlertConfig, 15000);
    return () => clearInterval(interval);
  }, [backendUrl, soundEnabled]);

  const saveEmailConfig = async (updated: Partial<typeof alertConfig>) => {
    setEmailSaving(true);
    setEmailMsg("");
    try {
      const res = await fetch(`${backendUrl}/api/admin-v2/email-alerts/config`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      setAlertConfig(data);
      if (soundEnabled) playAlertChime("success");
      setEmailMsg("✅ Email notification alert settings updated successfully!");
    } catch (e: any) {
      if (soundEnabled) playAlertChime("warning");
      setEmailMsg(`⚠️ Update failed: ${e.message}`);
    } finally {
      setEmailSaving(false);
      fetchEmailAlertConfig();
    }
  };

  const sendTestEmail = async () => {
    setEmailSaving(true);
    setEmailMsg("Sending test email alert...");
    try {
      const res = await fetch(`${backendUrl}/api/admin-v2/email-alerts/test`, { method: "POST" });
      const data = await res.json();
      if (soundEnabled) {
        if (data.success) playAlertChime("success");
        else playAlertChime("warning");
      }
      setEmailMsg(`✉️ ${data.message || "Test email alert dispatched!"}`);
      fetchEmailAlertConfig();
    } catch (e: any) {
      if (soundEnabled) playAlertChime("warning");
      setEmailMsg(`⚠️ Test email failed: ${e.message}`);
    } finally {
      setEmailSaving(false);
    }
  };

  const triggerSimulatedAnomaly = async () => {
    setEmailSaving(true);
    setEmailMsg("Simulating AI response anomaly...");
    try {
      const res = await fetch(`${backendUrl}/api/admin-v2/email-alerts/trigger-anomaly`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          latencyMs: 2450,
          model: "gemini-3.6-flash",
          error: "Simulated AI Model Response Delay (>2000ms)"
        })
      });
      const data = await res.json();
      if (soundEnabled) playAlertChime("warning");
      setEmailMsg(`🚨 Anomaly detected! ${data.message || "Email alert triggered."}`);
      fetchEmailAlertConfig();
    } catch (e: any) {
      if (soundEnabled) playAlertChime("warning");
      setEmailMsg(`⚠️ Anomaly trigger failed: ${e.message}`);
    } finally {
      setEmailSaving(false);
    }
  };

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
      const res = await fetch(`${backendUrl}/api/admin-v2/ai-admin/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      const data = await res.json();
      setMessages((m) => [...m, { role: "assistant", text: data.text || data.response || "No response." }]);
    } catch (e: any) {
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ Connection error: ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  async function runQuickFeatureAction(endpoint: string, method: "GET" | "POST" = "GET", body?: any) {
    setFeatureLoading(true);
    setFeatureResult(null);
    try {
      const opts: RequestInit = { method };
      if (body) {
        opts.headers = { "Content-Type": "application/json" };
        opts.body = JSON.stringify(body);
      }
      const res = await fetch(`${backendUrl}/api/admin-v2${endpoint}`, opts);
      const data = await res.json();
      setFeatureResult(data);
    } catch (e: any) {
      setFeatureResult({ error: e.message });
    } finally {
      setFeatureLoading(false);
    }
  }

  return (
    <div style={styles.page}>
      {/* Cards Row */}
      <div style={styles.cardsRow}>
        <StatCard label="Total Users" value={controlCenter?.dashboard?.users?.totalUsers ?? "0"} />
        <StatCard label="AI Requests Today" value={controlCenter?.dashboard?.ai?.requestsToday ?? "0"} />
        <StatCard label="Errors Today" value={controlCenter?.dashboard?.errorsToday ?? "0"} />
        <StatCard label="Performance Score" value={controlCenter?.performanceScore?.score ?? "98"} />
      </div>

      {/* Quick Insights */}
      {controlCenter?.quickInsights?.length > 0 && (
        <div style={styles.insightsBox}>
          <div style={styles.insightsTitle}>⚡ Quick Automation Insights</div>
          {controlCenter.quickInsights.map((insight: string, i: number) => (
            <div key={i} style={styles.insightItem}>• {insight}</div>
          ))}
        </div>
      )}

      {/* 100 Features Action Launcher Bar */}
      <div style={styles.launcherBox}>
        <div style={styles.launcherTitle}>🛠️ 100-Feature Admin Automation Quick Executor</div>
        <div style={styles.launcherButtons}>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/users/statistics")}>User Stats (#10)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/ai/usage")}>AI Usage (#11)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/dashboard/live")}>Live Snapshot (#25)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/system/health-dashboard")}>Health Check (#40)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/learning/engagement")}>Learning Engagement (#48)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/security/dashboard")}>Security Dashboard (#60)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/maintenance/run-full", "POST")}>Run Full Maintenance (#70)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/analytics/growth-prediction")}>Growth Prediction (#77)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/ai-admin/advice")}>Smart System Advice (#84)</button>
          <button style={styles.actionBtn} onClick={() => runQuickFeatureAction("/briefing/daily")}>Admin Briefing (#99)</button>
        </div>

        {featureLoading && <div style={{ marginTop: "10px", fontSize: "13px", color: "#2563eb" }}>Executing feature query...</div>}
        {featureResult && (
          <div style={styles.resultJsonBox}>
            <pre style={{ margin: 0, fontSize: "12px", fontFamily: "monospace", color: "#1e293b" }}>
              {JSON.stringify(featureResult, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* 📧 AI Anomaly & Email Alert Automation Sentinel */}
      <div style={{ background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "18px", marginBottom: "16px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <span style={{ fontSize: "16px", fontWeight: 700, color: "#0f172a" }}>📧 AI Anomaly & Email Alert Automation</span>
            <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>Automated high-priority email notifications on AI delays, errors, or quota issues</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playAlertChime("success");
              }}
              style={{
                background: soundEnabled ? "#eff6ff" : "#f1f5f9",
                color: soundEnabled ? "#1d4ed8" : "#64748b",
                border: `1px solid ${soundEnabled ? "#bfdbfe" : "#cbd5e1"}`,
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {soundEnabled ? "🔊 Sound Alerts: ON" : "🔇 Sound Alerts: OFF"}
            </button>
            <button
              onClick={() => playAlertChime("warning")}
              style={{
                background: "#fef3c7",
                color: "#b45309",
                border: "1px solid #fde68a",
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
              title="Test the siren alarm sound"
            >
              🎵 Test Sound
            </button>
            <span style={{ fontSize: "12px", fontWeight: 600, color: alertConfig.alertsEnabled ? "#16a34a" : "#dc2626" }}>
              {alertConfig.alertsEnabled ? "🟢 Sentinel Active" : "🔴 Sentinel Paused"}
            </span>
            <button
              onClick={() => saveEmailConfig({ alertsEnabled: !alertConfig.alertsEnabled })}
              style={{
                background: alertConfig.alertsEnabled ? "#fef2f2" : "#f0fdf4",
                color: alertConfig.alertsEnabled ? "#991b1b" : "#166534",
                border: `1px solid ${alertConfig.alertsEnabled ? "#fca5a5" : "#86efac"}`,
                borderRadius: "6px",
                padding: "4px 10px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {alertConfig.alertsEnabled ? "Pause Alerts" : "Enable Alerts"}
            </button>
          </div>
        </div>

        {/* Email Settings Row */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", background: "#f8fafc", padding: "14px", borderRadius: "8px", border: "1px solid #f1f5f9", marginBottom: "14px", alignItems: "flex-end" }}>
          <div style={{ flex: "1 1 220px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Admin Recipient Email:
            </label>
            <input
              type="email"
              value={alertConfig.recipientEmail}
              onChange={(e) => setAlertConfig({ ...alertConfig, recipientEmail: e.target.value })}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
              placeholder="mnain7674@gmail.com"
            />
          </div>

          <div style={{ flex: "0 1 150px" }}>
            <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#334155", marginBottom: "4px" }}>
              Latency Threshold:
            </label>
            <select
              value={alertConfig.latencyThresholdMs}
              onChange={(e) => saveEmailConfig({ latencyThresholdMs: Number(e.target.value) })}
              style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", background: "#ffffff" }}
            >
              <option value={1500}>Strict (&gt; 1500ms)</option>
              <option value={2000}>Balanced (&gt; 2000ms)</option>
              <option value={3000}>Relaxed (&gt; 3000ms)</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={() => saveEmailConfig({ recipientEmail: alertConfig.recipientEmail, smtpHost: alertConfig.smtpHost, smtpPort: alertConfig.smtpPort, smtpUser: alertConfig.smtpUser, smtpPass: alertConfig.smtpPass })}
              disabled={emailSaving}
              style={{ background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              Save Configuration
            </button>
            <button
              onClick={sendTestEmail}
              disabled={emailSaving}
              style={{ background: "#059669", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              🚀 Send Real Test Email
            </button>
            <button
              onClick={triggerSimulatedAnomaly}
              disabled={emailSaving}
              style={{ background: "#d97706", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
            >
              🚨 Test AI Anomaly
            </button>
          </div>
        </div>

        {/* Real Email Delivery Settings Block (API Key or SMTP) */}
        <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "8px", padding: "14px", marginBottom: "14px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ fontWeight: 700, fontSize: "13px", color: "#166534" }}>
              ⚡ REAL EMAIL DELIVERY (Resend Email API / SendGrid / Gmail SMTP)
            </div>
            <button
              onClick={() => setShowSmtpDetails(!showSmtpDetails)}
              style={{ background: "transparent", border: "none", fontSize: "12px", color: "#15803d", cursor: "pointer", textDecoration: "underline" }}
            >
              {showSmtpDetails ? "Hide Delivery Setup" : "Show Delivery Setup"}
            </button>
          </div>

          {showSmtpDetails && (
            <div>
              {/* Option 1: Email API Key (NO Gmail password needed!) */}
              <div style={{ background: "#ffffff", border: "1px solid #86efac", padding: "12px", borderRadius: "8px", marginBottom: "12px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#15803d", marginBottom: "6px" }}>
                  🌟 OPTION 1: Resend Email API Key (পাসওয়ার্ড ছাড়া সহজ উপায় - সবচেয়ে ভালো!)
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input
                    type="password"
                    value={alertConfig.emailApiKey || ""}
                    placeholder="re_123456789... (Resend API Key)"
                    onChange={(e) => setAlertConfig({ ...alertConfig, emailApiKey: e.target.value })}
                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                  />
                  <button
                    onClick={() => saveEmailConfig({ recipientEmail: alertConfig.recipientEmail, emailApiKey: alertConfig.emailApiKey, provider: "resend" })}
                    disabled={emailSaving}
                    style={{ background: "#16a34a", color: "#ffffff", border: "none", borderRadius: "6px", padding: "8px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >
                    Save API Key
                  </button>
                </div>
                <div style={{ fontSize: "11px", color: "#166534", marginTop: "6px" }}>
                  👉 <strong>Resend API Key পেতে ১ মিনিটের নিয়ম:</strong> <a href="https://resend.com" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>Resend.com</a> এ গিয়ে জিমেইল দিয়ে সাইন আপ করে "API Keys" থেকে একটি ফ্রী Key কপি করে এখানে বসিয়ে "Save API Key" দিন! কোনো জিমেইল পাসওয়ার্ড লাগবে না!
                </div>
              </div>

              {/* Option 2: Gmail SMTP App Password */}
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#334155", marginBottom: "6px" }}>
                  🔑 OPTION 2: Gmail SMTP App Password
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "2px" }}>SMTP Host</label>
                    <input
                      type="text"
                      value={alertConfig.smtpHost || "smtp.gmail.com"}
                      onChange={(e) => setAlertConfig({ ...alertConfig, smtpHost: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "2px" }}>SMTP Port</label>
                    <input
                      type="number"
                      value={alertConfig.smtpPort || 587}
                      onChange={(e) => setAlertConfig({ ...alertConfig, smtpPort: Number(e.target.value) })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "2px" }}>Sender Email</label>
                    <input
                      type="email"
                      value={alertConfig.smtpUser || "mnain7674@gmail.com"}
                      onChange={(e) => setAlertConfig({ ...alertConfig, smtpUser: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#475569", marginBottom: "2px" }}>Gmail App Password (16-digit)</label>
                    <input
                      type="password"
                      value={alertConfig.smtpPass || ""}
                      placeholder="16-digit App Password"
                      onChange={(e) => setAlertConfig({ ...alertConfig, smtpPass: e.target.value })}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", border: "1px solid #cbd5e1", fontSize: "12px" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {emailMsg && (
          <div style={{ padding: "8px 12px", background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "12px", color: "#1e40af", marginBottom: "12px" }}>
            {emailMsg}
          </div>
        )}

        {/* Email Sentinel Dispatched Logs Table */}
        <div style={{ marginTop: "10px" }}>
          <div style={{ fontSize: "13px", fontWeight: 600, color: "#1e293b", marginBottom: "6px" }}>
            📜 Recent Dispatched Email Alert Logs ({alertLogs.length}):
          </div>
          <div style={{ maxHeight: "160px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <th style={{ padding: "6px 8px", color: "#64748b" }}>Time</th>
                  <th style={{ padding: "6px 8px", color: "#64748b" }}>Type</th>
                  <th style={{ padding: "6px 8px", color: "#64748b" }}>Recipient</th>
                  <th style={{ padding: "6px 8px", color: "#64748b" }}>Subject</th>
                  <th style={{ padding: "6px 8px", color: "#64748b" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {alertLogs.slice(0, 8).map((log, idx) => (
                  <tr key={idx} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 8px", whiteSpace: "nowrap" }}>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td style={{ padding: "6px 8px", fontWeight: 600, color: "#2563eb" }}>{log.alertType}</td>
                    <td style={{ padding: "6px 8px" }}>{log.recipient}</td>
                    <td style={{ padding: "6px 8px", color: "#334155" }}>{log.subject}</td>
                    <td style={{ padding: "6px 8px" }}>
                      <span style={{
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "10px",
                        fontWeight: 700,
                        background: log.status === "SENT" ? "#dcfce7" : "#fee2e2",
                        color: log.status === "SENT" ? "#15803d" : "#b91c1c"
                      }}>
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statValue}>{value}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { fontFamily: "system-ui, sans-serif", padding: "16px", maxWidth: "100%", width: "100%" },
  cardsRow: { display: "flex", gap: "12px", marginBottom: "16px", flexWrap: "wrap" },
  statCard: { flex: "1 1 180px", background: "#ffffff", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  statValue: { fontSize: "26px", fontWeight: 700, color: "#111827" },
  statLabel: { fontSize: "12px", color: "#6b7280", marginTop: "4px" },
  insightsBox: { background: "#fef3c7", border: "1px solid #fde68a", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  insightsTitle: { fontWeight: 600, marginBottom: "6px", color: "#92400e" },
  insightItem: { fontSize: "13px", color: "#78350f", marginBottom: "3px" },
  launcherBox: { background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "14px", marginBottom: "16px" },
  launcherTitle: { fontWeight: 600, fontSize: "14px", marginBottom: "10px", color: "#0f172a" },
  launcherButtons: { display: "flex", gap: "8px", flexWrap: "wrap" },
  actionBtn: { background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "6px 12px", fontSize: "12px", fontWeight: 500, color: "#334155", cursor: "pointer" },
  resultJsonBox: { marginTop: "12px", background: "#f1f5f9", padding: "12px", borderRadius: "8px", maxHeight: "200px", overflowY: "auto" },
  chatContainer: { display: "flex", flexDirection: "column", height: "480px", border: "1px solid #e2e2e2", borderRadius: "12px", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", background: "#ffffff" },
  chatHeader: { display: "flex", alignItems: "center", gap: "8px", padding: "14px 16px", background: "#111827", color: "#ffffff" },
  headerDot: { width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e" },
  headerTitle: { fontWeight: 600, fontSize: "15px" },
  messages: { flex: 1, overflowY: "auto", padding: "16px", background: "#f9fafb", display: "flex", flexDirection: "column", gap: "10px" },
  bubbleRow: { display: "flex" },
  bubbleAdmin: { background: "#2563eb", color: "#ffffff", padding: "10px 14px", borderRadius: "14px 14px 2px 14px", maxWidth: "80%", fontSize: "14px" },
  bubbleAssistant: { background: "#ffffff", border: "1px solid #e5e7eb", color: "#111827", padding: "10px 14px", borderRadius: "14px 14px 14px 2px", maxWidth: "85%", fontSize: "14px", whiteSpace: "pre-wrap" },
  inputRow: { display: "flex", gap: "8px", padding: "12px", borderTop: "1px solid #e5e7eb", background: "#ffffff" },
  input: { flex: 1, border: "1px solid #d1d5db", borderRadius: "8px", padding: "8px 10px", fontSize: "14px" },
  sendButton: { background: "#2563eb", color: "#ffffff", border: "none", borderRadius: "8px", padding: "0 18px", fontWeight: 600, cursor: "pointer" },
};

export default AdminAutomationDashboard;
