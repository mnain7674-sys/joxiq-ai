const mongoose = require("mongoose");
const { Schema } = mongoose;

const UsageEventSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  eventName: String,
  metadata: Schema.Types.Mixed,
  timestamp: { type: Date, default: Date.now },
});

const LoginAttemptSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  success: Boolean,
  deviceFingerprint: String,
  ipCountry: String,
  attemptedAt: { type: Date, default: Date.now },
});

const SecurityAlertSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  reason: String,
  details: Schema.Types.Mixed,
  acknowledged: { type: Boolean, default: false },
  raisedAt: { type: Date, default: Date.now },
});

const ErrorLogSchema = new Schema({
  context: String,
  message: String,
  stack: String,
  loggedAt: { type: Date, default: Date.now },
});

const HealthCheckSchema = new Schema({
  name: String,
  up: Boolean,
  latencyMs: Number,
  checkedAt: { type: Date, default: Date.now },
});

const AuditLogSchema = new Schema({
  adminId: { type: Schema.Types.ObjectId, ref: "Admin" },
  action: String,
  details: Schema.Types.Mixed,
  at: { type: Date, default: Date.now },
});

const NotificationSchema = new Schema({
  recipient: { type: Schema.Types.ObjectId, ref: "User" },
  title: String,
  body: String,
  sendAt: Date,
  status: { type: String, enum: ["pending", "sent"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = {
  UsageEvent: mongoose.models.UsageEvent || mongoose.model("UsageEvent", UsageEventSchema),
  LoginAttempt: mongoose.models.LoginAttempt || mongoose.model("LoginAttempt", LoginAttemptSchema),
  SecurityAlert: mongoose.models.SecurityAlert || mongoose.model("SecurityAlert", SecurityAlertSchema),
  ErrorLog: mongoose.models.ErrorLog || mongoose.model("ErrorLog", ErrorLogSchema),
  HealthCheck: mongoose.models.HealthCheck || mongoose.model("HealthCheck", HealthCheckSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema),
  Notification: mongoose.models.Notification || mongoose.model("Notification", NotificationSchema),
};
