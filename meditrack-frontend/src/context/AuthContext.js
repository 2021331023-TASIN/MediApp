// // // frontend/src/context/AuthContext.js

// // import React, { createContext, useState, useEffect, useContext } from 'react';
// // import axios from 'axios';

// // // CRITICAL FIX: Use the Environment Variable set in Vercel.
// // // Vercel will inject the value of REACT_APP_API_URL here.
// // const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback for local dev

// // // Auth routes (Login/Register) will go to: BASE_URL/api/auth
// // const AUTH_URL = `${BASE_URL}/api/auth`; 

// // // Create the Context
// // const AuthContext = createContext();

// // // Custom hook to use the context
// // export const useAuth = () => useContext(AuthContext);

// // // Provider Component
// // export const AuthProvider = ({ children }) => {
// //     // ... (rest of your state definitions remain the same)
// //     const [user, setUser] = useState(null);
// //     const [token, setToken] = useState(localStorage.getItem('token'));
// //     const [loading, setLoading] = useState(true);

// //     // LOGOUT FUNCTION: (remains the same)
// //     const logout = () => {
// //         localStorage.removeItem('token');
// //         delete axios.defaults.headers.common['Authorization'];
// //         setToken(null);
// //         setUser(null);
// //     };

// //     useEffect(() => {
// //         if (token) {
// //             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// //         }
// //         setLoading(false);
// //     }, [token]);

// //     // Helper function to make authenticated requests
// //     const authenticatedRequest = async (method, url, data = null) => {
// //         try {
// //             const config = {
// //                 method,
// //                 url,
// //                 // FIX: Use the BASE_URL variable here. Non-auth routes go to: BASE_URL/api
// //                 baseURL: `${BASE_URL}/api`, 
// //                 headers: {
// //                     'Content-Type': 'application/json',
// //                 },
// //                 data: data,
// //             };
// //             if (token) {
// //                 config.headers['Authorization'] = `Bearer ${token}`;
// //             }

// //             const response = await axios(config);
// //             return response.data;
// //         } catch (error) {
// //             if (error.response && error.response.status === 401) {
// //                 logout(); 
// //                 throw new Error("Session expired. Please log in again.");
// //             }
// //             throw error.response?.data?.message || `API Request Failed: ${error.message}`;
// //         }
// //     };

// //     // Registration Function
// //     const register = async (name, email, password) => {
// //         try {
// //             // FIX: Use the new AUTH_URL variable
// //             const response = await axios.post(`${AUTH_URL}/register`, {
// //                 name,
// //                 email,
// //                 password,
// //             });
// //             const { token: newToken, user: newUser } = response.data;

// //             localStorage.setItem('token', newToken);
// //             setToken(newToken);
// //             setUser(newUser);
// //             axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
// //             return response.data; 
// //         } catch (error) {
// //             throw error.response.data.message || 'Registration failed.';
// //         }
// //     };

// //     // Login Function
// //     const login = async (email, password) => {
// //         try {
// //             // FIX: Use the new AUTH_URL variable
// //             const response = await axios.post(`${AUTH_URL}/login`, {
// //                 email,
// //                 password,
// //             });

// //             const { token: newToken, user: newUser } = response.data;

// //             localStorage.setItem('token', newToken);
// //             setToken(newToken);
// //             setUser(newUser);
// //             axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
// //             return response.data;
// //         } catch (error) {
// //             throw error.response.data.message || 'Login failed.';
// //         }
// //     };

// //     // ... (rest of the component remains the same)
// //     const value = {
// //         user,
// //         token,
// //         loading,
// //         register,
// //         login,
// //         logout,
// //         isAuthenticated: !!token,
// //         authenticatedRequest, 
// //     };

// //     return (
// //         <AuthContext.Provider value={value}>
// //             {!loading && children}
// //         </AuthContext.Provider>
// //     );
// // };



// // frontend/src/context/AuthContext.js

// import React, { createContext, useState, useEffect, useContext } from 'react';
// import axios from 'axios';

// // REVERTED: Hardcoded the local base URL for development.
// const BASE_URL = 'http://localhost:5000'; 

// // Auth routes (Login/Register) will go to: http://localhost:5000/api/auth
// const AUTH_URL = `${BASE_URL}/api/auth`; 

// // Create the Context
// const AuthContext = createContext();

// // Custom hook to use the context
// export const useAuth = () => useContext(AuthContext);

// // Provider Component
// export const AuthProvider = ({ children }) => {
//     // ... (rest of your state definitions remain the same)
//     const [user, setUser] = useState(null);
//     const [token, setToken] = useState(localStorage.getItem('token'));
//     const [loading, setLoading] = useState(true);

//     // LOGOUT FUNCTION: (remains the same)
//     const logout = () => {
//         localStorage.removeItem('token');
//         delete axios.defaults.headers.common['Authorization'];
//         setToken(null);
//         setUser(null);
//     };

//     useEffect(() => {
//         if (token) {
//             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
//         }
//         setLoading(false);
//     }, [token]);

//     // Helper function to make authenticated requests
//     const authenticatedRequest = async (method, url, data = null) => {
//         try {
//             const config = {
//                 method,
//                 url,
//                 // Local Base API path for non-auth routes: http://localhost:5000/api
//                 baseURL: `${BASE_URL}/api`, 
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 data: data,
//             };
//             if (token) {
//                 config.headers['Authorization'] = `Bearer ${token}`;
//             }

//             const response = await axios(config);
//             return response.data;
//         } catch (error) {
//             if (error.response && error.response.status === 401) {
//                 logout(); 
//                 throw new Error("Session expired. Please log in again.");
//             }
//             throw error.response?.data?.message || `API Request Failed: ${error.message}`;
//         }
//     };

//     // Registration Function
//     const register = async (name, email, password) => {
//         try {
//             // Uses the hardcoded AUTH_URL: http://localhost:5000/api/auth/register
//             const response = await axios.post(`${AUTH_URL}/register`, {
//                 name,
//                 email,
//                 password,
//             });
//             const { token: newToken, user: newUser } = response.data;

//             localStorage.setItem('token', newToken);
//             setToken(newToken);
//             setUser(newUser);
//             axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//             return response.data; 
//         } catch (error) {
//             throw error.response.data.message || 'Registration failed.';
//         }
//     };

//     // Login Function
//     const login = async (email, password) => {
//         try {
//             // Uses the hardcoded AUTH_URL: http://localhost:5000/api/auth/login
//             const response = await axios.post(`${AUTH_URL}/login`, {
//                 email,
//                 password,
//             });

//             const { token: newToken, user: newUser } = response.data;

//             localStorage.setItem('token', newToken);
//             setToken(newToken);
//             setUser(newUser);
//             axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
//             return response.data;
//         } catch (error) {
//             throw error.response.data.message || 'Login failed.';
//         }
//     };

//     // ... (rest of the component remains the same)
//     const value = {
//         user,
//         token,
//         loading,
//         register,
//         login,
//         logout,
//         isAuthenticated: !!token,
//         authenticatedRequest, 
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {!loading && children}
//         </AuthContext.Provider>
//     );
// };



// frontend/src/context/AuthContext.js

import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // <-- VITAL: Ensures 'axios' is defined

// The base URL for your backend API
const API_URL = 'http://localhost:5000/api/auth';

// Create the Context
const AuthContext = createContext();

// Custom hook to use the context
export const useAuth = () => useContext(AuthContext);

// Provider Component
export const AuthProvider = ({ children }) => {
    // STATE DEFINITIONS: FIXES ALL 'is not defined' ESLint errors
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // LOGOUT FUNCTION: Must be defined before authenticatedRequest uses it
    const logout = () => {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setUser(null);
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, [token]);

    // Helper function to make authenticated requests (Your submitted code snippet)
    const authenticatedRequest = async (method, url, data = null) => {
        try {
            const config = {
                method,
                url,
                // baseURL should be set in axios configuration or explicitly here
                baseURL: 'http://localhost:5000/api', // Base API path for non-auth routes
                headers: {
                    'Content-Type': 'application/json',
                    // The Authorization header is typically managed by axios defaults, but we ensure Content-Type is set.
                },
                data: data,
            };
            // Manually add Authorization header if it's not set globally or if it's missing (failsafe)
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (error.response && error.response.status === 401) {
                // If token expires or is invalid, force logout
                logout();
                throw new Error("Session expired. Please log in again.");
            }
            throw error.response?.data?.message || `API Request Failed: ${error.message}`;
        }
    };

    // Registration Function (Uses state setters)
    const register = async (name, email, password) => {
        try {
            const response = await axios.post(`${API_URL}/register`, {
                name,
                email,
                password,
            });
            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return response.data;
        } catch (error) {
            throw error.response.data.message || 'Registration failed.';
        }
    };

    // Login Function (Uses state setters)
    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/login`, {
                email,
                password,
            });

            const { token: newToken, user: newUser } = response.data;

            localStorage.setItem('token', newToken);
            setToken(newToken);
            setUser(newUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
            return response.data;
        } catch (error) {
            throw error.response.data.message || 'Login failed.';
        }
    };

    // Value object containing all exported variables/functions
    const value = {
        user,
        token,
        loading,
        register,
        login,
        logout,
        isAuthenticated: !!token,
        authenticatedRequest,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};