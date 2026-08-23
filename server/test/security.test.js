const test = require("node:test");
const assert = require("node:assert/strict");

process.env.NODE_ENV = "test";
process.env.RATE_LIMIT_MAX = "3";
process.env.RATE_LIMIT_WINDOW_MS = "60000";

const { app } = require("../server");

let server;
let baseUrl;

test.before(() => new Promise((resolve) => {
  server = app.listen(0, () => {
    baseUrl = `http://127.0.0.1:${server.address().port}`;
    resolve();
  });
}));

test.after(() => new Promise((resolve, reject) => {
  server.close((error) => error ? reject(error) : resolve());
}));

test("health endpoint returns a non-sensitive service status", async () => {
  const response = await fetch(`${baseUrl}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.deepEqual(body, { success: true, message: "Service is healthy.", data: null });
});

test("allows the local frontend origin and sets security headers", async () => {
  const origin = "http://localhost:5173";
  const response = await fetch(`${baseUrl}/`, { headers: { Origin: origin } });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("access-control-allow-origin"), origin);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});

test("rejects disallowed browser origins without exposing internals", async () => {
  const response = await fetch(`${baseUrl}/`, { headers: { Origin: "https://untrusted.example" } });
  const body = await response.json();

  assert.equal(response.status, 403);
  assert.deepEqual(body, { success: false, message: "Origin is not allowed.", data: null });
});

test("rejects oversized JSON requests safely", async () => {
  const response = await fetch(`${baseUrl}/api/ats/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText: "a".repeat(260000), jobDescription: "React" }),
  });
  const body = await response.json();

  assert.equal(response.status, 413);
  assert.deepEqual(body, { success: false, message: "Request body is too large.", data: null });
});

test("rate limits analysis requests with a safe response", async () => {
  const request = () => fetch(`${baseUrl}/api/ats/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resumeText: "React", jobDescription: "React" }),
  });

  assert.equal((await request()).status, 200);
  assert.equal((await request()).status, 200);
  assert.equal((await request()).status, 200);
  const limitedResponse = await request();
  const limitedBody = await limitedResponse.json();

  assert.equal(limitedResponse.status, 429);
  assert.deepEqual(limitedBody, {
    success: false,
    message: "Too many analysis requests. Please try again later.",
    data: null,
  });
});
