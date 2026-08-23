const test = require("node:test");
const assert = require("node:assert/strict");

const validateEnvironment = require("../config/env");

test("requires MONGODB_URI without revealing a value", () => {
  const originalUri = process.env.MONGODB_URI;
  delete process.env.MONGODB_URI;

  try {
    assert.throws(validateEnvironment, /MONGODB_URI/);
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
  }
});

test("rejects an invalid PORT", () => {
  const originalUri = process.env.MONGODB_URI;
  const originalPort = process.env.PORT;
  process.env.MONGODB_URI = "mongodb://example.invalid/test";
  process.env.PORT = "invalid";

  try {
    assert.throws(validateEnvironment, /PORT/);
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
    if (originalPort === undefined) delete process.env.PORT;
    else process.env.PORT = originalPort;
  }
});

test("rejects an invalid Gemini timeout", () => {
  const originalUri = process.env.MONGODB_URI;
  const originalTimeout = process.env.GEMINI_TIMEOUT_MS;
  process.env.MONGODB_URI = "mongodb://example.invalid/test";
  process.env.GEMINI_TIMEOUT_MS = "invalid";

  try {
    assert.throws(validateEnvironment, /GEMINI_TIMEOUT_MS/);
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
    if (originalTimeout === undefined) delete process.env.GEMINI_TIMEOUT_MS;
    else process.env.GEMINI_TIMEOUT_MS = originalTimeout;
  }
});

test("requires an explicit production client origin", () => {
  const originalUri = process.env.MONGODB_URI;
  const originalNodeEnv = process.env.NODE_ENV;
  const originalOrigin = process.env.CLIENT_ORIGIN;
  process.env.MONGODB_URI = "mongodb://example.invalid/test";
  process.env.NODE_ENV = "production";
  delete process.env.CLIENT_ORIGIN;

  try {
    assert.throws(validateEnvironment, /CLIENT_ORIGIN/);
  } finally {
    if (originalUri === undefined) delete process.env.MONGODB_URI;
    else process.env.MONGODB_URI = originalUri;
    if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalNodeEnv;
    if (originalOrigin === undefined) delete process.env.CLIENT_ORIGIN;
    else process.env.CLIENT_ORIGIN = originalOrigin;
  }
});
