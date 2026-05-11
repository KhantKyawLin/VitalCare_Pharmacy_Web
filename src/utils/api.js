import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor for auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Helper to get storage URL
export const getStorageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${STORAGE_BASE_URL}/${path}`;
};

// Helper for auth headers
export const getAuthConfig = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`
        }
    };
};

export default api;
