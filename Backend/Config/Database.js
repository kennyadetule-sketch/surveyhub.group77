const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    process.env.MOCK_MODE = "false";
    return true;
  } catch (error) {
    console.warn("MongoDB not reachable. Starting API in mock mode.");
    process.env.MOCK_MODE = "true";
    return false;
  }
};

module.exports = connectDB;