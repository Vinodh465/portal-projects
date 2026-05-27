'use strict';

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getPayslip, getPayslipPdf, sendPayslipEmail } = require('../controllers/payslipController');

// POST /api/payslip/send-email (must be before /:empId to avoid conflict)
router.post('/send-email', authMiddleware, sendPayslipEmail);

// GET /api/payslip/pdf/:empId  (must be before /:empId to avoid conflict)
router.get('/pdf/:empId', authMiddleware, getPayslipPdf);

// GET /api/payslip/:empId
router.get('/:empId', authMiddleware, getPayslip);

module.exports = router;
