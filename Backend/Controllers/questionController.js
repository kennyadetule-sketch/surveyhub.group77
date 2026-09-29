const mongoose = require("mongoose");
const Question = require("../Models/Question");
const Survey = require("../Models/Survey");

const optionTypes = ["multiple-choice", "checkbox"];
const EDIT_WINDOW_MS = 60 * 60 * 1000;

const getOwnedSurvey = async (surveyId, userId) => Survey.findOne({ _id: surveyId, creator: userId });

const canEditQuestions = (survey) => {
  if (survey.status !== "published") return true;
  if (!survey.publishedAt) return false;
  return Date.now() - new Date(survey.publishedAt).getTime() <= EDIT_WINDOW_MS;
};

const editWindowMessage = "Published survey questions can only be edited, added, or removed within 1 hour of publishing. Move the survey back to draft to make further structural changes.";

const validateQuestionPayload = ({ questionText, type, options }) => {
  if (!questionText?.trim()) return "Question text is required.";
  if (questionText.trim().length > 300) return "Question text cannot exceed 300 characters.";
  if (!type) return "Question type is required.";
  if (!['short-text', 'long-text', 'multiple-choice', 'checkbox', 'yes-no', 'rating'].includes(type)) return "Invalid question type.";

  if (optionTypes.includes(type)) {
    if (!Array.isArray(options) || options.length < 2) return "Multiple-choice and checkbox questions require at least 2 options.";
    if (options.length > 10) return "A question cannot have more than 10 options.";
    const cleaned = options.map((option) => String(option).trim());
    if (cleaned.some((option) => !option)) return "Options cannot be empty.";
    if (cleaned.some((option) => option.length > 100)) return "Each option cannot exceed 100 characters.";
  }
  return null;
};

//CREATE QUESTION
exports.createQuestion = async (req, res) => {
  try {
    const { questionText, type, options, surveyId, required } = req.body;
    if (!surveyId || !mongoose.Types.ObjectId.isValid(surveyId)) {
      return res.status(400).json({ success: false, message: "A valid survey ID is required." });
    }

    const survey = await getOwnedSurvey(surveyId, req.user._id);
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found." });
    if (!canEditQuestions(survey)) return res.status(403).json({ success: false, message: editWindowMessage });

    const validationError = validateQuestionPayload({ questionText, type, options });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    const newQuestion = await Question.create({
      survey: surveyId,
      text: questionText.trim(),
      type,
      required: Boolean(required),
      options: optionTypes.includes(type) ? options.map((option) => String(option).trim()) : [],
    });

    return res.status(201).json({ success: true, message: "Question created successfully.", data: newQuestion });
  } catch (error) {
    console.error("Create question error:", error);
    return res.status(500).json({ success: false, message: "Error creating question." });
  }
};

//UPDATE QUESTION
exports.updateQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid question ID." });

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const survey = await getOwnedSurvey(question.survey, req.user._id);
    if (!survey) return res.status(403).json({ success: false, message: "You do not have permission to edit this question." });
    if (!canEditQuestions(survey)) return res.status(403).json({ success: false, message: editWindowMessage });

    const { questionText, type, options, required } = req.body;
    const nextText = questionText !== undefined ? questionText : question.text;
    const nextType = type !== undefined ? type : question.type;
    const nextOptions = options !== undefined ? options : question.options;

    const validationError = validateQuestionPayload({ questionText: nextText, type: nextType, options: nextOptions });
    if (validationError) return res.status(400).json({ success: false, message: validationError });

    question.text = String(nextText).trim();
    question.type = nextType;
    question.options = optionTypes.includes(nextType) ? nextOptions.map((option) => String(option).trim()) : [];
    if (required !== undefined) question.required = Boolean(required);

    await question.save();
    return res.status(200).json({ success: true, message: "Question updated successfully.", data: question });
  } catch (error) {
    console.error("Update question error:", error);
    return res.status(500).json({ success: false, message: "Error updating question." });
  }
};

//DELETE QUESTION
exports.deleteQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid question ID." });

    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: "Question not found." });

    const survey = await getOwnedSurvey(question.survey, req.user._id);
    if (!survey) return res.status(403).json({ success: false, message: "You do not have permission to delete this question." });
    if (!canEditQuestions(survey)) return res.status(403).json({ success: false, message: editWindowMessage });

    await question.deleteOne();
    return res.status(200).json({ success: true, message: "Question deleted successfully." });
  } catch (error) {
    console.error("Delete question error:", error);
    return res.status(500).json({ success: false, message: "Error deleting question." });
  }
};