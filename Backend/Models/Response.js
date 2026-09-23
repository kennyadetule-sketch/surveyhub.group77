const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: true,
    },

    answer: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
  },
  { _id: false }
);

const responseSchema = new mongoose.Schema(
  {
    survey: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Survey",
      required: true,
    },

    respondent: {
      type: String,
      default: "Anonymous",
    },

    answers: {
      type: [answerSchema],
      required: true,
    },
  },
  
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Response", responseSchema);