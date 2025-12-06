require('dotenv').config();
const { dbPool } = require('./config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS dose_logs (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    prescription_id INT NOT NULL,
    schedule_time TIME NOT NULL,
    taken_date DATE NOT NULL,
    taken_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (prescription_id) REFERENCES user_prescriptions(prescription_id)
);
`;

dbPool.query(createTableQuery, (err, results) => {
       if (err) {
              console.error("Error creating table:", err);
              process.exit(1);
       }
       console.log("dose_logs table created successfully");
       process.exit(0);
});
