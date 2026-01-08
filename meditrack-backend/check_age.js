require('dotenv').config();
const { dbPool } = require('./config/db');

async function checkAge() {
    try {
        const [rows] = await dbPool.promise().query('SELECT user_id, name, email, age FROM users LIMIT 10');
        console.log("USER_DATA_START");
        console.log(JSON.stringify(rows, null, 2));
        console.log("USER_DATA_END");
        process.exit(0);
    } catch (err) {
        console.error("Database Query Failed:", err);
        process.exit(1);
    }
}

checkAge();
