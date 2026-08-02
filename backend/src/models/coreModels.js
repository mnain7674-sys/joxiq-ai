const mongoose = require("mongoose");
const { Schema } = mongoose;

const UserSchema = new Schema({
  email: { type: String, unique: true, sparse: true },
  createdAt: { type: Date, default: Date.now },
  lastActiveAt: Date,
  preferences: { type: Schema.Types.Mixed, default: {} },
});

/** Admins are separate from regular users — they log in with their own JWT-based auth. */
const AdminSchema = new Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["super_admin", "admin", "support"], default: "admin" },
  createdAt: { type: Date, default: Date.now },
});

const ConversationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: String,
  messages: [{
    role: { type: String, enum: ["user", "assistant"] },
    content: String,
    savedAt: { type: Date, default: Date.now },
  }],
  favorited: { type: Boolean, default: false },
  category: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = {
  User: mongoose.models.User || mongoose.model("User", UserSchema),
  Admin: mongoose.models.Admin || mongoose.model("Admin", AdminSchema),
  Conversation: mongoose.models.Conversation || mongoose.model("Conversation", ConversationSchema),
};
