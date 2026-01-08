require('dotenv').config();
const { dbPool } = require('./config/db');

const createTableQuery = `
CREATE TABLE IF NOT EXISTS vitals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'blood_pressure', 'weight', 'sugar'
    value VARCHAR(50) NOT NULL,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);
`;

dbPool.query(createTableQuery, (err, results) => {
    if (err) {
        console.error("Error creating vitals table:", err);
        process.exit(1);
    }
    console.log("vitals table created successfully");
    process.exit(0);
});
