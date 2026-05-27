'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getProfile } = require('../controllers/profileController');

// GET /api/profile/:empId
router.get('/:empId', authMiddleware, getProfile);

module.exports = router;
