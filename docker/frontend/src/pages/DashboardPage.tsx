import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  Store, 
  Package, 
  LogOut,
  Plus,
  Eye,
  Users,
  TrendingUp,
  Edit,
  Trash2
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { boutiquesService, productsService, statsService } from '../services/api'

interface Boutique {
  id: string
  societe: string
  ville: string
  pays: string
  categorie: string
  status: string
  vues: number
  visites: number
}

interface Product {
  id: string
  nom: string
  prix: number
  stock: number
  statut: string
  vues: number
}

interface Stats {
  totalBoutiques: number
  totalProducts: number
  totalVuesBoutiques: number
  totalVuesProducts: number
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, logout, checkAuth, setToken } = useAuthStore()
  const [activeTab, setActiveTab] = useState('articles')
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl) {
      setToken(tokenFromUrl)
      navigate('/dashboard', { replace: true })
    }
    checkAuth()
  }, [])

  useEffect(() => {
    if (!user && !searchParams.get('token')) {
      navigate('/')
      return
    }
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [boutiquesRes, statsRes] = await Promise.all([
        boutiquesService.getAll(),
        statsService.getGlobal(),
      ])
      setBoutiques(boutiquesRes.data)
      setStats(statsRes.data)

      if (boutiquesRes.data.length > 0) {
        const productsRes = await productsService.getByBoutique(boutiquesRes.data[0].id)
        setProducts(productsRes.data)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

    const menuItems = [
      { id: 'assistant', label: 'Assistant', emoji: '🤖' },
      { id: 'ajouter', label: 'Ajouter', emoji: '➕' },
      { id: 'articles', label: 'Mes articles', emoji: '📦' },
      { id: 'ventes', label: 'Mes Ventes', emoji: '💰' },
      { id: 'reseaux', label: 'Réseaux sociaux', emoji: '📱' },
      { id: 'infos', label: 'Informations', emoji: 'ℹ️' },
      { id: 'profil', label: 'Mon Profil', emoji: '👤' },
      { id: 'accueil', label: 'Accueil', emoji: '🏠' },
      { id: 'boutique', label: 'Ma Boutique', emoji: '🏪' },
      { id: 'commandes', label: 'Mes Commandes', emoji: '📋' },
      { id: 'avantgout', label: 'Mon Avant-goût', emoji: '👁️' },
    ]

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 bg-dark-light border-r border-dark-medium flex flex-col">
        <div className="p-6 border-b border-dark-medium">
          <Link to="/" className="text-gold text-2xl font-display font-bold">
            ARLink
          </Link>
          <p className="text-gray-400 text-sm mt-1">Espace Artisan</p>
        </div>

                <nav className="flex-1 p-4 overflow-y-auto">
                  <ul className="space-y-1">
                    {menuItems.map((item) => (
                      <li key={item.id}>
                        <button
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                            activeTab === item.id
                              ? 'bg-gold text-dark'
                              : 'text-cream hover:bg-dark-medium hover:text-gold'
                          }`}
                        >
                          <span className="text-lg">{item.emoji}</span>
                          <span>{item.label}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </nav>

        <div className="p-4 border-t border-dark-medium">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gold rounded-full flex items-center justify-center text-dark font-bold">
              {user?.prenom?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-cream font-medium truncate">
                {user?.prenom} {user?.nom}
              </p>
              <p className="text-gray-400 text-sm truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2 text-gray-400 hover:text-cream transition"
          >
            <LogOut className="w-5 h-5" />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
          </div>
        ) : (
          <>
                        {/* Articles Tab */}
                        {activeTab === 'articles' && (
                          <div>
                            <div className="mb-6">
                              <h1 className="text-2xl font-bold mb-2">📦 Mes articles</h1>
                              <p className="text-gray-400">Gérez vos produits, modifiez les prix et suivez vos ventes</p>
                            </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Store className="w-8 h-8 text-gold" />
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +12%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Mes Boutiques</p>
                    <p className="text-cream text-3xl font-bold">{boutiques.length}</p>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Package className="w-8 h-8 text-gold" />
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +8%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Mes Produits</p>
                    <p className="text-cream text-3xl font-bold">{products.length}</p>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Eye className="w-8 h-8 text-gold" />
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +24%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Vues Totales</p>
                    <p className="text-cream text-3xl font-bold">
                      {boutiques.reduce((sum, b) => sum + (b.vues || 0), 0)}
                    </p>
                  </div>

                  <div className="card p-6">
                    <div className="flex items-center justify-between mb-4">
                      <Users className="w-8 h-8 text-gold" />
                      <span className="text-green-500 text-sm flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +15%
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm">Visites</p>
                    <p className="text-cream text-3xl font-bold">
                      {boutiques.reduce((sum, b) => sum + (b.visites || 0), 0)}
                    </p>
                  </div>
                </div>

                {/* Recent Boutiques */}
                <div className="card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-gold font-display text-xl">Mes Boutiques</h2>
                    <button className="btn-gold flex items-center gap-2 text-sm py-2 px-4">
                      <Plus className="w-4 h-4" />
                      Nouvelle Boutique
                    </button>
                  </div>
                  {boutiques.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="text-left text-gray-400 border-b border-dark-medium">
                            <th className="pb-3">Boutique</th>
                            <th className="pb-3">Catégorie</th>
                            <th className="pb-3">Statut</th>
                            <th className="pb-3">Vues</th>
                            <th className="pb-3">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {boutiques.slice(0, 5).map((boutique) => (
                            <tr key={boutique.id} className="border-b border-dark-medium">
                              <td className="py-4">
                                <div>
                                  <p className="text-cream font-medium">{boutique.societe}</p>
                                  <p className="text-gray-400 text-sm">{boutique.ville}, {boutique.pays}</p>
                                </div>
                              </td>
                              <td className="py-4 text-cream">{boutique.categorie}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded text-xs ${
                                  boutique.status === 'active' 
                                    ? 'bg-green-500/20 text-green-500' 
                                    : 'bg-yellow-500/20 text-yellow-500'
                                }`}>
                                  {boutique.status}
                                </span>
                              </td>
                              <td className="py-4 text-cream">{boutique.vues || 0}</td>
                              <td className="py-4">
                                <div className="flex items-center gap-2">
                                  <button className="p-2 text-cream hover:text-gold transition">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 text-cream hover:text-red-500 transition">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Store className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                      <p className="text-gray-400">Vous n'avez pas encore de boutique</p>
                      <button className="btn-gold mt-4">Créer ma première boutique</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutiques Tab */}
            {activeTab === 'boutiques' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-gold font-display text-2xl">Mes Boutiques</h1>
                  <button className="btn-gold flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nouvelle Boutique
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boutiques.map((boutique) => (
                    <div key={boutique.id} className="card p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-dark-medium rounded-lg flex items-center justify-center">
                          <span className="text-3xl">🏪</span>
                        </div>
                        <div>
                          <h3 className="text-cream font-medium">{boutique.societe}</h3>
                          <p className="text-gray-400 text-sm">{boutique.ville}, {boutique.pays}</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{boutique.vues || 0} vues</span>
                        <span className={`px-2 py-1 rounded ${
                          boutique.status === 'active' 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-yellow-500/20 text-yellow-500'
                        }`}>
                          {boutique.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-gold font-display text-2xl">Mes Produits</h1>
                  <button className="btn-gold flex items-center gap-2">
                    <Plus className="w-5 h-5" />
                    Nouveau Produit
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product.id} className="card overflow-hidden">
                      <div className="h-40 bg-dark-medium flex items-center justify-center">
                        <span className="text-5xl">📦</span>
                      </div>
                      <div className="p-4">
                        <h3 className="text-cream font-medium truncate">{product.nom}</h3>
                        <p className="text-gold font-bold mt-2">{product.prix} €</p>
                        <div className="flex items-center justify-between mt-2 text-sm">
                          <span className="text-gray-400">Stock: {product.stock}</span>
                          <span className={`px-2 py-1 rounded ${
                            product.statut === 'active' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {product.statut}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div>
                <h1 className="text-gold font-display text-2xl mb-6">Statistiques</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="card p-6">
                    <h3 className="text-cream font-medium mb-4">Vues par boutique</h3>
                    <div className="space-y-4">
                      {boutiques.map((boutique) => (
                        <div key={boutique.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-gray-400 text-sm">{boutique.societe}</span>
                            <span className="text-cream text-sm">{boutique.vues || 0}</span>
                          </div>
                          <div className="h-2 bg-dark-medium rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gold rounded-full"
                              style={{ width: `${Math.min(100, (boutique.vues || 0) / 10)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="card p-6">
                    <h3 className="text-cream font-medium mb-4">Résumé</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Boutiques</span>
                        <span className="text-cream font-bold">{stats?.totalBoutiques || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Total Produits</span>
                        <span className="text-cream font-bold">{stats?.totalProducts || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Vues Boutiques</span>
                        <span className="text-cream font-bold">{stats?.totalVuesBoutiques || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Vues Produits</span>
                        <span className="text-cream font-bold">{stats?.totalVuesProducts || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <h1 className="text-gold font-display text-2xl mb-6">Paramètres</h1>
                <div className="card p-6 max-w-2xl">
                  <h3 className="text-cream font-medium mb-4">Informations du compte</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-400 text-sm mb-2">Email</label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-dark border border-dark-medium rounded-lg px-4 py-2 text-cream"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Prénom</label>
                        <input
                          type="text"
                          defaultValue={user?.prenom || ''}
                          className="w-full bg-dark border border-dark-medium rounded-lg px-4 py-2 text-cream focus:border-gold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-gray-400 text-sm mb-2">Nom</label>
                        <input
                          type="text"
                          defaultValue={user?.nom || ''}
                          className="w-full bg-dark border border-dark-medium rounded-lg px-4 py-2 text-cream focus:border-gold focus:outline-none"
                        />
                      </div>
                    </div>
                    <button className="btn-gold">Enregistrer</button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
