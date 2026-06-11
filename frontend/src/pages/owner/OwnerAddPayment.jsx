import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPayment } from '../../services/payments';
import { fetchCustomers } from '../../services/customers';
import { normalizeListResponse } from '../../utils/apiHelpers';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

export default function OwnerAddPayment() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    customer: '',
    amount_paid: '',
    payment_mode: 'Cash',
    remarks: '',
  });

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await fetchCustomers({ is_active: true });
        setCustomers(normalizeListResponse(response));
      } catch (err) {
        console.error('Failed to load customers');
      }
    };

    loadCustomers();
  }, []);

  const handleCustomerChange = (e) => {
    const customerId = e.target.value;
    setFormData((prev) => ({ ...prev, customer: customerId }));

    const customer = customers.find((c) => c.id === parseInt(customerId));
    setSelectedCustomer(customer || null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        amount_paid: parseFloat(formData.amount_paid) || 0,
      };
      const response = await createPayment(payload);
      alert(`Payment recorded successfully! Receipt #: ${response.data.receipt_number}`);
      navigate('/owner/payments');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to record payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Record Payment</h2>
        <p className="text-muted">Add a new payment for a customer.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Payment Details</h5>
            </div>
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12">
                    <label className="form-label">Select Customer *</label>
                    <select
                      className="form-select"
                      value={formData.customer}
                      onChange={handleCustomerChange}
                      required
                    >
                      <option value="">Choose a customer...</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} ({customer.phone})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Amount Paid (₹) *</label>
                    <input
                      type="number"
                      name="amount_paid"
                      className="form-control"
                      placeholder="Enter amount paid"
                      value={formData.amount_paid}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Payment Mode *</label>
                    <select
                      name="payment_mode"
                      className="form-select"
                      value={formData.payment_mode}
                      onChange={handleChange}
                      required
                    >
                      <option value="Cash">Cash</option>
                      <option value="GPay">GPay</option>
                      <option value="PhonePe">PhonePe</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label">Remarks</label>
                    <textarea
                      name="remarks"
                      className="form-control"
                      placeholder="Add any remarks or notes..."
                      value={formData.remarks}
                      onChange={handleChange}
                      rows="3"
                    />
                  </div>

                  <div className="col-12">
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Recording...' : 'Record Payment'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/owner/payments')}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>

        {selectedCustomer && (
          <div className="col-12 col-lg-4">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">Customer Info</h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="text-muted mb-1">Name</label>
                  <p className="fw-semibold">{selectedCustomer.name}</p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Phone</label>
                  <p className="fw-semibold">{selectedCustomer.phone}</p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Collection Type</label>
                  <p>
                    <span
                      className={`badge ${
                        selectedCustomer.collection_type === 'Daily' ? 'bg-info' : 'bg-warning'
                      }`}
                    >
                      {selectedCustomer.collection_type}
                    </span>
                  </p>
                </div>

                <hr />

                <div className="mb-3">
                  <label className="text-muted mb-1">Opening Balance</label>
                  <p className="fw-semibold">{formatCurrency(selectedCustomer.opening_balance)}</p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Current Balance</label>
                  <p className="fw-semibold text-success">
                    {formatCurrency(selectedCustomer.current_balance)}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Outstanding Amount</label>
                  <p className="fw-semibold text-danger">
                    {formatCurrency(selectedCustomer.due_amount || selectedCustomer.outstanding_amount)}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">
                    Expected{' '}
                    {selectedCustomer.collection_type === 'Daily'
                      ? 'Daily'
                      : 'Weekly'}{' '}
                    Amount
                  </label>
                  <p className="fw-semibold">
                    {selectedCustomer.collection_type === 'Daily'
                      ? formatCurrency(selectedCustomer.daily_collection_amount)
                      : formatCurrency(selectedCustomer.weekly_collection_amount)}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Loan Date</label>
                  <p className="fw-semibold">
                    {selectedCustomer.loan_date
                      ? new Date(selectedCustomer.loan_date).toLocaleDateString('en-IN')
                      : 'Not set'}
                  </p>
                </div>

                <div className="mb-3">
                  <label className="text-muted mb-1">Last Payment Date</label>
                  <p className="fw-semibold">
                    {selectedCustomer.last_payment_date
                      ? new Date(selectedCustomer.last_payment_date).toLocaleDateString('en-IN')
                      : 'No payment yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
