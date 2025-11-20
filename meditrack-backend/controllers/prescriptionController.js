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
        // Join prescriptions with medicine names
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