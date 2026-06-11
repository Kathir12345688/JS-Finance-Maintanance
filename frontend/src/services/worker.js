import api from './api';

export function fetchWorkerDashboard(params = {}) {
  return api.get('/reports/dashboard/', { params });
}

export function fetchAssignedCustomers(params = {}) {
  return api.get('/customers/', { params });
}

export function fetchWorkerPayments(params = {}) {
  return api.get('/payments/', { params });
}

export function createPayment(payload) {
  return api.post('/payments/', payload);
}
