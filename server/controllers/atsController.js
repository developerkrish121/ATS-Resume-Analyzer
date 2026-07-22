const calculateATS = require("../utils/atsScore");

const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        message: "Resume text and Job Description are required.",
      });
    }

    const result = calculateATS(resumeText, jobDescription);

    return res.status(200).json({
      success: true,
      message: "ATS analysis completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("ATS Error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

module.exports = {
  analyzeResume,
};