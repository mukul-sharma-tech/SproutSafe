/** Centralized error handling middleware. Must be registered last. */
export const errorHandler = (err, req, res, next) => {
  console.error("[Error]", err.message);
  if (process.env.NODE_ENV === "development" && err.stack) {
    console.error(err.stack);
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message).join("; ");
    return res.status(400).json({ message: "Validation error", errors: messages });
  }

  // Mongoose duplicate key (e.g. unique email)
  if (err.code === 11000) {
    return res.status(400).json({ message: "A record with this value already exists" });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Invalid or expired token" });
  }

  // Mongoose CastError (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({ message: "Invalid ID format" });
  }

  // Default
  res.status(err.statusCode || 500).json({
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/** 404 handler for unknown routes */
export const notFound = (req, res) => {
  res.status(404).json({ message: "Route not found" });
};
