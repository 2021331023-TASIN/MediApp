const AuthService = require('../services/AuthService');

/**
 * Handles user registration.
 */
exports.register = async (req, res) => {
    const { name, email, password, age } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please provide all required fields (Name, Email, Password).' });
    }

    try {
        const result = await AuthService.register({ name, email, password, age });
        res.status(201).json({
            ...result,
            message: 'Registration successful.'
        });
    } catch (error) {
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
        const result = await AuthService.login(email, password);
        res.json({
            ...result,
            message: 'Login successful.'
        });
    } catch (error) {
        if (error.message.includes('Invalid credentials')) {
            return res.status(401).json({ message: error.message });
        }
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login.' });
    }
};
