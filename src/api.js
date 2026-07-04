import axios from 'axios';

// База API. По умолчанию — задеплоенный backend; можно переопределить через
// VITE_API_BASE (например, при локальной разработке против localhost).
const baseURL =
  import.meta.env.VITE_API_BASE || 'https://roomly.bashtup.com/api';

export const api = axios.create({ baseURL });

// Удобный помощник: возвращает data напрямую.
export const get = (url, config) => api.get(url, config).then((r) => r.data);
export const post = (url, body) => api.post(url, body).then((r) => r.data);
export const put = (url, body) => api.put(url, body).then((r) => r.data);
export const del = (url) => api.delete(url).then((r) => r.data);
