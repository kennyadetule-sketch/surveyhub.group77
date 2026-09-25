const mongoose = require("mongoose");
const Survey = require("../Models/Survey");
const Question = require("../Models/Question");
const Response = require("../Models/Response");
const { sendEmail } = require("../Middleware/EmailSender");

const normalizeSurveyValue = (value) => {
  return String(value ?? "").trim().toLowerCase();
};

exports.createSurvey = async (req, res) => {
  try {
    const { title, description, visibility, status, coverImage } = req.body;

    if (!title?.trim() || !description?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
        data: null,
      });
    }

    const normalizedVisibility = normalizeSurveyValue(visibility || "public");
    const normalizedStatus = normalizeSurveyValue(status || "draft");

    // Validate visibility
    if (!["public", "private"].includes(normalizedVisibility)) {
      return res.status(400).json({
        success: false,
        message: "Visibility must be either public or private.",
        data: null,
      });
    }

    // Validate status
    if (!["draft", "published", "closed"].includes(normalizedStatus)) {
      return res.status(400).json({
        success: false,
        message: "Status must be draft, published, or closed.",
        data: null,
      });
    }

    // Create the survey in MongoDB
    const survey = await Survey.create({
      creator: req.user._id,
      title: title.trim(),
      description: description.trim(),
      visibility: normalizedVisibility,
      status: normalizedStatus,
      coverImage: coverImage || "",
    });

    /*
      IMPORTANT:
      Do not wait for the email before responding to the frontend.

      The survey has already been successfully saved to MongoDB.
      Email is now a secondary/background action.
    */
    sendEmail(
      req.user.email,
      "New Survey Created",
      `Your survey "${survey.title}" has been created successfully.\n\nSurvey ID: ${survey._id}`
    ).catch((emailError) => {
      console.error(
        "Survey created successfully, but confirmation email failed:",
        emailError.message
      );
    });

    // Respond immediately after the survey is saved
    return res.status(201).json({
      success: true,
      message: "Survey created successfully.",
      data: survey,
    });
  } catch (error) {
    console.error("Create survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create the survey right now. Please try again.",
      data: null,
    });
  }
};

exports.getSurveys = async (req, res) => {
  try {
    const { search, status } = req.query;

    const query = {
      creator: req.user._id,
    };

    if (status) {
      query.status = normalizeSurveyValue(status);
    }

    if (search?.trim()) {
      query.$or = [
        {
          title: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // Get all surveys belonging to this creator in one query
    const surveys = await Survey.find(query).sort({ createdAt: -1 }).lean();

    if (surveys.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Surveys retrieved successfully.",
        data: [],
      });
    }

    const surveyIds = surveys.map((survey) => survey._id);

    /*Get question counts for all surveys at once.*/
    const questionCounts = await Question.aggregate([
      {
        $match: {
          survey: { $in: surveyIds },
        },
      },
      {
        $group: {
          _id: "$survey",
          count: { $sum: 1 },
        },
      },
    ]);

    /* response counts for all surveys at once.*/
    const responseCounts = await Response.aggregate([
      {
        $match: {
          survey: { $in: surveyIds },
        },
      },
      {
        $group: {
          _id: "$survey",
          count: { $sum: 1 },
        },
      },
    ]);

    // Convert aggregation results into easy lookup objects
    const questionCountMap = {};
    const responseCountMap = {};

    questionCounts.forEach((item) => {
      questionCountMap[item._id.toString()] = item.count;
    });

    responseCounts.forEach((item) => {
      responseCountMap[item._id.toString()] = item.count;
    });

    /*
      Attach counts to each survey.
      The frontend now receives everything it needs
      from ONE GET /api/surveys request.
    */
    const surveysWithCounts = surveys.map((survey) => {
      const id = survey._id.toString();

      return {
        ...survey,
        questionCount: questionCountMap[id] || 0,
        responseCount: responseCountMap[id] || 0,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Surveys retrieved successfully.",
      data: surveysWithCounts,
    });
  } catch (error) {
    console.error("Get surveys error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve your surveys right now. Please try again.",
      data: null,
    });
  }
};

exports.getSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey ID.",
        data: null,
      });
    }

    const survey = await Survey.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found.",
        data: null,
      });
    }

    const questions = await Question.find({
      survey: survey._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Survey retrieved successfully.",
      data: {
        ...survey.toObject(),
        questions,
      },
    });
  } catch (error) {
    console.error("Get survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the survey right now. Please try again.",
      data: null,
    });
  }
};

exports.getPublicSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey ID.",
        data: null,
      });
    }

    const survey = await Survey.findOne({
      _id: req.params.id,
      visibility: "public",
      status: "published",
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found or no longer available.",
        data: null,
      });
    }

    const questions = await Question.find({
      survey: survey._id,
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      message: "Public survey retrieved successfully.",
      data: {
        ...survey.toObject(),
        questions,
      },
    });
  } catch (error) {
    console.error("Get public survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load this survey right now. Please try again.",
      data: null,
    });
  }
};

exports.updateSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey ID.",
        data: null,
      });
    }

    const survey = await Survey.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found.",
        data: null,
      });
    }

    const {
      title,
      description,
      visibility,
      status,
      coverImage,
    } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: "Survey title cannot be empty.",
          data: null,
        });
      }

      survey.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: "Survey description cannot be empty.",
          data: null,
        });
      }

      survey.description = description.trim();
    }

    if (visibility !== undefined) {
      const normalizedVisibility = normalizeSurveyValue(visibility);

      if (!["public", "private"].includes(normalizedVisibility)) {
        return res.status(400).json({
          success: false,
          message: "Visibility must be either public or private.",
          data: null,
        });
      }

      survey.visibility = normalizedVisibility;
    }

    if (status !== undefined) {
      const normalizedStatus = normalizeSurveyValue(status);

      if (!["draft", "published", "closed"].includes(normalizedStatus)) {
        return res.status(400).json({
          success: false,
          message: "Status must be draft, published, or closed.",
          data: null,
        });
      }

      survey.status = normalizedStatus;
    }

    if (coverImage !== undefined) {
      survey.coverImage = coverImage;
    }

    await survey.save();

    return res.status(200).json({
      success: true,
      message: "Survey updated successfully.",
      data: survey,
    });
  } catch (error) {
    console.error("Update survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update the survey right now. Please try again.",
      data: null,
    });
  }
};

exports.deleteSurvey = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid survey ID.",
        data: null,
      });
    }

    const survey = await Survey.findOne({
      _id: req.params.id,
      creator: req.user._id,
    });

    if (!survey) {
      return res.status(404).json({
        success: false,
        message: "Survey not found.",
        data: null,
      });
    }

    // Delete all questions belonging to this survey
    await Question.deleteMany({
      survey: survey._id,
    });

    // Delete the survey
    await survey.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Survey deleted successfully.",
      data: null,
    });
  } catch (error) {
    console.error("Delete survey error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete the survey right now. Please try again.",
      data: null,
    });
  }
};