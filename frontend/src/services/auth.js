import api from './api';

export function registerUser(payload) {
  return api.post('/auth/register/', payload);
}

export function loginUser(payload) {
  return api.post('/auth/login/', payload);
}

export function requestPasswordReset(payload) {
  return api.post('/auth/request-reset/', payload);
}

export function verifyOtpReset(payload) {
  return api.post('/auth/verify-otp/', payload);
}
