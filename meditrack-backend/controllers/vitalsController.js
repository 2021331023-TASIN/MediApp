const VitalService = require('../services/VitalService');

// Get all vitals for a user
exports.getVitals = async (req, res) => {
    try {
        const userId = req.userId;
        const vitals = await VitalService.getVitals(userId);
        res.json(vitals);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error fetching vitals' });
    }
};

// Add a new vital record
exports.addVital = async (req, res) => {
    try {
        const userId = req.userId;
        await VitalService.addVital(userId, req.body);
        res.status(201).json({ message: 'Vital recorded successfully' });
    } catch (error) {
        if (error.message.includes('required')) {
            return res.status(400).json({ message: error.message });
        }
        console.error(error);
        res.status(500).json({ message: 'Server error saving vital' });
    }
};
