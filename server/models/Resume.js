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
      required: true,
    },

    atsScore: {
      type: Number,
      default: 0,
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