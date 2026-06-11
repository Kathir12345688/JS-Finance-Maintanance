import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchWeeklyDueCustomers } from '../../services/payments';
import { normalizeListResponse } from '../../utils/apiHelpers';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function OwnerWeeklyDueCustomers() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const loadWeeklyDueCustomers = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchWeeklyDueCustomers();
        setCustomers(normalizeListResponse(response));
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load weekly due customers.');
      } finally {
        setLoading(false);
      }
    };

    loadWeeklyDueCustomers();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = customers.slice(startIndex, endIndex);
  const totalPages = Math.ceil(customers.length / itemsPerPage);

  const totalExpected = customers.reduce((sum, c) => sum + (c.due_amount || 0), 0);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Weekly Due Customers</h2>
        <p className="text-muted">Customers with pending weekly collections.</p>
      </div>

      <div className="row mb-4 g-2">
        <div className="col-12 col-md-6">
          <div className="card bg-light">
            <div className="card-body">
              <p className="text-muted mb-1">Total Due Amount</p>
              <h3 className="text-success">{formatCurrency(totalExpected)}</h3>
              <p className="text-muted mb-0">{customers.length} customers</p>
            </div>
          </div>
        </div>
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
        <div className="alert alert-info">No weekly due customers at this time.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Customer Name</th>
                  <th>Phone</th>
                  <th>Weekly Amount</th>
                  <th>Due Amount</th>
                  <th>Current Balance</th>
                  <th>Outstanding</th>
                  <th>Status</th>
                  <th>Assigned Worker</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedCustomers.map((customer) => (
                  <tr key={customer.id}>
                    <td className="fw-semibold">{customer.name}</td>
                    <td>{customer.phone}</td>
                    <td className="fw-semibold text-warning">
                      {formatCurrency(customer.weekly_collection_amount)}
                    </td>
                    <td className="fw-semibold text-danger">
                      {formatCurrency(customer.due_amount)}
                    </td>
                    <td>{formatCurrency(customer.current_balance)}</td>
                    <td className="text-danger fw-semibold">
                      {formatCurrency(customer.outstanding_amount)}
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          customer.is_active ? 'bg-success' : 'bg-danger'
                        }`}
                      >
                        {customer.is_active ? 'Active' : 'Closed'}
                      </span>
                    </td>
                    <td>{customer.assigned_worker_name || 'Unassigned'}</td>
                    <td>
                      <div className="btn-group btn-group-sm" role="group">
                        <Link
                          to={`/owner/customers/${customer.id}`}
                          className="btn btn-outline-info"
                        >
                          View
                        </Link>
                        <Link
                          to={`/owner/add-payment?customer=${customer.id}`}
                          className="btn btn-outline-success"
                        >
                          Collect
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
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    First
                  </button>
                </li>
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  return (
                    <li key={pageNum} className={`page-item ${currentPage === pageNum ? 'active' : ''}`}>
                      <button className="page-link" onClick={() => setCurrentPage(pageNum)}>
                        {pageNum}
                      </button>
                    </li>
                  );
                })}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Last
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
