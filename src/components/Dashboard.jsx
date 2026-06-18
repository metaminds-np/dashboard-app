import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, fetchApi, fetchApiQuery, getTokens, refreshAccessToken } from '../services/api';
import Playground from './Playground';
import Documentation from './Documentation';
import ReportTreeTable from './ReportTreeTable';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const TABS = ['Overview', 'Playground', 'Documentation'];
const PIE_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4', '#f97316'];

function today() {
  return new Date().toISOString().slice(0, 10);
}
function monthAgo() {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().slice(0, 10);
}

function extractPieData(data, key) {
  if (!data || !Array.isArray(data)) return [];
  return data
    .filter((item) => item[key] && item[key].sum_balance)
    .map((item) => ({
      name: item.name,
      value: Math.abs(item[key].sum_balance),
    }));
}

function ledgerPieData(data) {
  if (!Array.isArray(data)) return [];
  return data
    .filter((item) => item.balance)
    .map((item) => ({ name: item.name, value: Math.abs(item.balance) }));
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');

  const [branches, setBranches] = useState([]);
  const [reportingTags, setReportingTags] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [tagValues, setTagValues] = useState({});
  const [fromDate, setFromDate] = useState(monthAgo());
  const [toDate, setToDate] = useState(today());

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [groupLevel, setGroupLevel] = useState(0);
  const [ledgerData, setLedgerData] = useState(null);
  const [groupData, setGroupData] = useState(null);
  const [trialData, setTrialData] = useState(null);
  const [plData, setPlData] = useState(null);
  const [bsData, setBsData] = useState(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
      return;
    }

    const init = async () => {
      try {
        const [branchesRes, tagsRes] = await Promise.all([
          fetchApi('/core/branches'),
          fetchApi('/accounting/reportingtags'),
        ]);
        setBranches(branchesRes.data || branchesRes);
        setReportingTags(tagsRes.data || tagsRes);
      } catch {}

      fetchReports();
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const reportBody = useCallback(() => {
    const body = { from_date: fromDate, to_date: toDate };
    if (selectedBranch) body.branch = Number(selectedBranch);
    const tags = {};
    reportingTags.forEach((t) => {
      const val = tagValues[t.id];
      if (val) tags[t.id] = [val];
    });
    if (Object.keys(tags).length) body.reporting_tags = tags;
    return body;
  }, [fromDate, toDate, selectedBranch, tagValues, reportingTags]);

  const fetchReports = async () => {
    setLoading(true);
    const body = reportBody();

    try {
      const [ledger, group, trial, pl, bs] = await Promise.all([
        fetchApiQuery('/accounting/reports/ledgerbalances', body),
        fetchApiQuery('/accounting/reports/groupbalances', body),
        fetchApiQuery('/accounting/reports/trialbalance', body),
        fetchApiQuery('/accounting/reports/profitloss', body),
        fetchApiQuery('/accounting/reports/balancesheet', body),
      ]);
      setLedgerData(ledger);
      setGroupData(group);
      setTrialData(trial);
      setPlData(pl);
      setBsData(bs);
    } catch (e) {
      console.error('Failed to fetch reports:', e);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const handleRefreshToken = async () => {
    setRefreshing(true);
    try {
      await refreshAccessToken();
    } catch (e) {
      console.error(e);
    }
    setRefreshing(false);
  };

  const tokens = getTokens();
  const expiresIn = tokens?.expires_at
    ? Math.max(0, Math.floor((tokens.expires_at * 1000 - Date.now()) / 1000))
    : 0;
  const hasRefresh = !!tokens?.refresh_token;

  const columns = trialData?.columns || [{ key: 'report_1', title: 'This Period', subtitle: '' }];
  const ledgerPie = ledgerPieData(ledgerData);
  const groupPie = Array.isArray(groupData)
    ? groupData.filter((g) => g.level === groupLevel).map((g) => ({ name: g.name, value: Math.abs(g.balance || 0) }))
    : [];
  const maxLevel = Array.isArray(groupData)
    ? Math.max(...groupData.map((g) => g.level), 0)
    : 0;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <div className="header-right">
          <span className="token-status" title={hasRefresh ? 'Refresh token available' : 'No refresh token'}>
            <span className={`status-dot ${hasRefresh ? 'has-refresh' : 'no-refresh'}`} />
            {expiresIn > 0
              ? `${Math.floor(expiresIn / 60)}m ${expiresIn % 60}s`
              : 'Expired'}
          </span>
          <button className="btn btn-sm btn-outline" onClick={handleRefreshToken} disabled={refreshing}>
            {refreshing ? 'Refreshing...' : 'Refresh Token'}
          </button>
          <button className="btn btn-outline" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="tabs">
        {TABS.map((t) => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)}>
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="filter-bar">
            <div className="filter-group">
              <label>Branch</label>
              <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}>
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Reporting Tags</label>
              <div className="tag-selects">
                {reportingTags.map((t) => (
                  <div key={t.id} className="tag-select-row">
                    <span className="tag-label">{t.name}</span>
                    <select
                      value={tagValues[t.id] || ''}
                      onChange={(e) =>
                        setTagValues((prev) => ({
                          ...prev,
                          [t.id]: e.target.value,
                        }))
                      }
                    >
                      <option value="">None</option>
                      {(t.options || []).map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div className="filter-group">
              <label>From</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
            </div>
            <div className="filter-group">
              <label>To</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
            </div>
            <button className="btn btn-primary" onClick={fetchReports} disabled={loading}>
              {loading ? 'Loading...' : 'Fetch Reports'}
            </button>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Ledger Balances</h3>
              {ledgerPie.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={ledgerPie} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                      {ledgerPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-empty">No data — click Fetch Reports</p>
              )}
            </div>
            <div className="chart-card">
              <h3>Group Balances</h3>
              <div className="chart-level-slider">
                <span>Level: {groupLevel}</span>
                <input
                  type="range"
                  min="0"
                  max={maxLevel}
                  value={groupLevel}
                  onChange={(e) => setGroupLevel(Number(e.target.value))}
                />
              </div>
              {groupPie.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={groupPie}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="value" name="Balance">
                      {groupPie.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="chart-empty">No data — click Fetch Reports</p>
              )}
            </div>
          </div>

          <div className="reports-grid">
            <ReportTreeTable data={trialData?.data} columns={columns} title="Trial Balance" />
            <ReportTreeTable data={plData?.data} columns={columns} title="Profit & Loss" />
            <ReportTreeTable data={bsData?.data} columns={columns} title="Balance Sheet" />
          </div>
        </>
      )}

      {activeTab === 'Playground' && <Playground />}
      {activeTab === 'Documentation' && <Documentation />}
    </div>
  );
}
