const User = require("../Models/User");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { createUser, findUserByEmail, findUserById } = require("../Config/mockStore");

const createToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  fullName: user.fullName,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt,
});

const isMockMode = () => process.env.MOCK_MODE === "true" || mongoose.connection.readyState === 0;

// REGISTER
exports.register = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (isMockMode()) {
      const existingUser = findUserByEmail(normalizedEmail);
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = createUser({
        fullName,
        email: normalizedEmail,
        password: hashedPassword,
        role: "creator",
      });

      const token = createToken(user);
      return res.status(201).json({
        success: true,
        message: "User registered successfully.",
        data: { user: sanitizeUser(user), token },
      });
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email: normalizedEmail,
      password: hashedPassword,
      role: "creator",
    });

    const token = createToken(user);

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error registering user.",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    let user;

    if (isMockMode()) {
      user = findUserByEmail(normalizedEmail);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = createToken(user);
      return res.status(200).json({
        success: true,
        message: "Login successful.",
        data: { user: sanitizeUser(user), token },
      });
    }

    user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = createToken(user);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        user: sanitizeUser(user),
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error logging in user.",
    });
  }
};

// CURRENT USER
exports.me = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      data: {
        user: sanitizeUser(req.user),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve profile.",
    });
  }
};