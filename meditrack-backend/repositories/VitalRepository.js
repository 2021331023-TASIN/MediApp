const { dbPool } = require('../config/db');

class VitalRepository {
    async findByUserId(userId) {
        const [rows] = await dbPool.promise().query(
            'SELECT * FROM vitals WHERE user_id = ? ORDER BY date DESC',
            [userId]
        );
        return rows;
    }

    async create({ userId, type, value, date }) {
        await dbPool.promise().query(
            'INSERT INTO vitals (user_id, type, value, date) VALUES (?, ?, ?, ?)',
            [userId, type, value, date || new Date()]
        );
    }
}

module.exports = new VitalRepository();
