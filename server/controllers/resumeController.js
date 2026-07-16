const extractTextFromPDF = require("../utils/extractText");

exports.uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const extractedText = await extractTextFromPDF(req.file.path);

    res.status(200).json({
      success: true,
      message: "Resume uploaded successfully",
      filename: req.file.filename,
      extractedText,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};