const express = require("express");
const router = express.Router();

const authController = require("../Controllers/authController");
const { protect } = require("../Middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);

module.exports = router;