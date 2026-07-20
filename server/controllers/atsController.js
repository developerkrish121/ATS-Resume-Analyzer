const Resume = require("../models/Resume");
const calculateATSScore = require("../utils/atsScore");

exports.analyzeResume = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume ID and Job Description are required",
      });
    }

    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found",
      });
    }

    const result = calculateATSScore(
      resume.extractedText,
      jobDescription
    );

    res.status(200).json({
      success: true,
      resumeId,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};