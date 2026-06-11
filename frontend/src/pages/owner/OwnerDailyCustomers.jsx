import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { filterCustomersByType } from '../../services/customers';
import { normalizeListResponse } from '../../utils/apiHelpers';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

export default function OwnerDailyCustomers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await filterCustomersByType('Daily');
        setCustomers(normalizeListResponse(response));
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load customers.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Daily Customers</h2>
        <p className="text-muted">Customers with daily collection schedule.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : paginatedCustomers.length === 0 ? (
        <div className="alert alert-info">No daily customers found.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th>Current Balance</th>
                  <th>Outstanding</th>
                  <th>Expected Daily Amount</th>
                  <th>Loan Date</th>
                  <th>Last Payment</th>
                  <th>Worker</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="fw-semibold">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td>
                      <span
                        className={`badge ${
                          customer.is_active ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td>{formatCurrency(customer.current_balance)}</td>
                    <td className="text-danger fw-semibold">
                      {formatCurrency(customer.due_amount || customer.outstanding_amount)}
                    </td>
                    <td>{formatCurrency(customer.daily_collection_amount)}</td>
                    <td>{formatDate(customer.last_payment_date)}</td>                    <td>{formatDate(customer.last_payment_date)}</td>                    <td>{customer.assigned_worker_name || '-'}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <Link
                          to={`/owner/customers/${customer.id}`}
                          className="btn btn-outline-info"
                        >
                          View
                        </Link>
                        <Link
                          to={`/owner/edit-customer/${customer.id}`}
                          className="btn btn-outline-primary"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
