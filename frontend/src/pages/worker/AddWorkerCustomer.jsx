import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

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

export default function AddWorkerCustomer() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    address: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    area: '',
    latitude: '',
    longitude: '',
    photo: null,
    collection_type: 'daily',
    daily_collection_amount: '',
    weekly_collection_amount: '',
    opening_balance: '',
    loan_date: '',
    last_payment_date: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [locationLabel, setLocationLabel] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateExpectedAmount = (collectionType, openingBalance) => {
    const opening = Number(openingBalance) || 0;
    if (collectionType === 'daily') return opening / 100;
    if (collectionType === 'weekly') return opening / 10;
    return 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setForm((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setForm((prev) => ({
            ...prev,
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
          }));
          setLocationLabel(`Live location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setError('');
        },
        (error) => {
          setError(`Failed to get location: ${error.message}`);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!user?.id) {
        throw new Error('Authenticated user is not loaded. Please log in again.');
      }

      const payload = {
        name: form.name,
        phone: form.phone,
        address: form.address,
        state: form.state,
        district: form.district,
        area: form.area,
        collection_type: form.collection_type,
        opening_balance: parseFloat(form.opening_balance) || 0,
        loan_date: form.loan_date || undefined,
        last_payment_date: form.last_payment_date || undefined,
        assigned_worker: user.id,
      };
      if (form.latitude) payload.latitude = parseFloat(form.latitude);
      if (form.longitude) payload.longitude = parseFloat(form.longitude);

      if (form.photo) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, value);
          }
        });
        formData.append('photo', form.photo);
        await api.post('/customers/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/customers/', payload);
      }

      navigate('/worker/customers');
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Failed to add customer';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Add Customer</h2>
        <p className="text-muted">Create a new customer assigned to you.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="card shadow-sm">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Name *</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Customer name"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Phone *</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <input
                  className="form-control"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Enter full address"
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">State</label>
                <input
                  className="form-control"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">District</label>
                <input
                  className="form-control"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label">Area / Locality</label>
                <input
                  className="form-control"
                  name="area"
                  value={form.area}
                  onChange={handleChange}
                  placeholder="Enter area or locality"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Collection Type *</label>
                <select
                  className="form-select"
                  name="collection_type"
                  value={form.collection_type}
                  onChange={handleChange}
                  required
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Opening Balance (₹) *</label>
                <input
                  className="form-control"
                  name="opening_balance"
                  type="number"
                  step="0.01"
                  value={form.opening_balance}
                  onChange={handleChange}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Loan Date</label>
                <input
                  type="date"
                  name="loan_date"
                  className="form-control"
                  value={form.loan_date}
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
                  value={form.last_payment_date}
                  onChange={handleChange}
                />
                <small className="text-muted">
                  When did they last make a payment? Leave empty if no payment yet.
                </small>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Current Balance (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  step="0.01"
                  value={form.opening_balance || ''}
                  readOnly
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Expected Collection Amount (₹)</label>
                <input
                  className="form-control"
                  type="number"
                  step="0.01"
                  value={calculateExpectedAmount(form.collection_type, form.opening_balance).toFixed(2)}
                  readOnly
                />
              </div>
              <div className="col-12">
                <div className="d-flex flex-column gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={handleGetLocation}
                  >
                    📍 Detect Live Location
                  </button>
                  <small className="text-muted">{locationLabel || 'Click to capture your live location.'}</small>
                </div>
              </div>
              <div className="col-12">
                <label className="form-label">Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="form-control"
                  onChange={handlePhotoChange}
                />
                <img
                  src={photoPreview || generateAvatarSvg(form.name || 'User', 200)}
                  alt="Customer preview"
                  className="img-fluid rounded mt-2"
                  style={{ maxWidth: '200px' }}
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2 flex-column flex-sm-row">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Customer'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/worker/customers')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
