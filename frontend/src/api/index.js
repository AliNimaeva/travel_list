// src/api/index.js
import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Перехватчик для добавления токена к каждому запросу
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// API методы
export const authAPI = {
    register: (data) => api.post('/auth/register', data),
    login: (data) => api.post('/auth/login', data),
    getMe: () => api.get('/auth/me')
};

export const travelAPI = {
    create: (data) => api.post('/travels', data),
    getMyTravels: () => api.get('/travels/my'),
    getTravel: (id) => api.get(`/feed/travel/${id}`)
};

export const feedAPI = {
    getFeed: async (params = {}) => {
        const queryString = new URLSearchParams(params).toString();
        const url = `/feed${queryString ? `?${queryString}` : ''}`;
        const response = await fetch(url);
        return response.json();
    },

    getCountries: async () => {
        const response = await fetch('/feed/countries');
        return response.json();
    },

    getTravel: async (id) => {
        const response = await fetch(`/feed/travel/${id}`);
        return response.json();
    }
};

export default api;