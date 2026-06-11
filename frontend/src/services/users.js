import api from './api';

export function fetchWorkers(params = {}) {
  return api.get('/users/', { params });
}

export function fetchWorker(id) {
  return api.get(`/users/${id}/`);
}

export function createWorker(payload) {
  return api.post('/users/', payload);
}

export function updateWorker(id, payload) {
  return api.patch(`/users/${id}/`, payload);
}

export function deleteWorker(id) {
  return api.delete(`/users/${id}/`);
}
