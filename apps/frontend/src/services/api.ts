import axios from 'axios';

// Create a globally configured Axios instance
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    withCredentials: true, // This is MANDATORY for sending and receiving the secure HttpOnly cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// We will add interceptors later to handle token attachment and refreshing