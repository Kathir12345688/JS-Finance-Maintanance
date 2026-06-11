import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWorker } from '../../services/users';

export default function OwnerAddWorker() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createWorker({
        ...form,
        role: 'worker',
      });
      navigate('/owner/workers');
    } catch (err) {
      setError(err.response?.data || err.response?.data?.detail || err.message || 'Failed to add worker.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h2>Add Worker</h2>
        <p className="text-muted">Create a new worker account.</p>
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
              <div className="col-12 col-md-6">
                <label className="form-label">Password *</label>
                <input
                  className="form-control"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                />
              </div>
            </div>

            <div className="mt-4 d-flex gap-2 flex-column flex-sm-row">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Worker'}
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
