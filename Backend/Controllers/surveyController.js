const mongoose = require("mongoose");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");
const Response = require("../Models/Response");
const { sendEmail } = require("../Middleware/EmailSender");

const normalizeSurveyValue = (value) => String(value ?? "").trim().toLowerCase();

const validateSurveyContent = ({ title, description }) => {
  if (!title?.trim() || !description?.trim()) return "Title and description are required.";
  if (title.trim().length < 3 || title.trim().length > 150) return "Survey title must be between 3 and 150 characters.";
  if (description.trim().length > 1000) return "Survey description cannot exceed 1000 characters.";
  return null;
};

const hasQuestions = async (surveyId) => (await Question.countDocuments({ survey: surveyId })) > 0;

//CREATE SURVEY
exports.createSurvey = async (req, res) => {
  try {
    const { title, description, visibility, status, coverImage } = req.body;
    const contentError = validateSurveyContent({ title, description });
    if (contentError) return res.status(400).json({ success: false, message: contentError, data: null });

    const normalizedVisibility = normalizeSurveyValue(visibility || "public");
    const normalizedStatus = normalizeSurveyValue(status || "draft");

    if (!["public", "private"].includes(normalizedVisibility)) {
      return res.status(400).json({ success: false, message: "Visibility must be either public or private.", data: null });
    }
    if (!["draft", "published", "closed"].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Status must be draft, published, or closed.", data: null });
    }
    if (normalizedStatus === "published") {
      return res.status(400).json({ success: false, message: "Create the survey as a draft, add at least one question, then publish it.", data: null });
    }

    const survey = await Survey.create({
      creator: req.user._id,
      title: title.trim(),
      description: description.trim(),
      visibility: normalizedVisibility,
      status: normalizedStatus,
      publishedAt: null,
      coverImage: coverImage || "",
    });

    sendEmail(
      req.user.email,
      "New Survey Created",
      `Your survey "${survey.title}" has been created successfully.\n\nSurvey ID: ${survey._id}`
    ).catch((emailError) => console.error("Survey email failed:", emailError.message));

    return res.status(201).json({ success: true, message: "Survey created successfully.", data: survey });
  } catch (error) {
    console.error("Create survey error:", error);
    return res.status(500).json({ success: false, message: "Unable to create the survey right now. Please try again.", data: null });
  }
};

//GET SURVEYS
exports.getSurveys = async (req, res) => {
  try {
    const { search, status } = req.query;
    const query = { creator: req.user._id };
    if (status) query.status = normalizeSurveyValue(status);
    if (search?.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { description: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const surveys = await Survey.find(query).sort({ createdAt: -1 }).lean();
    if (!surveys.length) return res.status(200).json({ success: true, message: "Surveys retrieved successfully.", data: [] });

    const surveyIds = surveys.map((survey) => survey._id);
    const [questionCounts, responseCounts] = await Promise.all([
      Question.aggregate([
        { $match: { survey: { $in: surveyIds } } },
        { $group: { _id: "$survey", count: { $sum: 1 } } },
      ]),
      Response.aggregate([
        { $match: { survey: { $in: surveyIds } } },
        { $group: { _id: "$survey", count: { $sum: 1 } } },
      ]),
    ]);

    const questionCountMap = Object.fromEntries(questionCounts.map((item) => [item._id.toString(), item.count]));
    const responseCountMap = Object.fromEntries(responseCounts.map((item) => [item._id.toString(), item.count]));

    return res.status(200).json({
      success: true,
      message: "Surveys retrieved successfully.",
      data: surveys.map((survey) => ({
        ...survey,
        questionCount: questionCountMap[survey._id.toString()] || 0,
        responseCount: responseCountMap[survey._id.toString()] || 0,
      })),
    });
  } catch (error) {
    console.error("Get surveys error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve your surveys right now. Please try again.", data: null });
  }
};

//GET SURVEY BY ID
exports.getSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid survey ID.", data: null });
    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found.", data: null });
    const questions = await Question.find({ survey: survey._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, message: "Survey retrieved successfully.", data: { ...survey.toObject(), questions } });
  } catch (error) {
    console.error("Get survey error:", error);
    return res.status(500).json({ success: false, message: "Unable to retrieve the survey right now. Please try again.", data: null });
  }
};

exports.getPublicSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid survey ID.", data: null });
    const survey = await Survey.findOne({ _id: req.params.id, visibility: "public", status: "published" });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found or no longer available.", data: null });
    const questions = await Question.find({ survey: survey._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, message: "Public survey retrieved successfully.", data: { ...survey.toObject(), questions } });
  } catch (error) {
    console.error("Get public survey error:", error);
    return res.status(500).json({ success: false, message: "Unable to load this survey right now. Please try again.", data: null });
  }
};

//UPDATE SURVEY
exports.updateSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid survey ID.", data: null });

    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found.", data: null });

    const { title, description, visibility, status, coverImage } = req.body;

    if (title !== undefined) {
      if (title.trim().length < 3 || title.trim().length > 150) return res.status(400).json({ success: false, message: "Survey title must be between 3 and 150 characters.", data: null });
      survey.title = title.trim();
    }
    if (description !== undefined) {
      if (!description.trim()) return res.status(400).json({ success: false, message: "Survey description cannot be empty.", data: null });
      if (description.trim().length > 1000) return res.status(400).json({ success: false, message: "Survey description cannot exceed 1000 characters.", data: null });
      survey.description = description.trim();
    }
    if (visibility !== undefined) {
      const value = normalizeSurveyValue(visibility);
      if (!["public", "private"].includes(value)) return res.status(400).json({ success: false, message: "Visibility must be either public or private.", data: null });
      survey.visibility = value;
    }

    if (status !== undefined) {
      const nextStatus = normalizeSurveyValue(status);
      if (!["draft", "published", "closed"].includes(nextStatus)) return res.status(400).json({ success: false, message: "Status must be draft, published, or closed.", data: null });

      if (nextStatus === "published" && survey.status !== "published") {
        if (!(await hasQuestions(survey._id))) {
          return res.status(400).json({ success: false, message: "You must add at least one question before publishing this survey.", data: null });
        }
        survey.publishedAt = new Date();
      }

      if (nextStatus === "draft") survey.publishedAt = null;
      if (nextStatus === "closed" && survey.status !== "closed" && !survey.publishedAt) survey.publishedAt = new Date();
      survey.status = nextStatus;
    }

    if (coverImage !== undefined) survey.coverImage = coverImage;

    await survey.save();
    return res.status(200).json({ success: true, message: "Survey updated successfully.", data: survey });
  } catch (error) {
    console.error("Update survey error:", error);
    return res.status(500).json({ success: false, message: "Unable to update the survey right now. Please try again.", data: null });
  }
};

//DELETE SURVEY
exports.deleteSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid survey ID.", data: null });
    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) return res.status(404).json({ success: false, message: "Survey not found.", data: null });
    await Question.deleteMany({ survey: survey._id });
    await Response.deleteMany({ survey: survey._id });
    await survey.deleteOne();
    return res.status(200).json({ success: true, message: "Survey deleted successfully.", data: null });
  } catch (error) {
    console.error("Delete survey error:", error);
    return res.status(500).json({ success: false, message: "Unable to delete the survey right now. Please try again.", data: null });
  }
};
