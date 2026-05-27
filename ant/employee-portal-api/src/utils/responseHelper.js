'use strict';

const config = require('../config');

/**
 * Success response helper
 */
const successResponse = (res, data, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response helper
 */
const errorResponse = (res, message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    statusCode,
    timestamp: new Date().toISOString(),
  };
  if (errors && config.nodeEnv === 'development') {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
};

/**
 * Paginated response helper
 */
const paginatedResponse = (res, data, total, page = 1, limit = 10, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    pagination: {
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = { successResponse, errorResponse, paginatedResponse };
