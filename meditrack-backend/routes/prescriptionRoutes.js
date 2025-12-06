// backend/routes/prescriptionRoutes.js

const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Routes
router.post('/', protect, prescriptionController.addPrescription);
router.get('/', protect, prescriptionController.getPrescriptions);
router.get('/today', protect, prescriptionController.getTodaySchedules); // Updated for dashboard checklist
router.post('/take', protect, prescriptionController.markDoseTaken);
router.get('/stats', protect, prescriptionController.getDashboardStats);
router.get('/history', protect, prescriptionController.getHistory);
router.delete('/:id', protect, prescriptionController.deletePrescription);

module.exports = router;