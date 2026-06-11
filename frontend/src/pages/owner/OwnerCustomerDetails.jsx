import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { fetchCustomer } from '../../services/customers';
import { fetchWorkerPayments } from '../../services/worker';

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(value || 0);

const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');

const getAvatarColor = (name) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const generateAvatarSvg = (name, size = 200) => {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="${size / 2}" font-weight="bold" fill="white" font-family="Arial">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function OwnerCustomerDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [customer, setCustomer] = useState(null);
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    const loadCustomerDetails = async () => {
      setLoading(true);
      setError('');

      try {
        const [customerRes, paymentsRes] = await Promise.all([
          fetchCustomer(id),
          fetchWorkerPayments({ customer: id }),
        ]);

        setCustomer(customerRes.data);
        setPayments(paymentsRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load customer details.');
      } finally {
        setLoading(false);
      }
    };

    loadCustomerDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <Link to="/owner/customers" className="btn btn-outline-secondary btn-sm mb-3">
          Back to Customers
        </Link>
        <h2 className="mb-1">{customer?.name}</h2>
        <p className="text-muted">Customer details and payment history.</p>
      </div>

      <div className="row g-4">
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Personal Information</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <label className="text-muted">Name</label>
                  <p className="fw-semibold">{customer?.name}</p>
                </div>
                <div className="col-6">
                  <label className="text-muted">Phone</label>
                  <p className="fw-semibold">{customer?.phone}</p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted">Address</label>
                <p className="fw-semibold">{customer?.address || '-'}</p>
              </div>

              <div className="mb-3">
                <label className="text-muted">Location</label>
                <p className="fw-semibold">
                  {customer?.location?.area || customer?.location?.name
                    ? `${customer?.location?.area || customer?.location?.name || '-'}${customer?.location?.district ? `, ${customer.location.district}` : ''}${customer?.location?.state ? `, ${customer.location.state}` : ''}`
                    : customer?.latitude && customer?.longitude
                    ? `${customer.latitude}, ${customer.longitude}`
                    : '-'}
                </p>
              </div>

              <div className="mb-3">
                <label className="text-muted">Photo</label>
                <div>
                  <img
                    src={customer?.photo || generateAvatarSvg(customer?.name || 'User', 200)}
                    alt="Customer"
                    className="img-fluid rounded"
                    style={{ maxWidth: '200px' }}
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="text-muted">Status</label>
                  <p>
                    <span
                      className={`badge ${
                        customer?.is_active ? 'bg-success' : 'bg-danger'
                      }`}
                    >
                      {customer?.is_active ? 'Active' : 'Closed'}
                    </span>
                  </p>
                </div>
                <div className="col-6">
                  <label className="text-muted">Collection Type</label>
                  <p>
                    <span
                      className={`badge ${
                        customer?.collection_type?.toLowerCase() === 'daily' ? 'bg-info' : 'bg-warning'
                      }`}
                    >
                      {customer?.collection_type
                        ? customer.collection_type.charAt(0).toUpperCase() + customer.collection_type.slice(1)
                        : '-'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Financial Information</h5>
            </div>
            <div className="card-body">
              <div className="row mb-3">
                <div className="col-6">
                  <label className="text-muted">Opening Balance</label>
                  <p className="fw-semibold">{formatCurrency(customer?.opening_balance)}</p>
                </div>
                <div className="col-6">
                  <label className="text-muted">Current Balance</label>
                  <p className="fw-semibold text-success">
                    {formatCurrency(customer?.current_balance)}
                  </p>
                </div>
              </div>

              <div className="mb-3">
                <label className="text-muted">Outstanding Amount</label>
                <p className="fw-semibold text-danger">
                  {formatCurrency(customer?.due_amount || customer?.outstanding_amount)}
                </p>
              </div>

              <div className="row">
                <div className="col-6">
                  <label className="text-muted">Expected Collection</label>
                  <p className="fw-semibold">
                    {formatCurrency(customer?.expected_collection_amount)}
                  </p>
                </div>
                <div className="col-6">
                  <label className="text-muted">Loan Date</label>
                  <p className="fw-semibold">
                    {customer?.loan_date
                      ? formatDate(customer?.loan_date)
                      : '-'}
                  </p>
                </div>
                <div className="col-6">
                  <label className="text-muted">Last Payment Date</label>
                  <p className="fw-semibold">
                    {customer?.last_payment_date
                      ? formatDate(customer?.last_payment_date)
                      : '-'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <h5 className="mb-0">Assignment</h5>
            </div>
            <div className="card-body">
              <p>
                <strong>Assigned Worker:</strong> {customer?.assigned_worker_name || 'Unassigned'}
              </p>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Recent Payments</h5>
              <Link to={`/owner/payments?customer=${id}`} className="btn btn-sm btn-primary">
                View All Payments
              </Link>
            </div>
            <div className="card-body p-0">
              {payments.length === 0 ? (
                <p className="p-3 text-muted">No payments recorded yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Mode</th>
                        <th>Receipt</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 5).map((payment) => (
                        <tr key={payment.id}>
                          <td>{formatDate(payment.payment_date)}</td>
                          <td className="fw-semibold">
                            {formatCurrency(payment.amount_paid)}
                          </td>
                          <td>
                            <span className="badge bg-secondary">
                              {payment.payment_mode}
                            </span>
                          </td>
                          <td>{payment.receipt_number || '-'}</td>
                          <td>{payment.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-12">
          <Link to={`/owner/edit-customer/${id}`} className="btn btn-primary">
            Edit Customer
          </Link>
        </div>
      </div>
    </div>
  );
}
