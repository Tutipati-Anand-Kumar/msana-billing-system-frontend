import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
api.interceptors.request.use(
    (config) => {
        // Multi-account logic: 
        // 1. sessionStorage tracks WHICH account this tab is using
        // 2. localStorage holds the actual tokens for all accounts
        const activeEmail = sessionStorage.getItem('activeAccount');
        const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');

        const token = activeEmail ? accounts[activeEmail]?.token : null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Handle response errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthError = error.response?.status === 401;
        const isDbError = error.response?.data?.isDbError || error.response?.status === 503;

        // ONLY log out if it's a real Auth error and NOT a database error
        if (isAuthError && !isDbError && !error.config.url.includes('/auth/login')) {
            if (window.location.pathname !== '/login') {
                const activeEmail = sessionStorage.getItem('activeAccount');
                if (activeEmail) {
                    const accounts = JSON.parse(localStorage.getItem('msana_accounts') || '{}');
                    delete accounts[activeEmail];
                    localStorage.setItem('msana_accounts', JSON.stringify(accounts));
                    sessionStorage.removeItem('activeAccount');
                }
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
