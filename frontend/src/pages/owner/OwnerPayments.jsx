import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchPayments } from '../../services/payments';
import { normalizeListResponse } from '../../utils/apiHelpers';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
const formatTime = (date) => new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

export default function OwnerPayments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payments, setPayments] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentModeFilter, setPaymentModeFilter] = useState('');
  const itemsPerPage = 10;

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await fetchPayments();
        setPayments(normalizeListResponse(response));
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load payments.');
      } finally {
        setLoading(false);
      }
    };

    loadPayments();
  }, []);

  // Filter payments
  let filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.receipt_number?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMode =
      !paymentModeFilter || payment.payment_mode === paymentModeFilter;

    return matchesSearch && matchesMode;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPayments = filteredPayments.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2 className="mb-1">Payment Management</h2>
            <p className="text-muted">View and manage all payments.</p>
          </div>
          <Link to="/owner/add-payment" className="btn btn-primary">
            + Add Payment
          </Link>
        </div>
      </div>

      <div className="row mb-3 g-2">
        <div className="col-12 col-md-6">
          <input
            type="text"
            className="form-control"
            placeholder="Search by customer name or receipt number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="col-12 col-md-3">
          <select
            className="form-select"
            value={paymentModeFilter}
            onChange={(e) => {
              setPaymentModeFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="">All Payment Modes</option>
            <option value="cash">Cash</option>
            <option value="gpay">GPay</option>
            <option value="phonepe">PhonePe</option>
          </select>
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
      ) : paginatedPayments.length === 0 ? (
        <div className="alert alert-info">No payments found.</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-hover">
              <thead className="table-light">
                <tr>
                  <th>Receipt #</th>
                  <th>Customer Name</th>
                  <th>Worker Name</th>
                  <th>Amount Paid</th>
                  <th>Mode</th>
                  <th>Date & Time</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="fw-semibold">{payment.receipt_number || '-'}</td>
                    <td>{payment.customer_name}</td>
                    <td>{payment.worker_name || '-'}</td>
                    <td className="fw-semibold">{formatCurrency(payment.amount_paid)}</td>
                    <td>
                      <span
                        className={`badge ${
                          payment.payment_mode === 'cash'
                            ? 'bg-success'
                            : payment.payment_mode === 'gpay'
                            ? 'bg-info'
                            : 'bg-warning'
                        }`}
                      >
                        {payment.payment_mode}
                      </span>
                    </td>
                    <td className="text-muted">
                      {formatDate(payment.payment_date)} {formatTime(payment.payment_date)}
                    </td>
                    <td className="text-truncate" title={payment.remarks || ''}>
                      {payment.remarks || '-'}
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
