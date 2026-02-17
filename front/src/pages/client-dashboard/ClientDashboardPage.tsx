import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Package, User, Star, MapPin, Clock } from 'lucide-react';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { API_BASE_URL } from '../../config/constants';
import { useAuth } from '../../hooks/useAuth';
import './ClientDashboard.css';

interface ClientStats {
  totalOrders: number;
  pendingOrders: number;
  wishlistCount: number;
  reviewsCount: number;
}

const ClientDashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ClientStats>({
    totalOrders: 0,
    pendingOrders: 0,
    wishlistCount: 0,
    reviewsCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('arlink_token');
    if (!token) return;

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_BASE_URL}/orders`, { headers }).then(r => r.ok ? r.json() : { orders: [] }).catch(() => ({ orders: [] })),
      fetch(`${API_BASE_URL}/wishlist`, { headers }).then(r => r.ok ? r.json() : { items: [] }).catch(() => ({ items: [] })),
    ]).then(([ordersData, wishlistData]) => {
      const orders = Array.isArray(ordersData) ? ordersData : ordersData.orders || [];
      const wishlist = Array.isArray(wishlistData) ? wishlistData : wishlistData.items || [];

      setStats({
        totalOrders: orders.length,
        pendingOrders: orders.filter((o: any) => o.status === 'pending' || o.status === 'processing').length,
        wishlistCount: wishlist.length,
        reviewsCount: 0,
      });
      setRecentOrders(orders.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const firstName = (user as any)?.firstName || (user as any)?.first_name || 'Client';

  return (
    <div className="client-dashboard-page">
      <Header variant="default" />

      <div className="client-dashboard-container">
        <div className="client-dashboard-header">
          <div className="client-welcome">
            <h1>Bonjour, {firstName} !</h1>
            <p>Bienvenue sur votre espace client ARLinK</p>
          </div>
        </div>

        <div className="client-stats-grid">
          <div className="client-stat-card">
            <div className="stat-icon-wrap"><Package size={24} /></div>
            <div className="stat-content">
              <h3>{stats.totalOrders}</h3>
              <p>Commandes</p>
            </div>
          </div>
          <div className="client-stat-card">
            <div className="stat-icon-wrap"><Clock size={24} /></div>
            <div className="stat-content">
              <h3>{stats.pendingOrders}</h3>
              <p>En cours</p>
            </div>
          </div>
          <div className="client-stat-card">
            <div className="stat-icon-wrap"><Heart size={24} /></div>
            <div className="stat-content">
              <h3>{stats.wishlistCount}</h3>
              <p>Favoris</p>
            </div>
          </div>
          <div className="client-stat-card">
            <div className="stat-icon-wrap"><Star size={24} /></div>
            <div className="stat-content">
              <h3>{stats.reviewsCount}</h3>
              <p>Avis</p>
            </div>
          </div>
        </div>

        <div className="client-quick-actions">
          <h2>Actions rapides</h2>
          <div className="quick-actions-grid">
            <Link to="/orders" className="quick-action-card">
              <Package size={20} />
              <span>Mes commandes</span>
            </Link>
            <Link to="/wishlist" className="quick-action-card">
              <Heart size={20} />
              <span>Ma liste de souhaits</span>
            </Link>
            <Link to="/cart" className="quick-action-card">
              <ShoppingBag size={20} />
              <span>Mon panier</span>
            </Link>
            <Link to="/profile" className="quick-action-card">
              <User size={20} />
              <span>Mon profil</span>
            </Link>
            <Link to="/stores" className="quick-action-card">
              <MapPin size={20} />
              <span>Explorer les boutiques</span>
            </Link>
          </div>
        </div>

        {recentOrders.length > 0 && (
          <div className="client-recent-orders">
            <h2>Commandes recentes</h2>
            <div className="orders-list">
              {recentOrders.map((order: any, idx: number) => (
                <Link to={`/orders/${order.id}`} key={order.id || idx} className="order-item">
                  <div className="order-info">
                    <span className="order-id">#{order.orderNumber || order.id?.slice(0, 8)}</span>
                    <span className="order-date">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${order.status}`}>{order.status}</span>
                    <span className="order-total">{order.total ? `${order.total.toFixed(2)} EUR` : ''}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ClientDashboardPage;
