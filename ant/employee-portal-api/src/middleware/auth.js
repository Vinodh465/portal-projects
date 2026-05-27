'use strict';

const jwt = require('jsonwebtoken');
const config = require('../config');
const { errorResponse } = require('../utils/responseHelper');

/**
 * JWT Authentication Middleware
 * Validates Bearer token from Authorization header
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Access denied. No token provided.', 401);
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return errorResponse(res, 'Access denied. Malformed token.', 401);
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token has expired. Please log in again.', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return errorResponse(res, 'Invalid token. Authentication failed.', 401);
    }
    return errorResponse(res, 'Authentication error.', 401);
  }
};

module.exports = authMiddleware;
