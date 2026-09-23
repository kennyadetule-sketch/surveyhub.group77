const express = require("express");
const router = express.Router();

const surveyController = require("../Controllers/surveyController");
const { protect } = require("../Middleware/authMiddleware");
const resultController = require("../Controllers/resultController");

//SURVEY ROUTES
router.post("/", protect, surveyController.createSurvey);
router.get("/", protect, surveyController.getSurveys);
router.get("/public/:id", surveyController.getPublicSurvey);
router.get("/:id", protect, surveyController.getSurvey);
router.put("/:id", protect, surveyController.updateSurvey);
router.delete("/:id", protect, surveyController.deleteSurvey);

//RESULT ROUTE
router.get("/:surveyId/results", protect, resultController.getResults);

module.exports = router;