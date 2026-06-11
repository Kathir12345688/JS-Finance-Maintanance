import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { fetchCustomers, deleteCustomer } from '../../services/customers';
import { useNavigate } from 'react-router-dom';

const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString('en-IN');
};

export default function WorkerCustomers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const defaultAvatar = 'https://via.placeholder.com/40?text=AV';

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

const generateAvatarSvg = (name, size = 40) => {
  const initials = getInitials(name);
  const color = getAvatarColor(name);
  const svg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${size}" height="${size}" fill="${color}"/>
    <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-size="${size / 2}" font-weight="bold" fill="white" font-family="Arial">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

  useEffect(() => {
    const loadCustomers = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await fetchCustomers();
        const data = res.data.results || res.data || [];
        const currentWorkerId = String(user.id);
        setCustomers(
          data.filter((customer) => {
            const assignedWorkerId =
              customer.assigned_worker?.id ?? customer.assigned_worker;
            return String(assignedWorkerId) === currentWorkerId;
          }),
        );
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Failed to load customers');
      } finally {
        setLoading(false);
      }
    };
    loadCustomers();
  }, [user.id]);

  const handleDelete = async (customerId) => {
    if (!window.confirm('Delete this customer? This cannot be undone.')) {
      return;
    }

    setDeletingId(customerId);
    setError('');

    try {
      await deleteCustomer(customerId);
      setCustomers((prev) => prev.filter((customer) => customer.id !== customerId));
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to delete customer');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4 gap-3">
        <div>
          <h2 className="mb-1">My Customers</h2>
          <p className="text-muted mb-0">Customers assigned to you.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => navigate('/worker/add-customer')}>
          Add Customer
        </button>
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
                  <th>Name</th>
                  <th>Phone</th>
                  <th>Collection Type</th>
                  <th>Location</th>
                  <th>Balance</th>
                  <th>Outstanding</th>
                  <th>Loan Date</th>
                  <th>Last Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer) => (
                    <tr key={customer.id}>
                      <td className="d-flex align-items-center gap-2">
                        <img
                          src={customer.photo || generateAvatarSvg(customer.name, 40)}
                          alt={customer.name}
                          className="rounded-circle"
                          style={{ width: 40, height: 40, objectFit: 'cover' }}
                        />
                        <span>{customer.name}</span>
                      </td>
                      <td>{customer.phone}</td>
                      <td>{customer.collection_type}</td>
                      <td>
                        {customer.latitude && customer.longitude ? (
                          <span className="text-muted">
                            📍 {customer.latitude}, {customer.longitude}
                          </span>
                        ) : (
                          <span className="text-muted">No location</span>
                        )}
                      </td>
                        <td>{customer.current_balance}</td>
                        <td>{customer.due_amount || customer.outstanding_amount}</td>
                      <td>{formatDate(customer.loan_date)}</td>
                      <td>{formatDate(customer.last_payment_date)}</td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button
                            type="button"
                            className="btn btn-outline-primary"
                            onClick={() => navigate(`/worker/edit-customer/${customer.id}`)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-danger"
                            onClick={() => handleDelete(customer.id)}
                            disabled={deletingId === customer.id}
                          >
                            {deletingId === customer.id ? 'Deleting...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted py-4">
                      No assigned customers found.
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
