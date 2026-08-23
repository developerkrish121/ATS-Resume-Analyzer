const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDirectory = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (req, file, cb) => {
    cb(null, `${crypto.randomUUID()}.pdf`);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf" && path.extname(file.originalname).toLowerCase() === ".pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed."));
  }
};

module.exports = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 5,
    fieldSize: 60 * 1024,
    parts: 6,
  },
});
