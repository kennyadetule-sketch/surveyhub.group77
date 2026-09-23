const Question = require("../Models/Question");
const Survey = require("../Models/Survey");
const mongoose = require("mongoose");
const { state, createQuestion, updateQuestion, deleteQuestion, findSurveyById } = require("../Config/mockStore");

const optionTypes = ["multiple-choice", "checkbox"];
const isMockMode = () => process.env.MOCK_MODE === "true" || mongoose.connection.readyState === 0;
const findQuestionById = (id) => state.questions.find((question) => String(question._id) === String(id)) || null;

//Create question
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, type, options, surveyId, required } = req.body;

    if (!questionText || !type || !surveyId) {
      return res.status(400).json({ success: false, message: "Question text, type and survey ID are required." });
    }

    if (isMockMode()) {
      const survey = findSurveyById(surveyId);
      if (!survey || String(survey.creator) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: "Survey not found." });
      }

      if (optionTypes.includes(type) && (!options || options.length === 0)) {
        return res.status(400).json({ success: false, message: "This question type requires options." });
      }

      const newQuestion = createQuestion({ survey: surveyId, text: questionText, type, required: Boolean(required), options: options || [] });
      return res.status(201).json({ success: true, message: "Question created successfully.", data: newQuestion });
    }

    const survey = await Survey.findOne({ _id: surveyId, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    if (optionTypes.includes(type) && (!options || options.length === 0)) {
      return res.status(400).json({ success: false, message: "This question type requires options." });
    }

    const newQuestion = await Question.create({ survey: surveyId, text: questionText, type, required: Boolean(required), options: options || [] });
    return res.status(201).json({ success: true, message: "Question created successfully.", data: newQuestion });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating question." });
  }
};

//Update question
exports.updateQuestion = async (req, res) => {
  try {
    if (isMockMode()) {
      const question = findQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, message: "Question not found." });
      }

      const survey = findSurveyById(question.survey);
      if (!survey || String(survey.creator) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "You do not have permission to edit this question." });
      }

      const { questionText, type, options, required } = req.body;
      const updated = updateQuestion(req.params.id, {
        ...(questionText !== undefined ? { text: questionText } : {}),
        ...(type !== undefined ? { type } : {}),
        ...(options !== undefined ? { options } : {}),
        ...(required !== undefined ? { required } : {}),
      });

      return res.status(200).json({ success: true, message: "Question updated successfully.", data: updated });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const survey = await Survey.findOne({ _id: question.survey, creator: req.user._id });
    if (!survey) {
      return res.status(403).json({ success: false, message: "You do not have permission to edit this question." });
    }

    const { questionText, type, options, required } = req.body;
    if (questionText !== undefined) question.text = questionText;
    if (type !== undefined) question.type = type;
    if (options !== undefined) question.options = options;
    if (required !== undefined) question.required = required;

    await question.save();
    return res.status(200).json({ success: true, message: "Question updated successfully.", data: question });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating question." });
  }
};

//DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    if (isMockMode()) {
      const question = findQuestionById(req.params.id);
      if (!question) {
        return res.status(404).json({ success: false, message: "Question not found." });
      }

      const survey = findSurveyById(question.survey);
      if (!survey || String(survey.creator) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "You do not have permission to delete this question." });
      }

      deleteQuestion(req.params.id);
      return res.status(200).json({ success: true, message: "Question deleted successfully." });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ success: false, message: "Question not found." });
    }

    const survey = await Survey.findOne({ _id: question.survey, creator: req.user._id });
    if (!survey) {
      return res.status(403).json({ success: false, message: "You do not have permission to delete this question." });
    }

    await question.deleteOne();
    return res.status(200).json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting question." });
  }
};