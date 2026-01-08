require('dotenv').config();
const { dbPool } = require('./config/db');

async function checkTables() {
    try {
        const [rows] = await dbPool.promise().query("SHOW TABLES");
        console.log("Current Tables in Database:", rows);

        const [columns] = await dbPool.promise().query("SHOW COLUMNS FROM vitals");
        console.log("Columns in 'vitals' table:", columns);

        const [users] = await dbPool.promise().query("SELECT user_id, email FROM users LIMIT 5");
        console.log("Existing Users:", users);
    } catch (error) {
        console.error("Error checking tables:", error.message);
    } finally {
        process.exit();
    }
}

checkTables();
