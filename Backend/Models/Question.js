const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["short-text", "long-text", "multiple-choice", "checkbox", "yes-no", "rating"],
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
