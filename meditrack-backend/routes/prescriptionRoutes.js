// backend/routes/prescriptionRoutes.js

const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication (protect middleware)
router.route('/')
    .post(protect, prescriptionController.addPrescription)  // POST /api/prescriptions
    .get(protect, prescriptionController.getPrescriptions); // GET /api/prescriptions

// Additional routes (e.g., PUT, DELETE) will go here later

module.exports = router;