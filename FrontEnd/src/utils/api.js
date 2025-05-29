import axios from 'axios';
import { useAuthStore } from 'src/stores/authStore';

const api = axios.create({
    baseURL: '/api',                  // ваш префикс API
    headers: { 'Content-Type': 'application/json' },
});

// В каждом запросе автоматически подставляем токен из Zustand
api.interceptors.request.use(config => {
    const token = useAuthStore.getState().token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
