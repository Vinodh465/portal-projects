const express = require('express');
const router = express.Router();
const { getWorkOrders, getWorkOrderById } = require('../controllers/workOrderController');
const authMiddleware = require('../middleware/auth');

// GET /api/workorders?id=&search=&priority=
router.get('/', authMiddleware, getWorkOrders);

// GET /api/workorders/:id
router.get('/:id', authMiddleware, getWorkOrderById);

module.exports = router;
