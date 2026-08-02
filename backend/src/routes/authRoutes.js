const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (e) {
    res.status(401).json({ error: e.message });
  }
});

module.exports = router;
