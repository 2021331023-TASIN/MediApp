const { dbPool } = require('../config/db');

class PrescriptionRepository {
    async addPrescription(connection, prescriptionData) {
        const {
            userId, medicine_id, dosage, startDate, endDate,
            pillsPerDose, dosesPerDay, durationDays, initQty, currQty, instructions
        } = prescriptionData;

        const presQuery = `
            INSERT INTO user_prescriptions 
            (user_id, medicine_id, dosage, start_date, end_date, pills_per_dose, doses_per_day, duration_days, initial_quantity, current_quantity, instructions) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const [result] = await connection.query(presQuery, [
            userId, medicine_id, dosage, startDate, endDate,
            pillsPerDose, dosesPerDay, durationDays, initQty, currQty, instructions
        ]);
        return result.insertId;
    }

    async addRecurringSchedules(connection, prescriptionId, scheduleTimes) {
        const scheduleValues = scheduleTimes.map(time => [
            prescriptionId, time, 'daily', null
        ]);
        const scheduleQuery = 'INSERT INTO recurring_schedules (prescription_id, time_of_day, frequency_type, frequency_detail) VALUES ?';
        await connection.query(scheduleQuery, [scheduleValues]);
    }

    async autoExpirePrescriptions(userId) {
        await dbPool.promise().query(`
            UPDATE user_prescriptions 
            SET is_active = FALSE 
            WHERE user_id = ? 
              AND is_active = TRUE 
              AND end_date IS NOT NULL 
              AND end_date < CURDATE()
        `, [userId]);
    }

    async getActivePrescriptions(userId) {
        const query = `
            SELECT 
                p.prescription_id, m.name, p.dosage, p.start_date, p.end_date,
                p.current_quantity, p.duration_days, p.doses_per_day,
                p.pills_per_dose, p.instructions,
                (SELECT COUNT(*) FROM dose_history dh WHERE dh.prescription_id = p.prescription_id AND dh.is_taken = TRUE) as total_taken
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            WHERE p.user_id = ? AND p.is_active = TRUE
        `;
        const [rows] = await dbPool.promise().query(query, [userId]);
        return rows;
    }

    async deletePrescription(prescriptionId, userId) {
        const query = 'UPDATE user_prescriptions SET is_active = FALSE WHERE prescription_id = ? AND user_id = ?';
        const [result] = await dbPool.promise().query(query, [prescriptionId, userId]);
        return result.affectedRows > 0;
    }

    async getDashboardStats(userId) {
        const activeCountQuery = 'SELECT COUNT(*) as count FROM user_prescriptions WHERE user_id = ? AND is_active = TRUE';
        const [activeRows] = await dbPool.promise().query(activeCountQuery, [userId]);

        const dosesQuery = `
            SELECT COUNT(rs.schedule_id) as count 
            FROM user_prescriptions p
            JOIN recurring_schedules rs ON p.prescription_id = rs.prescription_id
            WHERE p.user_id = ? AND p.is_active = TRUE
        `;
        const [dosesRows] = await dbPool.promise().query(dosesQuery, [userId]);

        return {
            activePrescriptions: activeRows[0].count,
            dailyDoses: dosesRows[0].count
        };
    }

    async getHistory(userId) {
        const query = `
            SELECT p.prescription_id, m.name, p.dosage, p.start_date, p.end_date, p.is_active
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            WHERE p.user_id = ? AND p.is_active = FALSE
            ORDER BY p.end_date DESC, p.prescription_id DESC
        `;
        const [rows] = await dbPool.promise().query(query, [userId]);
        return rows;
    }

    async getTodaySchedules(userId, today) {
        const query = `
            SELECT 
                p.prescription_id, m.name, p.dosage, rs.time_of_day,
                p.current_quantity, p.pills_per_dose,
                CASE WHEN dh.dose_id IS NOT NULL THEN TRUE ELSE FALSE END as is_taken
            FROM user_prescriptions p
            JOIN medicines m ON p.medicine_id = m.medicine_id
            JOIN recurring_schedules rs ON p.prescription_id = rs.prescription_id
            LEFT JOIN dose_history dh ON p.prescription_id = dh.prescription_id 
                                   AND DATE(dh.scheduled_time) = ? 
                                   AND TIME(dh.scheduled_time) = rs.time_of_day
            WHERE p.user_id = ? 
              AND p.is_active = TRUE
              AND p.start_date <= ?
              AND (p.end_date IS NULL OR p.end_date >= ?)
            ORDER BY rs.time_of_day ASC
        `;
        const [rows] = await dbPool.promise().query(query, [today, userId, today, today]);
        return rows;
    }

    async checkDoseAlreadyTaken(connection, prescriptionId, today, scheduleTime) {
        const checkQuery = `
            SELECT dose_id FROM dose_history 
            WHERE prescription_id = ? 
            AND DATE(scheduled_time) = ? 
            AND TIME(scheduled_time) = ?
        `;
        const [existing] = await connection.query(checkQuery, [prescriptionId, today, scheduleTime]);
        return existing.length > 0;
    }

    async markDoseTaken(connection, prescriptionId, scheduledDateTime) {
        const insertQuery = 'INSERT INTO dose_history (prescription_id, scheduled_time, is_taken, taken_at) VALUES (?, ?, TRUE, NOW())';
        await connection.query(insertQuery, [prescriptionId, scheduledDateTime]);
    }

    async decrementQuantity(connection, prescriptionId) {
        const updateQtyQuery = `
            UPDATE user_prescriptions 
            SET current_quantity = GREATEST(0, current_quantity - pills_per_dose)
            WHERE prescription_id = ? AND current_quantity IS NOT NULL
        `;
        await connection.query(updateQtyQuery, [prescriptionId]);
    }
}

module.exports = new PrescriptionRepository();
