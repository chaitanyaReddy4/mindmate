const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const roleMiddleware = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/health", authMiddleware, roleMiddleware("admin"), (_req, res) => {
  res.json({ ok: true, scope: "admin" });
});

module.exports = router;
