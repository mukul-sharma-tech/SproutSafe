/** Validate required environment variables. Call at startup. */
export const validateEnv = () => {
  const required = ["MONGO_URI", "JWT_SECRET"];
  const missing = required.filter((key) => !process.env[key] || process.env[key].trim() === "");
  if (missing.length > 0) {
    console.error(`Missing required env: ${missing.join(", ")}`);
    process.exit(1);
  }
};
