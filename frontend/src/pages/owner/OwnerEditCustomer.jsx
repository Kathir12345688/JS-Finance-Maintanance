import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { fetchCustomer, updateCustomer } from '../../services/customers';
import api from '../../services/api';
import LoadingButton from '../../components/LoadingButton';

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

export default function OwnerEditCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    area: '',
    opening_balance: '',
    last_payment_date: '',
    current_balance: '',
    collection_type: 'daily',
    assigned_worker: '',
  });

  const calculateExpectedAmount = (collectionType, openingBalance) => {
    const opening = Number(openingBalance) || 0;
    if (collectionType === 'daily') return opening / 100;
    if (collectionType === 'weekly') return opening / 10;
    return 0;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [customerRes, workersRes] = await Promise.all([
          fetchCustomer(id),
          api.get('/users/', { params: { role: 'worker' } }),
        ]);

        setFormData({
          name: customerRes.data.name || '',
          phone: customerRes.data.phone || '',
          address: customerRes.data.address || '',
          state: customerRes.data.location?.state || 'Tamil Nadu',
          district: customerRes.data.location?.district || 'Coimbatore',
          area: customerRes.data.location?.area || '',
          opening_balance: customerRes.data.opening_balance || '',
          loan_date: customerRes.data.loan_date || '',
          last_payment_date: customerRes.data.last_payment_date || '',
          current_balance: customerRes.data.current_balance || '',
          collection_type: customerRes.data.collection_type?.toLowerCase() || 'daily',
          daily_collection_amount: customerRes.data.daily_collection_amount || '',
          weekly_collection_amount: customerRes.data.weekly_collection_amount || '',
          assigned_worker: customerRes.data.assigned_worker || '',
        });
        setWorkers(workersRes.data || []);
      } catch (err) {
        setError(err.response?.data?.detail || 'Unable to load customer.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'opening_balance' ? { current_balance: value } : {}),
    }));
  };

  const { showToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        area: formData.area,
        collection_type: formData.collection_type,
        opening_balance: parseFloat(formData.opening_balance) || 0,
        loan_date: formData.loan_date || undefined,
        last_payment_date: formData.last_payment_date || undefined,
        assigned_worker: formData.assigned_worker || null,
      };
      await updateCustomer(id, payload);
      showToast('Customer updated successfully.', 'success');
      navigate('/owner/customers');
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Failed to update customer.';
      setError(message);
      showToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Edit Customer</h2>
        <p className="text-muted">Update customer details.</p>
      </div>

      <div className="row">
        <div className="col-12 col-lg-8">
          <div className="card shadow-sm">
            <div className="card-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      className="form-control"
                      placeholder="Enter customer name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      className="form-control"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      name="address"
                      className="form-control"
                      placeholder="Enter customer address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      name="state"
                      className="form-control"
                      value={formData.state}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">District</label>
                    <input
                      type="text"
                      name="district"
                      className="form-control"
                      value={formData.district}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="col-12 col-md-4">
                    <label className="form-label">Area / Locality</label>
                    <input
                      type="text"
                      name="area"
                      className="form-control"
                      placeholder="Enter area or locality"
                      value={formData.area}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Opening Balance (₹)</label>
                    <input
                      type="number"
                      name="opening_balance"
                      className="form-control"
                      placeholder="Enter opening balance"
                      value={formData.opening_balance}
                      onChange={handleChange}
                      step="0.01"
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Loan Date</label>
                    <input
                      type="date"
                      name="loan_date"
                      className="form-control"
                      value={formData.loan_date}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      When did the customer receive the loan?
                    </small>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Last Payment Date</label>
                    <input
                      type="date"
                      name="last_payment_date"
                      className="form-control"
                      value={formData.last_payment_date}
                      onChange={handleChange}
                    />
                    <small className="text-muted">
                      When did they last make a payment? Leave empty if no payment yet.
                    </small>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label">Current Balance (₹)</label>
                    <input
                      type="number"
                      name="current_balance"
                      className="form-control"
                      value={formData.current_balance}
                      readOnly
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Collection Type *</label>
                    <select
                      name="collection_type"
                      className="form-select"
                      value={formData.collection_type}
                      onChange={handleChange}
                      required
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Expected Collection Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={calculateExpectedAmount(formData.collection_type, formData.opening_balance).toFixed(2)}
                      readOnly
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label">Assign Worker</label>
                    <select
                      name="assigned_worker"
                      className="form-select"
                      value={formData.assigned_worker}
                      onChange={handleChange}
                    >
                      <option value="">Select a worker</option>
                      {workers.map((worker) => (
                        <option key={worker.id} value={worker.id}>
                          {worker.name || worker.username}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-12">
                    <div className="d-flex gap-2 flex-wrap">
                      <LoadingButton type="submit" loading={loading} variant="primary" className="me-2">
                        Update Customer
                      </LoadingButton>
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => navigate('/owner/customers')}
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
      </div>
    </div>
  );
}
