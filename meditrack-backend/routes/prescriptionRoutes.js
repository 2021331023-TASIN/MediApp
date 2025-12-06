// backend/routes/prescriptionRoutes.js

const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Active Prescriptions (Add/Get)
router.route('/')
    .post(protect, prescriptionController.addPrescription)
    .get(protect, prescriptionController.getPrescriptions);

// Dashboard Stats
router.get('/stats', protect, prescriptionController.getDashboardStats);

// History
router.get('/history', protect, prescriptionController.getHistory);

// Today's Schedules (Alarms)
router.get('/today', protect, prescriptionController.getTodaySchedules);

// Delete Prescription
router.route('/:id')
    .delete(protect, prescriptionController.deletePrescription);

module.exports = router;