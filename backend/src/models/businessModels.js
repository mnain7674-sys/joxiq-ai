const mongoose = require("mongoose");
const { Schema } = mongoose;

const TokenUsageSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  provider: { type: String, enum: ["gemini", "chatgpt", "claude"] },
  model: String,
  inputTokens: Number,
  outputTokens: Number,
  totalTokens: Number,
  latencyMs: Number,
  success: { type: Boolean, default: true },
  timestamp: { type: Date, default: Date.now },
});

const SubscriptionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  plan: { type: String, enum: ["free", "pro", "premium"], default: "free" },
  status: { type: String, enum: ["active", "cancelled", "expired"], default: "active" },
  renewsAt: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: Date,
});

const PaymentSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  amount: Number,
  currency: { type: String, default: "USD" },
  provider: String,
  status: { type: String, enum: ["success", "failed", "pending"] },
  verifiedAt: { type: Date, default: Date.now },
});

const ProgressSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  unitId: String,
  score: Number,
  completedAt: { type: Date, default: Date.now },
});

const FeedbackSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  text: String,
  sentiment: { type: String, enum: ["positive", "neutral", "negative"] },
  submittedAt: { type: Date, default: Date.now },
});

module.exports = {
  TokenUsage: mongoose.models.TokenUsage || mongoose.model("TokenUsage", TokenUsageSchema),
  Subscription: mongoose.models.Subscription || mongoose.model("Subscription", SubscriptionSchema),
  Payment: mongoose.models.Payment || mongoose.model("Payment", PaymentSchema),
  Progress: mongoose.models.Progress || mongoose.model("Progress", ProgressSchema),
  Feedback: mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema),
};
