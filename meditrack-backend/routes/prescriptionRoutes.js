// // backend/routes/prescriptionRoutes.js

// const express = require('express');
// const prescriptionController = require('../controllers/prescriptionController');
// const { protect } = require('../middleware/authMiddleware');

// const router = express.Router();

// // All routes require authentication (protect middleware)
// router.route('/')
//     .post(protect, prescriptionController.addPrescription)  // POST /api/prescriptions
//     .get(protect, prescriptionController.getPrescriptions); // GET /api/prescriptions

// // Additional routes (e.g., PUT, DELETE) will go here later

// module.exports = router;



// backend/routes/prescriptionRoutes.js

const express = require('express');
const prescriptionController = require('../controllers/prescriptionController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication (protect middleware)
router.route('/')
    .post(protect, prescriptionController.addPrescription)  // POST /api/prescriptions
    .get(protect, prescriptionController.getPrescriptions); // GET /api/prescriptions

// Route for deleting a specific prescription
router.route('/:id')
    .delete(protect, prescriptionController.deletePrescription);

// Additional routes (e.g., PUT, DELETE) will go here later

module.exports = router;