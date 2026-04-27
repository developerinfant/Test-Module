// frontend/src/hooks/useAuth.jsx (or .js if you haven't renamed it yet)
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Add isLoading state
    const navigate = useNavigate();

    const loadUserFromLocalStorage = useCallback(() => {
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage:", error);
            localStorage.removeItem('user'); // Clear corrupted data
            setUser(null);
        } finally {
            setIsLoading(false); // Set loading to false after attempting to load user
        }
    }, []);

    useEffect(() => {
        loadUserFromLocalStorage();
    }, [loadUserFromLocalStorage]);

    // Ensure your login/logout methods are consistent with how you authenticate
    // Assuming a simple token-less login based on previous interactions,
    // where login gets user data and stores it.
    const login = useCallback(async (userData) => { // Removed 'role' parameter as it wasn't used in login logic
        setIsLoading(true); // Set loading true on login attempt
        try {
            // Your actual login API call from authController (example, adjust if different)
            // const res = await api.post('/auth/admin/login', { email: userData.email, password: userData.password });
            // localStorage.setItem('user', JSON.stringify(res.data));
            // setUser(res.data);

            // Using the userData directly from backend response as passed to this function
            localStorage.setItem('user', JSON.stringify(userData)); // Store user object
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error.response?.data?.message || error.message);
            return { success: false, message: error.response?.data?.message || 'Login failed' };
        } finally {
            setIsLoading(false); // Set loading false after login attempt
        }
    }, []);


    const logout = useCallback(() => {
        setIsLoading(true); // Set loading true on logout attempt (briefly)
        localStorage.removeItem('user');
        setUser(null);
        navigate('/'); // Redirect to homepage or login page
        setIsLoading(false); // Set loading false after logout
    }, [navigate]);

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export { useAuth, AuthProvider };