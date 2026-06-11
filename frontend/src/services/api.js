import axios from 'axios';

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

if (import.meta.env.DEV) {
  console.debug('API base URL:', apiBaseUrl);
}

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('fm_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      error.message = 'Network error. Check your connection and try again.';
      return Promise.reject(error);
    }

    if (error.response.status === 401) {
      localStorage.removeItem('fm_user');
      localStorage.removeItem('fm_token');
      delete api.defaults.headers.common.Authorization;
      window.location.href = '/auth/login';
    }

    return Promise.reject(error);
  },
);

export default api;
