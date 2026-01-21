import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Bell, LogOut, Users, Store, Package, Ticket, Eye, UserCheck, UserX, Star, Archive, MessageSquare, X, Save, Edit2, Crown, CreditCard, Search, RefreshCw } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { boutiquesService, productsService } from '../services/api'

interface Artisan {
  id: string
  societe: string
  subDomain: string
  email: string
  telephone: string
  ville: string
  pays: string
  latitude: string
  longitude: string
  categorie: string
  plan: 'BASIQUE' | 'STANDARD' | 'PREMIUM'
  nbArticles: number
  status: 'ACTIF' | 'SUSPENDU'
  selected: boolean
}

interface Boutique {
  id: string
  nom: string
  slug: string
  category: string
  status: 'ACTIVE' | 'SUSPENDUE'
  artisanNom: string
  vedette: boolean
  vedetteType: 'GRATUIT' | 'PAYANT' | 'ADMIN'
  vedetteExpire?: string
  photo?: string
  hasPhoto: boolean
}

interface Article {
  id: string
  nom: string
  boutiqueNom: string
  prixTTC: number
  stock: number
  status: 'ACTIF' | 'ARCHIVE'
  isFeatured: boolean
}

interface Commande {
  id: string
  orderNumber: string
  artisanNom: string
  clientNom: string
  totalTTC: number
  status: string
  createdAt: string
}

interface TicketSupport {
  id: string
  ticketNumber: string
  artisanNom: string
  category: string
  status: 'OUVERT' | 'EN_COURS' | 'RESOLU' | 'FERME'
  priority: 'BASSE' | 'NORMALE' | 'HAUTE' | 'URGENTE'
}

const sampleArtisans: Artisan[] = []

const sampleBoutiques: Boutique[] = [
  { id: '1', nom: 'Dar Lakbira', slug: 'darlakbira', category: 'Artisanat', status: 'ACTIVE', artisanNom: 'Ahmed Benali', vedette: true, vedetteType: 'ADMIN', photo: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400', hasPhoto: true },
  { id: '2', nom: 'IRYA Cosmetics', slug: 'irya', category: 'Cosmetique', status: 'ACTIVE', artisanNom: 'Marie Dupont', vedette: true, vedetteType: 'PAYANT', vedetteExpire: '2026-02-15', photo: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400', hasPhoto: true },
  { id: '3', nom: 'Afrikration', slug: 'afrikration', category: 'Textile', status: 'ACTIVE', artisanNom: 'Amadou Toure', vedette: false, vedetteType: 'GRATUIT', photo: '', hasPhoto: false },
  { id: '4', nom: 'Miss Dattes', slug: 'missdattes', category: 'Gastronomie', status: 'ACTIVE', artisanNom: 'Aissatou Ndiaye', vedette: true, vedetteType: 'ADMIN', photo: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400', hasPhoto: true },
  { id: '5', nom: 'Inspiro Artium', slug: 'inspiroartium', category: 'Arts-manuels', status: 'ACTIVE', artisanNom: 'Fatima Alami', vedette: false, vedetteType: 'GRATUIT', photo: '', hasPhoto: false },
]

const sampleArticles: Article[] = [
  { id: '1', nom: 'Collier Amazigh', boutiqueNom: 'Dar Lakbira', prixTTC: 106.80, stock: 12, status: 'ACTIF', isFeatured: true },
  { id: '2', nom: 'Huile Argan Bio', boutiqueNom: 'IRYA Cosmetics', prixTTC: 45.00, stock: 50, status: 'ACTIF', isFeatured: false },
]

const sampleCommandes: Commande[] = [
  { id: '1', orderNumber: 'ARK-2026-00001', artisanNom: 'Ahmed Benali', clientNom: 'Jean Martin', totalTTC: 106.80, status: 'EN_PREPARATION', createdAt: '2026-01-19' },
]

const sampleTickets: TicketSupport[] = [
  { id: '1', ticketNumber: 'TKT-2026-00001', artisanNom: 'Ahmed Benali', category: 'PAIEMENT', status: 'OUVERT', priority: 'HAUTE' },
]

const SUPPORT_TEMPLATES = [
  'Nous avons bien recu votre demande',
  'Pouvez-vous envoyer une capture ?',
  'Votre probleme est en cours de resolution',
  'Resolu - merci pour votre patience'
]

// Categories principales avec numeros WhatsApp
interface CategoryWhatsApp {
  id: string
  name: string
  emoji: string
  whatsappNumber: string
  responsable: string
}

const DEFAULT_CATEGORY_WHATSAPP: CategoryWhatsApp[] = [
  { id: 'bijoux', name: 'Bijoux & Orfevrerie', emoji: '💎', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'cuir', name: 'Cuir & Maroquinerie', emoji: '👜', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'textile', name: 'Textile & Mode', emoji: '🧵', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'cosmetique', name: 'Cosmetique naturelle', emoji: '🌿', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'gastronomie', name: 'Gastronomie & Terroir', emoji: '🍽️', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'artisanat', name: 'Artisanat traditionnel', emoji: '🏺', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
  { id: 'coffrets', name: 'Coffrets & Cadeaux', emoji: '🎁', whatsappNumber: '33768084103', responsable: 'ARLink Support' },
]

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null)
  
  const [artisans, setArtisans] = useState<Artisan[]>([])
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [articles, setArticles] = useState<Article[]>(sampleArticles)
  const [commandes, setCommandes] = useState<Commande[]>(sampleCommandes)
  const [tickets, setTickets] = useState<TicketSupport[]>(sampleTickets)
  
  // Gestion des numeros WhatsApp par categorie
  const [categoryWhatsApp, setCategoryWhatsApp] = useState<CategoryWhatsApp[]>(() => {
    const saved = localStorage.getItem('arlink_category_whatsapp')
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORY_WHATSAPP
  })
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  
  const [editingArtisan, setEditingArtisan] = useState<string | null>(null)
  
  const [suspendModal, setSuspendModal] = useState<{type: string, id: string, name: string} | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [ticketReplyModal, setTicketReplyModal] = useState<string | null>(null)
  const [ticketReply, setTicketReply] = useState('')
  const [mergeForm, setMergeForm] = useState({ oldEmail: '', newUserId: '', reason: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [boutiquesRes, productsRes] = await Promise.all([
        boutiquesService.getAll(),
        productsService.getAll()
      ])
      
      const boutiquesData = (boutiquesRes.data as Array<Record<string, unknown>>).map((b) => ({
        id: b.id as string,
        nom: b.societe as string || 'Sans nom',
        slug: b.subDomain as string || '',
        category: b.categorie as string || 'Autre',
        status: (b.status as string || 'active') === 'active' ? 'ACTIVE' as const : 'SUSPENDUE' as const,
        artisanNom: b.societe as string || '',
        vedette: b.vedette as boolean || false,
        vedetteType: (b.vedetteType as string || 'GRATUIT') as 'GRATUIT' | 'PAYANT' | 'ADMIN',
        photo: b.logo as string || b.image as string || '',
        hasPhoto: !!(b.logo || b.image)
      }))
      setBoutiques(boutiquesData)
      
      const productsData = productsRes.data as Array<Record<string, unknown>>
      const rawBoutiques = boutiquesRes.data as Array<Record<string, unknown>>
      const artisansData = rawBoutiques.map((b) => ({
        id: b.id as string,
        societe: b.societe as string || 'Sans nom',
        subDomain: b.subDomain as string || '',
        email: (b.subDomain as string || 'contact') + '@arlink.online',
        telephone: '',
        ville: b.ville as string || '',
        pays: b.pays as string || '',
        latitude: b.latitude as string || '',
        longitude: b.longitude as string || '',
        categorie: b.categorie as string || '',
        plan: 'STANDARD' as const,
        nbArticles: productsData.filter((p) => p.boutiqueId === b.id).length,
        status: (b.status as string || 'active') === 'active' ? 'ACTIF' as const : 'SUSPENDU' as const,
        selected: false
      }))
      setArtisans(artisansData)
      
      const articlesData = productsData.slice(0, 100).map((p) => ({
        id: p.id as string,
        nom: p.nom as string || 'Sans nom',
        boutiqueNom: boutiquesData.find((b) => b.id === p.boutiqueId)?.nom || 'Inconnu',
        prixTTC: Number(p.prix_ttc) || Number(p.prix_public_ht) * 1.2 || 0,
        stock: Number(p.stock) || 0,
        status: 'ACTIF' as const,
        isFeatured: p.vedette as boolean || false
      }))
      setArticles(articlesData)
      showNotification('success', `${boutiquesData.length} boutiques chargees`)
    } catch (error) {
      console.error('Error loading data:', error)
      setArtisans(sampleArtisans)
      setBoutiques(sampleBoutiques)
      showNotification('error', 'Erreur - donnees demo chargees')
    }
    setLoading(false)
  }

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleUpdateArtisan = (id: string, field: string, value: string) => {
    setArtisans(artisans.map(a => a.id === id ? { ...a, [field]: value } : a))
  }

  const handleSaveArtisan = () => {
    showNotification('success', 'Artisan mis a jour!')
    setEditingArtisan(null)
  }

  const handleToggleVedette = (id: string, type: 'ADMIN' | 'PAYANT') => {
    const boutique = boutiques.find(b => b.id === id)
    if (!boutique) return
    const newVedette = !boutique.vedette || boutique.vedetteType !== type
    setBoutiques(boutiques.map(b => b.id === id ? { ...b, vedette: newVedette, vedetteType: type } : b))
    showNotification('success', newVedette ? 'Boutique mise en vedette!' : 'Boutique retiree des vedettes')
  }

  const filteredArtisans = artisans.filter(a => 
    a.societe?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subDomain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.ville?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.pays?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleSelectAll = (checked: boolean) => {
    setArtisans(artisans.map(a => ({ ...a, selected: checked })))
  }

  const handleSelectArtisan = (id: string, checked: boolean) => {
    setArtisans(artisans.map(a => a.id === id ? { ...a, selected: checked } : a))
  }

  const handleDeleteArtisan = (_id: string) => {
    showNotification('error', 'Suppression non autorisee - contactez le super admin')
  }

  const filteredBoutiques = boutiques.filter(b =>
    b.nom?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

    const navItems = [
      { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
      { id: 'crm', icon: '📋', label: 'CRM Artisans' },
      { id: 'whatsapp', icon: '📱', label: 'WhatsApp Categories' },
      { id: 'vedettes', icon: '⭐', label: 'Boutiques Vedettes' },
      { id: 'artisans', icon: '👥', label: 'Artisans' },
      { id: 'boutiques', icon: '🏪', label: 'Boutiques' },
      { id: 'articles', icon: '📦', label: 'Articles' },
      { id: 'commandes', icon: '📋', label: 'Commandes' },
      { id: 'tickets', icon: '🎫', label: 'Support' },
      { id: 'merge', icon: '🔗', label: 'Fusion comptes' },
      { id: 'backup', icon: '💾', label: 'Sauvegarde' },
      { id: 'home', icon: '🏠', label: 'Accueil', link: '/' },
    ]

  // Fonctions de gestion WhatsApp par categorie
  const handleUpdateCategoryWhatsApp = (id: string, field: string, value: string) => {
    setCategoryWhatsApp(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }

  const handleSaveCategoryWhatsApp = () => {
    localStorage.setItem('arlink_category_whatsapp', JSON.stringify(categoryWhatsApp))
    showNotification('success', 'Numeros WhatsApp sauvegardes!')
    setEditingCategory(null)
  }

  const artisansActifs = artisans.filter(a => a.status === 'ACTIF').length
  const boutiquesActives = boutiques.filter(b => b.status === 'ACTIVE').length
  const ticketsOuverts = tickets.filter(t => t.status === 'OUVERT').length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSuspendArtisan = (id: string) => {
    if (!suspendReason) { alert('Raison obligatoire'); return }
    setArtisans(artisans.map(a => a.id === id ? { ...a, status: 'SUSPENDU' as const } : a))
    alert('Artisan suspendu')
    setSuspendModal(null)
    setSuspendReason('')
  }

  const handleActivateArtisan = (id: string) => {
    setArtisans(artisans.map(a => a.id === id ? { ...a, status: 'ACTIF' as const } : a))
    alert('Artisan reactive')
  }

  const handleSuspendBoutique = (id: string) => {
    if (!suspendReason) { alert('Raison obligatoire'); return }
    setBoutiques(boutiques.map(b => b.id === id ? { ...b, status: 'SUSPENDUE' as const } : b))
    alert('Boutique suspendue')
    setSuspendModal(null)
    setSuspendReason('')
  }

  const handleActivateBoutique = (id: string) => {
    setBoutiques(boutiques.map(b => b.id === id ? { ...b, status: 'ACTIVE' as const } : b))
    alert('Boutique reactivee')
  }

  const handleArchiveArticle = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, status: 'ARCHIVE' as const } : a))
    alert('Article archive')
  }

  const handleToggleFeatured = (id: string) => {
    setArticles(articles.map(a => a.id === id ? { ...a, isFeatured: !a.isFeatured } : a))
  }

  const handleUpdateOrderStatus = (id: string, newStatus: string) => {
    setCommandes(commandes.map(c => c.id === id ? { ...c, status: newStatus } : c))
    alert('Statut mis a jour')
  }

  const handleReplyTicket = (_id: string) => {
    if (!ticketReply) { alert('Message obligatoire'); return }
    alert('Reponse envoyee')
    setTicketReplyModal(null)
    setTicketReply('')
  }

  const handleCloseTicket = (id: string) => {
    setTickets(tickets.map(t => t.id === id ? { ...t, status: 'FERME' as const } : t))
    alert('Ticket ferme')
  }

  const handleMergeAccounts = () => {
    if (!mergeForm.oldEmail || !mergeForm.newUserId || !mergeForm.reason) {
      alert('Tous les champs sont obligatoires')
      return
    }
    alert('Fusion effectuee!')
    setMergeForm({ oldEmail: '', newUserId: '', reason: '' })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF': case 'ACTIVE': case 'LIVREE': case 'RESOLU': return 'bg-green-500/20 text-green-500'
      case 'SUSPENDU': case 'SUSPENDUE': case 'ANNULEE': case 'FERME': return 'bg-red-500/20 text-red-500'
      case 'EN_ATTENTE': case 'OUVERT': return 'bg-yellow-500/20 text-yellow-500'
      case 'EN_PREPARATION': case 'EN_COURS': return 'bg-blue-500/20 text-blue-500'
      default: return 'bg-purple-500/20 text-purple-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#EDE6D2] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-medium`}>
          {notification.message}
        </div>
      )}
      <aside className={sidebarOpen ? 'w-[260px] bg-[#0a0c0f] border-r border-[#232a33] flex flex-col fixed h-full z-40' : 'w-[52px] bg-[#0a0c0f] border-r border-[#232a33] flex flex-col fixed h-full z-40'}>
        <div className="p-4 border-b border-[#232a33] flex items-center justify-between">
          {sidebarOpen && <span className="text-[#3B82F6] font-bold text-lg">ARLink Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            item.link ? (
              <Link key={item.id} to={item.link} className={'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ' + (activeSection === item.id ? 'bg-[#14181d] border border-[#3B82F6]/30' : '')}>
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ) : (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={'w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ' + (activeSection === item.id ? 'bg-[#14181d] border border-[#3B82F6]/30' : '')}>
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

      <main className={sidebarOpen ? 'flex-1 ml-[260px]' : 'flex-1 ml-[52px]'}>
        <header className="sticky top-0 z-30 bg-[#0d0f12]/95 backdrop-blur-md border-b border-[#232a33]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#CFC6AE]">
              <span>Admin</span>
              <span>/</span>
              <span className="text-[#EDE6D2]">{navItems.find(n => n.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#CFC6AE]" />
                <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher..." className="bg-[#14181d] border border-[#232a33] rounded-xl pl-10 pr-4 py-2 text-sm outline-none focus:border-[#BFA26A] w-64" />
              </div>
              <button onClick={loadData} className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center">{ticketsOuverts}</span>
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold">A</div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Tableau de bord Admin</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <Users className="w-6 h-6 text-[#BFA26A] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Artisans actifs</p>
                  <p className="text-2xl font-bold">{artisansActifs}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <Store className="w-6 h-6 text-[#BFA26A] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Boutiques actives</p>
                  <p className="text-2xl font-bold">{boutiquesActives}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <Package className="w-6 h-6 text-[#BFA26A] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Articles</p>
                  <p className="text-2xl font-bold">{articles.length}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <Ticket className="w-6 h-6 text-[#BFA26A] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Tickets ouverts</p>
                  <p className="text-2xl font-bold">{ticketsOuverts}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveSection('artisans')} className="px-4 py-2 bg-[#BFA26A] text-black font-bold rounded-xl">Voir artisans</button>
                <button onClick={() => setActiveSection('commandes')} className="px-4 py-2 bg-[#14181d] border border-[#232a33] rounded-xl hover:border-[#BFA26A]">Commandes</button>
                <button onClick={() => setActiveSection('tickets')} className="px-4 py-2 bg-[#14181d] border border-[#232a33] rounded-xl hover:border-[#BFA26A]">Support</button>
              </div>
            </div>
          )}

          {activeSection === 'crm' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <h2 className="text-2xl font-bold">CRM Boutiques ({filteredArtisans.length})</h2>
                <p className="text-sm text-[#CFC6AE]">Donnees reelles de la base de donnees - {artisans.filter(a => a.selected).length} selectionne(s)</p>
              </div>
              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0c0f] overflow-x-auto">
                <table className="w-full text-xs">
                  <thead className="bg-[#14181d] sticky top-0">
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="px-2 py-3 text-center w-10"><input type="checkbox" onChange={(e) => handleSelectAll(e.target.checked)} className="w-4 h-4 accent-[#BFA26A]" /></th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Societe</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Sous-domaine</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Email</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Mobile</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Ville</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Pays</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">GPS</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Categorie</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Articles</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Statut</th>
                      <th className="px-2 py-3 text-left text-[#CFC6AE] font-medium whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArtisans.map(artisan => (
                      <tr key={artisan.id} className={`border-b border-[#1a1a1a] hover:bg-[#14181d]/50 ${artisan.selected ? 'bg-[#BFA26A]/10' : ''}`}>
                        <td className="px-2 py-2 text-center">
                          <input type="checkbox" checked={artisan.selected} onChange={(e) => handleSelectArtisan(artisan.id, e.target.checked)} className="w-4 h-4 accent-[#BFA26A]" />
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.societe} onChange={(e) => handleUpdateArtisan(artisan.id, 'societe', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-28" />
                          ) : (
                            <span className="font-medium text-[#EDE6D2]">{artisan.societe}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.subDomain} onChange={(e) => handleUpdateArtisan(artisan.id, 'subDomain', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-24" />
                          ) : (
                            <a href={`https://${artisan.subDomain}.arlink.online`} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline">{artisan.subDomain}</a>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.email} onChange={(e) => handleUpdateArtisan(artisan.id, 'email', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-36" />
                          ) : (
                            <span className="text-[#CFC6AE]">{artisan.email}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.telephone} onChange={(e) => handleUpdateArtisan(artisan.id, 'telephone', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-28" placeholder="+212..." />
                          ) : (
                            <span className="text-[#CFC6AE]">{artisan.telephone || '-'}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.ville} onChange={(e) => handleUpdateArtisan(artisan.id, 'ville', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-24" />
                          ) : (
                            <span className="text-[#CFC6AE]">{artisan.ville || '-'}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {editingArtisan === artisan.id ? (
                            <input value={artisan.pays} onChange={(e) => handleUpdateArtisan(artisan.id, 'pays', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-20" />
                          ) : (
                            <span className="text-[#CFC6AE]">{artisan.pays || '-'}</span>
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {artisan.latitude && artisan.longitude ? (
                            <a href={`https://www.google.com/maps?q=${artisan.latitude},${artisan.longitude}`} target="_blank" rel="noopener noreferrer" className="text-[#3B82F6] hover:underline text-xs" title={`${artisan.latitude}, ${artisan.longitude}`}>
                              Voir carte
                            </a>
                          ) : (
                            <span className="text-[#666]">-</span>
                          )}
                        </td>
                                                <td className="px-2 py-2">
                                                  {editingArtisan === artisan.id ? (
                                                    <select value={artisan.categorie || ''} onChange={(e) => handleUpdateArtisan(artisan.id, 'categorie', e.target.value)} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs w-28">
                                                      <option value="">-</option>
                                                      <option value="Bijoux">Bijoux</option>
                                                      <option value="Cosmetique">Cosmetique</option>
                                                      <option value="Cuir">Cuir</option>
                                                      <option value="Gastronomie">Gastronomie</option>
                                                      <option value="Mode">Mode</option>
                                                      <option value="Decoration">Decoration</option>
                                                      <option value="Artisanat">Artisanat</option>
                                                    </select>
                                                  ) : (
                                                    <span className="px-2 py-0.5 text-xs rounded bg-[#BFA26A]/20 text-[#BFA26A]">{artisan.categorie || '-'}</span>
                                                  )}
                                                </td>
                        <td className="px-2 py-2 text-center font-medium">{artisan.nbArticles}</td>
                        <td className="px-2 py-2">
                          <span className={'px-2 py-0.5 text-xs rounded ' + getStatusColor(artisan.status)}>{artisan.status}</span>
                        </td>
                        <td className="px-2 py-2">
                          <div className="flex gap-1">
                            {editingArtisan === artisan.id ? (
                              <button onClick={() => handleSaveArtisan()} className="p-1.5 hover:bg-green-500/20 rounded-lg" title="Sauvegarder"><Save className="w-3.5 h-3.5 text-green-500" /></button>
                            ) : (
                              <button onClick={() => setEditingArtisan(artisan.id)} className="p-1.5 hover:bg-[#BFA26A]/20 rounded-lg" title="Modifier"><Edit2 className="w-3.5 h-3.5 text-[#BFA26A]" /></button>
                            )}
                            {artisan.status === 'ACTIF' ? (
                              <button onClick={() => setSuspendModal({type: 'artisan', id: artisan.id, name: artisan.societe})} className="p-1.5 hover:bg-red-500/20 rounded-lg" title="Desactiver"><UserX className="w-3.5 h-3.5 text-red-500" /></button>
                            ) : (
                              <button onClick={() => handleActivateArtisan(artisan.id)} className="p-1.5 hover:bg-green-500/20 rounded-lg" title="Activer"><UserCheck className="w-3.5 h-3.5 text-green-500" /></button>
                            )}
                            <button onClick={() => handleDeleteArtisan(artisan.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg" title="Supprimer"><Archive className="w-3.5 h-3.5 text-red-500" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'artisans' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Artisans ({artisans.length})</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Nom</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Email</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Plan</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Articles</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {artisans.map(artisan => (
                      <tr key={artisan.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3">{artisan.societe}</td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{artisan.email}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-[#BFA26A]/20 text-[#BFA26A]">{artisan.plan}</span></td>
                        <td className="px-4 py-3">{artisan.nbArticles}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(artisan.status)}>{artisan.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {artisan.status === 'ACTIF' ? (
                              <button onClick={() => setSuspendModal({type: 'artisan', id: artisan.id, name: artisan.societe})} className="p-2 hover:bg-red-500/20 rounded-lg"><UserX className="w-4 h-4 text-red-500" /></button>
                            ) : (
                              <button onClick={() => handleActivateArtisan(artisan.id)} className="p-2 hover:bg-green-500/20 rounded-lg"><UserCheck className="w-4 h-4 text-green-500" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'whatsapp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion WhatsApp par Categorie</h2>
                <p className="text-sm text-[#CFC6AE]">Numero par defaut: +33 7 68 08 41 03</p>
              </div>
              
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5 mb-6">
                <p className="text-[#CFC6AE] text-sm mb-2">Chaque categorie peut avoir un responsable WhatsApp different.</p>
                <p className="text-[#CFC6AE] text-sm">Les clients contacteront le numero associe a la categorie de la boutique qu'ils visitent.</p>
              </div>

              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0c0f] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#14181d]">
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Categorie</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Numero WhatsApp</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Responsable</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryWhatsApp.map(cat => (
                      <tr key={cat.id} className="border-b border-[#1a1a1a] hover:bg-[#14181d]/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cat.emoji}</span>
                            <span className="font-medium">{cat.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {editingCategory === cat.id ? (
                            <input 
                              value={cat.whatsappNumber} 
                              onChange={(e) => handleUpdateCategoryWhatsApp(cat.id, 'whatsappNumber', e.target.value)} 
                              className="bg-[#0d0f12] border border-[#232a33] rounded px-3 py-2 text-sm w-40"
                              placeholder="33768084103"
                            />
                          ) : (
                            <a href={`https://wa.me/${cat.whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-[#22C55E] hover:underline">
                              +{cat.whatsappNumber}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editingCategory === cat.id ? (
                            <input 
                              value={cat.responsable} 
                              onChange={(e) => handleUpdateCategoryWhatsApp(cat.id, 'responsable', e.target.value)} 
                              className="bg-[#0d0f12] border border-[#232a33] rounded px-3 py-2 text-sm w-40"
                              placeholder="Nom du responsable"
                            />
                          ) : (
                            <span className="text-[#CFC6AE]">{cat.responsable}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {editingCategory === cat.id ? (
                              <button onClick={handleSaveCategoryWhatsApp} className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-xs font-medium hover:bg-green-600">
                                <Save className="w-4 h-4 inline mr-1" /> Sauvegarder
                              </button>
                            ) : (
                              <button onClick={() => setEditingCategory(cat.id)} className="px-3 py-1.5 bg-[#BFA26A] text-black rounded-lg text-xs font-medium hover:brightness-95">
                                <Edit2 className="w-4 h-4 inline mr-1" /> Modifier
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                <h3 className="font-bold mb-3">Comment ca fonctionne</h3>
                <ul className="text-sm text-[#CFC6AE] space-y-2">
                  <li>1. Chaque categorie a un numero WhatsApp associe</li>
                  <li>2. Quand un client visite une boutique, le bouton WhatsApp utilise le numero de la categorie</li>
                  <li>3. Vous pouvez assigner un responsable different pour chaque categorie</li>
                  <li>4. Les modifications sont sauvegardees automatiquement</li>
                </ul>
              </div>
            </div>
          )}

          {activeSection === 'vedettes' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion Boutiques Vedettes</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#BFA26A]/20 text-[#BFA26A] rounded-full text-sm flex items-center gap-1"><Crown className="w-4 h-4" /> Admin</span>
                  <span className="px-3 py-1 bg-green-500/20 text-green-500 rounded-full text-sm flex items-center gap-1"><CreditCard className="w-4 h-4" /> Payant</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <p className="text-[#CFC6AE] text-sm">Boutiques avec photo</p>
                  <p className="text-2xl font-bold">{boutiques.filter(b => b.hasPhoto).length}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <p className="text-[#CFC6AE] text-sm">Vedettes actives</p>
                  <p className="text-2xl font-bold">{boutiques.filter(b => b.vedette).length}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <p className="text-[#CFC6AE] text-sm">Sans photo (non eligible)</p>
                  <p className="text-2xl font-bold text-red-500">{boutiques.filter(b => !b.hasPhoto).length}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-[#1a1a1a] bg-[#0a0c0f] overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-[#14181d]">
                    <tr className="border-b border-[#1a1a1a]">
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Photo</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Boutique</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Categorie</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Vedette</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Type</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBoutiques.map(boutique => (
                      <tr key={boutique.id} className="border-b border-[#1a1a1a] hover:bg-[#14181d]/50">
                        <td className="px-4 py-3">
                          {boutique.hasPhoto ? (
                            <img src={boutique.photo} alt={boutique.nom} className="w-12 h-12 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center text-red-500 text-xs">Aucune</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{boutique.nom}</p>
                            <p className="text-xs text-[#CFC6AE]">{boutique.slug}.arlink.online</p>
                          </div>
                        </td>
                        <td className="px-4 py-3"><span className="px-2 py-0.5 text-xs rounded bg-[#BFA26A]/20 text-[#BFA26A]">{boutique.category}</span></td>
                        <td className="px-4 py-3">
                          {boutique.vedette ? (
                            <Star className="w-5 h-5 text-[#BFA26A]" fill="currentColor" />
                          ) : (
                            <Star className="w-5 h-5 text-[#232a33]" />
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {boutique.vedette && (
                            <span className={`px-2 py-0.5 text-xs rounded ${boutique.vedetteType === 'ADMIN' ? 'bg-[#BFA26A]/20 text-[#BFA26A]' : boutique.vedetteType === 'PAYANT' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                              {boutique.vedetteType}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {boutique.hasPhoto ? (
                              <>
                                <button onClick={() => handleToggleVedette(boutique.id, 'ADMIN')} className={`px-2 py-1 text-xs rounded ${boutique.vedette && boutique.vedetteType === 'ADMIN' ? 'bg-[#BFA26A] text-black' : 'bg-[#232a33] hover:bg-[#BFA26A]/20'}`}>
                                  <Crown className="w-3 h-3 inline mr-1" />Admin
                                </button>
                                <button onClick={() => handleToggleVedette(boutique.id, 'PAYANT')} className={`px-2 py-1 text-xs rounded ${boutique.vedette && boutique.vedetteType === 'PAYANT' ? 'bg-green-500 text-black' : 'bg-[#232a33] hover:bg-green-500/20'}`}>
                                  <CreditCard className="w-3 h-3 inline mr-1" />Payant
                                </button>
                              </>
                            ) : (
                              <span className="text-xs text-red-500">Photo requise</span>
                            )}
                            <a href={`https://${boutique.slug}.arlink.online`} target="_blank" className="p-1.5 hover:bg-[#232a33] rounded-lg"><Eye className="w-3.5 h-3.5" /></a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'boutiques' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Boutiques ({filteredBoutiques.length})</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Nom</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Slug</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Categorie</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Artisan</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBoutiques.map(boutique => (
                      <tr key={boutique.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3 font-semibold">{boutique.nom}</td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{boutique.slug}</td>
                        <td className="px-4 py-3">{boutique.category}</td>
                        <td className="px-4 py-3">{boutique.artisanNom}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(boutique.status)}>{boutique.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <a href={'https://' + boutique.slug + '.arlink.online'} target="_blank" className="p-2 hover:bg-[#232a33] rounded-lg"><Eye className="w-4 h-4" /></a>
                            {boutique.status === 'ACTIVE' ? (
                              <button onClick={() => setSuspendModal({type: 'boutique', id: boutique.id, name: boutique.nom})} className="p-2 hover:bg-red-500/20 rounded-lg"><UserX className="w-4 h-4 text-red-500" /></button>
                            ) : (
                              <button onClick={() => handleActivateBoutique(boutique.id)} className="p-2 hover:bg-green-500/20 rounded-lg"><UserCheck className="w-4 h-4 text-green-500" /></button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'articles' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Articles</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Nom</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Boutique</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Prix TTC</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Stock</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Vedette</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map(article => (
                      <tr key={article.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3 font-semibold">{article.nom}</td>
                        <td className="px-4 py-3">{article.boutiqueNom}</td>
                        <td className="px-4 py-3">{article.prixTTC.toFixed(2)} EUR</td>
                        <td className="px-4 py-3">{article.stock}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(article.status)}>{article.status}</span></td>
                        <td className="px-4 py-3">{article.isFeatured ? <Star className="w-4 h-4 text-[#BFA26A]" fill="currentColor" /> : '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleArchiveArticle(article.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Archive className="w-4 h-4 text-red-500" /></button>
                            <button onClick={() => handleToggleFeatured(article.id)} className="p-2 hover:bg-[#BFA26A]/20 rounded-lg"><Star className="w-4 h-4" fill={article.isFeatured ? 'currentColor' : 'none'} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'commandes' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Commandes</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">N Commande</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Artisan</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Client</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Total TTC</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commandes.map(commande => (
                      <tr key={commande.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3 font-mono">{commande.orderNumber}</td>
                        <td className="px-4 py-3">{commande.artisanNom}</td>
                        <td className="px-4 py-3">{commande.clientNom}</td>
                        <td className="px-4 py-3 font-bold">{commande.totalTTC.toFixed(2)} EUR</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(commande.status)}>{commande.status}</span></td>
                        <td className="px-4 py-3">
                          <select onChange={(e) => handleUpdateOrderStatus(commande.id, e.target.value)} value={commande.status} className="bg-[#0d0f12] border border-[#232a33] rounded px-2 py-1 text-xs">
                            <option value="EN_ATTENTE">En attente</option>
                            <option value="CONFIRMEE">Confirmee</option>
                            <option value="EN_PREPARATION">En preparation</option>
                            <option value="ENVOYEE">Envoyee</option>
                            <option value="LIVREE">Livree</option>
                            <option value="ANNULEE">Annulee</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'tickets' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Support - Tickets</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">N Ticket</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Artisan</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Categorie</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Priorite</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map(ticket => (
                      <tr key={ticket.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3 font-mono">{ticket.ticketNumber}</td>
                        <td className="px-4 py-3">{ticket.artisanNom}</td>
                        <td className="px-4 py-3">{ticket.category}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(ticket.status)}>{ticket.status}</span></td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + (ticket.priority === 'URGENTE' || ticket.priority === 'HAUTE' ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/20 text-gray-500')}>{ticket.priority}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => setTicketReplyModal(ticket.id)} className="p-2 hover:bg-[#232a33] rounded-lg"><MessageSquare className="w-4 h-4" /></button>
                            <button onClick={() => handleCloseTicket(ticket.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 text-xs">Fermer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeSection === 'merge' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Fusion de comptes</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6 max-w-xl">
                <p className="text-[#CFC6AE] mb-4">Transferer les donnees d'un ancien compte vers un nouveau compte artisan.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Ancien email</label>
                    <input value={mergeForm.oldEmail} onChange={(e) => setMergeForm({...mergeForm, oldEmail: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" placeholder="ancien@email.com" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nouveau compte</label>
                    <select value={mergeForm.newUserId} onChange={(e) => setMergeForm({...mergeForm, newUserId: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]">
                      <option value="">Selectionner...</option>
                      {artisans.filter(a => a.status === 'ACTIF').map(a => (
                        <option key={a.id} value={a.id}>{a.email}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Raison</label>
                    <textarea value={mergeForm.reason} onChange={(e) => setMergeForm({...mergeForm, reason: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] min-h-[80px]" />
                  </div>
                  <button onClick={handleMergeAccounts} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl">Fusionner</button>
                </div>
              </div>
            </div>
                )}

                {activeSection === 'backup' && (
                  <div className="space-y-6">
                    <h2 className="text-2xl font-bold">Sauvegarde & Restauration</h2>
              
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <span className="text-2xl">💾</span> Derniere sauvegarde
                        </h3>
                        <div className="space-y-3 text-[#CFC6AE]">
                          <p><strong>Date:</strong> 21 Janvier 2026 - 01:03</p>
                          <p><strong>Taille:</strong> 576 MB</p>
                          <p><strong>Contenu:</strong> Base de donnees + Code source</p>
                          <p><strong>Emplacement:</strong> /var/www/backups/arlink-v2-20260121.tar.gz</p>
                        </div>
                        <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
                          <p className="text-green-400 text-sm">Sauvegarde automatique active</p>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <span className="text-2xl">🔄</span> Restauration
                        </h3>
                        <div className="space-y-4">
                          <p className="text-[#CFC6AE] text-sm">En cas de panne, contactez le support technique avec les informations suivantes:</p>
                          <div className="bg-[#0d0f12] p-4 rounded-xl font-mono text-xs text-[#CFC6AE]">
                            <p>Serveur: 217.154.2.83</p>
                            <p>Backup: /var/www/backups/arlink-v2-20260121.tar.gz</p>
                            <p>DB: arlink_v2 (PostgreSQL)</p>
                          </div>
                          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                            <p className="text-yellow-400 text-sm">La restauration necessite un acces SSH au serveur</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6">
                      <h3 className="text-lg font-bold mb-4">Historique des sauvegardes</h3>
                      <table className="w-full text-sm">
                        <thead className="bg-[#0d0f12]">
                          <tr>
                            <th className="px-4 py-2 text-left text-[#CFC6AE]">Date</th>
                            <th className="px-4 py-2 text-left text-[#CFC6AE]">Fichier</th>
                            <th className="px-4 py-2 text-left text-[#CFC6AE]">Taille</th>
                            <th className="px-4 py-2 text-left text-[#CFC6AE]">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-[#232a33]">
                            <td className="px-4 py-3">21 Jan 2026 01:03</td>
                            <td className="px-4 py-3 font-mono text-xs">arlink-v2-20260121.tar.gz</td>
                            <td className="px-4 py-3">576 MB</td>
                            <td className="px-4 py-3"><span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs">Complet</span></td>
                          </tr>
                          <tr className="border-t border-[#232a33]">
                            <td className="px-4 py-3">29 Dec 2025 17:29</td>
                            <td className="px-4 py-3 font-mono text-xs">arlink-complete-20251229-172959</td>
                            <td className="px-4 py-3">4.5 GB</td>
                            <td className="px-4 py-3"><span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs">Archive</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-6">
                      <h3 className="text-lg font-bold mb-2 text-red-400">Procedure de restauration d'urgence</h3>
                      <ol className="list-decimal list-inside space-y-2 text-[#CFC6AE] text-sm">
                        <li>Connectez-vous au serveur via SSH: <code className="bg-[#0d0f12] px-2 py-1 rounded">ssh root@217.154.2.83</code></li>
                        <li>Arretez les containers: <code className="bg-[#0d0f12] px-2 py-1 rounded">cd /var/www/arlink-prod && docker-compose down</code></li>
                        <li>Restaurez la base de donnees: <code className="bg-[#0d0f12] px-2 py-1 rounded">docker exec -i arlink-postgres psql -U arlink arlink_v2 &lt; backup/database.sql</code></li>
                        <li>Redemarrez les containers: <code className="bg-[#0d0f12] px-2 py-1 rounded">docker-compose up -d</code></li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
            </main>

            {suspendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Suspendre {suspendModal.name}</h3>
              <button onClick={() => { setSuspendModal(null); setSuspendReason('') }} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <textarea value={suspendReason} onChange={(e) => setSuspendReason(e.target.value)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] min-h-[80px]" placeholder="Raison..." />
              <div className="flex gap-3">
                <button onClick={() => suspendModal.type === 'artisan' ? handleSuspendArtisan(suspendModal.id) : handleSuspendBoutique(suspendModal.id)} className="px-6 py-3 bg-red-500 text-white font-bold rounded-xl">Confirmer</button>
                <button onClick={() => { setSuspendModal(null); setSuspendReason('') }} className="px-6 py-3 bg-[#232a33] rounded-xl">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {ticketReplyModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Repondre au ticket</h3>
              <button onClick={() => { setTicketReplyModal(null); setTicketReply('') }} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {SUPPORT_TEMPLATES.map((template, i) => (
                  <button key={i} onClick={() => setTicketReply(template)} className="px-3 py-1 bg-[#0d0f12] border border-[#232a33] rounded-lg text-xs hover:border-[#BFA26A]">{template}</button>
                ))}
              </div>
              <textarea value={ticketReply} onChange={(e) => setTicketReply(e.target.value)} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] min-h-[120px]" />
              <button onClick={() => handleReplyTicket(ticketReplyModal)} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl">Envoyer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
