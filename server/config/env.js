const validateEnvironment = () => {
  const missingVariables = ["MONGODB_URI"].filter(
    (name) => !process.env[name]?.trim()
  );

  if (missingVariables.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVariables.join(", ")}`
    );
  }

  if (process.env.PORT) {
    const port = Number(process.env.PORT);

    if (!Number.isInteger(port) || port < 1 || port > 65535) {
      throw new Error("PORT must be an integer between 1 and 65535.");
    }
  }

  if (process.env.GEMINI_TIMEOUT_MS) {
    const timeout = Number(process.env.GEMINI_TIMEOUT_MS);

    if (!Number.isInteger(timeout) || timeout < 1000 || timeout > 120000) {
      throw new Error("GEMINI_TIMEOUT_MS must be an integer between 1000 and 120000.");
    }
  }

  const numericVariables = [
    ["RATE_LIMIT_WINDOW_MS", 1000, 86400000],
    ["RATE_LIMIT_MAX", 1, 1000],
  ];

  numericVariables.forEach(([name, minimum, maximum]) => {
    if (!process.env[name]) return;
    const value = Number(process.env[name]);

    if (!Number.isInteger(value) || value < minimum || value > maximum) {
      throw new Error(`${name} must be an integer between ${minimum} and ${maximum}.`);
    }
  });

  const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (process.env.NODE_ENV === "production" && !configuredOrigins.length) {
    throw new Error("CLIENT_ORIGIN is required in production.");
  }

  if (configuredOrigins.some((origin) => origin === "*" || !/^https?:\/\/[^\s/]+/i.test(origin))) {
    throw new Error("CLIENT_ORIGIN must contain valid explicit HTTP(S) origins.");
  }
};

module.exports = validateEnvironment;
