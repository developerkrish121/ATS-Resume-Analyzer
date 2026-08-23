const test = require("node:test");
const assert = require("node:assert/strict");
const { mock } = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const mongoose = require("mongoose");

const Resume = require("../models/Resume");
const geminiService = require("../services/geminiService");
const {
  uploadResume,
  getAnalysis,
  getAnalysisHistory,
  deleteAnalysis,
} = require("../controllers/resumeController");

const createResponse = () => {
  const response = { statusCode: 200, body: null };
  response.status = (statusCode) => {
    response.statusCode = statusCode;
    return response;
  };
  response.json = (body) => {
    response.body = body;
    return response;
  };
  return response;
};

const createResume = (overrides = {}) => ({
  _id: new mongoose.Types.ObjectId(),
  filename: "saved-resume.pdf",
  originalName: "resume.pdf",
  atsScore: 72,
  uploadDate: new Date("2026-08-22T08:00:00.000Z"),
  createdAt: new Date("2026-08-22T08:00:00.000Z"),
  updatedAt: new Date("2026-08-22T08:00:00.000Z"),
  analysis: {
    score: 72,
    breakdown: { skillMatch: 30 },
    matchedKeywords: ["React"],
    missingKeywords: ["Node.js"],
    metadata: { experienceSignals: {}, additionalSignals: {} },
  },
  ...overrides,
});

test("upload persists the complete ATS analysis and returns an analysis ID", async (context) => {
  const temporaryDirectory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ats-persistence-"));
  const sourcePdf = require.resolve("pdf-parse/test/data/04-valid.pdf");
  const uploadPath = path.join(temporaryDirectory, "resume.pdf");
  await fs.promises.copyFile(sourcePdf, uploadPath);
  context.after(() => fs.promises.rm(temporaryDirectory, { recursive: true, force: true }));

  const savedResume = createResume();
  let persistedPayload;
  const createMock = mock.method(Resume, "create", async (payload) => {
    persistedPayload = payload;
    return savedResume;
  });
  context.after(() => createMock.mock.restore());
  const geminiMock = mock.method(geminiService, "generateAiInsights", async () => ({
    aiStatus: "available",
    aiInsights: {
      summary: "Resume evidence aligns with the role.",
      topStrengths: ["React is supported by the resume."],
      improvementAreas: [],
      missingSkillExplanation: "Node.js is not detected.",
      jdSpecificRecommendations: [],
      bulletImprovements: [],
      overallAdvice: "Keep claims accurate.",
    },
  }));
  context.after(() => geminiMock.mock.restore());

  const response = createResponse();
  await uploadResume({
    file: { path: uploadPath, filename: savedResume.filename, originalname: savedResume.originalName },
    body: { jobDescription: "Required: React and Node.js" },
  }, response);

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.data.analysisId, String(savedResume._id));
  assert.equal(response.body.data.resume.originalName, "resume.pdf");
  assert.equal(persistedPayload.jobDescription, "Required: React and Node.js");
  assert.equal(persistedPayload.atsScore, response.body.data.analysis.score);
  assert.deepEqual(persistedPayload.analysis, response.body.data.analysis);
  assert.equal(persistedPayload.analysis.aiStatus, "available");
  assert.equal(persistedPayload.analysis.aiInsights.summary, "Resume evidence aligns with the role.");
  assert.equal(Object.hasOwn(response.body.data.resume, "extractedText"), false);
});

test("retrieves a saved analysis without exposing extracted resume text", async (context) => {
  const resume = createResume({ extractedText: "private resume content" });
  const findMock = mock.method(Resume, "findById", async () => resume);
  context.after(() => findMock.mock.restore());

  const response = createResponse();
  await getAnalysis({ params: { analysisId: String(resume._id) } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.analysis.score, 72);
  assert.equal(response.body.data.resume.analysisId, String(resume._id));
  assert.equal(Object.hasOwn(response.body.data.resume, "extractedText"), false);
});

test("rejects an invalid analysis ID", async () => {
  const response = createResponse();
  await getAnalysis({ params: { analysisId: "not-an-object-id" } }, response);

  assert.equal(response.statusCode, 400);
  assert.equal(response.body.message, "Invalid analysis ID.");
});

test("returns not found for a nonexistent analysis", async (context) => {
  const findMock = mock.method(Resume, "findById", async () => null);
  context.after(() => findMock.mock.restore());

  const response = createResponse();
  await getAnalysis({ params: { analysisId: String(new mongoose.Types.ObjectId()) } }, response);

  assert.equal(response.statusCode, 404);
  assert.equal(response.body.message, "Analysis not found.");
});

test("lists lightweight analysis history in the database sort order", async (context) => {
  const newest = createResume({ createdAt: new Date("2026-08-23T08:00:00.000Z") });
  const oldest = createResume({ createdAt: new Date("2026-08-22T08:00:00.000Z") });
  let sortArgument;
  const findMock = mock.method(Resume, "find", () => ({
    sort: async (argument) => {
      sortArgument = argument;
      return [newest, oldest];
    },
  }));
  context.after(() => findMock.mock.restore());

  const response = createResponse();
  await getAnalysisHistory({}, response);

  assert.equal(response.statusCode, 200);
  assert.deepEqual(sortArgument, { createdAt: -1 });
  assert.deepEqual(response.body.data.map((item) => item.analysisId), [String(newest._id), String(oldest._id)]);
  assert.equal(Object.hasOwn(response.body.data[0], "extractedText"), false);
  assert.equal(Object.hasOwn(response.body.data[0], "analysis"), false);
});

test("deletes an analysis and its associated uploaded file", async (context) => {
  const uploadsDirectory = path.resolve(__dirname, "..", "uploads");
  const filename = `delete-test-${Date.now()}.pdf`;
  const filePath = path.join(uploadsDirectory, filename);
  await fs.promises.mkdir(uploadsDirectory, { recursive: true });
  await fs.promises.writeFile(filePath, "test upload");
  context.after(() => fs.promises.rm(filePath, { force: true }));

  const resume = createResume({ filename });
  const deleteMock = mock.method(Resume, "findByIdAndDelete", async () => resume);
  context.after(() => deleteMock.mock.restore());

  const response = createResponse();
  await deleteAnalysis({ params: { analysisId: String(resume._id) } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.data.analysisId, String(resume._id));
  assert.equal(fs.existsSync(filePath), false);
});

test("deletion succeeds when the associated upload file is already missing", async (context) => {
  const resume = createResume({ filename: `missing-test-${Date.now()}.pdf` });
  const deleteMock = mock.method(Resume, "findByIdAndDelete", async () => resume);
  context.after(() => deleteMock.mock.restore());

  const response = createResponse();
  await deleteAnalysis({ params: { analysisId: String(resume._id) } }, response);

  assert.equal(response.statusCode, 200);
  assert.equal(response.body.message, "Analysis deleted successfully.");
});
