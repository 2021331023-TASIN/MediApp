// backend/controllers/prescriptionController.js

const { dbPool } = require('../config/db');

/**
 * Helper to check if a medicine name exists or create it.
 * Returns the medicine_id.
 */
const getOrCreateMedicineId = async (name) => {
    // 1. Check if medicine exists
    let [rows] = await dbPool.promise().query('SELECT medicine_id FROM medicines WHERE name = ?', [name]);

    if (rows.length > 0) {
        return rows[0].medicine_id;
    }

    // 2. If not, insert it (we default generic_name, side_effects, description to NULL)
    const [result] = await dbPool.promise().query('INSERT INTO medicines (name) VALUES (?)', [name]);
    return result.insertId;
};

/**
 * POST /api/prescriptions
 * Adds a new prescription and its recurring schedules.
 */
exports.addPrescription = async (req, res) => {
    const { medicineName, dosage, startDate, endDate, scheduleTimes } = req.body;
    const userId = req.userId; // Set by authMiddleware

    if (!medicineName || !dosage || !startDate || !scheduleTimes || scheduleTimes.length === 0) {
        return res.status(400).json({ message: 'Missing required prescription fields.' });
    }

    const connection = await dbPool.promise().getConnection();
    await connection.beginTransaction();

    try {
        // 1. Get or Create the Medicine
        const medicine_id = await getOrCreateMedicineId(medicineName);

        // 2. Insert the User_Prescription
        const presQuery = 'INSERT INTO user_prescriptions (user_id, medicine_id, dosage, start_date, end_date) VALUES (?, ?, ?, ?, ?)';
        const [presResult] = await connection.query(presQuery, [userId, medicine_id, dosage, startDate, endDate]);
        const prescription_id = presResult.insertId;

        // 3. Insert Recurring Schedules
        const scheduleValues = scheduleTimes.map(time => [
            prescription_id,
            time,
            'daily', // For simplicity in this phase, we use 'daily'
            null
        ]);

        const scheduleQuery = 'INSERT INTO recurring_schedules (prescription_id, time_of_day, frequency_type, frequency_detail) VALUES ?';
        await connection.query(scheduleQuery, [scheduleValues]);

        // 4. Commit and Respond
        await connection.commit();
        res.status(201).json({ message: 'Prescription added and schedules set.', prescription_id });

    } catch (error) {
        await connection.rollback();
        console.error('Error adding prescription:', error);
        res.status(500).json({ message: 'Failed to add prescription due to a server error.' });
    } finally {
        connection.release();
    }
};

/**
 * GET /api/prescriptions
 * Retrieves all active prescriptions for the logged-in user.
 */
exports.getPrescriptions = async (req, res) => {
    const userId = req.userId;

    try {
        // 1. Auto-expire prescriptions where end_date < TODAY
        // valid end_date (not null) AND strictly less than current date
        await dbPool.promise().query(`
            UPDATE user_prescriptions 
            SET is_active = FALSE 
            WHERE user_id = ? 
              AND is_active = TRUE 
              AND end_date IS NOT NULL 
              AND end_date < CURDATE()
        `, [userId]);

        // 2. Join prescriptions with medicine names
        const query = `
            SELECT 
                p.prescription_id, 
                m.name, 
                p.dosage, 
                p.start_date, 
                p.end_date 
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            WHERE p.user_id = ? AND p.is_active = TRUE
        `;
        const [prescriptions] = await dbPool.promise().query(query, [userId]);

        res.json(prescriptions);
    } catch (error) {
        console.error('Error fetching prescriptions:', error);
        res.status(500).json({ message: 'Failed to retrieve prescriptions.' });
    }
};

/**
 * DELETE /api/prescriptions/:id
 * Soft deletes a prescription by setting is_active = FALSE
 */
exports.deletePrescription = async (req, res) => {
    const userId = req.userId;
    const prescriptionId = req.params.id;
    console.log(`[DELETE] Request for ID: ${prescriptionId}, User: ${userId}`);

    try {
        const query = 'UPDATE user_prescriptions SET is_active = FALSE WHERE prescription_id = ? AND user_id = ?';
        const [result] = await dbPool.promise().query(query, [prescriptionId, userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Prescription not found or unauthorized.' });
        }

        res.json({ message: 'Prescription deleted successfully.' });
    } catch (error) {
        console.error('Error deleting prescription:', error);
        res.status(500).json({ message: 'Failed to delete prescription.' });
    }
};

/**
 * GET /api/prescriptions/stats
 * Retrieves dashboard statistics: total active prescriptions and today's total doses.
 */
exports.getDashboardStats = async (req, res) => {
    const userId = req.userId;

    try {
        // 1. Get total active prescriptions
        const activeCountQuery = 'SELECT COUNT(*) as count FROM user_prescriptions WHERE user_id = ? AND is_active = TRUE';
        const [activeRows] = await dbPool.promise().query(activeCountQuery, [userId]);
        const activePrescriptions = activeRows[0].count;

        // 2. Get total daily doses (sum of schedule times for active prescriptions)
        const dosesQuery = `
            SELECT COUNT(rs.schedule_id) as count 
            FROM user_prescriptions p
            JOIN recurring_schedules rs ON p.prescription_id = rs.prescription_id
            WHERE p.user_id = ? AND p.is_active = TRUE
        `;
        const [dosesRows] = await dbPool.promise().query(dosesQuery, [userId]);
        const dailyDoses = dosesRows[0].count;

        res.json({
            activePrescriptions,
            dailyDoses
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ message: 'Failed to fetch dashboard stats.' });
    }
};

/**
 * GET /api/prescriptions/history
 * Retrieves inactive (history) prescriptions.
 */
exports.getHistory = async (req, res) => {
    const userId = req.userId;

    try {
        // Fetch prescriptions that are NOT active
        const query = `
            SELECT 
                p.prescription_id, 
                m.name, 
                p.dosage, 
                p.start_date, 
                p.end_date,
                p.is_active
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            WHERE p.user_id = ? AND p.is_active = FALSE
            ORDER BY p.end_date DESC, p.prescription_id DESC
        `;
        const [history] = await dbPool.promise().query(query, [userId]);

        res.json(history);
    } catch (error) {
        console.error('Error fetching history:', error);
        res.status(500).json({ message: 'Failed to retrieve prescription history.' });
    }
};

/**
 * GET /api/prescriptions/today
 * Retrieves all medication schedules for today.
 * Used for the alarm system and dashboard checklist.
 */
exports.getTodaySchedules = async (req, res) => {
    const userId = req.userId;
    try {
        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const query = `
            SELECT 
                p.prescription_id, 
                m.name, 
                p.dosage, 
                rs.time_of_day,
                CASE WHEN dl.log_id IS NOT NULL THEN TRUE ELSE FALSE END as is_taken
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            JOIN recurring_schedules rs ON p.prescription_id = rs.prescription_id
            LEFT JOIN dose_logs dl ON p.prescription_id = dl.prescription_id 
                                   AND dl.taken_date = ? 
                                   AND dl.schedule_time = rs.time_of_day
            WHERE p.user_id = ? AND p.is_active = TRUE
            ORDER BY rs.time_of_day ASC
        `;
        const [schedules] = await dbPool.promise().query(query, [today, userId]);
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
    const userId = req.userId;
    const { prescriptionId, scheduleTime } = req.body;

    if (!prescriptionId || !scheduleTime) {
        return res.status(400).json({ message: 'Missing prescriptionId or scheduleTime.' });
    }

    const today = new Date().toISOString().slice(0, 10);

    try {
        // Check if already taken to avoid duplicates
        const checkQuery = 'SELECT log_id FROM dose_logs WHERE prescription_id = ? AND taken_date = ? AND schedule_time = ?';
        const [existing] = await dbPool.promise().query(checkQuery, [prescriptionId, today, scheduleTime]);

        if (existing.length > 0) {
            return res.status(200).json({ message: 'Dose already marked as taken.' });
        }

        const insertQuery = 'INSERT INTO dose_logs (user_id, prescription_id, schedule_time, taken_date) VALUES (?, ?, ?, ?)';
        await dbPool.promise().query(insertQuery, [userId, prescriptionId, scheduleTime, today]);

        res.json({ message: 'Dose marked as taken.' });
    } catch (error) {
        console.error('Error marking dose as taken:', error);
        res.status(500).json({ message: 'Failed to mark dose as taken.' });
    }
};
