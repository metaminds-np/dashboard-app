const MAP = {
  CLIENT_ID: 'VITE_CLIENT_ID',
  CLIENT_SECRET: 'VITE_CLIENT_SECRET',
  REDIRECT_URI: 'VITE_REDIRECT_URI',
  AUTH_URL: 'VITE_AUTH_URL',
  TOKEN_URL: 'VITE_TOKEN_URL',
  SCOPE: 'VITE_SCOPE',
  API_BASE_URL: 'VITE_API_BASE_URL',
};

Object.entries(MAP).forEach(([src, dest]) => {
  if (process.env[src]) {
    process.env[dest] = process.env[src];
  }
});
