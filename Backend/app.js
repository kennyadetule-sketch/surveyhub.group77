const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, ".env") });

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./Config/Database");

const surveyRoutes = require("./Routes/surveyRoutes");
const questionRoutes = require("./Routes/questionRoutes");
const responseRoutes = require("./Routes/responseRoutes");
const authRoutes = require("./Routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 7000;

// Middleware
app.use(cors());
app.use(express.json());

// Database availability check
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message: "The database is temporarily unavailable. Please try again shortly.",
      data: null,
    });
  }

  next();
});

// Routes
app.use("/api/surveys", surveyRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/responses", responseRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the Survey and Feedback App API",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  const dbReady = await connectDB();

  if (!dbReady) {
    console.error("Database connection failed. Server is not starting.");
    process.exit(1);
    return;
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

module.exports = app;