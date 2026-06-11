import { useEffect, useState } from 'react';
import { fetchPayments } from '../../services/payments';
import { useNavigate } from 'react-router-dom';
import { downloadCsv } from '../../utils/exportData';
import { normalizeListResponse } from '../../utils/apiHelpers';

export default function WorkerPayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const handleExport = () => {
    if (!payments.length) {
      return;
    }

    const rows = [
      ['Customer', 'Amount', 'Mode', 'Date', 'Remarks'],
      ...payments.map((payment) => [
        payment.customer?.name || payment.customer_name || 'N/A',
        payment.amount_paid,
        payment.payment_mode,
        payment.payment_date,
        payment.remarks || '',
      ]),
    ];

    downloadCsv('worker-payments.csv', rows);
  };

  useEffect(() => {
    const loadPayments = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchPayments({ ordering: '-payment_date,-payment_time' });
        setPayments(normalizeListResponse(response));
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load payments');
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
  }, []);

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="mb-1">Payments</h2>
          <p className="text-muted mb-0">Record a payment or review recent entries.</p>
        </div>
        <div className="d-flex flex-wrap gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={handleExport} disabled={!payments.length}>
            Export CSV
          </button>
          <button type="button" className="btn btn-primary" onClick={() => navigate('/worker/payments/add')}>
            Add Payment
          </button>
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
      ) : (
        <div className="card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Date</th>
                  <th>Remarks</th>
                </tr>
              </thead>
              <tbody>
                {payments.length > 0 ? (
                  payments.map((payment) => (
                    <tr key={payment.id}>
                      <td>{payment.customer?.name || payment.customer_name || 'N/A'}</td>
                      <td>{payment.amount_paid}</td>
                      <td>{payment.payment_mode}</td>
                      <td>{payment.payment_date}</td>
                      <td>{payment.remarks}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center text-muted py-4">
                      No payments recorded yet.
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
