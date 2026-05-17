const express = require('express');
const router = express.Router();
const { getPlants, getPlantById } = require('../controllers/plantController');
const authMiddleware = require('../middleware/auth');

// GET /api/plants?id=&search=
router.get('/', authMiddleware, getPlants);

// GET /api/plants/:id
router.get('/:id', authMiddleware, getPlantById);

module.exports = router;
