import axios from 'axios';

// База API. По умолчанию — задеплоенный backend; можно переопределить через
// VITE_API_BASE (например, при локальной разработке против localhost).
const baseURL =
  import.meta.env.VITE_API_BASE || 'https://roomly.bashtup.com/api';

export const api = axios.create({ baseURL });

// ---------------- токен авторизации ----------------
const TOKEN_KEY = 'roomly_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY) || '';
export const setToken = (t) => {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
};

// Подставляем Bearer-токен в каждый запрос.
api.interceptors.request.use((config) => {
  const t = getToken();
  if (t) config.headers.Authorization = `Bearer ${t}`;
  return config;
});

// При 401 — токен недействителен: чистим и уведомляем приложение (уводит на вход).
api.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      setToken('');
      window.dispatchEvent(new Event('roomly-unauthorized'));
    }
    return Promise.reject(error);
  },
);

// Удобный помощник: возвращает data напрямую.
export const get = (url, config) => api.get(url, config).then((r) => r.data);
export const post = (url, body) => api.post(url, body).then((r) => r.data);
export const put = (url, body) => api.put(url, body).then((r) => r.data);
export const del = (url) => api.delete(url).then((r) => r.data);
