const LOCAL_ORIGINS = ["http://localhost:5173", "http://127.0.0.1:5173"];

const getAllowedOrigins = () => {
  const configuredOrigins = String(process.env.CLIENT_ORIGIN || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

  return configuredOrigins.length ? configuredOrigins : LOCAL_ORIGINS;
};

const createCorsOptions = () => {
  const allowedOrigins = getAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

      const error = new Error("Origin is not allowed.");
      error.code = "CORS_ORIGIN_NOT_ALLOWED";
      return callback(error);
    },
    methods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
  };
};

module.exports = { createCorsOptions, getAllowedOrigins };
