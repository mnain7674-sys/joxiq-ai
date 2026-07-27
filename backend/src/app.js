const express = require("express");
const cors = require("cors");
const adminAssistantRoutes = require("./routes/adminAssistantRoutes");

const app = express();
app.use(cors({ origin: "*" })); // tighten to your admin panel's URL in production
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));
app.use("/api/admin-assistant", adminAssistantRoutes);

const PORT = process.env.PORT || 4000;
if (require.main === module) {
  app.listen(PORT, () => console.log(`JOXIQ AI Admin Assistant backend running on http://localhost:${PORT}`));
}

module.exports = app;
