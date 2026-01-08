// // backend/controllers/authController.js

// const { dbPool } = require('../config/db'); // <-- UPDATED IMPORT
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');

// // --- Helper Functions ---

// /**
//  * Generates a JWT for a given user ID.
//  * @param {number} userId - The ID of the user.
//  * @returns {string} The signed JWT.
//  */
// const generateToken = (userId) => {
//     return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
//         expiresIn: process.env.JWT_EXPIRATION_TIME,
//     });
// };

// // --- Controller Functions ---

// /**
//  * Handles user registration.
//  */
// exports.register = async (req, res) => {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//         return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password).' });
//     }

//     try {
//         // 1. Hash the password
//         const salt = await bcrypt.genSalt(10);
//         const password_hash = await bcrypt.hash(password, salt);

//         // 2. Insert new user into the 'users' table
//         const query = 'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)';
//         const [result] = await dbPool.promise().query(query, [name, email, password_hash]);

//         const userId = result.insertId;

//         // 3. Generate token
//         const token = generateToken(userId);

//         // 4. Respond with token and basic user info
//         res.status(201).json({ 
//             token,
//             user: { id: userId, name, email },
//             message: 'Registration successful.'
//         });

//     } catch (error) {
//         // Handle unique constraint violation (email already exists)
//         if (error.code === 'ER_DUP_ENTRY') {
//             return res.status(409).json({ message: 'The email address is already registered.' });
//         }
//         console.error('Registration error:', error);
//         res.status(500).json({ message: 'Server error during registration.' });
//     }
// };

// /**
//  * Handles user login.
//  */
// exports.login = async (req, res) => {
//     const { email, password } = req.body;

//     if (!email || !password) {
//         return res.status(400).json({ message: 'Please provide both email and password.' });
//     }

//     try {
//         // 1. Find the user by email
//         const query = 'SELECT user_id, name, email, password_hash FROM users WHERE email = ?';
//         const [rows] = await dbPool.promise().query(query, [email]);

//         if (rows.length === 0) {
//             return res.status(401).json({ message: 'Invalid credentials (User not found).' });
//         }

//         const user = rows[0];

//         // 2. Compare the provided password with the stored hash
//         const isMatch = await bcrypt.compare(password, user.password_hash);

//         if (!isMatch) {
//             return res.status(401).json({ message: 'Invalid credentials (Password mismatch).' });
//         }

//         // 3. Generate token
//         const token = generateToken(user.user_id);

//         // 4. Respond with token and basic user info
//         res.json({
//             token,
//             user: { id: user.user_id, name: user.name, email: user.email },
//             message: 'Login successful.'
//         });

//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).json({ message: 'Server error during login.' });
//     }
// };



// backend/controllers/authController.js

const { dbPool } = require('../config/db'); // <-- UPDATED IMPORT
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- Helper Functions ---

/**
 * Generates a JWT for a given user ID.
 * @param {number} userId - The ID of the user.
 * @returns {string} The signed JWT.
 */
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRATION_TIME,
    });
};

// --- Controller Functions ---

/**
 * Handles user registration.
 */
exports.register = async (req, res) => {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password).' });
    }

    try {
        // 1. Hash the password
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // 2. Insert new user into the 'users' table (default age to 25 if not provided)
        const query = 'INSERT INTO users (name, email, age, password_hash) VALUES (?, ?, ?, ?)';
        const [result] = await dbPool.promise().query(query, [name, email, age || 25, password_hash]);

        const userId = result.insertId;

        // 3. Generate token
        const token = generateToken(userId);

        // 4. Respond with token and basic user info
        res.status(201).json({
            token,
            user: { id: userId, name, email, age: age || 25 },
            message: 'Registration successful.'
        });

    } catch (error) {
        // Handle unique constraint violation (email already exists)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'The email address is already registered.' });
        }
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration.' });
    }
};

/**
 * Handles user login.
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    try {
        // 1. Find the user by email
        const query = 'SELECT user_id, name, email, age, password_hash FROM users WHERE email = ?';
        const [rows] = await dbPool.promise().query(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials (User not found).' });
        }

        const user = rows[0];

        // 2. Compare the provided password with the stored hash
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials (Password mismatch).' });
        }

        // 3. Generate token
        const token = generateToken(user.user_id);

        // 4. Respond with token and basic user info
        res.json({
            token,
            user: { id: user.user_id, name: user.name, email: user.email, age: user.age },
            message: 'Login successful.'
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};