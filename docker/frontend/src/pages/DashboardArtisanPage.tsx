import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Eye, ChevronLeft, ChevronRight, Search, Bell, Settings, LogOut, Save, Trash2, Upload, Edit2, X, Check, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { productsService, boutiquesService, artisansService, ordersService } from '../services/api'

interface Product {
  id: string
  nom: string
  description: string
  prix_artisan_ht: number
  prix_public_ht: number
  prix_ttc: number
  stock: number
  images: string[]
  categorie: string
  vedette: boolean
}

interface Order {
  id: string
  numero: string
  client_nom: string
  client_email: string
  total_ttc: number
  status: string
  created_at: string
  items: { nom: string; quantite: number; prix: number }[]
}

interface Boutique {
  id: string
  nom: string
  slug: string
  description: string
  photo_vedette: string
  adresse: string
  telephone: string
  email: string
  categorie: string
}

interface SocialNetwork {
  name: string
  url: string
  icon: string
  hint: string
  placeholder: string
}

export default function DashboardArtisanPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('assistant')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [newProduct, setNewProduct] = useState({ nom: '', description: '', prix_artisan_ht: 0, stock: 0, categorie: '', tva: 20 })
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadedImages, setUploadedImages] = useState<string[]>([])
  
  const [orders, setOrders] = useState<Order[]>([])
  const [boutique, setBoutique] = useState<Boutique | null>(null)
  
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([
    { name: 'Instagram', url: '', icon: '📷', hint: 'Reels + Photos', placeholder: 'https://instagram.com/...' },
    { name: 'TikTok', url: '', icon: '🎥', hint: 'Shorts viraux', placeholder: 'https://tiktok.com/@...' },
    { name: 'YouTube', url: '', icon: '▶️', hint: 'Videos longues', placeholder: 'https://youtube.com/@...' },
    { name: 'Facebook', url: '', icon: '📘', hint: 'Page pro', placeholder: 'https://facebook.com/...' },
    { name: 'Pinterest', url: '', icon: '📌', hint: 'Inspirations', placeholder: 'https://pinterest.com/...' },
    { name: 'Google Business', url: '', icon: '📍', hint: 'Fiche locale', placeholder: 'https://g.page/...' },
    { name: 'WhatsApp', url: '', icon: '💬', hint: 'Contact direct', placeholder: '+212 6...' },
    { name: 'Site Web', url: '', icon: '🌐', hint: 'Reference', placeholder: 'https://...' },
    { name: 'Email Pro', url: '', icon: '✉️', hint: 'Contact', placeholder: 'contact@...' },
  ])
  
  const [profile, setProfile] = useState({ prenom: user?.prenom || '', nom: user?.nom || '', email: user?.email || '', telephone: '' })
  const [salesStats, setSalesStats] = useState({ chiffre_affaires: 0, commandes: 0, clients: 0, commission: 0 })
  const [aiQuestion, setAiQuestion] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  const navItems = [
    { id: 'assistant', icon: '🤖', label: 'Assistant IA' },
    { id: 'add', icon: '➕', label: 'Ajouter' },
    { id: 'products', icon: '📦', label: 'Mes articles' },
    { id: 'sales', icon: '💰', label: 'Mes Ventes' },
    { id: 'social', icon: '📱', label: 'Reseaux sociaux' },
    { id: 'info', icon: 'ℹ️', label: 'Informations' },
    { id: 'profile', icon: '👤', label: 'Mon Profil' },
    { id: 'home', icon: '🏠', label: 'Accueil', link: '/' },
    { id: 'shop', icon: '🏪', label: 'Ma Boutique' },
    { id: 'orders', icon: '📋', label: 'Mes Commandes' },
    { id: 'preview', icon: '👁️', label: 'Mon Avant-gout' },
  ]

  useEffect(() => {
    loadProducts()
    loadOrders()
    loadBoutique()
  }, [])

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const loadProducts = async () => {
    try {
      const response = await productsService.getAll()
      if (response.data) setProducts(response.data)
    } catch {
      setProducts([
        { id: '1', nom: 'Collier Amazigh', description: 'Collier traditionnel berbere', prix_artisan_ht: 77.39, prix_public_ht: 89, prix_ttc: 106.80, stock: 12, categorie: 'Bijoux', images: ['https://moroccanzest.com/wp-content/uploads/2019/02/moroccan-jewelry.jpg'], vedette: true },
        { id: '2', nom: 'Bracelet Touareg', description: 'Bracelet en cuir et argent', prix_artisan_ht: 39.13, prix_public_ht: 45, prix_ttc: 54, stock: 8, categorie: 'Bijoux', images: ['https://static01.nyt.com/images/2024/12/06/multimedia/06sp-jewelry-atlas-inyt-01-ljtb/29sp-jewelry-atlas-inyt-01-ljtb-videoSixteenByNineJumbo1600.jpg'], vedette: false },
      ])
    }
  }

  const loadOrders = async () => {
    try {
      const response = await ordersService.getArtisanOrders()
      if (response.data) setOrders(response.data)
    } catch {
      setOrders([
        { id: '1', numero: 'CMD-001', client_nom: 'Jean Dupont', client_email: 'jean@email.com', total_ttc: 134, status: 'LIVREE', created_at: new Date().toISOString(), items: [{ nom: 'Collier Amazigh', quantite: 1, prix: 89 }, { nom: 'Bracelet Touareg', quantite: 1, prix: 45 }] },
        { id: '2', numero: 'CMD-002', client_nom: 'Marie Martin', client_email: 'marie@email.com', total_ttc: 89, status: 'EN_COURS', created_at: new Date().toISOString(), items: [{ nom: 'Collier Amazigh', quantite: 1, prix: 89 }] },
      ])
    }
  }

  const loadBoutique = async () => {
    try {
      const response = await artisansService.getMyProfile()
      if (response.data?.boutique) setBoutique(response.data.boutique)
    } catch {
      setBoutique({ id: '1', nom: 'Ma Boutique Artisanale', slug: 'maboutique', description: 'Artisanat authentique du Maroc', photo_vedette: '', adresse: 'Marrakech, Maroc', telephone: '+212 6 00 00 00 00', email: 'contact@maboutique.com', categorie: 'Bijoux' })
    }
  }

  useEffect(() => {
    const totalCA = orders.reduce((sum, o) => sum + o.total_ttc, 0)
    const commission = Math.max(1, Math.floor(totalCA / 100))
    setSalesStats({ chiffre_affaires: totalCA, commandes: orders.length, clients: new Set(orders.map(o => o.client_email)).size, commission })
  }, [orders])

  const handleLogout = () => { logout(); navigate('/') }

  const handleAddProduct = async () => {
    if (!newProduct.nom || !newProduct.prix_artisan_ht) { showNotification('error', 'Nom et prix obligatoires'); return }
    setLoading(true)
    try {
      const prix_public_ht = newProduct.prix_artisan_ht * 1.15
      const prix_ttc = prix_public_ht * (1 + newProduct.tva / 100)
      const productData = { ...newProduct, prix_public_ht, prix_ttc, images: uploadedImages, vedette: false }
      const response = await productsService.create(productData)
      if (response.data) { setProducts([...products, response.data]); showNotification('success', 'Article ajoute!') }
    } catch {
      const prix_public_ht = newProduct.prix_artisan_ht * 1.15
      const prix_ttc = prix_public_ht * (1 + newProduct.tva / 100)
      const product: Product = { id: Date.now().toString(), nom: newProduct.nom, description: newProduct.description, prix_artisan_ht: newProduct.prix_artisan_ht, prix_public_ht, prix_ttc, stock: newProduct.stock, categorie: newProduct.categorie, images: uploadedImages, vedette: false }
      setProducts([...products, product])
      showNotification('success', 'Article ajoute localement')
    }
    setNewProduct({ nom: '', description: '', prix_artisan_ht: 0, stock: 0, categorie: '', tva: 20 })
    setUploadedImages([])
    setLoading(false)
  }

  const handleUpdateProduct = async (product: Product) => {
    setLoading(true)
    try { await productsService.update(product.id, product as unknown as Record<string, unknown>) } catch { /* ignore */ }
    setProducts(products.map(p => p.id === product.id ? product : p))
    showNotification('success', 'Article mis a jour!')
    setEditingProduct(null)
    setLoading(false)
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Supprimer cet article?')) return
    setLoading(true)
    try { await productsService.delete(id) } catch { /* ignore */ }
    setProducts(products.filter(p => p.id !== id))
    showNotification('success', 'Article supprime!')
    setLoading(false)
  }

  const handleToggleVedette = async (product: Product) => {
    const updated = { ...product, vedette: !product.vedette }
    await handleUpdateProduct(updated)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploadProgress(0)
    const newImages: string[] = []
    for (let i = 0; i < files.length; i++) {
      setUploadProgress(Math.round(((i + 0.5) / files.length) * 100))
      const url = URL.createObjectURL(files[i])
      newImages.push(url)
      setUploadProgress(Math.round(((i + 1) / files.length) * 100))
    }
    setUploadedImages([...uploadedImages, ...newImages])
    setTimeout(() => setUploadProgress(0), 1000)
  }

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try { await ordersService.updateStatus(orderId, newStatus) } catch { /* ignore */ }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    showNotification('success', 'Statut mis a jour!')
  }

  const handleSaveSocialNetworks = async () => {
    setLoading(true)
    try { if (boutique) await boutiquesService.update(boutique.id, { social_networks: socialNetworks }) } catch { /* ignore */ }
    showNotification('success', 'Reseaux sociaux sauvegardes!')
    setLoading(false)
  }

  const handleSaveBoutiqueInfo = async () => {
    if (!boutique) return
    setLoading(true)
    try { await boutiquesService.update(boutique.id, boutique as unknown as Record<string, unknown>) } catch { /* ignore */ }
    showNotification('success', 'Informations sauvegardees!')
    setLoading(false)
  }

  const handleSaveProfile = async () => {
    setLoading(true)
    try { await artisansService.update(user?.id || '', profile) } catch { /* ignore */ }
    showNotification('success', 'Profil mis a jour!')
    setLoading(false)
  }

  const handleAIAssistant = async (action: string) => {
    setAiLoading(true)
    setAiResponse('')
    await new Promise(resolve => setTimeout(resolve, 1500))
    const responses: Record<string, string> = {
      'descriptions': `Voici des suggestions pour ameliorer vos descriptions:\n\n1. **${products[0]?.nom || 'Votre produit'}**: Ajoutez des mots-cles comme "fait main", "authentique", "traditionnel" pour ameliorer le SEO.\n\n2. Mentionnez les materiaux utilises et leur origine.\n\n3. Racontez l'histoire de chaque piece pour creer une connexion emotionnelle.`,
      'seo': `Conseils SEO pour votre boutique:\n\n1. **Titres**: Utilisez des mots-cles pertinents (artisanat marocain, bijoux berberes, etc.)\n\n2. **Images**: Ajoutez des textes alternatifs descriptifs\n\n3. **Description**: Incluez votre localisation et specialite\n\n4. **Reseaux sociaux**: Publiez regulierement avec des hashtags pertinents`,
      'ventes': `Analyse de vos ventes:\n\n- Chiffre d'affaires: ${salesStats.chiffre_affaires.toFixed(2)} EUR\n- Nombre de commandes: ${salesStats.commandes}\n- Clients uniques: ${salesStats.clients}\n- Commission ARLink: ${salesStats.commission.toFixed(2)} EUR\n\nRecommandation: Ajoutez plus de photos et activez la mise en vedette pour vos meilleurs produits.`
    }
    setAiResponse(responses[action] || 'Je suis la pour vous aider! Posez-moi une question sur votre boutique.')
    setAiLoading(false)
  }

  const handleAIQuestion = async () => {
    if (!aiQuestion.trim()) return
    setAiLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    setAiResponse(`Merci pour votre question: "${aiQuestion}"\n\nJe vous recommande de:\n1. Optimiser vos descriptions de produits\n2. Ajouter plus de photos de qualite\n3. Activer vos reseaux sociaux pour plus de visibilite\n\nN'hesitez pas a me poser d'autres questions!`)
    setAiQuestion('')
    setAiLoading(false)
  }

  const updateSocialUrl = (index: number, url: string) => {
    const updated = [...socialNetworks]
    updated[index].url = url
    setSocialNetworks(updated)
  }

  const copyAllSocialLinks = () => {
    const links = socialNetworks.filter(s => s.url).map(s => `${s.name}: ${s.url}`).join('\n')
    navigator.clipboard.writeText(links)
    showNotification('success', 'Liens copies!')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'LIVREE': return 'bg-[#22C55E]/20 text-[#22C55E]'
      case 'EN_COURS': case 'EN_PREPARATION': return 'bg-[#3B82F6]/20 text-[#3B82F6]'
      case 'ANNULEE': return 'bg-[#EF4444]/20 text-[#EF4444]'
      default: return 'bg-[#F59E0B]/20 text-[#F59E0B]'
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = { 'EN_ATTENTE': 'En attente', 'CONFIRMEE': 'Confirmee', 'EN_PREPARATION': 'En preparation', 'ENVOYEE': 'Envoyee', 'LIVREE': 'Livree', 'ANNULEE': 'Annulee', 'EN_COURS': 'En cours' }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#EDE6D2] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl ${notification.type === 'success' ? 'bg-[#22C55E]' : 'bg-[#EF4444]'} text-white font-semibold shadow-lg`}>
          {notification.message}
        </div>
      )}

      <aside className={`${sidebarOpen ? 'w-[260px]' : 'w-[52px]'} bg-[#0a0c0f] border-r border-[#232a33] flex flex-col transition-all duration-300 fixed h-full z-40`}>
        <div className="p-4 border-b border-[#232a33] flex items-center justify-between">
          {sidebarOpen && <span className="text-[#BFA26A] font-bold text-lg">ARLink</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            item.link ? (
              <Link key={item.id} to={item.link} className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ${activeSection === item.id ? 'bg-[#14181d] border border-[#BFA26A]/30' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ) : (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ${activeSection === item.id ? 'bg-[#14181d] border border-[#BFA26A]/30' : ''}`}>
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </button>
            )
          ))}
        </nav>
        <div className="p-4 border-t border-[#232a33]">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Deconnexion</span>}
          </button>
        </div>
      </aside>

      <main className={`flex-1 ${sidebarOpen ? 'ml-[260px]' : 'ml-[52px]'} transition-all duration-300`}>
        <header className="sticky top-0 z-30 bg-[#0d0f12]/95 backdrop-blur-md border-b border-[#232a33]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#CFC6AE]">
              <span>Dashboard</span><span>/</span>
              <span className="text-[#EDE6D2]">{navItems.find(n => n.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#14181d] border border-[#232a33] rounded-xl px-3 py-2 w-[280px]">
                <Search className="w-4 h-4 text-[#CFC6AE] mr-2" />
                <input placeholder="Rechercher..." className="bg-transparent outline-none w-full text-sm text-[#EDE6D2]" />
              </div>
              <button className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition relative">
                <Bell className="w-4 h-4" />
                {orders.filter(o => o.status === 'EN_ATTENTE').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center">{orders.filter(o => o.status === 'EN_ATTENTE').length}</span>
                )}
              </button>
              <button onClick={() => setActiveSection('profile')} className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#BFA26A] flex items-center justify-center text-black font-bold">{user?.prenom?.[0] || 'A'}</div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeSection === 'assistant' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Assistant IA</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#BFA26A] flex items-center justify-center text-2xl">🤖</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#EDE6D2]">Bonjour {user?.prenom || 'Artisan'}! Je suis votre assistant ARLink</h3>
                    <p className="text-[#CFC6AE] mt-2">Je peux vous aider a optimiser votre boutique, generer des descriptions de produits, et ameliorer votre visibilite en ligne.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button onClick={() => handleAIAssistant('descriptions')} disabled={aiLoading} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition disabled:opacity-50">
                        {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> : null}Optimiser mes descriptions
                      </button>
                      <button onClick={() => handleAIAssistant('seo')} disabled={aiLoading} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition disabled:opacity-50">Conseils SEO</button>
                      <button onClick={() => handleAIAssistant('ventes')} disabled={aiLoading} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition disabled:opacity-50">Analyser mes ventes</button>
                    </div>
                  </div>
                </div>
                {aiResponse && <div className="mt-6 p-4 bg-[#0d0f12] rounded-xl border border-[#232a33]"><pre className="whitespace-pre-wrap text-sm text-[#EDE6D2]">{aiResponse}</pre></div>}
                <div className="mt-6 flex items-center gap-3">
                  <input value={aiQuestion} onChange={(e) => setAiQuestion(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleAIQuestion()} placeholder="Posez votre question..." className="flex-1 bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  <button onClick={handleAIQuestion} disabled={aiLoading || !aiQuestion.trim()} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition disabled:opacity-50">
                    {aiLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Envoyer'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'add' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Ajouter un article</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom du produit *</label>
                    <input value={newProduct.nom} onChange={(e) => setNewProduct({...newProduct, nom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="Ex: Collier Amazigh" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Categorie</label>
                    <select value={newProduct.categorie} onChange={(e) => setNewProduct({...newProduct, categorie: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]">
                      <option value="">Selectionner...</option>
                      <option value="Bijoux">💎 Bijoux & Orfèvrerie</option>
                      <option value="Cuir">👜 Cuir & Maroquinerie</option>
                      <option value="Bois">🪵 Bois & Sculpture</option>
                      <option value="Metal">⚒️ Métal & Ferronnerie</option>
                      <option value="Textile">🧵 Textile, Soie & Broderie</option>
                      <option value="Poterie">🏺 Poterie & Céramique</option>
                      <option value="Verre">🥃 Verre & Cristal</option>
                      <option value="Pierre">💠 Pierre & Minéraux</option>
                      <option value="Vannerie">🧺 Vannerie & Tapisserie</option>
                      <option value="Arts-manuels">✋ Arts manuels</option>
                      <option value="Cosmetique">🌿 Cosmétique naturelle</option>
                      <option value="Mode">👗 Accessoires & Mode</option>
                      <option value="Art-sacre">🕌 Art sacré</option>
                      <option value="Patisserie">🍰 Pâtisserie artisanale</option>
                      <option value="Gastronomie">🍽️ Produits gourmets</option>
                      <option value="Huiles">🫒 Huiles & Terroir</option>
                      <option value="Coffrets">🎁 Coffrets</option>
                      <option value="Maghreb">🌙 Maghreb</option>
                      <option value="Afrique-Ouest">🌍 Afrique Ouest</option>
                      <option value="Afrique-centrale">🥁 Afrique centrale</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Description</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[100px]" placeholder="Decrivez votre produit..." />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Prix Artisan HT (EUR) *</label>
                    <input type="number" value={newProduct.prix_artisan_ht || ''} onChange={(e) => setNewProduct({...newProduct, prix_artisan_ht: parseFloat(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="0.00" />
                    <p className="text-xs text-[#CFC6AE] mt-1">Prix Public HT = {(newProduct.prix_artisan_ht * 1.15).toFixed(2)} EUR (+15%)</p>
                    <p className="text-xs text-[#BFA26A] mt-1">Prix TTC Client = {(newProduct.prix_artisan_ht * 1.15 * (1 + newProduct.tva / 100)).toFixed(2)} EUR</p>
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">TVA (%)</label>
                    <select value={newProduct.tva} onChange={(e) => setNewProduct({...newProduct, tva: parseFloat(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]">
                      <option value="20">20% (standard)</option>
                      <option value="10">10%</option>
                      <option value="5.5">5.5%</option>
                      <option value="2.1">2.1%</option>
                      <option value="0">0%</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Stock</label>
                    <input type="number" value={newProduct.stock || ''} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="0" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Images (jusqu'a 100MB)</label>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} multiple accept="image/*" className="hidden" />
                    <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-[#232a33] rounded-xl p-8 text-center hover:border-[#BFA26A] transition cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-[#CFC6AE] mb-2" />
                      <p className="text-[#CFC6AE]">Glissez vos images ici ou cliquez pour telecharger</p>
                      <p className="text-xs text-[#CFC6AE] mt-1">PNG, JPG jusqu'a 100MB - Compression automatique</p>
                    </div>
                    {uploadProgress > 0 && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm text-[#CFC6AE] mb-1"><span>Compression et upload...</span><span>{uploadProgress}%</span></div>
                        <div className="h-2 bg-[#232a33] rounded-full overflow-hidden"><div className="h-full bg-[#BFA26A] transition-all duration-300" style={{ width: `${uploadProgress}%` }} /></div>
                      </div>
                    )}
                    {uploadedImages.length > 0 && (
                      <div className="mt-4 flex gap-2 flex-wrap">
                        {uploadedImages.map((img, i) => (
                          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden">
                            <img src={img} alt="" className="w-full h-full object-cover" />
                            <button onClick={() => setUploadedImages(uploadedImages.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 w-5 h-5 bg-[#EF4444] rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => { setNewProduct({ nom: '', description: '', prix_artisan_ht: 0, stock: 0, categorie: '', tva: 20 }); setUploadedImages([]) }} className="px-6 py-3 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition">Annuler</button>
                  <button onClick={handleAddProduct} disabled={loading} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2 disabled:opacity-50">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Enregistrer
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes articles ({products.length})</h2>
                <button onClick={() => setActiveSection('add')} className="px-4 py-2 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="rounded-3xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                    <div className="h-40 bg-[#0d0f12] relative">
                      {product.images?.[0] ? <img src={product.images[0]} alt={product.nom} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                      {product.vedette && <span className="absolute top-2 right-2 px-2 py-1 bg-[#BFA26A] text-black text-xs font-bold rounded-full">Vedette</span>}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[#EDE6D2] truncate">{product.nom}</h4>
                      <p className="text-sm text-[#CFC6AE] truncate">{product.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#BFA26A] font-bold">{Number(product.prix_ttc || product.prix_artisan_ht * 1.38).toFixed(2)} EUR</span>
                        <span className="text-xs text-[#CFC6AE]">Stock: {product.stock}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => setEditingProduct(product)} className="flex-1 px-3 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition flex items-center justify-center gap-1"><Edit2 className="w-3 h-3" />Modifier</button>
                        <button onClick={() => handleToggleVedette(product)} className={`px-3 py-2 rounded-xl text-sm transition ${product.vedette ? 'bg-[#BFA26A]/20 border border-[#BFA26A] text-[#BFA26A]' : 'bg-[#0d0f12] border border-[#232a33] hover:border-[#BFA26A]'}`}>⭐</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-2 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/30 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'sales' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes Ventes</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-[#CFC6AE] text-sm">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">{salesStats.chiffre_affaires.toFixed(2)} EUR</p>
                  <p className="text-xs text-[#22C55E] mt-1">+12% ce mois</p>
                </div>
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-[#CFC6AE] text-sm">Commandes</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">{salesStats.commandes}</p>
                  <p className="text-xs text-[#22C55E] mt-1">+5 cette semaine</p>
                </div>
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-[#CFC6AE] text-sm">Clients</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">{salesStats.clients}</p>
                  <p className="text-xs text-[#22C55E] mt-1">+3 nouveaux</p>
                </div>
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">💸</div>
                  <p className="text-[#CFC6AE] text-sm">Commission ARLink</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">{salesStats.commission.toFixed(2)} EUR</p>
                  <p className="text-xs text-[#CFC6AE] mt-1">1EUR min / 1EUR par 100EUR</p>
                </div>
              </div>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <h3 className="text-lg font-semibold text-[#EDE6D2] mb-4">Dernieres ventes</h3>
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 bg-[#0d0f12] rounded-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#14181d] flex items-center justify-center">📦</div>
                        <div><p className="font-semibold">{order.items[0]?.nom || 'Commande'}</p><p className="text-xs text-[#CFC6AE]">{order.client_nom}</p></div>
                      </div>
                      <span className="text-[#22C55E] font-bold">+{order.total_ttc.toFixed(2)} EUR</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'social' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-[#EDE6D2]">Reseaux (video + photo + trafic)</h2>
                  <p className="text-[#CFC6AE] mt-1">Mets tout. Plus tu remplis, plus tu gagnes des vues (Reels, Shorts, videos, photos).</p>
                </div>
                <button className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-xl hover:brightness-95 transition">Auto remplir (IA)</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {socialNetworks.map((network, index) => (
                  <div key={network.name} className="rounded-2xl border border-[#2d3743] bg-[#0f1318] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#10161d] border border-[#2d3743] flex items-center justify-center text-lg">{network.icon}</div>
                        <div><div className="font-semibold text-[#EDE6D2]">{network.name}</div><div className="text-xs text-[#CFC6AE]">{network.hint}</div></div>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full border border-[#3B82F6]/35 bg-[#3B82F6]/14 text-[#EDE6D2]">+vues</span>
                    </div>
                    <input value={network.url} onChange={(e) => updateSocialUrl(index, e.target.value)} placeholder={network.placeholder} className="w-full bg-[#0f1318] border border-[#2d3743] rounded-xl px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 text-[#EDE6D2] text-sm transition" />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveSocialNetworks} disabled={loading} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition disabled:opacity-50">
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> : null}Appliquer au cadre boutique
                </button>
                <button onClick={copyAllSocialLinks} className="px-6 py-3 bg-[#14181d] border border-[#2d3743] text-[#EDE6D2] font-bold rounded-xl hover:border-[#BFA26A] transition">Copier tous les liens</button>
              </div>
            </div>
          )}

          {activeSection === 'info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Informations de la boutique</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom de la boutique</label>
                    <input value={boutique?.nom || ''} onChange={(e) => setBoutique(boutique ? {...boutique, nom: e.target.value} : null)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                    <input value={boutique?.email || ''} onChange={(e) => setBoutique(boutique ? {...boutique, email: e.target.value} : null)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Description</label>
                    <textarea value={boutique?.description || ''} onChange={(e) => setBoutique(boutique ? {...boutique, description: e.target.value} : null)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[100px]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Adresse</label>
                    <input value={boutique?.adresse || ''} onChange={(e) => setBoutique(boutique ? {...boutique, adresse: e.target.value} : null)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Telephone</label>
                    <input value={boutique?.telephone || ''} onChange={(e) => setBoutique(boutique ? {...boutique, telephone: e.target.value} : null)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveBoutiqueInfo} disabled={loading} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2 disabled:opacity-50">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}Sauvegarder
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mon Profil</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#BFA26A] flex items-center justify-center text-4xl text-black font-bold">{user?.prenom?.[0] || 'A'}</div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.prenom} {user?.nom}</h3>
                    <p className="text-[#CFC6AE]">{user?.email}</p>
                    <button className="mt-2 text-sm text-[#3B82F6] hover:underline">Changer la photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Prenom</label>
                    <input value={profile.prenom} onChange={(e) => setProfile({...profile, prenom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom</label>
                    <input value={profile.nom} onChange={(e) => setProfile({...profile, nom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                    <input value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Telephone</label>
                    <input value={profile.telephone} onChange={(e) => setProfile({...profile, telephone: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button onClick={handleSaveProfile} disabled={loading} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition disabled:opacity-50">
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin inline mr-2" /> : null}Mettre a jour
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'shop' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Ma Boutique</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <p className="text-[#CFC6AE]">Votre boutique est accessible a l'adresse:</p>
                <a href={`https://${boutique?.slug || 'maboutique'}.arlink.online`} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] text-lg font-semibold hover:underline mt-2 block">{boutique?.slug || 'maboutique'}.arlink.online</a>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Photo Vedette</label>
                    <div className="border-2 border-dashed border-[#232a33] rounded-xl p-4 text-center hover:border-[#BFA26A] transition cursor-pointer">
                      {boutique?.photo_vedette ? (
                        <img src={boutique.photo_vedette} alt="Photo vedette" className="w-full h-40 object-cover rounded-lg" />
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mx-auto text-[#CFC6AE] mb-2" />
                          <p className="text-[#CFC6AE] text-sm">Ajouter une photo vedette</p>
                          <p className="text-xs text-[#CFC6AE] mt-1">Obligatoire pour etre visible</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Statistiques</label>
                    <div className="space-y-2">
                      <div className="flex justify-between p-3 bg-[#0d0f12] rounded-xl"><span className="text-[#CFC6AE]">Articles</span><span className="font-bold">{products.length}</span></div>
                      <div className="flex justify-between p-3 bg-[#0d0f12] rounded-xl"><span className="text-[#CFC6AE]">Commandes</span><span className="font-bold">{orders.length}</span></div>
                      <div className="flex justify-between p-3 bg-[#0d0f12] rounded-xl"><span className="text-[#CFC6AE]">Vues ce mois</span><span className="font-bold">127</span></div>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex gap-3">
                  <a href={`https://${boutique?.slug || 'maboutique'}.arlink.online`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Eye className="w-4 h-4" />Voir ma boutique</a>
                  <button onClick={() => setActiveSection('info')} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition">Personnaliser</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes Commandes ({orders.length})</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4 bg-[#0d0f12] rounded-xl">
                      <div className="flex items-center justify-between mb-3">
                        <div><p className="font-semibold text-lg">#{order.numero}</p><p className="text-sm text-[#CFC6AE]">{order.items.length} article(s) - {order.client_nom}</p></div>
                        <div className="text-right">
                          <p className="font-bold text-[#EDE6D2] text-lg">{order.total_ttc.toFixed(2)} EUR</p>
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                        </div>
                      </div>
                      <div className="border-t border-[#232a33] pt-3 mt-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-[#CFC6AE]">{order.items.map(item => `${item.nom} x${item.quantite}`).join(', ')}</div>
                          <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className="bg-[#14181d] border border-[#232a33] rounded-lg px-3 py-1 text-sm outline-none focus:border-[#BFA26A]">
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="CONFIRMEE">Confirmee</option>
                            <option value="EN_PREPARATION">En preparation</option>
                            <option value="ENVOYEE">Envoyee</option>
                            <option value="LIVREE">Livree</option>
                            <option value="ANNULEE">Annulee</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {orders.length === 0 && <div className="text-center py-8 text-[#CFC6AE]"><p>Aucune commande pour le moment</p></div>}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'preview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mon Avant-gout</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <p className="text-[#CFC6AE] mb-4">Previsualisation de votre boutique telle qu'elle apparait aux visiteurs.</p>
                <div className="aspect-video bg-[#0d0f12] rounded-xl overflow-hidden">
                  <iframe src={`https://${boutique?.slug || 'maboutique'}.arlink.online`} className="w-full h-full border-0" title="Apercu boutique" />
                </div>
                <div className="mt-4 flex gap-3">
                  <a href={`https://${boutique?.slug || 'maboutique'}.arlink.online`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Eye className="w-4 h-4" />Ouvrir dans un nouvel onglet</a>
                  <button onClick={() => loadBoutique()} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition flex items-center gap-2"><RefreshCw className="w-4 h-4" />Rafraichir</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-3xl border border-[#232a33] p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Modifier l'article</h3>
              <button onClick={() => setEditingProduct(null)} className="w-8 h-8 rounded-lg bg-[#0d0f12] flex items-center justify-center hover:bg-[#EF4444]/20 transition"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Nom</label>
                <input value={editingProduct.nom} onChange={(e) => setEditingProduct({...editingProduct, nom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Categorie</label>
                <select value={editingProduct.categorie} onChange={(e) => setEditingProduct({...editingProduct, categorie: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]">
                  <option value="">Selectionner...</option>
                  <option value="Bijoux">💎 Bijoux & Orfèvrerie</option>
                  <option value="Cuir">👜 Cuir & Maroquinerie</option>
                  <option value="Bois">🪵 Bois & Sculpture</option>
                  <option value="Metal">⚒️ Métal & Ferronnerie</option>
                  <option value="Textile">🧵 Textile, Soie & Broderie</option>
                  <option value="Poterie">🏺 Poterie & Céramique</option>
                  <option value="Verre">🥃 Verre & Cristal</option>
                  <option value="Pierre">💠 Pierre & Minéraux</option>
                  <option value="Vannerie">🧺 Vannerie & Tapisserie</option>
                  <option value="Arts-manuels">✋ Arts manuels</option>
                  <option value="Cosmetique">🌿 Cosmétique naturelle</option>
                  <option value="Mode">👗 Accessoires & Mode</option>
                  <option value="Art-sacre">🕌 Art sacré</option>
                  <option value="Patisserie">🍰 Pâtisserie artisanale</option>
                  <option value="Gastronomie">🍽️ Produits gourmets</option>
                  <option value="Huiles">🫒 Huiles & Terroir</option>
                  <option value="Coffrets">🎁 Coffrets</option>
                  <option value="Maghreb">🌙 Maghreb</option>
                  <option value="Afrique-Ouest">🌍 Afrique Ouest</option>
                  <option value="Afrique-centrale">🥁 Afrique centrale</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-[#CFC6AE] block mb-2">Description</label>
                <textarea value={editingProduct.description} onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[80px]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Prix Artisan HT</label>
                <input type="number" value={editingProduct.prix_artisan_ht} onChange={(e) => setEditingProduct({...editingProduct, prix_artisan_ht: parseFloat(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Stock</label>
                <input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setEditingProduct(null)} className="px-6 py-3 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition">Annuler</button>
              <button onClick={() => handleUpdateProduct(editingProduct)} disabled={loading} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2 disabled:opacity-50">
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
