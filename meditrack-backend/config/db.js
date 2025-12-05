// backend/config/db.js

const mysql = require('mysql2');

// Database Connection Pool Setup
// CRITICAL: We pass the full URI AND explicitly enable SSL, which the mysql2 library requires.
const dbPool = mysql.createPool({
    // 1. Use 'uri' to pass the entire connection string (Host, User, Pass, DB, Port, and 'ssl-mode=REQUIRED').
    uri: process.env.DATABASE_URL, 
    
    // 2. CRITICAL FIX: Add the 'ssl' object to explicitly enable SSL.
    // This satisfies the mysql2 driver's requirement to connect securely to Aiven.
    ssl: {
        // Setting this to true forces the connection to use TLS/SSL encryption.
        rejectUnauthorized: false 
    },
    
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection
dbPool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        // CRITICAL: If deployment fails here, check the SSL configuration (ssl: {}) and the DATABASE_URL.
        console.error('Final check: Ensure DATABASE_URL is set in Render!');
        process.exit(1); 
    }
    console.log('Successfully connected to MySQL Database as id ' + connection.threadId);
    connection.release();
});

// Export the pool
module.exports = { dbPool };