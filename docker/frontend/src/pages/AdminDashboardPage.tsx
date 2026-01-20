import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Bell, LogOut, Users, Store, Package, Ticket, Eye, UserCheck, UserX, Star, Archive, MessageSquare, X } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

interface Artisan {
  id: string
  nom: string
  prenom: string
  email: string
  plan: 'BASIQUE' | 'STANDARD' | 'PREMIUM'
  nbArticles: number
  status: 'ACTIF' | 'SUSPENDU'
}

interface Boutique {
  id: string
  nom: string
  slug: string
  category: string
  status: 'ACTIVE' | 'SUSPENDUE'
  artisanNom: string
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

const sampleArtisans: Artisan[] = [
  { id: '1', nom: 'Benali', prenom: 'Ahmed', email: 'ahmed@example.com', plan: 'PREMIUM', nbArticles: 45, status: 'ACTIF' },
  { id: '2', nom: 'Dupont', prenom: 'Marie', email: 'marie@example.com', plan: 'STANDARD', nbArticles: 28, status: 'ACTIF' },
  { id: '3', nom: 'Alami', prenom: 'Fatima', email: 'fatima@example.com', plan: 'BASIQUE', nbArticles: 12, status: 'SUSPENDU' },
]

const sampleBoutiques: Boutique[] = [
  { id: '1', nom: 'Dar Lakbira', slug: 'darlakbira', category: 'Artisanat', status: 'ACTIVE', artisanNom: 'Ahmed Benali' },
  { id: '2', nom: 'IRYA Cosmetics', slug: 'irya', category: 'Cosmetique', status: 'ACTIVE', artisanNom: 'Marie Dupont' },
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

export default function AdminDashboardPage() {
  const navigate = useNavigate()
  const { logout } = useAuthStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  
  const [artisans, setArtisans] = useState<Artisan[]>(sampleArtisans)
  const [boutiques, setBoutiques] = useState<Boutique[]>(sampleBoutiques)
  const [articles, setArticles] = useState<Article[]>(sampleArticles)
  const [commandes, setCommandes] = useState<Commande[]>(sampleCommandes)
  const [tickets, setTickets] = useState<TicketSupport[]>(sampleTickets)
  
  const [suspendModal, setSuspendModal] = useState<{type: string, id: string, name: string} | null>(null)
  const [suspendReason, setSuspendReason] = useState('')
  const [ticketReplyModal, setTicketReplyModal] = useState<string | null>(null)
  const [ticketReply, setTicketReply] = useState('')
  const [mergeForm, setMergeForm] = useState({ oldEmail: '', newUserId: '', reason: '' })

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'artisans', icon: '👥', label: 'Artisans' },
    { id: 'boutiques', icon: '🏪', label: 'Boutiques' },
    { id: 'articles', icon: '📦', label: 'Articles' },
    { id: 'commandes', icon: '📋', label: 'Commandes' },
    { id: 'tickets', icon: '🎫', label: 'Support' },
    { id: 'merge', icon: '🔗', label: 'Fusion comptes' },
    { id: 'home', icon: '🏠', label: 'Accueil', link: '/' },
  ]

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

          {activeSection === 'artisans' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Artisans</h2>
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
                        <td className="px-4 py-3">{artisan.prenom} {artisan.nom}</td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{artisan.email}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded-full bg-[#BFA26A]/20 text-[#BFA26A]">{artisan.plan}</span></td>
                        <td className="px-4 py-3">{artisan.nbArticles}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(artisan.status)}>{artisan.status}</span></td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            {artisan.status === 'ACTIF' ? (
                              <button onClick={() => setSuspendModal({type: 'artisan', id: artisan.id, name: artisan.nom})} className="p-2 hover:bg-red-500/20 rounded-lg"><UserX className="w-4 h-4 text-red-500" /></button>
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

          {activeSection === 'boutiques' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Gestion des Boutiques</h2>
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
                    {boutiques.map(boutique => (
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
