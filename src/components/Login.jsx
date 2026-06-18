import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuthUrl, exchangeCode, isAuthenticated, setTokens } from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const c = searchParams.get('code');
    if (!c) return;

    exchangeCode(c)
      .then((data) => {
        const tokens = {
          ...data,
          expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        };
        setTokens(tokens);
        navigate('/dashboard', { replace: true });
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [searchParams, navigate]);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  if (error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Authentication Failed</h1>
          <p style={{ color: '#ef4444', margin: '1rem 0' }}>{error}</p>
          <button className="btn btn-primary" onClick={handleLogin}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>OneApp</h1>
        <p>Sign in with Oneflow to continue</p>
        <button className="btn btn-primary" onClick={handleLogin}>
          Login with OAuth
        </button>
      </div>
    </div>
  );
}
