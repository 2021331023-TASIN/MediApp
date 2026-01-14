const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserRepository = require('../repositories/UserRepository');

class AuthService {
    async register({ name, email, password, age }) {
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const userId = await UserRepository.create({
            name,
            email,
            age: age || 25,
            password_hash
        });

        const token = this.generateToken(userId);
        return {
            token,
            user: { id: userId, name, email, age: age || 25 }
        };
    }

    async login(email, password) {
        const user = await UserRepository.findByEmail(email);
        if (!user) {
            throw new Error('Invalid credentials (User not found).');
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            throw new Error('Invalid credentials (Password mismatch).');
        }

        const token = this.generateToken(user.user_id);
        return {
            token,
            user: { id: user.user_id, name: user.name, email: user.email, age: user.age }
        };
    }

    generateToken(userId) {
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRATION_TIME,
        });
    }
}

module.exports = new AuthService();
