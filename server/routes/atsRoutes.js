const express = require("express");

const router = express.Router();

const { analyzeResume } = require("../controllers/atsController");
const { createAnalysisRateLimiter } = require("../middleware/rateLimiters");

router.post("/analyze", createAnalysisRateLimiter(), analyzeResume);

module.exports = router;
