const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    minlength: 3, 
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please add a valid email"],
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role:{
    type: String,
    enum:["creator", "admin"],
    default: "creator"
  }
},

{timestamps: true}

);

module.exports = mongoose.model("User", userSchema);