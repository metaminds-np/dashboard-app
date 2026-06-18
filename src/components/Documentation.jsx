import config from '../config';

export default function Documentation() {
  const { clientId, clientSecret, redirectUri, authUrl, tokenUrl, scope } = config.oauth;
  const apiBase = config.api.baseUrl;

  return (
    <div className="docs">
      <h2>Oneflow Developer Portal & OAuth 2.0 Integration</h2>
      <p className="docs-intro">
        Complete guide to creating a Oneflow app in the Developer Portal and integrating it
        using the OAuth 2.0 Authorization Code flow.
      </p>

      <section className="docs-section">
        <h3>Developer Portal Overview</h3>
        <p>
          The Oneflow Developer Portal allows third-party developers to create applications
          that integrate with Oneflow's accounting and reporting APIs. Each app gets a unique
          <code>client_id</code> and <code>client_secret</code> used to authenticate via OAuth 2.0.
        </p>
        <ul>
          <li>Manage your applications and their credentials</li>
          <li>Configure allowed redirect URIs for OAuth callbacks</li>
          <li>Select API scopes your app needs access to</li>
          <li>View and revoke active tokens</li>
        </ul>
      </section>

      <section className="docs-section">
        <h3>Creating a New App</h3>
        <ol className="docs-steps">
          <li><strong>Navigate</strong> to the Developer Portal and click <span className="docs-tag">New App</span>.</li>
          <li>
            <strong>App Name</strong> — Enter a descriptive name for your application
            (e.g., "My Accounting Dashboard"). This will be shown to users during authorization.
          </li>
          <li>
            <strong>App Type</strong> — Select <code>web_app</code> for server-side or
            single-page applications.
          </li>
          <li>
            <strong>Company URL</strong> — Enter your application's website URL
            (e.g., <code>https://example.com</code>).
          </li>
          <li>
            <strong>Redirect URI</strong> — Enter the URL where users are sent after
            authorization. This must match exactly the <code>redirect_uri</code> used in
            your OAuth requests.
            <div className="docs-note">
              Example: <code>{redirectUri}</code>
            </div>
          </li>
          <li>
            <strong>Scopes</strong> — Select the API permissions your app requires.
            <ul>
              <li>Include <code>offline_access</code> to receive a <code>refresh_token</code> for long-term access</li>
              <li>Select only the scopes your app actually needs</li>
            </ul>
          </li>
          <li>
            <strong>Save</strong> — After saving, you'll receive your
            <code>client_id</code> and <code>client_secret</code>.
            <div className="docs-note">
              The <code>client_secret</code> is shown only once. Store it securely.
              If lost, you must generate a new secret from the Developer Portal.
            </div>
          </li>
        </ol>
      </section>

      <section className="docs-section">
        <h3>Your App Configuration</h3>
        <div className="docs-config">
          <table>
            <tbody>
              <tr><td>Client ID</td><td><code>{clientId}</code></td></tr>
              <tr><td>Client Secret</td><td><code>********</code></td></tr>
              <tr><td>Redirect URI</td><td><code>{redirectUri}</code></td></tr>
              <tr><td>Auth URL</td><td><code>{authUrl}</code></td></tr>
              <tr><td>Token URL</td><td><code>{tokenUrl}</code></td></tr>
              <tr><td>Scope</td><td><code>{scope}</code></td></tr>
              <tr><td>API Base</td><td><code>{apiBase}</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="docs-section">
        <h3>OAuth 2.0 Authorization Code Flow</h3>

        <h4>Step 1: Redirect User to Authorize</h4>
        <p>Redirect the user's browser to the Oneflow authorization page:</p>
        <pre className="docs-code">
          GET {authUrl}?client_id={clientId}&redirect_uri={redirectUri}&response_type=code&scope={scope.replace(/ /g, '+')}&state=RANDOM_CSRF
        </pre>
        <table className="docs-table">
          <thead>
            <tr><th>Parameter</th><th>Description</th></tr>
          </thead>
          <tbody>
            <tr><td><code>client_id</code></td><td>Your app's public identifier</td></tr>
            <tr><td><code>redirect_uri</code></td><td>Where to redirect after authorization (must match Developer Portal)</td></tr>
            <tr><td><code>response_type</code></td><td>Must be <code>code</code></td></tr>
            <tr><td><code>scope</code></td><td>Space-separated list of requested scopes</td></tr>
            <tr><td><code>state</code></td><td>Random CSRF token — validate on callback</td></tr>
          </tbody>
        </table>

        <h4>Step 2: Exchange Code for Token</h4>
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

        <h4>Step 3: Refresh Access Token</h4>
        <p>When the access token expires, use the <code>refresh_token</code> to get a new one:</p>
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

        <h4>Step 4: Call APIs</h4>
        <p>Include the access token in the <code>Authorization</code> header:</p>
        <pre className="docs-code">
          GET {apiBase}/core/branches
          Authorization: Bearer ACCESS_TOKEN
        </pre>

        <h4>Step 5: Revoke Token</h4>
        <p>When disconnecting the app, list and revoke active tokens:</p>
        <pre className="docs-code">
          GET /oauth/tokens
          DELETE /oauth/tokens/{'{tokenId}'}
        </pre>
      </section>

      <section className="docs-section">
        <h3>Available Scopes</h3>
        <table className="docs-table">
          <thead>
            <tr><th>Scope</th><th>Access</th><th>Included</th></tr>
          </thead>
          <tbody>
            <tr><td><code>accounts.read</code></td><td>View accounts</td><td>{scope.includes('accounts.read') ? '✓' : ''}</td></tr>
            <tr><td><code>branches.read</code></td><td>View branches</td><td>{scope.includes('branches.read') ? '✓' : ''}</td></tr>
            <tr><td><code>reporting_tags.read</code></td><td>View reporting tags</td><td>{scope.includes('reporting_tags.read') ? '✓' : ''}</td></tr>
            <tr><td><code>reports.balance_sheet.read</code></td><td>View balance sheet reports</td><td>{scope.includes('reports.balance_sheet.read') ? '✓' : ''}</td></tr>
            <tr><td><code>reports.income_statement.read</code></td><td>View income statement reports</td><td>{scope.includes('reports.income_statement.read') ? '✓' : ''}</td></tr>
            <tr><td><code>reports.trial_balance.read</code></td><td>View trial balance reports</td><td>{scope.includes('reports.trial_balance.read') ? '✓' : ''}</td></tr>
            <tr><td><code>contacts.read</code></td><td>View contacts</td><td>{scope.includes('contacts.read') ? '✓' : ''}</td></tr>
            <tr><td><code>items.read</code></td><td>View items</td><td>{scope.includes('items.read') ? '✓' : ''}</td></tr>
            <tr><td><code>offline_access</code></td><td>Receive refresh token for long-term access</td><td>{scope.includes('offline_access') ? '✓' : ''}</td></tr>
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
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reports/ledgerbalances</code></td><td>Ledger balances report</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reports/groupbalances</code></td><td>Group balances report</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reports/trialbalance</code></td><td>Trial balance report</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reports/profitloss</code></td><td>Profit & loss report</td></tr>
            <tr><td><span className="method-badge method-get">GET</span></td><td><code>{apiBase}/accounting/reports/balancesheet</code></td><td>Balance sheet report</td></tr>
          </tbody>
        </table>
      </section>

      <section className="docs-section">
        <h3>Security Best Practices</h3>
        <ul>
          <li>Never expose your <code>client_secret</code> in client-side code or public repositories</li>
          <li>Always validate the <code>state</code> parameter to prevent CSRF attacks</li>
          <li>Use HTTPS for all OAuth endpoints and redirect URIs in production</li>
          <li>Store tokens securely — use HTTP-only cookies or encrypted storage</li>
          <li>Rotate your <code>client_secret</code> periodically or if compromised</li>
          <li>Request only the scopes your app needs (principle of least privilege)</li>
          <li>Implement token refresh logic rather than asking users to re-authenticate</li>
          <li>Revoke tokens when users disconnect or uninstall your app</li>
        </ul>
      </section>
    </div>
  );
}
