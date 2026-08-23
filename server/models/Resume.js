const mongoose = require("mongoose");

const resumeSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },

    originalName: {
      type: String,
      required: true,
    },

    extractedText: {
      type: String,
    },

    atsScore: {
      type: Number,
      default: 0,
    },

    jobDescription: {
      type: String,
      required: true,
    },

    analysis: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },

    uploadDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Resume", resumeSchema);
