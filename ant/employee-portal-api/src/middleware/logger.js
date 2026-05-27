'use strict';

// ANSI color codes
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',

  // Method colors
  GET: '\x1b[32m',     // Green
  POST: '\x1b[34m',    // Blue
  PUT: '\x1b[33m',     // Yellow
  PATCH: '\x1b[35m',   // Magenta
  DELETE: '\x1b[31m',  // Red
  OPTIONS: '\x1b[36m', // Cyan
  HEAD: '\x1b[36m',    // Cyan

  // Status code colors
  info: '\x1b[36m',    // Cyan  — 1xx
  success: '\x1b[32m', // Green — 2xx
  redirect: '\x1b[33m',// Yellow— 3xx
  clientErr: '\x1b[31m',// Red  — 4xx
  serverErr: '\x1b[35m',// Magenta— 5xx
};

/**
 * Returns the ANSI color for an HTTP status code.
 * @param {number} status
 * @returns {string}
 */
const statusColor = (status) => {
  if (status >= 500) return COLORS.serverErr;
  if (status >= 400) return COLORS.clientErr;
  if (status >= 300) return COLORS.redirect;
  if (status >= 200) return COLORS.success;
  return COLORS.info;
};

/**
 * Returns the ANSI color for an HTTP method.
 * @param {string} method
 * @returns {string}
 */
const methodColor = (method) => COLORS[method] || COLORS.reset;

/**
 * Custom request logging middleware.
 * Logs: [timestamp] METHOD /url STATUS responseTimeMs
 */
const logger = (req, res, next) => {
  const start = process.hrtime.bigint();

  // Intercept response finish to capture status and elapsed time
  res.on('finish', () => {
    const elapsedNs = process.hrtime.bigint() - start;
    const elapsedMs = (Number(elapsedNs) / 1_000_000).toFixed(2);
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl || req.url;
    const status = res.statusCode;

    const mColor = methodColor(method);
    const sColor = statusColor(status);

    const line = [
      `${COLORS.dim}[${timestamp}]${COLORS.reset}`,
      `${mColor}${COLORS.bright}${method.padEnd(7)}${COLORS.reset}`,
      `${url}`,
      `${sColor}${status}${COLORS.reset}`,
      `${COLORS.dim}${elapsedMs}ms${COLORS.reset}`,
    ].join(' ');

    console.log(line);
  });

  next();
};

module.exports = logger;
