import api from './api';

export function fetchDashboardSummary(params = {}) {
  return api.get('/reports/dashboard/', { params });
}

export function fetchDailyReport(params = {}) {
  return api.get('/reports/daily/', { params });
}

export function fetchWeeklyReport(params = {}) {
  return api.get('/reports/weekly/', { params });
}

export function fetchMonthlyReport(params = {}) {
  return api.get('/reports/monthly/', { params });
}

export function fetchOutstandingReport(params = {}) {
  return api.get('/reports/outstanding/', { params });
}

export function fetchWorkerPerformanceReport(params = {}) {
  return api.get('/reports/worker-performance/', { params });
}
