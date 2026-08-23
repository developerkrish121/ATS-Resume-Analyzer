const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ quiet: true });

const baseUrl = process.env.TEST_API_URL || "http://localhost:5000";
const uploadsDirectory = path.resolve(__dirname, "..", "uploads");
const validPdfPath = require.resolve("pdf-parse/test/data/04-valid.pdf");

const request = async (name, route, options, expectedStatus) => {
  const response = await fetch(`${baseUrl}${route}`, options);
  const body = await response.json();

  if (response.status !== expectedStatus || typeof body.success !== "boolean") {
    throw new Error(
      `${name} failed: expected ${expectedStatus}, received ${response.status}`
    );
  }

  return { name, status: response.status, success: body.success, body };
};

const pdfForm = (contents, fields = {}) => {
  const form = new FormData();
  form.append("resume", new Blob([contents], { type: "application/pdf" }), "test.pdf");

  Object.entries(fields).forEach(([key, value]) => form.append(key, value));
  return form;
};

const run = async () => {
  const originalUploadCount = (await fs.promises.readdir(uploadsDirectory)).length;
  const validPdf = await fs.promises.readFile(validPdfPath);
  let analysisId;
  const results = [];

  try {
    results.push(await request("GET /", "/", {}, 200));
    results.push(
      await request(
        "ATS analysis",
        "/api/ats/analyze",
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            resumeText: "Node.js C++ C# machine-learning REST API",
            jobDescription: "Need Node.js, C++, C#, machine learning and REST API",
          }),
        },
        200
      )
    );
    results.push(
      await request(
        "Missing resume",
        "/api/resume/upload",
        { method: "POST", body: new FormData() },
        400
      )
    );
    results.push(
      await request(
        "Missing job description",
        "/api/resume/upload",
        { method: "POST", body: pdfForm(validPdf) },
        400
      )
    );

    const textForm = new FormData();
    textForm.append("resume", new Blob(["plain text"], { type: "text/plain" }), "test.txt");
    textForm.append("jobDescription", "Node.js");
    results.push(
      await request(
        "Invalid file type",
        "/api/resume/upload",
        { method: "POST", body: textForm },
        400
      )
    );
    results.push(
      await request(
        "Malformed PDF",
        "/api/resume/upload",
        {
          method: "POST",
          body: pdfForm(Buffer.from("%PDF-malformed"), {
            jobDescription: "Node.js",
          }),
        },
        400
      )
    );
    results.push(
      await request(
        "Oversized PDF",
        "/api/resume/upload",
        {
          method: "POST",
          body: pdfForm(Buffer.alloc(6 * 1024 * 1024), {
            jobDescription: "Node.js",
          }),
        },
        400
      )
    );

    const validResult = await request(
      "Valid PDF upload",
      "/api/resume/upload",
      {
        method: "POST",
        body: pdfForm(validPdf, {
          jobDescription: "PDF specification document",
        }),
      },
      201
    );
    results.push(validResult);
    analysisId = validResult.body.data?.analysisId;

    if (typeof analysisId !== "string") {
      throw new Error("Valid upload did not return the saved resume.");
    }

    const retrievedAnalysis = await request(
      "Retrieve analysis",
      `/api/resume/${analysisId}`,
      {},
      200
    );
    results.push(retrievedAnalysis);

    const history = await request("Analysis history", "/api/resume/history", {}, 200);
    if (!Array.isArray(history.body.data) || !history.body.data.some((item) => item.analysisId === analysisId)) {
      throw new Error("Analysis history did not include the saved analysis.");
    }
    results.push(history);

    results.push(await request(
      "Delete analysis",
      `/api/resume/${analysisId}`,
      { method: "DELETE" },
      200
    ));
    analysisId = null;
  } finally {
    if (analysisId) await request("Delete analysis cleanup", `/api/resume/${analysisId}`, { method: "DELETE" }, 200);
  }

  const finalUploadCount = (await fs.promises.readdir(uploadsDirectory)).length;
  if (finalUploadCount !== originalUploadCount) {
    throw new Error("Upload cleanup check failed.");
  }

  console.table(
    results.map(({ name, status, success }) => ({ name, status, success }))
  );
  console.log("Database and upload cleanup verified.");
};

run().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
