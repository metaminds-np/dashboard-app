import config from '../config';

export default function Documentation() {
  const { clientId, redirectUri, authUrl, tokenUrl, scope } = config.oauth;
  const apiBase = config.api.baseUrl;

  return (
    <div className="docs">
      <h2>Oneflow OAuth 2.0 Integration</h2>
      <p className="docs-intro">
        Integrate third-party apps with Oneflow using the OAuth 2.0 Authorization Code flow.
        Below are the steps, endpoints, and scopes available.
      </p>

      <section className="docs-section">
        <h3>1. Create an App in Developer Portal</h3>
        <ul>
          <li>Click <strong>New App</strong></li>
          <li>Fill in App name, App type, Company URL, and Redirect URL</li>
          <li>Choose scopes (include <code>offline_access</code> for refresh token flow)</li>
          <li>Save and copy <code>client_id</code> and <code>client_secret</code></li>
        </ul>
        <div className="docs-config">
          <h4>Your App Configuration</h4>
          <table>
            <tbody>
              <tr><td>Client ID</td><td><code>{clientId}</code></td></tr>
              <tr><td>Client Secret</td><td><code>********</code></td></tr>
              <tr><td>Redirect URI</td><td><code>{redirectUri}</code></td></tr>
              <tr><td>Scope</td><td><code>{scope}</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h3>2. Redirect User to Authorize Endpoint</h3>
        <p>Redirect the user's browser to the Oneflow authorization page:</p>
        <pre className="docs-code">
          {authUrl}?client_id={clientId}&redirect_uri={redirectUri}&response_type=code&scope={scope.replace(/ /g, '+')}&state=RANDOM_CSRF
        </pre>
        <p className="docs-note">
          Include a random <code>state</code> value for CSRF protection. Validate it when the user is redirected back.
        </p>
      </section>

      <section className="docs-section">
        <h3>3. Exchange Code for Token</h3>
        <p>After the user authorizes, they are redirected back with a <code>code</code> parameter. Exchange it for tokens:</p>
        <div className="docs-request">
          <span className="method-badge method-post">POST</span>
          <code>{tokenUrl}</code>
        </div>
        <pre className="docs-code">
{`{
  "grant_type": "authorization_code",
  "client_id": "${clientId}",
  "client_secret": "YOUR_CLIENT_SECRET",
  "redirect_uri": "${redirectUri}",
  "code": "AUTHORIZATION_CODE"
}`}
        </pre>
        <div className="docs-response">
          <h4>Response</h4>
          <pre className="docs-code">
{`{
  "access_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "${scope}",
  "refresh_token": "def..."
}`}
          </pre>
        </div>
      </section>

      <section className="docs-section">
        <h3>4. Refresh Access Token</h3>
        <p>When the access token expires, use the refresh token to get a new one:</p>
        <div className="docs-request">
          <span className="method-badge method-post">POST</span>
          <code>{tokenUrl}</code>
        </div>
        <pre className="docs-code">
{`{
  "grant_type": "refresh_token",
  "refresh_token": "REFRESH_TOKEN",
  "client_id": "${clientId}",
  "client_secret": "YOUR_CLIENT_SECRET"
}`}
        </pre>
        <div className="docs-response">
          <h4>Response</h4>
          <pre className="docs-code">
{`{
  "access_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "scope": "${scope}"
}`}
          </pre>
        </div>
      </section>

      <section className="docs-section">
        <h3>5. Call APIs</h3>
        <p>Include the access token in the <code>Authorization</code> header:</p>
        <pre className="docs-code">
          GET {apiBase}/core/branches
          Authorization: Bearer ACCESS_TOKEN
        </pre>
      </section>

      <section className="docs-section">
        <h3>6. Revoke Token</h3>
        <p>When disconnecting the app, revoke the token:</p>
        <pre className="docs-code">
          GET /oauth/tokens
          DELETE /oauth/tokens/{'{tokenId}'}
        </pre>
      </section>

      <section className="docs-section">
        <h3>Available Scopes</h3>
        <table className="docs-table">
          <thead>
            <tr><th>Scope</th><th>Access</th></tr>
          </thead>
          <tbody>
            <tr><td><code>accounts.read</code></td><td>View accounts</td></tr>
            <tr><td><code>branches.read</code></td><td>View branches</td></tr>
            <tr><td><code>reporting_tags.read</code></td><td>View reporting tags</td></tr>
            <tr><td><code>reports.balance_sheet.read</code></td><td>View balance sheet reports</td></tr>
            <tr><td><code>reports.income_statement.read</code></td><td>View income statement reports</td></tr>
            <tr><td><code>reports.trial_balance.read</code></td><td>View trial balance reports</td></tr>
            <tr><td><code>contacts.read</code></td><td>View contacts</td></tr>
            <tr><td><code>items.read</code></td><td>View items</td></tr>
            <tr><td><code>offline_access</code></td><td>Receive refresh token for long-term access</td></tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h3>Available API Endpoints</h3>
        <table className="docs-table">
          <thead>
            <tr><th>Method</th><th>Endpoint</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/core/branches</code></td><td>List branches</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reportingtags</code></td><td>List reporting tags</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/groups</code></td><td>List accounting groups</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/accounts</code></td><td>List accounts</td></tr>
            <tr><td><span className="method-badge method-post">POST</span></td><td><code>{apiBase}/accounting/reports/ledgerbalances</code></td><td>Ledger balances report</td></tr>
            <tr><td><span className="method-badge method-post">POST</span></td><td><code>{apiBase}/accounting/reports/groupbalances</code></td><td>Group balances report</td></tr>
            <tr><td><span className="method-badge method-post">POST</span></td><td><code>{apiBase}/accounting/reports/trialbalance</code></td><td>Trial balance report</td></tr>
            <tr><td><span className="method-badge method-post">POST</span></td><td><code>{apiBase}/accounting/reports/profitloss</code></td><td>Profit & loss report</td></tr>
            <tr><td><span className="method-badge method-post">POST</span></td><td><code>{apiBase}/accounting/reports/balancesheet</code></td><td>Balance sheet report</td></tr>
          </tbody>
        </table>
      </section>
    </div>
  );
}
