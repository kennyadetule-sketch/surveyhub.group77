const User = require("../Models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const createToken = (user) => jwt.sign(
  { id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  profileImage: user.profileImage || "",
  createdAt: user.createdAt,
});

// REGISTER USER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const profileImage = req.file?.path || req.body?.profileImage || "";

    if (!fullName?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ success: false, message: "Full name, email and password are required." });
    }
    if (fullName.trim().length > 50) {
      return res.status(400).json({ success: false, message: "Full name cannot exceed 50 characters." });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      profileImage,
      role: "creator",
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: { user: sanitizeUser(user), token: createToken(user) },
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({ success: false, message: "Error registering user." });
  }
};

//LOGIN USER
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }

    const user = await User.findOne({ email: String(email).trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password." });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user: sanitizeUser(user), token: createToken(user) },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ success: false, message: "Error logging in user." });
  }
};

//USER PROFILE
exports.me = async (req, res) => {
  try {
    return res.status(200).json({ success: true, data: { user: sanitizeUser(req.user) } });
  } catch (error) {
    console.error("Profile error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve profile." });
  }
};

//UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    const { fullName, email, password } = req.body;

    if (fullName !== undefined) {
      const value = String(fullName).trim();
      if (value.length < 3 || value.length > 50) {
        return res.status(400).json({ success: false, message: "Full name must be between 3 and 50 characters." });
      }
      user.fullName = value;
    }

    if (email !== undefined) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (!normalizedEmail) return res.status(400).json({ success: false, message: "Email cannot be empty." });
      const existing = await User.findOne({ email: normalizedEmail, _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ success: false, message: "That email is already in use." });
      user.email = normalizedEmail;
    }

    if (password) {
      if (password.length < 6) return res.status(400).json({ success: false, message: "New password must be at least 6 characters." });
      user.password = await bcrypt.hash(password, 10);
    }

    if (req.file?.path) user.profileImage = req.file.path;

    await user.save();
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      data: { user: sanitizeUser(user) },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ success: false, message: "Unable to update your profile right now." });
  }
};
