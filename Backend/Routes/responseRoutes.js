const express = require("express");
const router = express.Router();

const responseController = require("../Controllers/responseController");
const { protect } = require("../Middleware/authMiddleware");

//RESPONSE ROUTES
router.post("/", responseController.createResponse);
router.get("/survey/:surveyId", protect, responseController.getResponsesBySurvey);

module.exports = router;