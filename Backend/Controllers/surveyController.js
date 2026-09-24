const mongoose = require("mongoose");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");
const { sendEmail } = require("../Middleware/EmailSender");
const {
  createSurvey,
  getSurveysByCreator,
  findSurveyById,
  updateSurvey,
  deleteSurvey,
  getQuestionsBySurvey,
  getPublicSurveyById,
} = require("../Config/mockStore");

const isMockMode = () => process.env.MOCK_MODE === "true" || mongoose.connection.readyState !== 1;

const normalizeSurveyValue = (value, fallback, allowedValues) => {
  const normalized = String(value ?? fallback).trim().toLowerCase();
  return allowedValues.includes(normalized) ? normalized : fallback;
};

exports.createSurvey = async (req, res) => {
  try {
    const { title, description, visibility, status, coverImage } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const normalizedVisibility = normalizeSurveyValue(visibility, "public", ["public", "private"]);
    const normalizedStatus = normalizeSurveyValue(status, "draft", ["draft", "published", "closed"]);

    if (visibility && !["public", "private"].includes(normalizedVisibility)) {
      return res.status(400).json({ success: false, message: "Visibility must be either public or private." });
    }

    if (status && !["draft", "published", "closed"].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Status must be draft, published, or closed." });
    }

    if (isMockMode()) {
      const survey = createSurvey({
        creator: req.user._id,
        title,
        description,
        visibility: normalizedVisibility,
        status: normalizedStatus,
        coverImage: coverImage || "",
      });

      try {
        await sendEmail(req.user.email, "New Survey Created", `Your survey "${survey.title}" has been created successfully.\n\nSurvey ID: ${survey._id}`);
      } catch (emailError) {
        console.error("Survey created, but email failed:", emailError.message);
      }

      return res.status(201).json({ success: true, message: "Survey created successfully.", data: survey });
    }

    const survey = await Survey.create({
      creator: req.user._id,
      title,
      description,
      visibility: normalizedVisibility,
      status: normalizedStatus,
      coverImage: coverImage || "",
    });

    try {
      await sendEmail(req.user.email, "New Survey Created", `Your survey "${survey.title}" has been created successfully.\n\nSurvey ID: ${survey._id}`);
    } catch (emailError) {
      console.error("Survey created, but email failed:", emailError.message);
    }

    return res.status(201).json({ success: true, message: "Survey created successfully.", data: survey });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error creating survey." });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const { search, status } = req.query;

    if (isMockMode()) {
      let surveys = getSurveysByCreator(req.user._id);

      if (status) {
        surveys = surveys.filter((survey) => survey.status === status);
      }

      if (search) {
        const term = String(search).toLowerCase();
        surveys = surveys.filter(
          (survey) =>
            survey.title.toLowerCase().includes(term) || survey.description.toLowerCase().includes(term)
        );
      }

      return res.status(200).json({ success: true, data: surveys });
    }

    const query = { creator: req.user._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const surveys = await Survey.find(query).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: surveys });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving surveys." });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid survey ID." });
    }

    if (isMockMode()) {
      const survey = findSurveyById(req.params.id);
      if (!survey || String(survey.creator) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: "Survey not found." });
      }

      const questions = getQuestionsBySurvey(survey._id);
      return res.status(200).json({ success: true, data: { ...survey, questions } });
    }

    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    const questions = await Question.find({ survey: survey._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: { ...survey.toObject(), questions } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving survey." });
  }
};

exports.getPublicSurvey = async (req, res) => {
  try {
    if (isMockMode()) {
      const survey = getPublicSurveyById(req.params.id);
      if (!survey) {
        return res.status(404).json({ success: false, message: "Survey not found or no longer available." });
      }
      const questions = getQuestionsBySurvey(survey._id);
      return res.status(200).json({ success: true, data: { ...survey, questions } });
    }

    const survey = await Survey.findOne({ _id: req.params.id, visibility: "public", status: "published" });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found or no longer available." });
    }

    const questions = await Question.find({ survey: survey._id }).sort({ createdAt: 1 });
    return res.status(200).json({ success: true, data: { ...survey.toObject(), questions } });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error retrieving public survey." });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    if (isMockMode()) {
      const existing = findSurveyById(req.params.id);
      if (!existing || String(existing.creator) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: "Survey not found." });
      }

      const { title, description, visibility, status, coverImage } = req.body;
      const survey = updateSurvey(req.params.id, req.user._id, {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(visibility !== undefined ? { visibility } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(coverImage !== undefined ? { coverImage } : {}),
      });

      return res.status(200).json({ success: true, message: "Survey updated successfully.", data: survey });
    }

    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    const { title, description, visibility, status, coverImage } = req.body;
    const normalizedVisibility = visibility !== undefined ? normalizeSurveyValue(visibility, "public", ["public", "private"]) : survey.visibility;
    const normalizedStatus = status !== undefined ? normalizeSurveyValue(status, "draft", ["draft", "published", "closed"]) : survey.status;

    if (visibility !== undefined && !["public", "private"].includes(normalizedVisibility)) {
      return res.status(400).json({ success: false, message: "Visibility must be either public or private." });
    }

    if (status !== undefined && !["draft", "published", "closed"].includes(normalizedStatus)) {
      return res.status(400).json({ success: false, message: "Status must be draft, published, or closed." });
    }

    if (title !== undefined) survey.title = title;
    if (description !== undefined) survey.description = description;
    if (visibility !== undefined) survey.visibility = normalizedVisibility;
    if (status !== undefined) survey.status = normalizedStatus;
    if (coverImage !== undefined) survey.coverImage = coverImage;

    await survey.save();
    return res.status(200).json({ success: true, message: "Survey updated successfully.", data: survey });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error updating survey." });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    if (isMockMode()) {
      const surveyExists = findSurveyById(req.params.id);
      if (!surveyExists || String(surveyExists.creator) !== String(req.user._id)) {
        return res.status(404).json({ success: false, message: "Survey not found." });
      }

      deleteSurvey(req.params.id, req.user._id);
      return res.status(200).json({ success: true, message: "Survey deleted successfully." });
    }

    const survey = await Survey.findOne({ _id: req.params.id, creator: req.user._id });
    if (!survey) {
      return res.status(404).json({ success: false, message: "Survey not found." });
    }

    await Question.deleteMany({ survey: survey._id });
    await survey.deleteOne();
    return res.status(200).json({ success: true, message: "Survey deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Error deleting survey." });
  }
};