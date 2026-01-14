const { dbPool } = require('../config/db');
const PrescriptionRepository = require('../repositories/PrescriptionRepository');
const MedicineRepository = require('../repositories/MedicineRepository');

class PrescriptionService {
    async addPrescription(userId, data) {
        const {
            medicineName, dosage, startDate, endDate, scheduleTimes,
            pillsPerDose, dosesPerDay, durationDays, initialQuantity, instructions
        } = data;

        const connection = await dbPool.promise().getConnection();
        await connection.beginTransaction();

        try {
            const medicine_id = await MedicineRepository.getOrCreate(medicineName);

            const initQty = initialQuantity ? parseInt(initialQuantity) : null;

            const prescriptionId = await PrescriptionRepository.addPrescription(connection, {
                userId, medicine_id, dosage, startDate, endDate,
                pillsPerDose: pillsPerDose || 1,
                dosesPerDay: dosesPerDay || scheduleTimes.length,
                durationDays: durationDays || 0,
                initQty,
                currQty: initQty,
                instructions
            });

            await PrescriptionRepository.addRecurringSchedules(connection, prescriptionId, scheduleTimes);

            await connection.commit();
            return prescriptionId;
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }

    async getActivePrescriptions(userId) {
        await PrescriptionRepository.autoExpirePrescriptions(userId);
        return await PrescriptionRepository.getActivePrescriptions(userId);
    }

    async deletePrescription(prescriptionId, userId) {
        const deleted = await PrescriptionRepository.deletePrescription(prescriptionId, userId);
        if (!deleted) {
            throw new Error('Prescription not found or unauthorized.');
        }
        return true;
    }

    async getDashboardStats(userId) {
        return await PrescriptionRepository.getDashboardStats(userId);
    }

    async getHistory(userId) {
        return await PrescriptionRepository.getHistory(userId);
    }

    async getTodaySchedules(userId) {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        return await PrescriptionRepository.getTodaySchedules(userId, today);
    }

    async markDoseTaken(userId, prescriptionId, scheduleTime) {
        const d = new Date();
        const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const scheduledDateTime = `${today} ${scheduleTime}`;

        const connection = await dbPool.promise().getConnection();
        await connection.beginTransaction();

        try {
            const alreadyTaken = await PrescriptionRepository.checkDoseAlreadyTaken(connection, prescriptionId, today, scheduleTime);
            if (alreadyTaken) {
                await connection.rollback();
                return 'Dose already marked as taken.';
            }

            await PrescriptionRepository.markDoseTaken(connection, prescriptionId, scheduledDateTime);
            await PrescriptionRepository.decrementQuantity(connection, prescriptionId);

            await connection.commit();
            return 'Dose marked as taken and quantity updated.';
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    }
}

module.exports = new PrescriptionService();
