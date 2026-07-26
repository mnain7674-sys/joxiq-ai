import React, { useEffect, useState } from "react";
import { Activity, RefreshCw, ShieldAlert, Cpu, Key, CheckCircle2, Clock } from "lucide-react";

export interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
}

interface AutomationActivityFeedProps {
  className?: string;
  maxHeight?: string;
}

export const AutomationActivityFeed: React.FC<AutomationActivityFeedProps> = ({
  className = "",
  maxHeight = "380px"
}) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchLogs = async () => {
    try {
      setError(null);
      const res = await fetch("/api/admin/automation-logs");
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.status === "success" && Array.isArray(data.logs)) {
        setLogs(data.logs);
      } else {
        setLogs([]);
      }
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Error fetching automation logs:", err);
      setError("Failed to load activity logs.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 10000); // 10-second polling

    return () => clearInterval(interval);
  }, []);

  const getLogCategoryInfo = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes("security") || act.includes("block") || act.includes("ddos") || act.includes("guard")) {
      return {
        borderClass: "border-l-4 border-l-rose-500 bg-rose-500/10 dark:bg-rose-950/20",
        badgeBg: "bg-rose-500/20 text-rose-400 border-rose-500/30",
        icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
        type: "Security Alert"
      };
    }
    if (act.includes("healing") || act.includes("cache") || act.includes("clear") || act.includes("heal")) {
      return {
        borderClass: "border-l-4 border-l-emerald-500 bg-emerald-500/10 dark:bg-emerald-950/20",
        badgeBg: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        icon: <Cpu className="w-4 h-4 text-emerald-400" />,
        type: "Self Healing"
      };
    }
    if (act.includes("token") || act.includes("pause") || act.includes("user") || act.includes("pin")) {
      return {
        borderClass: "border-l-4 border-l-amber-500 bg-amber-500/10 dark:bg-amber-950/20",
        badgeBg: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        icon: <Key className="w-4 h-4 text-amber-400" />,
        type: "Token/User"
      };
    }
    return {
      borderClass: "border-l-4 border-l-blue-500 bg-blue-500/10 dark:bg-blue-950/20",
      badgeBg: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: <Activity className="w-4 h-4 text-blue-400" />,
      type: "Automation"
    };
  };

  return (
    <div
      className={`bg-slate-900/90 border border-slate-800 rounded-xl p-5 text-slate-100 shadow-xl backdrop-blur-md ${className}`}
    >
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-base text-slate-100 flex items-center gap-2">
              🤖 AI Automation Activity Feed
            </h3>
            {lastRefreshed && (
              <p className="text-xs text-slate-400">
                Updated at {lastRefreshed}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            Live Monitoring
          </span>

          <button
            onClick={fetchLogs}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer disabled:opacity-50"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div
        className="overflow-y-auto pr-1.5 flex flex-col gap-3 custom-scrollbar"
        style={{ maxHeight }}
      >
        {isLoading && logs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
            <p>Fetching latest automation activity logs...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-rose-400 text-sm bg-rose-500/10 rounded-lg p-4 border border-rose-500/20">
            <p>{error}</p>
            <button
              onClick={fetchLogs}
              className="mt-2 text-xs text-rose-300 underline cursor-pointer"
            >
              Try again
            </button>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm bg-slate-800/40 rounded-lg border border-dashed border-slate-700/60 p-6">
            <CheckCircle2 className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="font-medium text-slate-300">No automation activity recorded yet.</p>
            <p className="text-xs text-slate-400 mt-1">Actions taken by the Self-Healing Engine or Security Guard will appear here in real time.</p>
          </div>
        ) : (
          logs.map((log, idx) => {
            const cat = getLogCategoryInfo(log.action);
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg transition-all border border-slate-800/60 ${cat.borderClass} hover:border-slate-700`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {cat.icon}
                    <span className="font-semibold text-sm text-slate-200">
                      {log.action}
                    </span>
                  </div>
                  <span className={`text-[11px] px-2 py-0.5 rounded-md border font-medium ${cat.badgeBg}`}>
                    {cat.type}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed pl-6">
                  {log.details}
                </p>

                <div className="flex items-center gap-1 mt-2 pl-6 text-[11px] text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
