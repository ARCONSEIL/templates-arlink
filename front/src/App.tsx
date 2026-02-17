import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ProtectedRoute } from './components/ProtectedRoute';
import { GuestRoute } from './components/GuestRoute';
import { AccessibilityWrapper } from './components/Accessibility';
import { OrganizationJsonLd } from './components/SEO';
import ChatbotWidget from './components/chatbot/ChatbotWidget';
import { ROUTES } from './config/constants';
import './App.css';

// Lazy loading for code splitting - improves initial load time
const HomePage = lazy(() => import('./pages/homepage/HomePage'));
const StoresExhibitionPage = lazy(() => import('./pages/stores-exhibition/StoresExhibitionPage'));
const VerifyPage = lazy(() => import('./pages/verifypage/VerifyPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const AdminLoginPage = lazy(() => import('./pages/admin-login/AdminLoginPage'));
const ShopPage = lazy(() => import('./pages/shop/ShopPage'));
const ProductsPage = lazy(() => import('./pages/products/ProductsPage'));
const ProductDetailPage = lazy(() => import('./pages/products/ProductDetailPage'));
const ProfilePage = lazy(() => import('./pages/profile/ProfilePage'));
const OrdersPage = lazy(() => import('./pages/orders/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/orders/OrderDetailPage'));
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout'));
const StatsPage = lazy(() => import('./pages/dashboard/StatsPage'));
const DashboardProductsPage = lazy(() => import('./pages/dashboard/ProductsPage'));
const DashboardShopPage = lazy(() => import('./pages/dashboard/ShopPage'));
const DashboardOrdersPage = lazy(() => import('./pages/dashboard/OrdersPage'));
const DashboardMessagesPage = lazy(() => import('./pages/dashboard/MessagesPage'));
const DashboardAnalyticsPage = lazy(() => import('./pages/dashboard/AnalyticsPage'));
const DashboardNotificationsPage = lazy(() => import('./pages/dashboard/NotificationsPage'));
const DashboardReviewsPage = lazy(() => import('./pages/dashboard/ReviewsPage'));
const DashboardVerificationPage = lazy(() => import('./pages/dashboard/VerificationPage'));
const DashboardSettingsPage = lazy(() => import('./pages/dashboard/SettingsPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const WishlistPage = lazy(() => import('./pages/wishlist/WishlistPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const UserManagementPage = lazy(() => import('./pages/admin/users').then(m => ({ default: m.UserManagementPage })));
const ShopManagementPage = lazy(() => import('./pages/admin/shops').then(m => ({ default: m.ShopManagementPage })));
const ModerationPage = lazy(() => import('./pages/admin/moderation').then(m => ({ default: m.ModerationPage })));
const AnalyticsPage = lazy(() => import('./pages/admin/analytics').then(m => ({ default: m.AnalyticsPage })));
const SettingsPage = lazy(() => import('./pages/admin/settings').then(m => ({ default: m.SettingsPage })));
const ContentManagementPage = lazy(() => import('./pages/admin/content').then(m => ({ default: m.ContentManagementPage })));
const ClientDashboardPage = lazy(() => import('./pages/client-dashboard/ClientDashboardPage'));
const PromoPage = lazy(() => import('./pages/promo/PromoPage'));
const ConditionsPage = lazy(() => import('./pages/legal/ConditionsPage'));
const PrivacyPolicyPage = lazy(() => import('./pages/legal/PrivacyPolicyPage'));

// Loading fallback component
function LoadingFallback() {
  return (
    <div className="loading-fallback" role="status" aria-label="Chargement en cours">
      <div className="spinner" aria-hidden="true"></div>
      <span className="sr-only">Chargement...</span>
    </div>
  );
}

// SEO Meta tags component
function SEO() {
  return (
    <>
      <title>ARLinK - L'Artisanat Mondial</title>
      <meta name="description" content="ARLinK - La plateforme mondiale de l'artisanat authentique. Découvrez des produits uniques créés par des artisans du monde entier." />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* Open Graph */}
      <meta property="og:title" content="ARLinK - L'Artisanat Mondial" />
      <meta property="og:description" content="La plateforme mondiale de l'artisanat authentique." />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://arlink.online" />
      <meta property="og:image" content="/logo-trans.png" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="ARLinK - L'Artisanat Mondial" />
      <meta name="twitter:description" content="La plateforme mondiale de l'artisanat authentique." />
      <meta name="twitter:image" content="/logo-trans.png" />
      
      {/* PWA */}
      <meta name="theme-color" content="#C9A961" />
      <link rel="canonical" href="https://arlink.online" />
    </>
  );
}

// Organization structured data for SEO
function OrganizationData() {
  return (
    <OrganizationJsonLd
      organization={{
        name: 'ARLinK',
        url: 'https://arlink.online',
        logo: 'https://arlink.online/logo-trans.png',
        description: 'La plateforme mondiale de l\'artisanat authentique. Découvrez des produits uniques créés par des artisans du monde entier.',
        email: 'contact@arlink.online',
        socialLinks: {
          facebook: 'https://facebook.com/arlink',
          instagram: 'https://instagram.com/arlink',
          twitter: 'https://x.com/arlink',
          tiktok: 'https://tiktok.com/@arlink',
        },
      }}
    />
  );
}

function AppRoutes() {
  const [isSubdomain, setIsSubdomain] = useState(false);
  const [isAdminSubdomain, setIsAdminSubdomain] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    // Check if it's the admin subdomain
    const adminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.arlink.online';
    // Check if it's any other subdomain (shop)
    const shopSubdomain = hostname.split('.').length > 2 &&
                      !hostname.startsWith('www.') &&
                      !hostname.startsWith('api.') &&
                      !hostname.startsWith('admin.') &&
                      !hostname.startsWith('dev.');
    setIsAdminSubdomain(adminSubdomain);
    setIsSubdomain(shopSubdomain);
  }, []);

  // Admin subdomain routes (admin.arlink.online)
  if (isAdminSubdomain) {
    return (
      <AccessibilityWrapper mainId="admin-main">
        <Routes>
          <Route path="/login" element={<AdminLoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
          <Route element={<ProtectedRoute requiredRole="admin" redirectTo="/login" />}>
            <Route path="*" element={<AdminDashboardPage />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="users" element={<UserManagementPage />} />
              <Route path="shops" element={<ShopManagementPage />} />
              <Route path="products" element={<div className="admin-subpage"><h1>Product Management</h1><p>Coming soon...</p></div>} />
              <Route path="orders" element={<div className="admin-subpage"><h1>Order Management</h1><p>Coming soon...</p></div>} />
              <Route path="moderation" element={<ModerationPage />} />
              <Route path="content" element={<ContentManagementPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Route>
        </Routes>
      </AccessibilityWrapper>
    );
  }

  // Shop subdomain routes (shop1.arlink.online, etc.)
  if (isSubdomain) {
    return (
      <AccessibilityWrapper mainId="shop-main">
        <Routes>
          <Route path="*" element={<ShopPage />} />
        </Routes>
      </AccessibilityWrapper>
    );
  }

  // Main domain routes (arlink.online)
  return (
    <AccessibilityWrapper mainId="app-main">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/stores" element={<StoresExhibitionPage />} />
        <Route path="/category/:categoryId" element={<StoresExhibitionPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/product/:id" element={<ProductDetailPage />} />
        <Route path="/auth/verify" element={<VerifyPage />} />
        <Route path="/terms" element={<ConditionsPage />} />
        <Route path="/conditions" element={<ConditionsPage />} />
        <Route path="/cgu" element={<ConditionsPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/confidentialite" element={<PrivacyPolicyPage />} />
        <Route path="/promo/:slug" element={<PromoPage />} />

        {/* Guest Routes (only for non-authenticated users) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin-login" element={<AdminLoginPage />} />
        </Route>

        {/* Protected Routes - Require Authentication */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
          <Route path="/client-dashboard" element={<ClientDashboardPage />} />
        </Route>

        {/* Artisan Dashboard Routes - Require Artisan Role */}
        <Route element={<ProtectedRoute requiredRole="artisan" />}>
          <Route path="/dashboard" element={<DashboardLayout><StatsPage /></DashboardLayout>} />
          <Route path="/dashboard/products" element={<DashboardLayout><DashboardProductsPage /></DashboardLayout>} />
          <Route path="/dashboard/shop" element={<DashboardLayout><DashboardShopPage /></DashboardLayout>} />
          <Route path="/dashboard/orders" element={<DashboardLayout><DashboardOrdersPage /></DashboardLayout>} />
          <Route path="/dashboard/messages" element={<DashboardLayout><DashboardMessagesPage /></DashboardLayout>} />
          <Route path="/dashboard/analytics" element={<DashboardLayout><DashboardAnalyticsPage /></DashboardLayout>} />
          <Route path="/dashboard/notifications" element={<DashboardLayout><DashboardNotificationsPage /></DashboardLayout>} />
          <Route path="/dashboard/reviews" element={<DashboardLayout><DashboardReviewsPage /></DashboardLayout>} />
          <Route path="/dashboard/verification" element={<DashboardLayout><DashboardVerificationPage /></DashboardLayout>} />
          <Route path="/dashboard/settings" element={<DashboardLayout><DashboardSettingsPage /></DashboardLayout>} />
        </Route>

        {/* Admin Dashboard Routes - Require Admin/Moderator Role */}
        <Route element={<ProtectedRoute requiredRole="admin" />}>
          <Route path="/admin" element={<AdminDashboardPage />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<UserManagementPage />} />
            <Route path="shops" element={<ShopManagementPage />} />
            <Route path="products" element={<div className="admin-subpage"><h1>Product Management</h1><p>Coming soon...</p></div>} />
            <Route path="orders" element={<div className="admin-subpage"><h1>Order Management</h1><p>Coming soon...</p></div>} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="content" element={<ContentManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to={ROUTES.HOME} replace />} />
      </Routes>
    </AccessibilityWrapper>
  );
}

function ChatbotConditional() {
  const location = useLocation();
  const hostname = window.location.hostname;
  const isAdminSubdomain = hostname.startsWith('admin.') || hostname === 'admin.arlink.online';
  const isDashboard = location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/admin');

  if (isAdminSubdomain || isDashboard) return null;
  return <ChatbotWidget />;
}

function App() {
  return (
    <Router>
      <SEO />
      <OrganizationData />
      <Suspense fallback={<LoadingFallback />}>
        <AppRoutes />
      </Suspense>
      <ChatbotConditional />
    </Router>
  );
}

export default App;
