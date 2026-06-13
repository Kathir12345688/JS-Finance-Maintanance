import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import { registerUser } from '../../services/auth';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('worker');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      const message = 'Please enter your username.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    if (!email.trim()) {
      const message = 'Please enter your email address.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      const message = 'Please enter a valid email address.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    if (!phone.trim()) {
      const message = 'Please enter your phone number.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    if (!role) {
      const message = 'Please select a role.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    if (!password || password.length < 6) {
      const message = 'Password must be at least 6 characters.';
      setError(message);
      showToast(message, 'danger');
      return;
    }

    setLoading(true);

    try {
      const response = await registerUser({
        username,
        email,
        phone,
        role,
        password,
      });

      if (response.status === 201 || response.status === 200) {
        showToast('Registration successful. Please login with your username and password.', 'success');
        navigate('/auth/login');
      } else {
        const message = 'Unable to register. Please try again.';
        setError(message);
        showToast(message, 'danger');
      }
    } catch (err) {
      let message = err.response?.data?.detail || err.response?.data?.message || err.message || 'Registration failed';
      if (err.response?.data && typeof err.response.data === 'object') {
        if (err.response.data.password) {
          message = Array.isArray(err.response.data.password)
            ? err.response.data.password.join(' ')
            : err.response.data.password;
        } else if (err.response.data.username) {
          message = Array.isArray(err.response.data.username)
            ? err.response.data.username.join(' ')
            : err.response.data.username;
        } else if (err.response.data.non_field_errors) {
          message = Array.isArray(err.response.data.non_field_errors)
            ? err.response.data.non_field_errors.join(' ')
            : err.response.data.non_field_errors;
        } else {
          message = JSON.stringify(err.response.data);
        }
      }
      setError(message);
      showToast(message, 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <h3 className="card-title text-center mb-3">Register with JS Finance</h3>
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Email Address</label>
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    type="email"
                    className="form-control"
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    type="tel"
                    className="form-control"
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Role</label>
                  <select
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    className="form-select"
                    required
                  >
                    <option value="worker">Worker</option>
                    <option value="owner">Owner</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <div className="input-group">
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Create a strong password"
                      required
                      aria-label="Password"
                    />
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={() => setShowPassword((s) => !s)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => navigate('/auth/login')}
                  >
                    Login
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
