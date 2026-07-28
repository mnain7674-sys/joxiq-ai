export interface LogEntry {
  timestamp: string;
  action: string;
  details: string;
}

const AUTOMATION_LOGS_KEY = "joxiq_automation_logs";

export class AutomationLogger {
  public static logActivity(action: string, details: string): LogEntry {
    const logEntry: LogEntry = {
      timestamp: new Date().toLocaleString(),
      action: action,
      details: details
    };

    let logs: LogEntry[] = [];
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const stored = localStorage.getItem(AUTOMATION_LOGS_KEY);
        if (stored) {
          logs = JSON.parse(stored);
        }
      } catch (e) {
        logs = [];
      }
    }

    logs.unshift(logEntry);
    logs = logs.slice(0, 50);

    if (typeof window !== "undefined" && window.localStorage) {
      try {
        localStorage.setItem(AUTOMATION_LOGS_KEY, JSON.stringify(logs));
      } catch (e) {
        // Safe fallback
      }
    }
    return logEntry;
  }
}
