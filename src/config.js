const config = {
  oauth: {
    clientId: import.meta.env.VITE_CLIENT_ID,
    clientSecret: import.meta.env.VITE_CLIENT_SECRET,
    redirectUri: import.meta.env.VITE_REDIRECT_URI,
    authUrl: import.meta.env.VITE_AUTH_URL,
    tokenUrl: import.meta.env.VITE_TOKEN_URL,
    scope: import.meta.env.VITE_SCOPE,
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  },
};

export default config;
