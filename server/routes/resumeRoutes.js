const express = require("express");
const router = express.Router();

const upload = require("../middleware/uploadMiddleware");

const {
  uploadResume,
  getAllResumes,
  getResumeById,
} = require("../controllers/resumeController");

router.post("/upload", upload.single("resume"), uploadResume);

router.get("/", getAllResumes);

router.get("/:id", getResumeById);

module.exports = router;