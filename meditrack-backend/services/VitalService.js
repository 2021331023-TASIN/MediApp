const VitalRepository = require('../repositories/VitalRepository');

class VitalService {
    async getVitals(userId) {
        return await VitalRepository.findByUserId(userId);
    }

    async addVital(userId, data) {
        const { type, value, date } = data;
        if (!type || !value) {
            throw new Error('Type and Value are required');
        }
        await VitalRepository.create({ userId, type, value, date });
    }
}

module.exports = new VitalService();
