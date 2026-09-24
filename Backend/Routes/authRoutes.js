const express = require("express");
const router = express.Router();

const authController = require("../Controllers/authController");
const { protect } = require("../Middleware/authMiddleware");
const upload = require("../Middleware/upload");

router.post(
  "/register",
  (req, res, next) => {
    const contentType = req.headers["content-type"] || "";
    if (contentType.includes("multipart/form-data")) {
      return upload.single("profileImage")(req, res, next);
    }
    return next();
  },
  authController.register
);
router.post("/login", authController.login);
router.get("/me", protect, authController.me);

module.exports = router;