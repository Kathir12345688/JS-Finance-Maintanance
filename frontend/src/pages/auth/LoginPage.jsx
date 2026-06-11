import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginUser } from '../../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectByRole = (user) => {
    if (user.role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/worker/dashboard');
    }
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setError('');

    if (!username.trim()) {
      const message = 'Please enter your username.';
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
      const response = await loginUser({ username, password });
      const data = response.data;
      const token = data.access || data.token;
      const user = data.user || data;

      if (!token) {
        throw new Error('Token not returned from login');
      }

      login(user, token);
      showToast('Logged in successfully.', 'success');
      redirectByRole(user);
    } catch (err) {
      const data = err.response?.data;
      let message = err.message || 'Login failed';
      if (data) {
        message = data.detail || data.non_field_errors || data.message || message;
        if (Array.isArray(message)) {
          message = message.join(' ');
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
              <h3 className="card-title text-center mb-3">JS Finance Login</h3>
              {error && <div className="alert alert-danger">{error}</div>}

              <form onSubmit={handlePasswordLogin}>
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
                  <label className="form-label">Password</label>
                  <input
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              <div className="text-center mt-4">
                <p className="mb-0">
                  Don't have an account?{' '}
                  <button type="button" className="btn btn-link p-0" onClick={() => navigate('/auth/register')}>
                    Register here
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
