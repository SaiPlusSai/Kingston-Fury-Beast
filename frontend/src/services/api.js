import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
      const payload = data.data;
      localStorage.setItem('accessToken', payload.tokens.accessToken);
      localStorage.setItem('refreshToken', payload.tokens.refreshToken);
      if (payload.user) {
        localStorage.setItem('user', JSON.stringify(payload.user));
      }
      processQueue(null, payload.tokens.accessToken);
      originalRequest.headers.Authorization = `Bearer ${payload.tokens.accessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export const getApiErrorMessage = (error) => {
  const data = error.response?.data;
  if (data?.errors && typeof data.errors === 'object' && Object.keys(data.errors).length > 0) {
    return Object.entries(data.errors)
      .map(([field, msg]) => `${field}: ${msg}`)
      .join(' | ');
  }
  if (data?.message) return data.message;
  return error.message || 'Error de conexión con el servidor';
};

export default api;
