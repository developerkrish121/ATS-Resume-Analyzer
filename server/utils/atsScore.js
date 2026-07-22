// server/utils/atsScore.js

const STOP_WORDS = [
  "the",
  "a",
  "an",
  "and",
  "or",
  "to",
  "of",
  "for",
  "with",
  "on",
  "in",
  "at",
  "by",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "this",
  "that",
  "it",
  "as",
  "from",
  "will",
  "can",
  "using",
  "use",
  "used",
  "have",
  "has",
  "had",
  "you",
  "your",
  "our",
  "their",
  "we",
  "they",
  "he",
  "she",
  "i",
  "am",
  "an",
];

const extractKeywords = (text) => {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .split(/\s+/)
        .filter(
          (word) =>
            word.length > 2 &&
            !STOP_WORDS.includes(word)
        )
    ),
  ];
};

const calculateATS = (resumeText, jobDescription) => {
  const resumeKeywords = extractKeywords(resumeText);
  const jobKeywords = extractKeywords(jobDescription);

  const matchedKeywords = jobKeywords.filter((keyword) =>
    resumeKeywords.includes(keyword)
  );

  const missingKeywords = jobKeywords.filter(
    (keyword) => !resumeKeywords.includes(keyword)
  );

  const score =
    jobKeywords.length === 0
      ? 0
      : Math.round(
          (matchedKeywords.length / jobKeywords.length) * 100
        );

  const strengths = [];
  const suggestions = [];

  // Strengths
  if (score >= 90) {
    strengths.push("Excellent ATS compatibility.");
    strengths.push("Very strong keyword coverage.");
  } else if (score >= 75) {
    strengths.push("Good keyword match.");
    strengths.push("Resume is relevant to the job description.");
  } else if (score >= 50) {
    strengths.push("Partial keyword match.");
  } else {
    strengths.push("Resume needs better optimization.");
  }

  // Suggestions based on missing keywords
  missingKeywords.forEach((keyword) => {
    suggestions.push(`Add "${keyword}" if you have experience with it.`);
  });

  // Resume quality checks
  if (resumeText.length < 1200) {
    suggestions.push(
      "Increase resume content with detailed project descriptions."
    );
  }

  if (!resumeText.toLowerCase().includes("project")) {
    suggestions.push("Add a Projects section.");
  }

  if (!resumeText.toLowerCase().includes("experience")) {
    suggestions.push("Include internships or work experience.");
  }

  if (!resumeText.toLowerCase().includes("education")) {
    suggestions.push("Include your Education section.");
  }

  if (
    !resumeText.toLowerCase().includes("skill") &&
    !resumeText.toLowerCase().includes("skills")
  ) {
    suggestions.push("Add a dedicated Skills section.");
  }

  if (
    !resumeText.toLowerCase().includes("certification") &&
    !resumeText.toLowerCase().includes("certificate")
  ) {
    suggestions.push("Mention certifications if available.");
  }

  if (
    !resumeText.toLowerCase().includes("github")
  ) {
    suggestions.push("Include your GitHub profile.");
  }

  if (
    !resumeText.toLowerCase().includes("linkedin")
  ) {
    suggestions.push("Include your LinkedIn profile.");
  }

  return {
    score,
    totalJobKeywords: jobKeywords.length,
    matchedKeywordCount: matchedKeywords.length,
    matchedKeywords,
    missingKeywords,
    strengths,
    suggestions,
  };
};

module.exports = calculateATS;