const Question = require("../Models/Question");
const Survey = require("../Models/Survey");

const optionTypes = ["multiple-choice", "checkbox"];

//Create question
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, type, options, surveyId, required } = req.body;

    if (!questionText || !type || !surveyId) {
      return res.status(400).json({ success: false, message: "Question text, type and survey ID are required." });
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