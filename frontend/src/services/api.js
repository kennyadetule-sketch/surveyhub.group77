import axios from 'axios';

const rawBaseUrl = (import.meta.env.VITE_API_URL || '/api').trim();
const normalizedBaseUrl = rawBaseUrl === '/'
  ? '/api'
  : rawBaseUrl.endsWith('/api')
    ? rawBaseUrl
    : `${rawBaseUrl.replace(/\/+$/, '')}/api`;

export const api = axios.create({
  baseURL: normalizedBaseUrl,
  timeout: 20000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('surveyhub-token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
