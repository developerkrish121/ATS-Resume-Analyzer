const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const mongoose = require("mongoose");

const connectDB = require("./config/db");
const validateEnvironment = require("./config/env");
const { createCorsOptions } = require("./config/cors");

dotenv.config({ quiet: true });

const app = express();

// Middleware
if (process.env.NODE_ENV === "production") app.set("trust proxy", 1);
app.use(helmet());
app.use(cors(createCorsOptions()));
app.use(express.json({ limit: "250kb" }));
app.use(express.urlencoded({ extended: true, limit: "250kb" }));

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Service is healthy.",
    data: null,
  });
});

// Routes
app.use("/api/resume", require("./routes/resumeRoutes"));
app.use("/api/ats", require("./routes/atsRoutes"));

// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ATS Resume Analyzer API is Running 🚀",
    data: null,
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found.",
    data: null,
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof multer.MulterError) {
    const message =
      error.code === "LIMIT_FILE_SIZE"
        ? "Resume PDF must be 5 MB or smaller."
        : error.code === "LIMIT_FIELD_VALUE"
          ? "Request field is too large."
        : "Invalid file upload.";

    return res.status(400).json({ success: false, message, data: null });
  }

  if (error?.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      message: error.message,
      data: null,
    });
  }

  if (error?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      message: "Request body is too large.",
      data: null,
    });
  }

  if (error?.code === "CORS_ORIGIN_NOT_ALLOWED") {
    return res.status(403).json({
      success: false,
      message: "Origin is not allowed.",
      data: null,
    });
  }

  console.error("Unhandled request error.");
  return res.status(500).json({
    success: false,
    message: "Internal server error.",
    data: null,
  });
});

const startServer = async () => {
  try {
    validateEnvironment();
    await connectDB();

    const port = Number(process.env.PORT) || 5000;
    return app.listen(port, "0.0.0.0", () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Startup error.");
    process.exitCode = 1;
    return null;
  }
};

if (require.main === module) {
  startServer();
}

const shutdown = async () => {
  await mongoose.connection.close();
};

module.exports = { app, startServer, shutdown };
