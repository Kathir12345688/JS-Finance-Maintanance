import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { createPayment } from '../../services/payments';
import { fetchCustomers } from '../../services/customers';
import { normalizeListResponse } from '../../utils/apiHelpers';
import LoadingButton from '../../components/LoadingButton';

export default function AddWorkerPayment() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({
    customer: '',
    amount_paid: '',
    payment_mode: 'cash',
    payment_date: '',
    payment_time: '',
    remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetchCustomers();
        setCustomers(normalizeListResponse(response));
      } catch (err) {
        console.error(err);
      }
    };
    loadCustomers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const { showToast } = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.customer) {
      const message = 'Please select a customer.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    if (!form.amount_paid || Number(form.amount_paid) <= 0) {
      const message = 'Please enter a valid payment amount.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    setLoading(true);

    try {
      await createPayment({
        customer: form.customer,
        amount_paid: Number(form.amount_paid),
        payment_mode: form.payment_mode,
        payment_date: form.payment_date,
        payment_time: form.payment_time,
        remarks: form.remarks,
      });
      showToast('Payment recorded successfully.', 'success');
      navigate('/worker/history');
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to create payment';
      setError(message);
      showToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Add Payment</h2>
        <p className="text-muted">Record payment for an assigned customer.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Customer</label>
                <select className="form-select" name="customer" value={form.customer} onChange={handleChange} required>
                  <option value="">Select customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>{customer.name}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Amount</label>
                <input
                  className="form-control"
                  type="number"
                  name="amount_paid"
                  value={form.amount_paid}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Payment Mode</label>
                <select className="form-select" name="payment_mode" value={form.payment_mode} onChange={handleChange}>
                  <option value="cash">Cash</option>
                  <option value="gpay">GPay</option>
                  <option value="phonepe">PhonePe</option>
                </select>
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Date</label>
                <input
                  className="form-control"
                  type="date"
                  name="payment_date"
                  value={form.payment_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">Time</label>
                <input
                  className="form-control"
                  type="time"
                  name="payment_time"
                  value={form.payment_time}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-control"
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows="3"
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2 flex-column flex-sm-row">
              <LoadingButton type="submit" loading={loading} variant="primary">
                Save Payment
              </LoadingButton>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/worker/payments')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
