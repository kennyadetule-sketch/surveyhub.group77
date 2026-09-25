const Response = require("../Models/Response");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");

//create response
exports.createResponse = async (req, res) => {
  try {
    const { surveyId, answers } = req.body;

    if (!surveyId || !answers || typeof answers !== "object") {
      return res.status(400).json({ success: false, message: "Survey ID and answers are required." });
    }

    const survey = await Survey.findOne({ _id: surveyId, visibility: "public", status: "published" });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found or no longer accepting responses." });
    }

    const questions = await Question.find({ survey: surveyId });
    for (const question of questions) {
      if (question.required) {
        const answer = answers[question._id.toString()];
        if (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
          return res.status(400).json({ success: false, message: `Please answer the required question: "${question.text}"` });
        }
      }
    }

    const formattedAnswers = questions
      .filter((question) => answers[question._id.toString()] !== undefined)
      .map((question) => ({ question: question._id, answer: answers[question._id.toString()] }));

    const response = await Response.create({ survey: surveyId, respondent: "Anonymous", answers: formattedAnswers });
    return res.status(201).json({ success: true, message: "Response submitted successfully.", data: response });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error submitting response." });
  }
};

//get response by survey
exports.getResponsesBySurvey = async (req, res) => {
  try {

    const survey = await Survey.findOne({ _id: req.params.surveyId, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    const responses = await Response.find({ survey: survey._id }).populate("answers.question", "text type").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: responses });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving responses." });
  }
};