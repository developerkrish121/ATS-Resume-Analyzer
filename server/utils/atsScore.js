const calculateATSScore = (resumeText, jobDescription) => {
  const cleanText = (text) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);
  };

  const resumeWords = [...new Set(cleanText(resumeText))];
  const jdWords = [...new Set(cleanText(jobDescription))];

  const matchedKeywords = jdWords.filter((word) =>
    resumeWords.includes(word)
  );

  const missingKeywords = jdWords.filter(
    (word) => !resumeWords.includes(word)
  );

  const score =
    jdWords.length === 0
      ? 0
      : Math.round((matchedKeywords.length / jdWords.length) * 100);

  return {
    score,
    matchedKeywords,
    missingKeywords,
  };
};

module.exports = calculateATSScore;