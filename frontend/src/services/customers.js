import api from './api';

export function fetchCustomers(params = {}) {
  return api.get('/customers/', { params });
}

export function fetchCustomer(id) {
  return api.get(`/customers/${id}/`);
}

export function createCustomer(payload) {
  return api.post('/customers/', payload);
}

export function updateCustomer(id, payload) {
  return api.patch(`/customers/${id}/`, payload);
}

export function deleteCustomer(id) {
  return api.delete(`/customers/${id}/`);
}

export function searchCustomers(query, params = {}) {
  return api.get('/customers/', { params: { ...params, search: query } });
}

export function filterCustomersByType(collectionType, params = {}) {
  return api.get('/customers/', {
    params: { ...params, collection_type: collectionType },
  });
}

export function filterCustomersByStatus(status, params = {}) {
  return api.get('/customers/', {
    params: { ...params, status },
  });
}
