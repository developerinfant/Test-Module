// frontend/src/services/api.js
import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_APP_BACKEND_URL || 'http://localhost:5000/api', // Use environment variable
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
