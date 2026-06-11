import api from './api';

export function registerUser(payload) {
  return api.post('/auth/register/', payload);
}

export function loginUser(payload) {
  return api.post('/auth/login/', payload);
}
