import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginUser, requestPasswordReset, verifyOtpReset } from '../../services/auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const { showToast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotPhone, setForgotPhone] = useState('');
  const [forgotStage, setForgotStage] = useState(1);
  const [forgotCode, setForgotCode] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState('');

  const redirectByRole = (user) => {
    if (user.role === 'owner') {
      navigate('/owner/dashboard');
    } else {
      navigate('/worker/dashboard');
    }
  };

  useEffect(() => {
    if (user) {
      redirectByRole(user);
    }
  }, [user]);

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

  const handleRequestOtp = async () => {
    setForgotMessage('');
    if (!forgotPhone.trim()) {
      setForgotMessage('Please enter your phone number.');
      return;
    }
    setForgotLoading(true);
    try {
      await requestPasswordReset({ phone: forgotPhone });
      setForgotStage(2);
      setForgotMessage('OTP sent to your phone.');
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to send OTP';
      setForgotMessage(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setForgotMessage('');
    if (!forgotCode.trim() || !forgotNewPassword) {
      setForgotMessage('Please enter OTP and new password.');
      return;
    }
    if (forgotNewPassword.length < 6) {
      setForgotMessage('Password must be at least 6 characters.');
      return;
    }
    setForgotLoading(true);
    try {
      const resp = await verifyOtpReset({ phone: forgotPhone, code: forgotCode, password: forgotNewPassword });
      const data = resp.data;
      const token = data.access || data.token;
      const user = data.user || data;
      if (token) {
        login(user, token);
        setForgotMessage('Password reset successful. Redirecting...');
      } else {
        setForgotMessage('Password reset successful. Please login.');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message || 'Failed to verify OTP';
      setForgotMessage(msg);
    } finally {
      setForgotLoading(false);
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
                  <div className="input-group">
                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      type={showPassword ? 'text' : 'password'}
                      className="form-control"
                      placeholder="Enter password"
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

              <div className="text-center mt-3">
                <button type="button" className="btn btn-link p-0" onClick={() => setShowForgot((s) => !s)}>
                  Forgot password?
                </button>
              </div>

              {showForgot && (
                <div className="card mt-3">
                  <div className="card-body">
                    <h5 className="card-title">Reset password via OTP</h5>
                    {forgotMessage && <div className="alert alert-info">{forgotMessage}</div>}
                    {forgotStage === 1 && (
                      <>
                        <div className="mb-2">
                          <label className="form-label">Phone number</label>
                          <input
                            value={forgotPhone}
                            onChange={(e) => setForgotPhone(e.target.value)}
                            type="tel"
                            className="form-control"
                            placeholder="Enter phone number"
                          />
                        </div>
                        <button className="btn btn-primary" onClick={handleRequestOtp} disabled={forgotLoading}>
                          {forgotLoading ? 'Sending...' : 'Send OTP'}
                        </button>
                      </>
                    )}

                    {forgotStage === 2 && (
                      <>
                        <div className="mb-2">
                          <label className="form-label">OTP Code</label>
                          <input value={forgotCode} onChange={(e) => setForgotCode(e.target.value)} className="form-control" />
                        </div>
                        <div className="mb-2">
                          <label className="form-label">New password</label>
                          <input value={forgotNewPassword} onChange={(e) => setForgotNewPassword(e.target.value)} type="password" className="form-control" />
                        </div>
                        <button className="btn btn-success" onClick={handleVerifyOtp} disabled={forgotLoading}>
                          {forgotLoading ? 'Verifying...' : 'Verify & Reset'}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
