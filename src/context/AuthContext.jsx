import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null);
    const [isLoading, setIsLoading] = useState(true);

    // Set axios default authorization header
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete axios.defaults.headers.common['Authorization'];
    }

    // Check if user is logged in on mount
    useEffect(() => {
        const fetchUser = async () => {
            if (token) {
                try {
                    const response = await axios.get('http://127.0.0.1:8000/api/auth/me');
                    setUser(response.data);
                } catch (error) {
                    console.error("Error fetching user:", error);
                    logout(); // Invalid token
                }
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/login', {
                email,
                password
            });

            const { access_token, user: userData } = response.data;

            setToken(access_token);
            setUser(userData);
            localStorage.setItem('token', access_token);

            return { success: true };
        } catch (error) {
            console.error("Login error:", error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.response?.data?.error || "Login failed"
            };
        }
    };

    const register = async (userData) => {
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/auth/register', userData);

            // Auto login after successful registration
            const { access_token, user: newUser } = response.data;

            setToken(access_token);
            setUser(newUser);
            localStorage.setItem('token', access_token);

            return { success: true };
        } catch (error) {
            console.error("Registration error:", error.response?.data);
            // Handle validation errors from Laravel
            const errorMsg = error.response?.data?.message
                || Object.values(error.response?.data || {}).flat().join(', ')
                || "Registration failed";
            return { success: false, error: errorMsg };
        }
    };

    const logout = async () => {
        try {
            if (token) {
                // Inform backend
                await axios.post('http://127.0.0.1:8000/api/auth/logout');
            }
        } catch (error) {
            console.error("Logout error API:", error);
        } finally {
            // Always clear local state 
            setToken(null);
            setUser(null);
            localStorage.removeItem('token');
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};
