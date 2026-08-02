const mongoose = require("mongoose");

/**
 * Real database connection. Replaces the JSON-file storage used in every
 * earlier prototype — this is the single place that changes if you ever
 * switch database providers.
 *
 * Set MONGODB_URI in your environment (e.g. from MongoDB Atlas's free tier):
 *   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/joxiq
 */
async function connectDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("MONGODB_URI environment variable is not set. Operating in graceful fallback mode for database queries.");
    return false;
  }
  try {
    await mongoose.connect(uri);
    console.log("Connected to MongoDB");
    return true;
  } catch (err) {
    console.error("MongoDB connection error:", err.message);
    return false;
  }
}

module.exports = { connectDatabase };
