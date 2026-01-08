// backend/routes/vitalsRoutes.js
const express = require('express');
const router = express.Router();
const vitalsController = require('../controllers/vitalsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, vitalsController.getVitals);
router.post('/', protect, vitalsController.addVital);

module.exports = router;
