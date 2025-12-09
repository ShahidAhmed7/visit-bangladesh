import { AppError } from "../shared/errors.js";
import { logger } from "../config/logger.js";

const errorHandler = (err, req, res, next) => {
  logger.error("Error", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
  });

  if (err.isOperational) {
    return res.status(err.statusCode).json({ status: "error", message: err.message });
  }

  if (err.name === "ValidationError") {
    return res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({ status: "error", message: `Invalid ${err.path}: ${err.value}` });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ status: "error", message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ status: "error", message: "Token expired" });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ status: "error", message: `${field} already exists` });
  }

  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    status: "error",
    message: process.env.NODE_ENV === "development" ? err.message : "Internal server error",
  });
};

export default errorHandler;
