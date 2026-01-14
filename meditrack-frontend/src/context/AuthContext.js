import React, { createContext, useState, useEffect, useContext } from 'react';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        setLoading(false);
    }, []);

    const register = async (name, email, password, age) => {
        try {
            const data = await apiService.register({ name, email, password, age });
            const { token: newToken, user: newUser } = data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
            return data;
        } catch (error) {
            throw error.message || 'Registration failed.';
        }
    };

    const login = async (email, password) => {
        try {
            const data = await apiService.login({ email, password });
            const { token: newToken, user: newUser } = data;

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
            return data;
        } catch (error) {
            throw error.message || 'Login failed.';
        }
    };

    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};