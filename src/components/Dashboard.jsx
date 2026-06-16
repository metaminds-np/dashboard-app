import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../services/api';
import Playground from './Playground';
import Documentation from './Documentation';
import PieChart from './PieChart';
import BarChart from './BarChart';

const TABS = ['Overview', 'Playground', 'Documentation'];

const MOCK_DATA = {
  users: [
    { source: 'Google', count: 340 },
    { source: 'GitHub', count: 210 },
    { source: 'Email', count: 150 },
    { source: 'Microsoft', count: 95 },
  ],
  requests: [
    { month: 'Jan', success: 120, failed: 12 },
    { month: 'Feb', success: 150, failed: 8 },
    { month: 'Mar', success: 180, failed: 15 },
    { month: 'Apr', success: 220, failed: 10 },
    { month: 'May', success: 190, failed: 6 },
    { month: 'Jun', success: 250, failed: 14 },
  ],
  summary: { totalUsers: 795, totalRequests: 1175, successRate: 94.5 },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [data] = useState(MOCK_DATA);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const { summary, users, requests } = data;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Dashboard</h1>
        <button className="btn btn-outline" onClick={handleLogout}>
          Logout
        </button>
      </header>

      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`tab ${activeTab === t ? 'active' : ''}`}
            onClick={() => setActiveTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === 'Overview' && (
        <>
          <div className="status-bar">
            <div className="stat-card">
              <span className="stat-value">{summary.totalUsers}</span>
              <span className="stat-label">Total Users</span>
            </div>
            <div className="stat-card success">
              <span className="stat-value">{summary.successRate}%</span>
              <span className="stat-label">Success Rate</span>
            </div>
            <div className="stat-card">
              <span className="stat-value">{summary.totalRequests}</span>
              <span className="stat-label">Total Requests</span>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Users by Source</h3>
              <PieChart data={users} />
            </div>
            <div className="chart-card">
              <h3>Requests (Success vs Failed)</h3>
              <BarChart data={requests} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'Playground' && <Playground />}
      {activeTab === 'Documentation' && <Documentation />}
    </div>
  );
}
