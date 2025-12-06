// // backend/server.js

// // Load environment variables
// require('dotenv').config();

// const express = require('express');
// const cors = require('cors');

// // Import DB Connection from config file
// const { dbPool } = require('./config/db'); 
// // Import Routes
// const authRoutes = require('./routes/authRoutes'); 
// const prescriptionRoutes = require('./routes/prescriptionRoutes'); // <-- NEW IMPORT

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors());
// app.use(express.json()); // Allows parsing of JSON request bodies

// // NOTE: The database connection and test are now handled in ./config/db.js

// // --- API Routes ---
// // Authentication routes
// app.use('/api/auth', authRoutes); 
// // Prescription routes
// app.use('/api/prescriptions', prescriptionRoutes); // <-- NEW ROUTE INTEGRATION

// // Basic Root Route
// app.get('/', (req, res) => {
//     res.send('MediTrack API is running!');
// });

// // Start Server
// app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
// });

// // NOTE: The export module.exports = { dbPool }; is REMOVED from here to fix the circular dependency warning.



// backend/server.js

// Load environment variables
require('dotenv').config();

const express = require('express');
const cors = require('cors');

// Import DB Connection from config file
const { dbPool } = require('./config/db');
// Import Routes
const authRoutes = require('./routes/authRoutes');
const prescriptionRoutes = require('./routes/prescriptionRoutes'); // <-- NEW IMPORT

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// NOTE: The database connection and test are now handled in ./config/db.js

// --- API Routes ---
// Authentication routes
app.use('/api/auth', authRoutes);
// Prescription routes
app.use('/api/prescriptions', prescriptionRoutes); // <-- NEW ROUTE INTEGRATION

// Basic Root Route
app.get('/', (req, res) => {
    res.send('MediTrack API is running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// NOTE: The export module.exports = { dbPool }; is REMOVED from here to fix the circular dependency warning.