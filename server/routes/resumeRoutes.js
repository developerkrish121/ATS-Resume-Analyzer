const express = require("express");

const router = express.Router();

const upload = require("../middleware/uploadMiddleware");
const { createAnalysisRateLimiter } = require("../middleware/rateLimiters");

const {
  uploadResume,
  getAnalysis,
  getAnalysisHistory,
  deleteAnalysis,
} = require("../controllers/resumeController");

router.get("/history", getAnalysisHistory);
router.get("/:analysisId", getAnalysis);
router.delete("/:analysisId", deleteAnalysis);

router.post(
  "/upload",
  createAnalysisRateLimiter(),
  upload.single("resume"),
  uploadResume
);

module.exports = router;
