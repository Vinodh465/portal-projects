'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getDashboard } = require('../controllers/dashboardController');

// GET /api/dashboard/:empId
router.get('/:empId', authMiddleware, getDashboard);

module.exports = router;
