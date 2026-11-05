import axios from 'axios';
import { handleMockRequest } from './mockHandler';

const isVercel = typeof window !== 'undefined' && window.location.hostname.includes('vercel.app');

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';
const STORAGE_BASE_URL = import.meta.env.VITE_STORAGE_URL || 'http://127.0.0.1:8000/storage';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Request interceptor for auth token and showcase mock fallback
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // On Vercel showcase deployment, resolve mock data directly for catalog endpoints
        if (isVercel) {
            const mock = handleMockRequest(config);
            if (mock) {
                config.adapter = () => Promise.resolve(mock);
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor: fallback gracefully if backend is offline or returns error
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.config) {
            const fallback = handleMockRequest(error.config);
            if (fallback) {
                return Promise.resolve(fallback);
            }
        }
        return Promise.reject(error);
    }
);

// Helper to get storage URL (served via static frontend storage on Vercel, or backend locally)
export const getStorageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http') && !path.includes('/storage/')) return path;
    
    let relativePath = path;
    if (path.includes('/storage/')) {
        relativePath = path.split('/storage/')[1];
    }
    relativePath = relativePath.replace(/^\//, '');
    
    if (isVercel) {
        return `/storage/${relativePath}`;
    }
    return `${STORAGE_BASE_URL}/${relativePath}`;
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
