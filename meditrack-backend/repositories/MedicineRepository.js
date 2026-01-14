const { dbPool } = require('../config/db');

class MedicineRepository {
    async findByName(name) {
        const [rows] = await dbPool.promise().query('SELECT medicine_id FROM medicines WHERE name = ?', [name]);
        return rows[0];
    }

    async create(name) {
        const [result] = await dbPool.promise().query('INSERT INTO medicines (name) VALUES (?)', [name]);
        return result.insertId;
    }

    async getOrCreate(name) {
        const medicine = await this.findByName(name);
        if (medicine) {
            return medicine.medicine_id;
        }
        return await this.create(name);
    }
}

module.exports = new MedicineRepository();
