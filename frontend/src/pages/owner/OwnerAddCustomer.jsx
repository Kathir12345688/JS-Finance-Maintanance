import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const defaultAvatar = 'https://via.placeholder.com/200?text=Avatar';

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

const calculateExpectedAmount = (collectionType, openingBalance) => {
  const opening = Number(openingBalance) || 0;
  if (collectionType === 'daily') {
    return opening / 100;
  }
  if (collectionType === 'weekly') {
    return opening / 10;
  }
  return 0;
};

export default function OwnerAddCustomer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workers, setWorkers] = useState([]);
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    state: 'Tamil Nadu',
    district: 'Coimbatore',
    area: '',
    latitude: '',
    longitude: '',
    photo: null,
    opening_balance: '',
    collection_type: 'daily',
    assigned_worker: '',
    loan_date: '',
    last_payment_date: '',
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [locationLabel, setLocationLabel] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const workersResp = await api.get('/users/', { params: { role: 'worker' } });
        setWorkers(Array.isArray(workersResp.data) ? workersResp.data : workersResp.data.results || []);

        const locationsResp = await api.get('/locations/');
        setLocations(Array.isArray(locationsResp.data) ? locationsResp.data : locationsResp.data.results || []);
      } catch (err) {
        console.error('Failed to load workers/locations:', err);
      }
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, photo: file }));
    setPhotoPreview(file ? URL.createObjectURL(file) : '');
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setFormData((prev) => ({
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const openingBalance = parseFloat(formData.opening_balance) || 0;
      const expectedAmount = calculateExpectedAmount(formData.collection_type, openingBalance);

      const payload = {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        state: formData.state,
        district: formData.district,
        area: formData.area,
        collection_type: formData.collection_type,
        opening_balance: openingBalance,
        current_balance: openingBalance,
        loan_date: formData.loan_date || undefined,
        last_payment_date: formData.last_payment_date || undefined,
        daily_collection_amount: formData.collection_type === 'daily' ? expectedAmount : 0,
        weekly_collection_amount: formData.collection_type === 'weekly' ? expectedAmount : 0,
      };
      if (formData.latitude) payload.latitude = parseFloat(formData.latitude);
      if (formData.longitude) payload.longitude = parseFloat(formData.longitude);
      if (formData.assigned_worker) payload.assigned_worker = Number(formData.assigned_worker);

      if (formData.photo) {
        const formDataPayload = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formDataPayload.append(key, value);
          }
        });
        formDataPayload.append('photo', formData.photo);
        await api.post('/customers/', formDataPayload, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await api.post('/customers/', payload);
      }

      navigate('/owner/customers');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to add customer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2 className="mb-1">Add New Customer</h2>
        <p className="text-muted">Create a new customer record.</p>
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
                      placeholder="Enter full address"
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
                    <label className="form-label">Opening Balance (₹) *</label>
                    <input
                      type="number"
                      name="opening_balance"
                      className="form-control"
                      placeholder="Enter opening balance"
                      value={formData.opening_balance}
                      onChange={handleChange}
                      step="0.01"
                      required
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
                      className="form-control"
                      value={formData.opening_balance || ''}
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

                  <div className="col-12">
                    <label className="form-label">GPS Location</label>
                    <div className="input-group mb-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={handleGetLocation}
                      >
                        📍 Get Current Location
                      </button>
                    </div>
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
                      src={photoPreview || generateAvatarSvg(formData.name || 'User', 200)}
                      alt="Customer preview"
                      className="img-fluid rounded mt-2"
                      style={{ maxWidth: '200px' }}
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
                    <div className="d-flex gap-2">
                      <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Adding...' : 'Add Customer'}
                      </button>
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
