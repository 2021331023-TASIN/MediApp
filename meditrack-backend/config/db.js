// backend/config/db.js

const mysql = require('mysql2');

// Database Connection Pool Setup
// CRITICAL: We now use the single DATABASE_URL environment variable
// which includes the Host, User, Password, Database, Port, AND the
// required 'ssl-mode=REQUIRED' parameter for Aiven.
const dbPool = mysql.createPool({
    uri: process.env.DATABASE_URL, // Reads the full connection string
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test DB Connection
dbPool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed: ' + err.stack);
        // CRITICAL: If deployment fails here, it's an SSL or connection string error.
        console.error('Check your DATABASE_URL environment variable in Render!');
        process.exit(1); 
    }
    console.log('Successfully connected to MySQL Database as id ' + connection.threadId);
    connection.release();
});

// Export the pool
module.exports = { dbPool };