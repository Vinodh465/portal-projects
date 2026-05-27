'use strict';

/**
 * Global Error Handler Middleware
 * Handles all errors thrown in the application and returns structured JSON
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal Server Error';

  // Log error details in development
  console.error(`\n❌ [ERROR] ${new Date().toISOString()}`);
  console.error(`   Route  : ${req.method} ${req.originalUrl}`);
  console.error(`   Status : ${statusCode}`);
  console.error(`   Message: ${message}`);
  if (err.stack) console.error(`   Stack  : ${err.stack}`);

  // Handle Axios / SAP connection errors
  if (err.isAxiosError) {
    if (err.code === 'ECONNREFUSED') {
      statusCode = 503;
      message = 'SAP backend service is unavailable. Please try again later.';
    } else if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      statusCode = 504;
      message = 'SAP service request timed out.';
    } else if (err.response) {
      statusCode = err.response.status || 502;
      message = `SAP OData error: ${err.response.statusText || 'Unknown error'}`;
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token.';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired.';
  }

  // Handle validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  return res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
