const mongoose = require("mongoose");

const surveySchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },

    status: {
      type: String,
      enum: ["draft", "published", "closed"],
      default: "draft",
    },

    coverImage: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Survey", surveySchema);