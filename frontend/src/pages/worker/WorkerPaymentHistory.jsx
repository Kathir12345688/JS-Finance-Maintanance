import { useEffect, useState } from 'react';
import { fetchPaymentHistory } from '../../services/payments';
import { normalizeListResponse } from '../../utils/apiHelpers';

export default function WorkerPaymentHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchPaymentHistory({ ordering: '-payment_date,-payment_time' });
        setHistory(normalizeListResponse(response));
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, []);

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Payment History</h2>
        <p className="text-muted mb-0">Recent payments you recorded.</p>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.payment_date}</td>
                      <td>{payment.customer?.name || payment.customer_name || 'N/A'}</td>
                      <td>{payment.amount_paid}</td>
                      <td>{payment.payment_mode}</td>
                      <td>{payment.receipt_number}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No payment history available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
