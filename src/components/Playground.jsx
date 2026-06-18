import { useState } from 'react';
import config from '../config';
import { getTokens } from '../services/api';

const ENDPOINTS = [
  {
    id: 'branches',
    label: 'Branches',
    method: 'GET',
    path: '/core/branches',
    description: 'List all branches',
    params: [
      { name: 'page', type: 'number', required: false, default: 1 },
      { name: 'per_page', type: 'number', required: false, default: 50 },
    ],
  },
  {
    id: 'reporting_tags',
    label: 'Reporting Tags',
    method: 'GET',
    path: '/accounting/reportingtags',
    description: 'List all reporting tags',
    params: [
      { name: 'page', type: 'number', required: false, default: 1 },
      { name: 'per_page', type: 'number', required: false, default: 50 },
    ],
  },
  {
    id: 'groups',
    label: 'Groups',
    method: 'GET',
    path: '/accounting/groups',
    description: 'List all accounting groups',
    params: [],
  },
  {
    id: 'accounts',
    label: 'Accounts',
    method: 'GET',
    path: '/accounting/accounts',
    description: 'List all accounts',
    params: [],
  },
  {
    id: 'ledger_balances',
    label: 'Ledger Balances',
    method: 'GET',
    path: '/accounting/reports/ledgerbalances',
    description: 'Get ledger balances report',
    params: [
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date', required: true },
      { name: 'branch', type: 'number', required: true },
      { name: 'reporting_tags', type: 'text', required: false, placeholder: '{"1":["ABC"]}' },
    ],
  },
  {
    id: 'group_balances',
    label: 'Group Balances',
    method: 'GET',
    path: '/accounting/reports/groupbalances',
    description: 'Get group balances report',
    params: [
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date', required: true },
      { name: 'branch', type: 'number', required: true },
      { name: 'reporting_tags', type: 'text', required: false, placeholder: '{"1":["ABC"]}' },
    ],
  },
  {
    id: 'trial_balance',
    label: 'Trial Balance',
    method: 'GET',
    path: '/accounting/reports/trialbalance',
    description: 'Get trial balance report',
    params: [
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date', required: true },
      { name: 'branch', type: 'number', required: true },
      { name: 'reporting_tags', type: 'text', required: false, placeholder: '{"1":["ABC"]}' },
    ],
  },
  {
    id: 'profit_loss',
    label: 'Profit & Loss',
    method: 'GET',
    path: '/accounting/reports/profitloss',
    description: 'Get profit & loss report',
    params: [
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date', required: true },
      { name: 'branch', type: 'number', required: true },
      { name: 'reporting_tags', type: 'text', required: false, placeholder: '{"1":["ABC"]}' },
    ],
  },
  {
    id: 'balance_sheet',
    label: 'Balance Sheet',
    method: 'GET',
    path: '/accounting/reports/balancesheet',
    description: 'Get balance sheet report',
    params: [
      { name: 'from_date', type: 'date', required: true },
      { name: 'to_date', type: 'date', required: true },
      { name: 'branch', type: 'number', required: true },
      { name: 'reporting_tags', type: 'text', required: false, placeholder: '{"1":["ABC"]}' },
    ],
  },
];

function ApiEndpoint({ spec }) {
  const [params, setParams] = useState({});
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(false);

  const updateParam = (name, value) => {
    setParams((prev) => ({ ...prev, [name]: value }));
  };

  const buildUrl = () => {
    const base = `${config.api.baseUrl}${spec.path}`;
    if (spec.method === 'POST') return base;
    const query = new URLSearchParams();
    spec.params.forEach((p) => {
      const val = params[p.name] || p.default;
      if (val !== undefined && val !== '') {
        query.set(p.name, val);
      }
    });
    const qs = query.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const buildBody = () => {
    if (spec.method !== 'POST') return null;
    const body = {};
    spec.params.forEach((p) => {
      const val = params[p.name];
      if (val !== undefined && val !== '') {
        if (p.name === 'reporting_tags') {
          try { body[p.name] = JSON.parse(val); } catch { body[p.name] = val; }
        } else if (p.type === 'number') {
          body[p.name] = Number(val);
        } else {
          body[p.name] = val;
        }
      }
    });
    return Object.keys(body).length ? body : null;
  };

  const buildBodyDisplay = () => {
    const body = buildBody();
    return body ? JSON.stringify(body, null, 2) : '';
  };

  const getHeaders = () => {
    const tokens = getTokens();
    const headers = {};
    if (tokens) headers.Authorization = `Bearer ${tokens.access_token}`;
    if (spec.method === 'POST') headers['Content-Type'] = 'application/json';
    return headers;
  };

  const send = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    const tokens = getTokens();
    if (!tokens) {
      setError('Not authenticated. Please login first.');
      setLoading(false);
      return;
    }

    const url = buildUrl();
    const startTime = performance.now();

    try {
      const res = await fetch(url, {
        method: spec.method,
        headers: getHeaders(),
        body: spec.method === 'POST' ? JSON.stringify(buildBody()) : undefined,
      });
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      const body = await res.json();
      setResponse({ status: res.status, elapsed, body });
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="playground-endpoint">
      <div className="endpoint-header" onClick={() => setExpanded(!expanded)}>
        <span className={`method-badge method-${spec.method.toLowerCase()}`}>
          {spec.method}
        </span>
        <code className="endpoint-path">{config.api.baseUrl}{spec.path}</code>
        <span className="endpoint-desc">{spec.description}</span>
        <span className="expand-icon">{expanded ? '▼' : '▶'}</span>
      </div>

      {expanded && (
        <div className="endpoint-body">
          <div className="params-section">
            <h4>Parameters</h4>
            <div className="params-grid">
              {spec.params.map((p) => (
                <div key={p.name} className="param-field">
                  <label>
                    {p.name}
                    {p.required && <span className="required">*</span>}
                  </label>
                  <input
                    type={p.type === 'date' ? 'date' : 'text'}
                    placeholder={p.placeholder || (p.default ? String(p.default) : p.name)}
                    value={params[p.name] || ''}
                    onChange={(e) => updateParam(p.name, e.target.value)}
                  />
                  {p.default !== undefined && (
                    <span className="param-default">default: {p.default}</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="request-section">
            <h4>Request</h4>
            <div className="request-url">
              <span className={`method-badge method-${spec.method.toLowerCase()}`}>
                {spec.method}
              </span>
              <code>{buildUrl()}</code>
            </div>
            {spec.method === 'POST' && buildBody() && (
              <div className="request-body">
                <pre>{buildBodyDisplay()}</pre>
              </div>
            )}
            <button
              className="btn btn-primary send-btn"
              onClick={send}
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Request'}
            </button>
          </div>

          {error && (
            <div className="response-section error">
              <h4>Error</h4>
              <pre>{error}</pre>
            </div>
          )}

          {response && (
            <div className="response-section">
              <h4>
                Response
                <span className={`status-badge status-${Math.floor(response.status / 100)}xx`}>
                  {response.status}
                </span>
                <span className="response-time">{response.elapsed}s</span>
              </h4>
              <pre>{JSON.stringify(response.body, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Playground() {
  return (
    <div className="playground">
      <h2>API Playground</h2>
      <p className="playground-desc">
        Explore Oneflow API endpoints. Each section shows the endpoint, parameters,
        request URL, and response.
      </p>
      <div className="playground-list">
        {ENDPOINTS.map((spec) => (
          <ApiEndpoint key={spec.id} spec={spec} />
        ))}
      </div>
    </div>
  );
}
