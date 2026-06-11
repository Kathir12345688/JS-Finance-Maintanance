import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchWorker, updateWorker } from '../../services/users';

export default function OwnerEditWorker() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    is_active: true,
  });

  useEffect(() => {
    const loadWorker = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await fetchWorker(id);
        setForm({
          name: response.data.name || '',
          username: response.data.username || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          is_active: response.data.is_active,
        });
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Unable to load worker.');
      } finally {
        setLoading(false);
      }
    };
    loadWorker();
  }, [id]);

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await updateWorker(id, {
        name: form.name,
        username: form.username,
        email: form.email || null,
        phone: form.phone || null,
        is_active: form.is_active,
      });
      navigate('/owner/workers');
    } catch (err) {
      setError(err.response?.data || err.response?.data?.detail || err.message || 'Unable to update worker.');
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
        <h2>Edit Worker</h2>
        <p className="text-muted">Update worker account information.</p>
      </div>

      {error && <div className="alert alert-danger">{typeof error === 'string' ? error : JSON.stringify(error)}</div>}

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
                  placeholder="Worker name"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Username *</label>
                <input
                  className="form-control"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Phone</label>
                <input
                  className="form-control"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Email</label>
                <input
                  className="form-control"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>
              <div className="col-12 col-md-6 d-flex align-items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                />
                <label htmlFor="is_active" className="form-label mb-0">
                  Active Worker
                </label>
              </div>
            </div>

            <div className="mt-4 d-flex gap-2 flex-column flex-sm-row">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/owner/workers')}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
