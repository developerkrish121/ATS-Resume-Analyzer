const calculateATS = require("../utils/atsScore");

const analyzeResume = async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (
      typeof resumeText !== "string" ||
      !resumeText.trim() ||
      typeof jobDescription !== "string" ||
      !jobDescription.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Resume text and Job Description are required.",
        data: null,
      });
    }

    if (resumeText.length > 200000 || jobDescription.length > 50000) {
      return res.status(400).json({
        success: false,
        message: "Resume text or Job Description is too long.",
        data: null,
      });
    }

    const result = calculateATS(resumeText.trim(), jobDescription.trim());

    return res.status(200).json({
      success: true,
      message: "ATS analysis completed successfully.",
      data: result,
    });
  } catch (error) {
    console.error("ATS analysis error.");

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      data: null,
    });
  }
};

module.exports = {
  analyzeResume,
};
