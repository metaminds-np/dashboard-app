import { useEffect, useState } from 'react';
import { exchangeCodeForToken } from '../services/api';

export default function Callback() {
  const [status, setStatus] = useState('Exchanging authorization code...');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const error = params.get('error');

    if (error) {
      setStatus(`Authorization failed: ${error}`);
      return;
    }

    if (!code) {
      setStatus('No authorization code received.');
      return;
    }

    exchangeCodeForToken(code)
      .then(() => {
        window.location.href = '/dashboard';
      })
      .catch((err) => {
        setStatus(`Token exchange failed: ${err.message}`);
      });
  }, []);

  return (
    <div style={styles.container}>
      <p>{status}</p>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontFamily: 'system-ui, sans-serif',
    fontSize: '18px',
    color: '#333',
  },
};
