const { GoogleGenAI } = require("@google/genai");

const DEFAULT_MODEL = "gemini-2.5-flash";
const DEFAULT_TIMEOUT_MS = 15000;

const AI_INSIGHTS_SCHEMA = {
  type: "object",
  properties: {
    summary: { type: "string" },
    topStrengths: { type: "array", items: { type: "string" } },
    improvementAreas: { type: "array", items: { type: "string" } },
    missingSkillExplanation: { type: "string" },
    jdSpecificRecommendations: { type: "array", items: { type: "string" } },
    bulletImprovements: { type: "array", items: { type: "string" } },
    overallAdvice: { type: "string" },
  },
  required: [
    "summary",
    "topStrengths",
    "improvementAreas",
    "missingSkillExplanation",
    "jdSpecificRecommendations",
    "bulletImprovements",
    "overallAdvice",
  ],
};

const unavailable = () => ({ aiInsights: null, aiStatus: "unavailable" });

const limitText = (value, limit = 30000) => String(value || "").slice(0, limit);

const isStringList = (value) => Array.isArray(value) && value.every((item) => typeof item === "string");

const validateAiInsights = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const requiredStrings = ["summary", "missingSkillExplanation", "overallAdvice"];
  const requiredLists = ["topStrengths", "improvementAreas", "jdSpecificRecommendations", "bulletImprovements"];

  if (!requiredStrings.every((key) => typeof value[key] === "string")) return null;
  if (!requiredLists.every((key) => isStringList(value[key]))) return null;

  return {
    summary: value.summary.trim(),
    topStrengths: value.topStrengths.map((item) => item.trim()).filter(Boolean),
    improvementAreas: value.improvementAreas.map((item) => item.trim()).filter(Boolean),
    missingSkillExplanation: value.missingSkillExplanation.trim(),
    jdSpecificRecommendations: value.jdSpecificRecommendations.map((item) => item.trim()).filter(Boolean),
    bulletImprovements: value.bulletImprovements.map((item) => item.trim()).filter(Boolean),
    overallAdvice: value.overallAdvice.trim(),
  };
};

const buildPrompt = ({ resumeText, jobDescription, analysis }) => `
You are a resume-feedback assistant. Provide practical, job-description-specific feedback as JSON.

Trust rules:
- The deterministic ATS analysis below is the source of truth. Do not calculate or change its score, skill matches, gaps, or evidence.
- Only describe evidence present in the resume or deterministic analysis.
- Never invent skills, years, companies, titles, certifications, achievements, metrics, or project outcomes.
- Clearly phrase improvements conditionally: suggest users add a skill only if it truthfully reflects their experience.
- Do not encourage fabrication.

Resume text:
${limitText(resumeText)}

Job description:
${limitText(jobDescription, 20000)}

Deterministic ATS analysis:
${JSON.stringify({
  score: analysis.score,
  breakdown: analysis.breakdown,
  matchedSkills: analysis.matchedKeywords,
  missingSkills: analysis.missingKeywords,
  requiredSkills: analysis.requiredKeywords,
  preferredSkills: analysis.preferredKeywords,
  relevantTechnicalConcepts: analysis.metadata?.relevantKeywords,
  matchedRelevantTechnicalConcepts: analysis.metadata?.matchedRelevantKeywords,
  experienceEvidence: analysis.metadata?.experienceSignals,
  deterministicRecommendations: analysis.suggestions,
})}
`;

const createGeminiClient = (apiKey, timeoutMs) => new GoogleGenAI({
  apiKey,
  httpOptions: { timeout: timeoutMs },
});

const generateAiInsights = async (input, options = {}) => {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = Number(options.timeoutMs ?? process.env.GEMINI_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const client = options.client || (apiKey ? createGeminiClient(apiKey, timeoutMs) : null);

  if (!client || !model) return unavailable();

  try {
    const interaction = await client.interactions.create({
      model,
      input: buildPrompt(input),
      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: AI_INSIGHTS_SCHEMA,
      },
    });

    const insights = validateAiInsights(JSON.parse(interaction.output_text));
    return insights ? { aiInsights: insights, aiStatus: "available" } : unavailable();
  } catch {
    return unavailable();
  }
};

module.exports = {
  AI_INSIGHTS_SCHEMA,
  buildPrompt,
  createGeminiClient,
  generateAiInsights,
  validateAiInsights,
};
