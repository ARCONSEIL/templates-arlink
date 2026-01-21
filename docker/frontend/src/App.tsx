import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import GaleriePage from './pages/GaleriePage'
import BoutiquePage from './pages/BoutiquePage'
import CartPage from './pages/CartPage'
import DashboardPage from './pages/DashboardPage'
import DashboardArtisanPage from './pages/DashboardArtisanPage'
import DashboardClientPage from './pages/DashboardClientPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import SuperAdminDashboardPage from './pages/SuperAdminDashboardPage'
import RegisterPage from './pages/RegisterPage'

// Check if we're on a subdomain (e.g., darnhas.arlink.online)
function getSubdomain(): string | null {
  const hostname = window.location.hostname
  // Match subdomains like xxx.arlink.online but not www.arlink.online or arlink.online
  const match = hostname.match(/^(?!www\.)([a-z0-9-]+)\.arlink\.online$/i)
  if (match && match[1] !== 'api' && match[1] !== 'v2' && match[1] !== 'expo' && match[1] !== 'harrama') {
    return match[1]
  }
  return null
}

function App() {
  const subdomain = getSubdomain()
  
  // If we're on a boutique subdomain, show the boutique page
  if (subdomain) {
    return <BoutiquePage subdomain={subdomain} />
  }
  
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/galerie" element={<GaleriePage />} />
      <Route path="/galerie/:categorie" element={<GaleriePage />} />
      <Route path="/boutique/:id" element={<BoutiquePage />} />
      <Route path="/panier" element={<CartPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/dashboard/artisan" element={<DashboardArtisanPage />} />
            <Route path="/dashboard/artisan/:boutiqueName" element={<DashboardArtisanPage />} />
            <Route path="/dashboard/client" element={<DashboardClientPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/super-admin" element={<SuperAdminDashboardPage />} />
            <Route path="/login" element={<Navigate to="/" replace />} />
            <Route path="/register" element={<RegisterPage />} />
    </Routes>
  )
}

export default App
