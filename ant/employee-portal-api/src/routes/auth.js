'use strict';

const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');

// POST /api/login
router.post('/', login);

module.exports = router;
