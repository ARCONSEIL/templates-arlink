import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, Users, Store, Package, ShoppingCart, Shield, TrendingUp, Settings, Home, Euro, CheckCircle, UserPlus, AlertTriangle, FileText } from 'lucide-react';
import { API_BASE_URL } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import './AdminDashboard.css';

interface DashboardStats {
  users: {
    total: number;
    artisans: number;
    clients: number;
    admins: number;
  };
  shops: {
    total: number;
    pending: number;
    active: number;
    suspended: number;
  };
  products: {
    total: number;
    active: number;
    outOfStock: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
  };
}

const AdminDashboardPage = () => {
  const location = useLocation();
  const { user, hasRole, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Check admin permissions
  const isSuperAdmin = hasRole('super_admin');
  const isModerator = hasRole('moderator') || isAdmin;

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('arlink_token');
      
      const response = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      // Use mock data for development
      setStats({
        users: { total: 1250, artisans: 156, clients: 1090, admins: 4 },
        shops: { total: 156, pending: 12, active: 140, suspended: 4 },
        products: { total: 3420, active: 2890, outOfStock: 530 },
        orders: { total: 4580, pending: 45, completed: 4500, revenue: 125000 },
        revenue: { total: 125000, thisMonth: 15000, lastMonth: 14200 },
      });
    } finally {
      setLoading(false);
    }
  };

  const navItems: { path: string; label: string; icon: React.ReactNode; exact?: boolean }[] = [
    { path: '/admin', label: 'Dashboard', icon: <BarChart3 size={18} />, exact: true },
    { path: '/admin/users', label: 'Users', icon: <Users size={18} /> },
    { path: '/admin/shops', label: 'Shops', icon: <Store size={18} /> },
    { path: '/admin/products', label: 'Products', icon: <Package size={18} /> },
    { path: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
    { path: '/admin/moderation', label: 'Moderation', icon: <Shield size={18} /> },
    { path: '/admin/content', label: 'Contenu', icon: <FileText size={18} /> },
    { path: '/admin/analytics', label: 'Analytics', icon: <TrendingUp size={18} /> },
    { path: '/admin/settings', label: 'Settings', icon: <Settings size={18} /> },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  if (!isModerator) {
    return (
      <div className="admin-access-denied">
        <h1>Access Denied</h1>
        <p>You don't have permission to access the admin dashboard.</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
          <button 
            className="collapse-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? '→' : '←'}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span className="nav-label">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <Link to="/dashboard" className="nav-item">
            <span className="nav-icon"><Home size={18} /></span>
            {!sidebarCollapsed && <span className="nav-label">Back to Artisan Dashboard</span>}
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-left">
            <h1>Platform Administration</h1>
            <p>Manage users, shops, and platform content</p>
          </div>
          <div className="header-right">
            <span className="admin-badge">
              {isSuperAdmin ? 'Super Admin' : isAdmin ? 'Admin' : 'Moderator'}
            </span>
            <span className="user-name">{user?.first_name} {user?.last_name}</span>
          </div>
        </header>

        {location.pathname === '/admin' ? (
          /* Dashboard Overview */
          <div className="admin-content">
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading statistics...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={fetchStats}>Retry</button>
              </div>
            ) : stats ? (
              <>
                {/* Stats Cards */}
                <div className="stats-grid">
                  <div className="stat-card users">
                    <div className="stat-icon"><Users size={24} /></div>
                    <div className="stat-info">
                      <h3>Total Users</h3>
                      <p className="stat-value">{stats.users.total.toLocaleString()}</p>
                      <div className="stat-breakdown">
                        <span>Artisans: {stats.users.artisans}</span>
                        <span>Clients: {stats.users.clients}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card shops">
                    <div className="stat-icon"><Store size={24} /></div>
                    <div className="stat-info">
                      <h3>Total Shops</h3>
                      <p className="stat-value">{stats.shops.total}</p>
                      <div className="stat-breakdown">
                        <span className="pending">Pending: {stats.shops.pending}</span>
                        <span className="active">Active: {stats.shops.active}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card products">
                    <div className="stat-icon"><Package size={24} /></div>
                    <div className="stat-info">
                      <h3>Total Products</h3>
                      <p className="stat-value">{stats.products.total.toLocaleString()}</p>
                      <div className="stat-breakdown">
                        <span>Active: {stats.products.active}</span>
                        <span>Out of Stock: {stats.products.outOfStock}</span>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card revenue">
                    <div className="stat-icon"><Euro size={24} /></div>
                    <div className="stat-info">
                      <h3>Total Revenue</h3>
                      <p className="stat-value">€{stats.revenue.total.toLocaleString()}</p>
                      <div className="stat-breakdown">
                        <span>This Month: €{stats.revenue.thisMonth.toLocaleString()}</span>
                        <span>Last Month: €{stats.revenue.lastMonth.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                  <h2>Quick Actions</h2>
                  <div className="actions-grid">
                    <Link to="/admin/users?action=approve" className="action-card">
                      <span className="action-icon"><CheckCircle size={20} /></span>
                      <span className="action-label">Approve Users</span>
                    </Link>
                    <Link to="/admin/shops?status=pending" className="action-card">
                      <span className="action-icon"><Store size={20} /></span>
                      <span className="action-label">Review Shops</span>
                    </Link>
                    <Link to="/admin/moderation" className="action-card">
                      <span className="action-icon"><Shield size={20} /></span>
                      <span className="action-label">Content Moderation</span>
                    </Link>
                    <Link to="/admin/analytics" className="action-card">
                      <span className="action-icon"><BarChart3 size={20} /></span>
                      <span className="action-label">View Reports</span>
                    </Link>
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="recent-activity">
                  <h2>Recent Activity</h2>
                  <div className="activity-list">
                    <div className="activity-item">
                      <span className="activity-icon"><UserPlus size={18} /></span>
                      <div className="activity-info">
                        <p>New artisan registration: <strong>Marie Artisan</strong></p>
                        <span className="activity-time">2 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon"><Store size={18} /></span>
                      <div className="activity-info">
                        <p>Shop pending approval: <strong>Boulangerie Paris</strong></p>
                        <span className="activity-time">4 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon"><AlertTriangle size={18} /></span>
                      <div className="activity-info">
                        <p>Flagged review reported for review #4521</p>
                        <span className="activity-time">6 hours ago</span>
                      </div>
                    </div>
                    <div className="activity-item">
                      <span className="activity-icon"><Euro size={18} /></span>
                      <div className="activity-info">
                        <p>New order: <strong>#ORD-2024-4580</strong></p>
                        <span className="activity-time">8 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        ) : (
          <Outlet />
        )}
      </main>
    </div>
  );
};

export default AdminDashboardPage;

