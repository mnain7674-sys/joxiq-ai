const { LoginAttempt, SecurityAlert } = require("../models/opsModels");
const { startOfDay, daysAgo } = require("./platformService");

async function checkSuspiciousLogin(userId, { deviceFingerprint, ipCountry }) {
  try {
    const recent = await LoginAttempt.find({ userId }).sort({ attemptedAt: -1 }).limit(5).lean();
    const knownDevices = new Set(recent.map((l) => l.deviceFingerprint));
    const knownCountries = new Set(recent.map((l) => l.ipCountry));
    const suspicious = !knownDevices.has(deviceFingerprint) && knownCountries.size > 0 && !knownCountries.has(ipCountry);
    await LoginAttempt.create({ userId, success: true, deviceFingerprint, ipCountry });
    if (suspicious) await raiseAlert(userId, "suspicious_login", { deviceFingerprint, ipCountry });
    return { available: true, suspicious };
  } catch (err) {
    return { available: true, suspicious: false };
  }
}

async function checkAccountLock(userId, { maxFailures = 5, windowMs = 15 * 60 * 1000 } = {}) {
  try {
    const since = new Date(Date.now() - windowMs);
    const failures = await LoginAttempt.countDocuments({ userId, success: false, attemptedAt: { $gte: since } });
    return { available: true, locked: failures >= maxFailures, failures };
  } catch (err) {
    return { available: true, locked: false, failures: 0 };
  }
}

function scoreSpam(text) {
  let score = 0;
  if (!text) return { available: true, spamScore: 0 };
  if ((text.match(/https?:\/\//g) || []).length > 2) score += 0.4;
  if (/\b(buy now|click here|free money|guaranteed)\b/i.test(text)) score += 0.4;
  if (text.length > 20 && text === text.toUpperCase()) score += 0.2;
  return { available: true, spamScore: Math.min(score, 1) };
}

async function raiseAlert(userId, reason, details = {}) {
  try {
    return await SecurityAlert.create({ userId, reason, details });
  } catch (err) {
    return null;
  }
}

async function getSecurityReport() {
  try {
    const alerts = await SecurityAlert.countDocuments({ acknowledged: false });
    const failedToday = await LoginAttempt.countDocuments({ success: false, attemptedAt: { $gte: startOfDay() } });
    return { available: true, unacknowledgedAlerts: alerts || 0, failedLoginsToday: failedToday || 0 };
  } catch (err) {
    return { available: true, unacknowledgedAlerts: 0, failedLoginsToday: 0 };
  }
}

function calculateRiskScore({ isNewDevice, countryMismatch, highActionRate, amount = 0 }) {
  let score = 0;
  if (isNewDevice) score += 0.25;
  if (countryMismatch) score += 0.35;
  if (highActionRate) score += 0.2;
  if (amount > 500) score += 0.2;
  return { available: true, riskScore: Math.min(score, 1), flagged: score >= 0.6 };
}

module.exports = { checkSuspiciousLogin, checkAccountLock, scoreSpam, raiseAlert, getSecurityReport, calculateRiskScore };
