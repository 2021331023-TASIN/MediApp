const PrescriptionService = require('../services/PrescriptionService');

/**
 * POST /api/prescriptions
 * Adds a new prescription and its recurring schedules.
 */
exports.addPrescription = async (req, res) => {
    try {
        const userId = req.userId;
        const prescriptionId = await PrescriptionService.addPrescription(userId, req.body);
        res.status(201).json({ message: 'Prescription added and schedules set.', prescription_id: prescriptionId });
    } catch (error) {
        console.error('Error adding prescription:', error);
        res.status(500).json({ message: 'Failed to add prescription due to a server error.' });
    }
};

/**
 * GET /api/prescriptions
 * Retrieves all active prescriptions for the logged-in user.
 */
exports.getPrescriptions = async (req, res) => {
    try {
        const userId = req.userId;
        const prescriptions = await PrescriptionService.getActivePrescriptions(userId);
        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Failed to retrieve prescriptions.' });
    }
};

/**
 * DELETE /api/prescriptions/:id
 * Soft deletes a prescription
 */
exports.deletePrescription = async (req, res) => {
    try {
        const userId = req.userId;
        const prescriptionId = req.params.id;
        await PrescriptionService.deletePrescription(prescriptionId, userId);
        res.json({ message: 'Prescription deleted successfully.' });
    } catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ message: error.message });
        }
        console.error('Error deleting prescription:', error);
        res.status(500).json({ message: 'Failed to delete prescription.' });
    }
};

/**
 * GET /api/prescriptions/stats
 */
exports.getDashboardStats = async (req, res) => {
    try {
        const userId = req.userId;
        const stats = await PrescriptionService.getDashboardStats(userId);
        res.json(stats);
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
};

/**
 * GET /api/prescriptions/history
 */
exports.getHistory = async (req, res) => {
    try {
        const userId = req.userId;
        const history = await PrescriptionService.getHistory(userId);
        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Failed to retrieve prescription history.' });
    }
};

/**
 * GET /api/prescriptions/today
 */
exports.getTodaySchedules = async (req, res) => {
    try {
        const userId = req.userId;
        const schedules = await PrescriptionService.getTodaySchedules(userId);
        res.json(schedules);
    } catch (error) {
        console.error('Error fetching today schedules:', error);
        res.status(500).json({ message: 'Failed to fetch schedules.' });
    }
};

/**
 * POST /api/prescriptions/take
 * Marks a specific scheduled dose as taken for today.
 */
exports.markDoseTaken = async (req, res) => {
    try {
        const userId = req.userId;
        const { prescriptionId, scheduleTime } = req.body;

        if (!prescriptionId || !scheduleTime) {
            return res.status(400).json({ message: 'Missing prescriptionId or scheduleTime.' });
        }

        const message = await PrescriptionService.markDoseTaken(userId, prescriptionId, scheduleTime);
        res.json({ message });
    } catch (error) {
        console.error('Error marking dose as taken:', error);
        res.status(500).json({ message: 'Failed to mark dose as taken.' });
    }
};

