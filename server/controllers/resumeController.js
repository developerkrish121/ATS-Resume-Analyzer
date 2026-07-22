const Resume = require("../models/Resume");
const extractText = require("../utils/extractText");
const calculateATS = require("../utils/atsScore");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
      });
    }

    const { jobDescription } = req.body;

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Job Description is required.",
      });
    }

    // PDF path
    const filePath = req.file.path;

    // Extract resume text
    const resumeText = await extractText(filePath);

    // ATS Analysis
    const atsResult = calculateATS(resumeText, jobDescription);

    // Save to MongoDB
   const resume = await Resume.create({
  filename: req.file.filename,
  originalName: req.file.originalname,
  extractedText: resumeText,
  atsScore: atsResult.score,
});

    return res.status(201).json({
      success: true,
      message: "Resume analyzed successfully.",
      resume,
      analysis: atsResult,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  uploadResume,
};