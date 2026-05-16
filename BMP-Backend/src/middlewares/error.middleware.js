import { ValidationError } from "sequelize";
import jwt from "jsonwebtoken";

const errorMiddleware = (err, req, res, next) => {
  // In production: log message only — no stack traces in server output.
  // In development: log the full error object for easier debugging.
  if (process.env.NODE_ENV === "production") {
    console.error(`[Error] ${req.method} ${req.path} — ${err.message}`);
  } else {
    console.error("ERROR:", err);
  }

  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = null;

  if (err instanceof ValidationError) {
    statusCode = 400;
    message = "Database Validation Error";
    errors = err.errors.map(e => ({
      field: e.path,
      message: e.message
    }));
  }

  if (err instanceof jwt.JsonWebTokenError) {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err instanceof jwt.TokenExpiredError) {
    statusCode = 401;
    message = "Token expired";
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    statusCode = 400;
    message = "Duplicate field value";
    errors = err.errors.map(e => ({
      field: e.path,
      message: `${e.path} already exists`
    }));
  }

  if (err.name === "SequelizeDatabaseError") {
    statusCode = 400;
    message = "Invalid input format";
  }

  // Never expose internal error details or stack traces to the client in production
  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
};

export default errorMiddleware;
export { errorMiddleware as errorHandler };
