// Error handling middleware for the API

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(statusCode, message, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error converter middleware
 * Converts regular errors to ApiError format
 */
export const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode = error.statusCode || error instanceof SyntaxError ? 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

/**
 * Error handler middleware
 * Formats and sends error responses
 */
export const errorHandler = (err, req, res, next) => {
  const { statusCode, message, isOperational, stack } = err;

  // Log error for debugging
  console.error(`🚨 Error: ${message}`);
  if (!isOperational) {
    console.error('Stack trace:', stack);
  }

  // Determine environment
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Prepare response
  const response = {
    success: false,
    status: statusCode,
    message,
    ...(isDevelopment && { stack: stack }),
    ...(isDevelopment && { isOperational }),
  };

  // Send response
  res.status(statusCode).json(response);
};

/**
 * Not found middleware
 * Handles 404 errors for routes that don't exist
 */
export const notFound = (req, res, next) => {
  const error = new ApiError(404, `API endpoint not found: ${req.originalUrl}`);
  next(error);
};

/**
 * Handle uncaught exceptions and unhandled rejections
 */
export const setupErrorHandlers = () => {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(error.name, error.message, error.stack);
    process.exit(1);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (error) => {
    console.error('UNHANDLED REJECTION! 💥 Shutting down...');
    console.error(error);
    process.exit(1);
  });
};