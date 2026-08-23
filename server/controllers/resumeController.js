const Resume = require("../models/Resume");
const extractText = require("../utils/extractText");
const calculateATS = require("../utils/atsScore");
const geminiService = require("../services/geminiService");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const removeUploadedFile = async (file) => {
  if (!file?.path) return;

  try {
    await fs.promises.unlink(file.path);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to clean up uploaded file.");
    }
  }
};

const isValidAnalysisId = (analysisId) => mongoose.isValidObjectId(analysisId);

const toResumeSummary = (resume) => ({
  analysisId: String(resume._id),
  originalName: resume.originalName,
  atsScore: resume.atsScore,
  uploadDate: resume.uploadDate,
  createdAt: resume.createdAt,
  updatedAt: resume.updatedAt,
});

const removeStoredUpload = async (filename) => {
  if (!filename) return;

  const uploadsDirectory = path.resolve(__dirname, "..", "uploads");
  const filePath = path.resolve(uploadsDirectory, filename);

  if (path.dirname(filePath) !== uploadsDirectory) return;

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Failed to delete uploaded resume file.");
    }
  }
};

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a PDF resume.",
        data: null,
      });
    }

    const { jobDescription } = req.body;

    if (typeof jobDescription !== "string" || !jobDescription.trim()) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Job Description is required.",
        data: null,
      });
    }

    if (jobDescription.length > 50000) {
      await removeUploadedFile(req.file);
      return res.status(400).json({
        success: false,
        message: "Job Description must be 50,000 characters or fewer.",
        data: null,
      });
    }

    // PDF path
    const filePath = req.file.path;

    // Extract resume text
    const resumeText = await extractText(filePath);

    // ATS Analysis
    const atsResult = calculateATS(resumeText, jobDescription.trim());
    const aiResult = await geminiService.generateAiInsights({
      resumeText,
      jobDescription: jobDescription.trim(),
      analysis: atsResult,
    });
    const analysis = {
      ...atsResult,
      aiInsights: aiResult.aiInsights,
      aiStatus: aiResult.aiStatus,
    };

    // Save to MongoDB
   const resume = await Resume.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      jobDescription: jobDescription.trim(),
      atsScore: analysis.score,
      analysis,
    });

    return res.status(201).json({
      success: true,
      message: "Resume analyzed successfully.",
      data: {
        analysisId: String(resume._id),
        resume: toResumeSummary(resume),
        analysis,
      },
    });
  } catch (error) {
    await removeUploadedFile(req.file);
    console.error("Resume upload error.");

    if (
      error.code === "INVALID_PDF" ||
      error.code === "EMPTY_PDF_TEXT" ||
      error.code === "PDF_EXTRACTION_FAILED"
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to analyze and save the resume.",
      data: null,
    });
  }
};

const getAnalysis = async (req, res) => {
  const { analysisId } = req.params;

  if (!isValidAnalysisId(analysisId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid analysis ID.",
      data: null,
    });
  }

  try {
    const resume = await Resume.findById(analysisId);

    if (!resume || !resume.analysis) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Analysis retrieved successfully.",
      data: {
        analysisId: String(resume._id),
        resume: toResumeSummary(resume),
        analysis: resume.analysis,
      },
    });
  } catch (error) {
    console.error("Analysis retrieval error.");
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the analysis.",
      data: null,
    });
  }
};

const getAnalysisHistory = async (req, res) => {
  try {
    const resumes = await Resume.find(
      {},
      { originalName: 1, atsScore: 1, uploadDate: 1, createdAt: 1 }
    ).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Analysis history retrieved successfully.",
      data: resumes.map(toResumeSummary),
    });
  } catch (error) {
    console.error("Analysis history error.");
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve analysis history.",
      data: null,
    });
  }
};

const deleteAnalysis = async (req, res) => {
  const { analysisId } = req.params;

  if (!isValidAnalysisId(analysisId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid analysis ID.",
      data: null,
    });
  }

  try {
    const resume = await Resume.findByIdAndDelete(analysisId);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Analysis not found.",
        data: null,
      });
    }

    await removeStoredUpload(resume.filename);

    return res.status(200).json({
      success: true,
      message: "Analysis deleted successfully.",
      data: { analysisId: String(resume._id) },
    });
  } catch (error) {
    console.error("Analysis deletion error.");
    return res.status(500).json({
      success: false,
      message: "Unable to delete the analysis.",
      data: null,
    });
  }
};

module.exports = {
  uploadResume,
  getAnalysis,
  getAnalysisHistory,
  deleteAnalysis,
};
