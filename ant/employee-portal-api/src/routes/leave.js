'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getLeave } = require('../controllers/leaveController');

// GET /api/leave/:empId
router.get('/:empId', authMiddleware, getLeave);

module.exports = router;
