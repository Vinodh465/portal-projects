const express = require('express');
const router = express.Router();
const { getNotifications, getNotificationById } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/auth');

// GET /api/notifications?id=&search=&priority=&status=
router.get('/', authMiddleware, getNotifications);

// GET /api/notifications/:id
router.get('/:id', authMiddleware, getNotificationById);

module.exports = router;
