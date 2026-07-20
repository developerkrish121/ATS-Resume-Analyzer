const express = require("express");
const router = express.Router();

const {
  analyzeResume,
} = require("../controllers/atsController");

router.post("/analyze", analyzeResume);

module.exports = router;