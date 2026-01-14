const { dbPool } = require('../config/db');

class UserRepository {
    async findByEmail(email) {
        const query = 'SELECT user_id, name, email, age, password_hash FROM users WHERE email = ?';
        const [rows] = await dbPool.promise().query(query, [email]);
        return rows[0];
    }

    async create({ name, email, age, password_hash }) {
        const query = 'INSERT INTO users (name, email, age, password_hash) VALUES (?, ?, ?, ?)';
        const [result] = await dbPool.promise().query(query, [name, email, age, password_hash]);
        return result.insertId;
    }

    async findById(userId) {
        const query = 'SELECT user_id, name, email, age FROM users WHERE user_id = ?';
        const [rows] = await dbPool.promise().query(query, [userId]);
        return rows[0];
    }
}

module.exports = new UserRepository();
