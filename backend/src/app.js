const express = require("express");
const cors = require("cors");
const { connectDatabase } = require("./db/connect");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDatabase();
  app.listen(PORT, () => console.log(`JOXIQ AI Unified Backend running on port ${PORT}`));
}

if (require.main === module) {
  start().catch((e) => {
    console.error("Failed to start:", e.message);
    process.exit(1);
  });
}

module.exports = app;
