import axios from 'axios';
import { ELocalStorageKeys } from './app-contants';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem(ELocalStorageKeys.TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
