import api from './api';

export function fetchPayments(params = {}) {
  return api.get('/payments/', { params });
}

export function fetchPaymentHistory(params = {}) {
  return api.get('/payments/history/', { params });
}

export function createPayment(payload) {
  return api.post('/payments/', payload);
}

export function fetchOutstandingCustomers(params = {}) {
  return api.get('/payments/outstanding_customers/', { params });
}

export function fetchDailyDueCustomers(params = {}) {
  return api.get('/payments/daily_due_customers/', { params });
}

export function fetchWeeklyDueCustomers(params = {}) {
  return api.get('/payments/weekly_due_customers/', { params });
}
