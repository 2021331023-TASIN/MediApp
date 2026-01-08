// backend/controllers/vitalsController.js
const { dbPool } = require('../config/db');

// Get all vitals for a user
exports.getVitals = async (req, res) => {
    try {
        const userId = req.userId; // FIXED: Middleware sets req.userId
        const [rows] = await dbPool.promise().query(
            'SELECT * FROM vitals WHERE user_id = ? ORDER BY date DESC',
            [userId]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching vitals' });
    }
};

// Add a new vital record
exports.addVital = async (req, res) => {
    try {
        const userId = req.userId; // FIXED: Middleware sets req.userId
        const { type, value, date } = req.body;

        if (!type || !value) {
            return res.status(400).json({ message: 'Type and Value are required' });
        }

        await dbPool.promise().query(
            'INSERT INTO vitals (user_id, type, value, date) VALUES (?, ?, ?, ?)',
            [userId, type, value, date || new Date()]
        );

        res.status(201).json({ message: 'Vital recorded successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error saving vital' });
    }
};
