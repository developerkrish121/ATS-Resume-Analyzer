const test = require("node:test");
const assert = require("node:assert/strict");

const {
  generateAiInsights,
  validateAiInsights,
} = require("../services/geminiService");

const validInsights = {
  summary: "The resume has evidence for React.",
  topStrengths: ["React experience is explicitly mentioned."],
  improvementAreas: ["Make API work more explicit if accurate."],
  missingSkillExplanation: "TypeScript is a deterministic gap for this role.",
  jdSpecificRecommendations: ["Add TypeScript only if it reflects genuine experience."],
  bulletImprovements: ["Clarify the existing API integration work in the project bullet."],
  overallAdvice: "Keep all resume claims truthful and specific.",
};

const input = {
  resumeText: "Skills: React. Built an API integration.",
  jobDescription: "Required: React and TypeScript.",
  analysis: {
    score: 70,
    breakdown: { skillMatch: 30 },
    matchedKeywords: ["React"],
    missingKeywords: ["TypeScript"],
    requiredKeywords: ["React", "TypeScript"],
    preferredKeywords: [],
    metadata: { relevantKeywords: [], matchedRelevantKeywords: [], experienceSignals: {} },
    suggestions: [],
  },
};

const createClient = (handler) => ({ interactions: { create: handler } });

test("returns validated structured Gemini insights", async () => {
  const client = createClient(async () => ({ output_text: JSON.stringify(validInsights) }));
  const result = await generateAiInsights(input, { client, apiKey: "test-key" });

  assert.equal(result.aiStatus, "available");
  assert.deepEqual(result.aiInsights, validInsights);
});

test("treats malformed structured output as unavailable", async () => {
  const client = createClient(async () => ({ output_text: JSON.stringify({ summary: "Incomplete" }) }));
  const result = await generateAiInsights(input, { client, apiKey: "test-key" });

  assert.deepEqual(result, { aiInsights: null, aiStatus: "unavailable" });
});

test("treats provider failures as unavailable", async () => {
  const client = createClient(async () => { throw new Error("provider failure"); });
  const result = await generateAiInsights(input, { client, apiKey: "test-key" });

  assert.equal(result.aiStatus, "unavailable");
  assert.equal(result.aiInsights, null);
});

test("treats a provider timeout as unavailable", async () => {
  const client = createClient(async () => { throw new Error("request timeout"); });
  const result = await generateAiInsights(input, { client, apiKey: "test-key" });

  assert.equal(result.aiStatus, "unavailable");
});

test("does not call Gemini when the API key is missing", async () => {
  const result = await generateAiInsights(input, { apiKey: "" });

  assert.deepEqual(result, { aiInsights: null, aiStatus: "unavailable" });
});

test("treats a rate-limit provider failure as unavailable", async () => {
  const client = createClient(async () => { throw new Error("429 rate limit"); });
  const result = await generateAiInsights(input, { client, apiKey: "test-key" });

  assert.equal(result.aiStatus, "unavailable");
});

test("rejects unexpected insight values during local validation", () => {
  assert.equal(validateAiInsights({ ...validInsights, topStrengths: [12] }), null);
});
