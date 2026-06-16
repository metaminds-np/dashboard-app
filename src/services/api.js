import config from '../config';

const TOKEN_KEY = 'oauth_tokens';
const REFRESH_BUFFER = 60;

export function getTokens() {
  const raw = localStorage.getItem(TOKEN_KEY);
  return raw ? JSON.parse(raw) : null;
}

function isExpired(tokens) {
  if (!tokens || !tokens.expires_at) return true;
  return Date.now() >= (tokens.expires_at * 1000 - REFRESH_BUFFER * 1000);
}

export function isAuthenticated() {
  const tokens = getTokens();
  if (!tokens) return false;
  if (!isExpired(tokens)) return true;
  return !!tokens.refresh_token;
}

export function setTokens(data) {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(data));
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
}

function updateTokens(partial) {
  const current = getTokens();
  if (!current) return;
  setTokens({ ...current, ...partial, expires_at: Math.floor(Date.now() / 1000) + partial.expires_in });
}

export function getAuthUrl() {
  const { clientId, redirectUri, authUrl, scope } = config.oauth;
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
  });
  return `${authUrl}?${params}`;
}

export async function exchangeCode(code) {
  const { clientId, clientSecret, redirectUri, tokenUrl } = config.oauth;
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${errBody}`);
  }
  return res.json();
}

export async function refreshAccessToken() {
  const tokens = getTokens();
  if (!tokens || !tokens.refresh_token) throw new Error('No refresh token available');

  const { clientId, clientSecret, tokenUrl } = config.oauth;
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: tokens.refresh_token,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!res.ok) {
    logout();
    throw new Error('Token refresh failed');
  }

  const data = await res.json();
  updateTokens({
    access_token: data.access_token,
    expires_in: data.expires_in,
    refresh_token: data.refresh_token || tokens.refresh_token,
  });
  return getTokens();
}

export async function fetchApi(endpoint) {
  let tokens = getTokens();
  if (!tokens) throw new Error('Not authenticated');

  if (isExpired(tokens)) {
    tokens = await refreshAccessToken();
  }

  const res = await fetch(`${config.api.baseUrl}${endpoint}`, {
    headers: { Authorization: `Bearer ${tokens.access_token}` },
  });

  if (res.status === 401) {
    tokens = await refreshAccessToken();
    const retry = await fetch(`${config.api.baseUrl}${endpoint}`, {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!retry.ok) throw new Error(`API error: ${retry.status}`);
    return retry.json();
  }

  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
