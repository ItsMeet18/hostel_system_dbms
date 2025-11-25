import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api';

const Login = ({ user, onLogin }) => {
  const [mode, setMode] = useState('resident');
  const [identifier, setIdentifier] = useState('');
  const [adminCreds, setAdminCreds] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleModeChange = (value) => {
    setMode(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (mode === 'resident') {
        const response = await authAPI.residentLogin({ identifier });
        onLogin(response.data);
        navigate('/resident');
      } else {
        const response = await authAPI.adminLogin(adminCreds);
        onLogin(response.data);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    const destination = user.type === 'admin' ? '/admin' : '/resident';
    navigate(destination);
  }

  return (
    <div className="login-wrapper">
      <div className="login-card card">
        <h1 className="page-title">Hostel Management Portal</h1>
        <p className="muted">Choose your portal to continue</p>

        <div className="toggle-group">
          <button
            className={`toggle-btn ${mode === 'resident' ? 'active' : ''}`}
            onClick={() => handleModeChange('resident')}
          >
            Resident
          </button>
          <button
            className={`toggle-btn ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => handleModeChange('admin')}
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'resident' ? (
            <div className="form-group">
              <label className="form-label">Resident ID / Email / Contact</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your registered detail"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
          ) : (
            <>
              <div className="form-group">
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@example.com"
                  value={adminCreds.email}
                  onChange={(e) => setAdminCreds({ ...adminCreds, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter password"
                  value={adminCreds.password}
                  onChange={(e) => setAdminCreds({ ...adminCreds, password: e.target.value })}
                  required
                />
              </div>
            </>
          )}

          {error && <div className="error">{error}</div>}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;

