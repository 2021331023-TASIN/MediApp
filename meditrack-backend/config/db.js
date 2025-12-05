// backend/config/db.js

const mysql = require('mysql2');

// Database Connection Pool Setup
const dbPool = mysql.createPool({
    // 1. Use 'uri' to pass the entire connection string (Host, User, Pass, DB, Port).
    // The mysql2 driver will parse all components except the 'ssl-mode'.
    uri: process.env.DATABASE_URL, 
    
    // 2. CRITICAL FIX: Add the 'ssl' object to explicitly enable SSL/TLS.
    // This tells the mysql2 driver to use encryption, which is REQUIRED by Aiven.
    ssl: {
        // Setting rejectUnauthorized to false tells Node.js to connect securely 
        // without needing the Aiven CA certificate file, which is hard to manage on Render.
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
        console.error('FINAL SSL CHECK: Ensure DATABASE_URL is correct and SSL is explicitly configured in db.js!');
        process.exit(1); 
    }
    console.log('Successfully connected to MySQL Database as id ' + connection.threadId);
    connection.release();
});

// Export the pool
module.exports = { dbPool };