const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/resume", require("./routes/resumeRoutes"));

// Default Route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "ATS Resume Analyzer API is Running 🚀",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});