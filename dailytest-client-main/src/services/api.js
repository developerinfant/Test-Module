// frontend/src/services/api.js
import axios from 'axios';

const getBaseURL = () => {
    const envUrl = import.meta.env.VITE_APP_BACKEND_URL;
    if (envUrl) {
        // Ensure the URL ends with /api
        return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
    }
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
