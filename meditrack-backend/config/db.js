// backend/config/db.js

const mysql = require('mysql2');

// Database Connection Pool Setup
const dbPool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    // Note: DB_PASSWORD is read as an empty string from .env if you left it blank.
    password: process.env.DB_PASSWORD, 
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection
dbPool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        process.exit(1); 
    }
    console.log('Successfully connected to MySQL Database as id ' + connection.threadId);
    connection.release();
});

// Export the pool
module.exports = { dbPool };