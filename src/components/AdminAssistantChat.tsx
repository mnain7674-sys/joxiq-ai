import React, { useState } from "react";
import { 
  Bot, 
  Send, 
  ShieldCheck, 
  Activity, 
  BarChart2, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Copy, 
  Check 
} from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AdminAssistantChatProps {
  isDark?: boolean;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  source?: string;
  executionTimeMs?: number;
  status?: "success" | "unavailable" | "error";
  timestamp: string;
}

export const AdminAssistantChat: React.FC<AdminAssistantChatProps> = ({ isDark = true }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      sender: "assistant",
      text: `👋 **Welcome to the Official JOXIQ AI Admin Assistant!**\n\nI can assist you with real-time platform diagnostics, usage analytics, server health monitoring, and daily metrics in English and Bangla.\n\nTry asking:\n• *"What is today's summary?"*\n• *"Show server health and diagnostics"*\n• *"What are the trending features?"*\n• *"আজকের সামারি ও সার্ভার স্ট্যাটাস দেখাও"*\n\n*All statistics are strictly verified from live backend databases and diagnostics.*`,
      source: "JOXIQ System Diagnostics",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }
  ]);

  const [inputQuery, setInputQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleSendQuery = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || isSending) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryToSend) setInputQuery("");
    setIsSending(true);

    try {
      const response = await fetch("/api/admin/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": "SECRET_JOXIQ_ADMIN_KEY"
        },
        body: JSON.stringify({ query: q })
      });

      const data = await response.json();

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.response || "Data is currently unavailable.",
        source: data.source || "JOXIQ Verified Database",
        executionTimeMs: data.execution_time_ms,
        status: data.status || "success",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error("Admin Assistant Chat Error:", err);
      const errorMsg: ChatMessage = {
        id: `assistant-err-${Date.now()}`,
        sender: "assistant",
        text: "🚨 **Error connecting to Admin Assistant Engine.** Please verify your server connection.",
        status: "error",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className={`rounded-3xl border ${isDark ? "bg-slate-900/90 border-slate-800" : "bg-white border-slate-200"} shadow-2xl overflow-hidden flex flex-col min-h-[600px]`}>
      {/* Header */}
      <div className={`px-6 py-4 border-b flex items-center justify-between ${isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                JOXIQ AI Official Admin Assistant
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                PROD AUTOMATION
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Natural Language Platform Admin & Diagnostic Engine (English & Bangla)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>x-admin-token Secured</span>
          </span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className={`px-6 py-2.5 border-b flex items-center gap-2 overflow-x-auto text-xs ${isDark ? "bg-slate-950/40 border-slate-800/60" : "bg-slate-100/50 border-slate-200"}`}>
        <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3 text-amber-400" />
          Quick Diagnostics:
        </span>
        <button
          onClick={() => handleSendQuery("What is today's summary?")}
          disabled={isSending}
          className="px-3 py-1 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 transition-all font-medium whitespace-nowrap cursor-pointer"
        >
          📊 Today's Summary
        </button>
        <button
          onClick={() => handleSendQuery("Show server health and diagnostics")}
          disabled={isSending}
          className="px-3 py-1 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all font-medium whitespace-nowrap cursor-pointer"
        >
          ⚙️ Server Health
        </button>
        <button
          onClick={() => handleSendQuery("What are the trending features?")}
          disabled={isSending}
          className="px-3 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all font-medium whitespace-nowrap cursor-pointer"
        >
          📈 Feature Analytics
        </button>
        <button
          onClick={() => handleSendQuery("আজকের সামারি ও সার্ভার স্ট্যাটাস দেখাও")}
          disabled={isSending}
          className="px-3 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 transition-all font-medium whitespace-nowrap cursor-pointer"
        >
          🇧🇩 আজকের সামারি (Bangla)
        </button>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[500px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-4 space-y-2 text-sm ${
                msg.sender === "user"
                  ? "bg-amber-500 text-slate-950 font-medium rounded-br-none"
                  : isDark
                  ? "bg-slate-950 border border-slate-800 text-slate-100 rounded-bl-none shadow-lg"
                  : "bg-slate-100 border border-slate-200 text-slate-900 rounded-bl-none"
              }`}
            >
              <div className="prose prose-invert max-w-none text-sm leading-relaxed">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>

              {msg.sender === "assistant" && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    {msg.source && (
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {msg.source}
                      </span>
                    )}
                    {msg.executionTimeMs && (
                      <span className="inline-flex items-center gap-1 text-slate-500">
                        <Clock className="w-3 h-3" />
                        {msg.executionTimeMs} ms
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => handleCopy(msg.id, msg.text)}
                    className="hover:text-amber-400 transition-colors p-1"
                    title="Copy message"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 px-1">
              {msg.timestamp}
            </span>
          </div>
        ))}

        {isSending && (
          <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold p-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Retrieving live backend metrics from JOXIQ AI Automation Engine...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className={`p-4 border-t ${isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask admin assistant (e.g., 'What is today's summary?' or 'সার্ভার হেলথ দেখাও')..."
            className={`flex-1 px-4 py-3 rounded-xl text-sm transition-all outline-none ${
              isDark
                ? "bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:border-amber-500/60"
                : "bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-amber-500"
            }`}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isSending}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center gap-2 cursor-pointer"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
