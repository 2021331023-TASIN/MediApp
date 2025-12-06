require('dotenv').config();
const { dbPool } = require('./config/db');

async function runMigration() {
    const connection = await dbPool.promise().getConnection();
    try {
        console.log("Starting Schema Update...");

        // 1. Medicines Table: Add interaction_warnings
        // Using a try-catch pattern to ignore "Duplicate column" error specifically if desired,
        // or just let it fail if it's critical. For simple add, we can try.
        try {
            await connection.query(`
                ALTER TABLE medicines 
                ADD COLUMN interaction_warnings TEXT NULL;
            `);
            console.log("Added interaction_warnings to medicines.");
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') console.log("interaction_warnings already exists in medicines.");
            else console.error("Error altering medicines:", e.message);
        }

        // 2. User_Prescriptions Table: Add new tracking columns
        const presCols = [
            "ADD COLUMN pills_per_dose INTEGER NOT NULL DEFAULT 1",
            "ADD COLUMN doses_per_day INTEGER NOT NULL DEFAULT 1",
            "ADD COLUMN duration_days INTEGER NOT NULL DEFAULT 1",
            "ADD COLUMN instructions VARCHAR(500)",
            "ADD COLUMN initial_quantity INT NULL",
            "ADD COLUMN current_quantity INT NULL",
            "ADD COLUMN refill_alert_threshold INT DEFAULT 7",
            "ADD COLUMN refill_count INT DEFAULT 0",
            "ADD COLUMN instruction_notes TEXT NULL"
        ];

        for (const col of presCols) {
            try {
                await connection.query(`ALTER TABLE user_prescriptions ${col};`);
                console.log(`Executed: ${col}`);
            } catch (e) {
                if (e.code === 'ER_DUP_FIELDNAME') {
                    // Success mostly
                } else {
                    console.error(`Error adding column (${col}):`, e.message);
                }
            }
        }

        // 3. Dose_History Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS dose_history (
                dose_id BIGINT AUTO_INCREMENT PRIMARY KEY,
                prescription_id INT NOT NULL,
                scheduled_time DATETIME NOT NULL,
                is_taken BOOLEAN DEFAULT FALSE,
                taken_at DATETIME NULL,
                notes TEXT,
                FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id) ON DELETE CASCADE
            )
        `);
        console.log("dose_history table checked/created.");

        // 4. Doctors Table
        await connection.query(`
            CREATE TABLE IF NOT EXISTS doctors (
                doctor_id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                specialty VARCHAR(100),
                contact_number VARCHAR(20),
                clinic_address VARCHAR(255),
                email VARCHAR(255)
            )
        `);
        console.log("doctors table checked/created.");

        console.log("Migration Complete.");
        process.exit(0);
    } catch (err) {
        console.error("Migration Failed:", err);
        process.exit(1);
    } finally {
        connection.release();
    }
}

runMigration();
