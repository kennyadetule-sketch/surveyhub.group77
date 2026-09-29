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
      minlength: 1,
      maxlength: 300,
    },
    required: {
      type: Boolean,
      default: false,
    },
    options: {
      type: [
        {
          type: String,
          trim: true,
          maxlength: 100,
        },
      ],
      default: [],
      validate: {
        validator: (options) => options.length <= 10,
        message: "A question cannot have more than 10 options.",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Question", questionSchema);
