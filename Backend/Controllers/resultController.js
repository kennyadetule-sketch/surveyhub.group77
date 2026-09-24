const Response = require("../Models/Response");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");
const mongoose = require("mongoose");
const { findSurveyById, getQuestionsBySurvey, getResponsesBySurvey } = require("../Config/mockStore");

const isMockMode = () => process.env.MOCK_MODE === "true" || mongoose.connection.readyState !== 1;

exports.getResults = async (req, res) => {
  try {
    const { surveyId } = req.params;

    if (isMockMode()) {
      const survey = findSurveyById(surveyId);
      if (!survey || String(survey.creator) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: "Survey not found." });
      }

      const questions = getQuestionsBySurvey(surveyId);
      const responses = getResponsesBySurvey(surveyId);
      const summaries = questions.map((question) => {
        const answers = responses
          .map((response) => response.answers.find((item) => item.question.toString() === question._id.toString()))
          .filter(Boolean)
          .map((item) => item.answer);

        if (question.type === "short-text" || question.type === "long-text") {
          return { questionId: question._id, type: question.type, text: question.text, results: answers };
        }

        const counts = {};
        answers.flat().forEach((answer) => {
          counts[answer] = (counts[answer] || 0) + 1;
        });

        return { questionId: question._id, type: question.type, text: question.text, results: counts };
      });

      return res.status(200).json({
        success: true,
        data: { totalResponses: responses.length, completionRate: responses.length > 0 ? 100 : 0, summaries },
      });
    }

    const survey = await Survey.findOne({ _id: surveyId, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    const questions = await Question.find({ survey: surveyId }).sort({ createdAt: 1 });
    const responses = await Response.find({ survey: surveyId });

    const summaries = questions.map((question) => {
      const answers = responses
        .map((response) => response.answers.find((item) => item.question.toString() === question._id.toString()))
        .filter(Boolean)
        .map((item) => item.answer);

      if (question.type === "short-text" || question.type === "long-text") {
        return { questionId: question._id, type: question.type, text: question.text, results: answers };
      }

      const counts = {};
      answers.flat().forEach((answer) => {
        counts[answer] = (counts[answer] || 0) + 1;
      });

      return { questionId: question._id, type: question.type, text: question.text, results: counts };
    });

    return res.status(200).json({
      success: true,
      data: {
        totalResponses: responses.length,
        completionRate: responses.length > 0 ? 100 : 0,
        summaries,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error calculating survey results." });
  }
};