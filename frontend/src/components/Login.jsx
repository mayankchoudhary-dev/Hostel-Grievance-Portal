import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // VERY IMPORTANT

    try {
      setLoading(true);
      setError('');

      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await response.json();
      console.log("LOGIN RESPONSE:", data);

      if (response.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        console.log("Navigating to dashboard...");
        navigate("/dashboard"); // GO TO NEXT PAGE
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error(error);
      setError("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🏠</div>
          <h1>Hostel Grievance Portal</h1>
          <p>Login to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message" style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-auth" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="divider"></div>

        <p className="auth-link">
          Don't have an account? <a href="/register">Register here</a>
        </p>
        <p className="auth-link" style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
          Admin? Use your admin credentials above.
        </p>
      </div>
    </div>
  );
};

export default Login;
