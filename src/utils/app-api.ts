import axios from 'axios';
import { getToken, logout, refreshToken } from 'src/libs/loginlib';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});
export const _guestApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE,
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(api(token));
    }
  });

  failedQueue = [];
};

// TO be refactored
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    logout();
    return Promise.reject(error);
  }
);

const responseInterceptor = api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const newToken = await refreshToken();
          isRefreshing = false;
          api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          processQueue(null, newToken);
        } catch (refreshError) {
          isRefreshing = false;
          processQueue(refreshError, null);
        }
      }

      const retryOriginalRequest = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      });

      return retryOriginalRequest;
    }

    return Promise.reject(error);
  }
);

export default api;
