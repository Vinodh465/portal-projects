const express = require('express');
const router = express.Router();
const { getDashboard } = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/auth');

// GET /api/dashboard
router.get('/', authMiddleware, getDashboard);

module.exports = router;
