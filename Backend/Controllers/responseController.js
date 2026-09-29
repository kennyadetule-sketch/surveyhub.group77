const Response = require("../Models/Response");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");

const LIMITS = { "short-text": 300, "long-text": 2000 };

//CREATE RESPONSE
exports.createResponse = async (req, res) => {
  try {
    const { surveyId, answers } = req.body;
    if (!surveyId || !answers || typeof answers !== "object") {
      return res.status(400).json({ success: false, message: "Survey ID and answers are required." });
    }

    const survey = await Survey.findOne({ _id: surveyId, visibility: "public", status: "published" });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found or no longer accepting responses." });

    const questions = await Question.find({ survey: surveyId });
    for (const question of questions) {
      const answer = answers[question._id.toString()];

      if (question.required && (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0))) {
        return res.status(400).json({ success: false, message: `Please answer the required question: "${question.text}"` });
      }

      if (answer === undefined || answer === null) continue;

      if (question.type === "short-text" || question.type === "long-text") {
        if (typeof answer !== "string") return res.status(400).json({ success: false, message: `Invalid answer for "${question.text}".` });
        if (answer.length > LIMITS[question.type]) return res.status(400).json({ success: false, message: `${question.type === "short-text" ? "Short-text" : "Long-text"} answers cannot exceed ${LIMITS[question.type]} characters.` });
      }

      if (question.type === "multiple-choice" && !question.options.includes(answer)) {
        return res.status(400).json({ success: false, message: `Invalid option selected for "${question.text}".` });
      }

      if (question.type === "checkbox") {
        if (!Array.isArray(answer) || answer.some((item) => !question.options.includes(item))) {
          return res.status(400).json({ success: false, message: `Invalid option selected for "${question.text}".` });
        }
      }

      if (question.type === "yes-no" && !["Yes", "No"].includes(answer)) {
        return res.status(400).json({ success: false, message: `Invalid answer for "${question.text}".` });
      }

      if (question.type === "rating" && (!Number.isInteger(Number(answer)) || Number(answer) < 1 || Number(answer) > 5)) {
        return res.status(400).json({ success: false, message: `Rating for "${question.text}" must be between 1 and 5.` });
      }
    }

    const formattedAnswers = questions
      .filter((question) => answers[question._id.toString()] !== undefined)
      .map((question) => ({ question: question._id, answer: answers[question._id.toString()] }));

    const response = await Response.create({ survey: surveyId, respondent: "Anonymous", answers: formattedAnswers });
    return res.status(201).json({ success: true, message: "Response submitted successfully.", data: response });
  } catch (error) {
    console.error("Create response error:", error);
    return res.status(500).json({ success: false, message: "Error submitting response." });
  }
};

//GET RESPONSE BY SURVEY
exports.getResponsesBySurvey = async (req, res) => {
  try {
    const survey = await Survey.findOne({ _id: req.params.surveyId, creator: req.user._id });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found." });
    const responses = await Response.find({ survey: survey._id }).populate("answers.question", "text type").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: responses });
  } catch (error) {
    console.error("Get responses error:", error);
    return res.status(500).json({ success: false, message: "Error retrieving responses." });
  }
};