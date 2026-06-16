import { useSearchParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuthUrl, exchangeCode, isAuthenticated, setTokens } from '../services/api';

export default function Login() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [code, setCode] = useState(null);
  const [tokenInfo, setTokenInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const c = searchParams.get('code');
    if (!c) return;
    setCode(c);

    exchangeCode(c)
      .then((data) => {
        const tokens = {
          ...data,
          expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
        };
        setTokens(tokens);
        setTokenInfo(tokens);
      })
      .catch((err) => {
        setError(err.message);
      });
  }, [searchParams, navigate]);

  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  if (tokenInfo) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Authenticated</h1>
          <div className="token-display">
            <div className="token-row">
              <span className="token-label">Access Token</span>
              <code className="token-value">{tokenInfo.access_token}</code>
            </div>
            <div className="token-row">
              <span className="token-label">Refresh Token</span>
              <code className="token-value">{tokenInfo.refresh_token}</code>
            </div>
            <div className="token-row">
              <span className="token-label">Expires In</span>
              <span>{tokenInfo.expires_in}s</span>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (code && error) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Authentication Failed</h1>
          <div className="token-display">
            <div className="token-row">
              <span className="token-label">Code Received</span>
              <code className="token-value">{code}</code>
            </div>
            <div className="token-row">
              <span className="token-label">Error</span>
              <span style={{ color: '#ef4444' }}>{error}</span>
            </div>
          </div>
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
