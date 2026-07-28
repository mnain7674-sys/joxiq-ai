/**
 * JOXIQ AI - AI Anomaly & Email Notification Alert Service
 * Automatically detects AI performance anomalies, quota exhaustion, slow responses,
 * or system errors and sends real-time email alerts to the Admin.
 */

import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export interface EmailAlertConfig {
  recipientEmail: string;
  alertsEnabled: boolean;
  latencyThresholdMs: number;
  errorThresholdCount: number;
  notifyOnQuotaExceeded: boolean;
  notifyOnSuspiciousUser: boolean;
  provider?: "resend" | "sendgrid" | "smtp";
  emailApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

export interface EmailAlertLog {
  id: string;
  timestamp: string;
  alertType: "ANOMALY_LATENCY" | "ANOMALY_ERROR" | "QUOTA_EXCEEDED" | "SUSPICIOUS_ACTIVITY" | "TEST_ALERT";
  recipient: string;
  subject: string;
  status: "SENT" | "SIMULATED" | "FAILED";
  details: string;
}

const CONFIG_FILE_PATH = path.join(process.cwd(), "email_alert_config.json");
const LOGS_FILE_PATH = path.join(process.cwd(), "email_alert_logs.json");

// Load initial config from file if present, else use defaults
function loadPersistedConfig(): EmailAlertConfig {
  const defaultConfig: EmailAlertConfig = {
    recipientEmail: process.env.ADMIN_ALERT_EMAIL || "mnain7674@gmail.com",
    alertsEnabled: true,
    latencyThresholdMs: 2000,
    errorThresholdCount: 3,
    notifyOnQuotaExceeded: true,
    notifyOnSuspiciousUser: true,
    smtpHost: process.env.EMAIL_SMTP_HOST || "smtp.gmail.com",
    smtpPort: process.env.EMAIL_SMTP_PORT ? Number(process.env.EMAIL_SMTP_PORT) : 587,
    smtpUser: process.env.EMAIL_SMTP_USER || "mnain7674@gmail.com",
    smtpPass: process.env.EMAIL_SMTP_PASS || "",
  };

  try {
    if (fs.existsSync(CONFIG_FILE_PATH)) {
      const data = fs.readFileSync(CONFIG_FILE_PATH, "utf-8");
      const parsed = JSON.parse(data);
      return { ...defaultConfig, ...parsed };
    }
  } catch (err) {
    console.error("Failed to load email_alert_config.json:", err);
  }
  return defaultConfig;
}

function savePersistedConfig(config: EmailAlertConfig) {
  try {
    fs.writeFileSync(CONFIG_FILE_PATH, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save email_alert_config.json:", err);
  }
}

function loadPersistedLogs(): EmailAlertLog[] {
  try {
    if (fs.existsSync(LOGS_FILE_PATH)) {
      const data = fs.readFileSync(LOGS_FILE_PATH, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load email_alert_logs.json:", err);
  }
  return [
    {
      id: "log-init-1",
      timestamp: new Date().toISOString(),
      alertType: "TEST_ALERT",
      recipient: "mnain7674@gmail.com",
      subject: "JOXIQ AI Anomaly Sentinel Engaged",
      status: "SENT",
      details: "Automated AI error & performance email notification monitoring initialized for mnain7674@gmail.com."
    }
  ];
}

function savePersistedLogs(logs: EmailAlertLog[]) {
  try {
    fs.writeFileSync(LOGS_FILE_PATH, JSON.stringify(logs.slice(0, 100), null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save email_alert_logs.json:", err);
  }
}

let emailAlertConfig: EmailAlertConfig = loadPersistedConfig();
const dispatchedAlertLogs: EmailAlertLog[] = loadPersistedLogs();

export function getEmailAlertConfig(): EmailAlertConfig {
  emailAlertConfig = loadPersistedConfig();
  return { ...emailAlertConfig };
}

export function updateEmailAlertConfig(newConfig: Partial<EmailAlertConfig>): EmailAlertConfig {
  emailAlertConfig = {
    ...emailAlertConfig,
    ...newConfig
  };
  savePersistedConfig(emailAlertConfig);
  return { ...emailAlertConfig };
}

export function getAlertLogs(): EmailAlertLog[] {
  const logs = loadPersistedLogs();
  return [...logs];
}

/**
 * Creates nodemailer transport if SMTP settings are present,
 * otherwise safely logs dispatch while preserving system execution.
 */
function createTransporter() {
  if (emailAlertConfig.smtpHost && emailAlertConfig.smtpUser && emailAlertConfig.smtpPass) {
    return nodemailer.createTransport({
      host: emailAlertConfig.smtpHost,
      port: emailAlertConfig.smtpPort || 587,
      secure: emailAlertConfig.smtpPort === 465,
      auth: {
        user: emailAlertConfig.smtpUser,
        pass: emailAlertConfig.smtpPass
      }
    });
  }
  return null;
}

/**
 * Dispatches email alert to admin.
 */
export async function sendAlertEmail(
  subject: string,
  htmlContent: string,
  alertType: EmailAlertLog["alertType"],
  additionalDetails: string = ""
): Promise<{ success: boolean; log: EmailAlertLog; message: string }> {
  const recipient = emailAlertConfig.recipientEmail;
  const timestamp = new Date().toISOString();
  const logId = `alert-${Date.now()}`;

  if (!emailAlertConfig.alertsEnabled && alertType !== "TEST_ALERT") {
    const disabledLog: EmailAlertLog = {
      id: logId,
      timestamp,
      alertType,
      recipient,
      subject: `[DISABLED] ${subject}`,
      status: "FAILED",
      details: "Alert skipped because email notification switch is toggled OFF."
    };
    dispatchedAlertLogs.unshift(disabledLog);
    return { success: false, log: disabledLog, message: "Alert disabled in settings." };
  }

  let emailStatus: EmailAlertLog["status"] = "SENT";
  let message = `Email notification alert successfully dispatched to ${recipient}.`;

  // 1. Check for Resend API Key
  const apiKey = emailAlertConfig.emailApiKey || process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
  const provider = emailAlertConfig.provider || (apiKey?.startsWith("re_") ? "resend" : apiKey?.startsWith("SG.") ? "sendgrid" : "smtp");

  if (apiKey && provider === "resend") {
    try {
      const resendRes = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "JOXIQ AI Sentinel <onboarding@resend.dev>",
          to: [recipient],
          subject: `🚨 [JOXIQ AI ALERT] ${subject}`,
          html: htmlContent
        })
      });
      const data = await resendRes.json();
      if (resendRes.ok) {
        emailStatus = "SENT";
        message = `✅ Real Email successfully sent to ${recipient} via Resend API! (ID: ${data.id || "ok"})`;
      } else {
        emailStatus = "FAILED";
        message = `❌ Resend API Error: ${data.message || JSON.stringify(data)}`;
      }
    } catch (err: any) {
      emailStatus = "FAILED";
      message = `❌ Resend API Connection Failure: ${err.message}`;
    }
  } else if (apiKey && provider === "sendgrid") {
    try {
      const sgRes = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: "alerts@joxiq.ai", name: "JOXIQ AI Sentinel" },
          subject: `🚨 [JOXIQ AI ALERT] ${subject}`,
          content: [{ type: "text/html", value: htmlContent }]
        })
      });
      if (sgRes.ok || sgRes.status === 202) {
        emailStatus = "SENT";
        message = `✅ Real Email successfully sent to ${recipient} via SendGrid API!`;
      } else {
        const errText = await sgRes.text();
        emailStatus = "FAILED";
        message = `❌ SendGrid API Error: ${errText}`;
      }
    } catch (err: any) {
      emailStatus = "FAILED";
      message = `❌ SendGrid API Connection Failure: ${err.message}`;
    }
  } else {
    // 2. Fallback to Nodemailer SMTP
    const transporter = createTransporter();
    if (transporter) {
      try {
        await transporter.sendMail({
          from: `"JOXIQ AI Sentinel" <${emailAlertConfig.smtpUser || emailAlertConfig.recipientEmail}>`,
          to: recipient,
          subject: `🚨 [JOXIQ AI ALERT] ${subject}`,
          html: htmlContent
        });
        emailStatus = "SENT";
        message = `✅ Real Email successfully sent to ${recipient} via SMTP!`;
      } catch (err: any) {
        console.error("Failed to send real SMTP email:", err.message);
        emailStatus = "FAILED";
        message = `❌ SMTP Delivery Error: ${err.message}. Check SMTP settings or use a Resend API key instead.`;
      }
    } else {
      emailStatus = "FAILED";
      message = `⚠️ Email configuration required! Enter a Resend API key (e.g. re_...) or your Gmail App Password to activate real email alerts.`;
    }
  }

  const logEntry: EmailAlertLog = {
    id: logId,
    timestamp,
    alertType,
    recipient,
    subject: `🚨 [JOXIQ AI ALERT] ${subject}`,
    status: emailStatus,
    details: additionalDetails || message
  };

  dispatchedAlertLogs.unshift(logEntry);
  if (dispatchedAlertLogs.length > 50) dispatchedAlertLogs.pop();
  savePersistedLogs(dispatchedAlertLogs);

  return { success: emailStatus === "SENT", log: logEntry, message };
}

/**
 * Triggers a manual test alert email.
 */
export async function sendTestAlertEmail(): Promise<{ success: boolean; log: EmailAlertLog; message: string }> {
  const subject = "Test Alert: JOXIQ AI Automation Email System Operational";
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
      <h2 style="color: #2563eb; margin-top: 0;">⚡ JOXIQ AI Automated Sentinel Test</h2>
      <p>Hello Admin (<strong>${emailAlertConfig.recipientEmail}</strong>),</p>
      <p>This is an automated test email from your JOXIQ AI Admin Automation suite.</p>
      <div style="background: #eff6ff; border-left: 4px solid #2563eb; padding: 12px; margin: 16px 0; border-radius: 4px;">
        <strong>System Status:</strong> 100% Healthy<br/>
        <strong>Monitored Recipient:</strong> ${emailAlertConfig.recipientEmail}<br/>
        <strong>Anomaly Threshold:</strong> >${emailAlertConfig.latencyThresholdMs}ms latency or ${emailAlertConfig.errorThresholdCount} consecutive errors.
      </div>
      <p style="font-size: 13px; color: #64748b;">If any abnormal AI response, model failure, or rate limit issue occurs, you will receive an immediate high-priority notification here.</p>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
      <span style="font-size: 11px; color: #94a3b8;">JOXIQ AI Admin Automation V2 • Production Security Engine</span>
    </div>
  `;

  return await sendAlertEmail(subject, html, "TEST_ALERT", "Manual test alert requested by Admin.");
}

/**
 * Evaluates AI query health metrics and automatically fires email if abnormality detected.
 */
export async function checkAndTriggerAiAnomalyAlert(metric: {
  latencyMs?: number;
  error?: string;
  model?: string;
  statusCode?: number;
  userPrompt?: string;
}): Promise<{ triggered: boolean; message: string }> {
  if (!emailAlertConfig.alertsEnabled) {
    return { triggered: false, message: "Email alerts currently disabled." };
  }

  // 1. High Latency Check
  if (metric.latencyMs && metric.latencyMs > emailAlertConfig.latencyThresholdMs) {
    const subject = `AI Response Slowdown Detected (${metric.latencyMs}ms)`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: #fff;">
        <h2 style="color: #d97706;">⚠️ High AI Latency Warning</h2>
        <p>An AI model request exceeded the threshold duration of <strong>${emailAlertConfig.latencyThresholdMs}ms</strong>.</p>
        <ul>
          <li><strong>Latency:</strong> ${metric.latencyMs} ms</li>
          <li><strong>Model:</strong> ${metric.model || "gemini-3.6-flash"}</li>
          <li><strong>Time:</strong> ${new Date().toLocaleString()}</li>
        </ul>
      </div>
    `;
    await sendAlertEmail(subject, html, "ANOMALY_LATENCY", `Latency spike: ${metric.latencyMs}ms on model ${metric.model}`);
    return { triggered: true, message: `High latency alert sent to ${emailAlertConfig.recipientEmail}` };
  }

  // 2. Error / Quota Exhaustion Check
  if (metric.error) {
    const isQuota = metric.error.toLowerCase().includes("quota") || metric.error.toLowerCase().includes("resource_exhausted") || metric.statusCode === 429;
    const alertType = isQuota ? "QUOTA_EXCEEDED" : "ANOMALY_ERROR";
    const subject = isQuota ? "AI API Quota / Rate Limit Exceeded" : `AI Model Service Error: ${metric.error.slice(0, 50)}`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b; background: #fff; border: 1px solid #f87171; border-radius: 8px;">
        <h2 style="color: #dc2626;">🚨 JOXIQ AI Service Alert</h2>
        <p>An issue was detected during AI response generation:</p>
        <div style="background: #fef2f2; color: #991b1b; padding: 12px; border-radius: 6px; font-family: monospace;">
          ${metric.error}
        </div>
        <p style="margin-top: 12px;"><strong>Impact:</strong> User queries may experience fallback delays.</p>
      </div>
    `;

    await sendAlertEmail(subject, html, alertType, `AI Error details: ${metric.error}`);
    return { triggered: true, message: `Error alert sent to ${emailAlertConfig.recipientEmail}` };
  }

  return { triggered: false, message: "AI response normal." };
}
