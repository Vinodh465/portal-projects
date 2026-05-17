/**
 * Auth Middleware - validates x-employee-id header for protected routes
 */
const authMiddleware = (req, res, next) => {
  const employeeId = req.headers['x-employee-id'];
  if (!employeeId) {
    return res.status(401).json({
      success: false,
      error: 'Missing x-employee-id header. Please login first.',
    });
  }
  req.employeeId = employeeId;
  next();
};

module.exports = authMiddleware;
