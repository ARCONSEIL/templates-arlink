import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, LogOut, Shield, CreditCard, RefreshCw, Eye, Edit2, Plus, X, AlertTriangle, CheckCircle } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

// Types
interface Admin {
  id: string
  email: string
  nom: string
  prenom: string
  role: 'ADMIN' | 'SUPER_ADMIN'
  status: 'ACTIF' | 'SUSPENDU'
  createdAt: string
  lastLogin: string
}

interface Plan {
  id: string
  nom: string
  prixMensuel: number
  prixAnnuel: number
  limiteArticles: number
  description: string
  isActive: boolean
}

interface CommissionRule {
  id: string
  nom: string
  minimum: number
  parTranche: number
  tranche: number
  isActive: boolean
}

interface SecurityLog {
  id: string
  adminEmail: string
  action: string
  ip: string
  userAgent: string
  createdAt: string
  status: 'SUCCESS' | 'FAILED'
}

interface RestoreLog {
  id: string
  adminEmail: string
  action: 'RESTORE' | 'PREVIEW' | 'BACKUP'
  filesModified: number
  status: 'SUCCESS' | 'FAILED'
  backupPath: string
  createdAt: string
  duration: number
}

interface RestoreResult {
  success: boolean
  message: string
  filesModified: FileChange[]
  backupPath: string
  duration: number
  timestamp: string
}

interface FileChange {
  path: string
  action: 'COPIED' | 'DELETED' | 'MODIFIED'
  sizeBefore: number
  sizeAfter: number
}

// Sample data
const sampleAdmins: Admin[] = [
  { id: '1', email: 'super@arlink.online', nom: 'Admin', prenom: 'Super', role: 'SUPER_ADMIN', status: 'ACTIF', createdAt: '2026-01-01', lastLogin: '2026-01-20' },
  { id: '2', email: 'admin@arlink.online', nom: 'Dupont', prenom: 'Jean', role: 'ADMIN', status: 'ACTIF', createdAt: '2026-01-10', lastLogin: '2026-01-19' },
]

const samplePlans: Plan[] = [
  { id: '1', nom: 'Basique', prixMensuel: 19.99, prixAnnuel: 199.90, limiteArticles: 30, description: 'Pour demarrer', isActive: true },
  { id: '2', nom: 'Standard', prixMensuel: 50.00, prixAnnuel: 500.00, limiteArticles: 60, description: 'Pour les artisans actifs', isActive: true },
  { id: '3', nom: 'Premium', prixMensuel: 100.00, prixAnnuel: 700.00, limiteArticles: 120, description: 'Pour les professionnels', isActive: true },
]

const sampleCommissionRules: CommissionRule[] = [
  { id: '1', nom: 'Commission standard', minimum: 1, parTranche: 1, tranche: 100, isActive: true },
]

const sampleSecurityLogs: SecurityLog[] = [
  { id: '1', adminEmail: 'super@arlink.online', action: 'LOGIN', ip: '192.168.1.1', userAgent: 'Chrome/120', createdAt: '2026-01-20 10:30:00', status: 'SUCCESS' },
  { id: '2', adminEmail: 'admin@arlink.online', action: 'SUSPEND_ARTISAN', ip: '192.168.1.2', userAgent: 'Firefox/115', createdAt: '2026-01-19 15:45:00', status: 'SUCCESS' },
]

const sampleRestoreLogs: RestoreLog[] = [
  { id: '1', adminEmail: 'super@arlink.online', action: 'RESTORE', filesModified: 12, status: 'SUCCESS', backupPath: '/backups/2026-01-19_14-30-00', createdAt: '2026-01-19 14:30:00', duration: 2.5 },
]

// Files that would be restored
const RESTORABLE_FILES = [
  { path: 'src/pages/HomePage.tsx', size: 34628 },
  { path: 'src/pages/GaleriePage.tsx', size: 8957 },
  { path: 'src/pages/BoutiquePage.tsx', size: 33491 },
  { path: 'src/pages/CartPage.tsx', size: 13346 },
  { path: 'src/pages/DashboardPage.tsx', size: 20639 },
  { path: 'src/pages/DashboardArtisanPage.tsx', size: 30511 },
  { path: 'src/pages/DashboardClientPage.tsx', size: 19762 },
  { path: 'src/pages/LoginPage.tsx', size: 8594 },
  { path: 'src/pages/RegisterPage.tsx', size: 13783 },
  { path: 'src/App.tsx', size: 1247 },
  { path: 'src/main.tsx', size: 312 },
  { path: 'src/index.css', size: 2156 },
  { path: 'src/stores/authStore.ts', size: 1845 },
  { path: 'src/services/api.ts', size: 2341 },
]

export default function SuperAdminDashboardPage() {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('dashboard')
  
  // Data states
  const [admins, setAdmins] = useState<Admin[]>(sampleAdmins)
  const [plans, setPlans] = useState<Plan[]>(samplePlans)
  const [commissionRules, setCommissionRules] = useState<CommissionRule[]>(sampleCommissionRules)
  const [securityLogs] = useState<SecurityLog[]>(sampleSecurityLogs)
  const [restoreLogs, setRestoreLogs] = useState<RestoreLog[]>(sampleRestoreLogs)
  
  // Modal states
  const [editPlanModal, setEditPlanModal] = useState<Plan | null>(null)
  const [editCommissionModal, setEditCommissionModal] = useState<CommissionRule | null>(null)
  const [addAdminModal, setAddAdminModal] = useState(false)
  const [newAdmin, setNewAdmin] = useState({ email: '', nom: '', prenom: '', role: 'ADMIN' as const })
  
  // Restore states
  const [restoreModal, setRestoreModal] = useState(false)
  const [restoreConfirmStep, setRestoreConfirmStep] = useState(0)
  const [restoreConfirmText, setRestoreConfirmText] = useState('')
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<RestoreResult | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const navItems = [
    { id: 'dashboard', icon: '📊', label: 'Tableau de bord' },
    { id: 'admins', icon: '👥', label: 'Administrateurs' },
    { id: 'plans', icon: '💳', label: 'Plans & Tarifs' },
    { id: 'commission', icon: '💰', label: 'Commission' },
    { id: 'security', icon: '🔒', label: 'Securite' },
    { id: 'maintenance', icon: '🔧', label: 'Maintenance' },
    { id: 'home', icon: '🏠', label: 'Accueil', link: '/' },
  ]

  // Stats
  const totalAdmins = admins.length
  const activePlans = plans.filter(p => p.isActive).length
  const totalRestores = restoreLogs.length

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const handleSuspendAdmin = (id: string) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, status: a.status === 'ACTIF' ? 'SUSPENDU' as const : 'ACTIF' as const } : a))
  }

  const handleUpdatePlan = () => {
    if (!editPlanModal) return
    setPlans(plans.map(p => p.id === editPlanModal.id ? editPlanModal : p))
    setEditPlanModal(null)
  }

  const handleUpdateCommission = () => {
    if (!editCommissionModal) return
    setCommissionRules(commissionRules.map(c => c.id === editCommissionModal.id ? editCommissionModal : c))
    setEditCommissionModal(null)
  }

  const handleAddAdmin = () => {
    if (!newAdmin.email || !newAdmin.nom) return
    const admin: Admin = {
      id: Date.now().toString(),
      ...newAdmin,
      status: 'ACTIF',
      createdAt: new Date().toISOString().split('T')[0],
      lastLogin: '-'
    }
    setAdmins([...admins, admin])
    setAddAdminModal(false)
    setNewAdmin({ email: '', nom: '', prenom: '', role: 'ADMIN' })
  }

  // RESTORE FUNCTIONS
  const openRestoreModal = (preview: boolean) => {
    setPreviewMode(preview)
    setRestoreModal(true)
    setRestoreConfirmStep(0)
    setRestoreConfirmText('')
    setRestoreResult(null)
  }

  const handleRestoreConfirm = () => {
    if (restoreConfirmStep === 0) {
      setRestoreConfirmStep(1)
    } else if (restoreConfirmStep === 1) {
      if (restoreConfirmText !== 'RESTAURER') {
        alert('Veuillez taper RESTAURER pour confirmer')
        return
      }
      executeRestore()
    }
  }

  const executeRestore = async () => {
    setIsRestoring(true)
    
    // Simulate restore process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const filesModified: FileChange[] = RESTORABLE_FILES.map(f => ({
      path: f.path,
      action: 'COPIED' as const,
      sizeBefore: f.size + Math.floor(Math.random() * 1000),
      sizeAfter: f.size
    }))
    
    const result: RestoreResult = {
      success: true,
      message: previewMode ? 'Preview termine - aucune modification appliquee' : 'Restauration terminee avec succes',
      filesModified,
      backupPath: `/backups/${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}`,
      duration: 2.5,
      timestamp: new Date().toISOString()
    }
    
    setRestoreResult(result)
    setIsRestoring(false)
    
    // Add to logs
    if (!previewMode) {
      const log: RestoreLog = {
        id: Date.now().toString(),
        adminEmail: user?.email || 'super@arlink.online',
        action: 'RESTORE',
        filesModified: filesModified.length,
        status: 'SUCCESS',
        backupPath: result.backupPath,
        createdAt: new Date().toISOString(),
        duration: result.duration
      }
      setRestoreLogs([log, ...restoreLogs])
    }
  }

  const closeRestoreModal = () => {
    setRestoreModal(false)
    setRestoreConfirmStep(0)
    setRestoreConfirmText('')
    setRestoreResult(null)
    setPreviewMode(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIF': case 'SUCCESS': return 'bg-green-500/20 text-green-500'
      case 'SUSPENDU': case 'FAILED': return 'bg-red-500/20 text-red-500'
      default: return 'bg-gray-500/20 text-gray-500'
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#EDE6D2] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
      <aside className={sidebarOpen ? 'w-[260px] bg-[#0a0c0f] border-r border-[#232a33] flex flex-col fixed h-full z-40' : 'w-[52px] bg-[#0a0c0f] border-r border-[#232a33] flex flex-col fixed h-full z-40'}>
        <div className="p-4 border-b border-[#232a33] flex items-center justify-between">
          {sidebarOpen && <span className="text-[#EF4444] font-bold text-lg">Super Admin</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="w-8 h-8 rounded-lg bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
            {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map((item) => (
            item.link ? (
              <Link key={item.id} to={item.link} className={'flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ' + (activeSection === item.id ? 'bg-[#14181d] border border-[#EF4444]/30' : '')}>
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="text-sm">{item.label}</span>}
              </Link>
            ) : (
              <button key={item.id} onClick={() => setActiveSection(item.id)} className={'w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition hover:bg-[#14181d] ' + (activeSection === item.id ? 'bg-[#14181d] border border-[#EF4444]/30' : '')}>
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

      {/* MAIN CONTENT */}
      <main className={sidebarOpen ? 'flex-1 ml-[260px]' : 'flex-1 ml-[52px]'}>
        <header className="sticky top-0 z-30 bg-[#0d0f12]/95 backdrop-blur-md border-b border-[#232a33]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#CFC6AE]">
              <span className="text-[#EF4444]">Super Admin</span>
              <span>/</span>
              <span className="text-[#EDE6D2]">{navItems.find(n => n.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#EF4444] flex items-center justify-center text-white font-bold">SA</div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* DASHBOARD */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Tableau de bord Super Admin</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <Shield className="w-6 h-6 text-[#EF4444] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Administrateurs</p>
                  <p className="text-2xl font-bold">{totalAdmins}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <CreditCard className="w-6 h-6 text-[#EF4444] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Plans actifs</p>
                  <p className="text-2xl font-bold">{activePlans}</p>
                </div>
                <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-5">
                  <RefreshCw className="w-6 h-6 text-[#EF4444] mb-2" />
                  <p className="text-[#CFC6AE] text-sm">Restaurations</p>
                  <p className="text-2xl font-bold">{totalRestores}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => setActiveSection('admins')} className="px-4 py-2 bg-[#EF4444] text-white font-bold rounded-xl hover:brightness-95 transition">Gerer admins</button>
                <button onClick={() => setActiveSection('plans')} className="px-4 py-2 bg-[#14181d] border border-[#232a33] rounded-xl hover:border-[#EF4444] transition">Plans & Tarifs</button>
                <button onClick={() => setActiveSection('maintenance')} className="px-4 py-2 bg-[#14181d] border border-[#232a33] rounded-xl hover:border-[#EF4444] transition">Maintenance</button>
              </div>
            </div>
          )}

          {/* ADMINS */}
          {activeSection === 'admins' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Administrateurs</h2>
                <button onClick={() => setAddAdminModal(true)} className="px-4 py-2 bg-[#EF4444] text-white font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter admin</button>
              </div>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Nom</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Email</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Role</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Derniere connexion</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {admins.map(admin => (
                      <tr key={admin.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3">{admin.prenom} {admin.nom}</td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{admin.email}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + (admin.role === 'SUPER_ADMIN' ? 'bg-[#EF4444]/20 text-[#EF4444]' : 'bg-[#3B82F6]/20 text-[#3B82F6]')}>{admin.role}</span></td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(admin.status)}>{admin.status}</span></td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{admin.lastLogin}</td>
                        <td className="px-4 py-3">
                          {admin.role !== 'SUPER_ADMIN' && (
                            <button onClick={() => handleSuspendAdmin(admin.id)} className={'p-2 rounded-lg ' + (admin.status === 'ACTIF' ? 'hover:bg-red-500/20 text-red-500' : 'hover:bg-green-500/20 text-green-500')}>
                              {admin.status === 'ACTIF' ? 'Suspendre' : 'Activer'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PLANS */}
          {activeSection === 'plans' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Plans & Tarifs</h2>
              <p className="text-[#CFC6AE]">Annuel = 10 mois payes = 12 mois actifs (2 mois offerts)</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map(plan => (
                  <div key={plan.id} className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6">
                    <h3 className="text-xl font-bold text-[#BFA26A]">{plan.nom}</h3>
                    <p className="text-[#CFC6AE] text-sm mt-1">{plan.description}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-2xl font-bold">{plan.prixMensuel.toFixed(2)} EUR<span className="text-sm text-[#CFC6AE]">/mois</span></p>
                      <p className="text-lg">{plan.prixAnnuel.toFixed(2)} EUR<span className="text-sm text-[#CFC6AE]">/an</span></p>
                      <p className="text-[#CFC6AE]">Limite: {plan.limiteArticles} articles</p>
                    </div>
                    <button onClick={() => setEditPlanModal(plan)} className="mt-4 w-full px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition flex items-center justify-center gap-2"><Edit2 className="w-4 h-4" />Modifier</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* COMMISSION */}
          {activeSection === 'commission' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Regles de Commission</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6 max-w-xl">
                <p className="text-[#CFC6AE] mb-4">Formule: Commission = max(minimum, floor(prix_ttc / tranche) * par_tranche)</p>
                {commissionRules.map(rule => (
                  <div key={rule.id} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-[#CFC6AE]">Minimum (EUR)</label>
                        <p className="text-xl font-bold">{rule.minimum} EUR</p>
                      </div>
                      <div>
                        <label className="text-sm text-[#CFC6AE]">Par tranche de {rule.tranche} EUR</label>
                        <p className="text-xl font-bold">{rule.parTranche} EUR</p>
                      </div>
                    </div>
                    <div className="p-4 bg-[#0d0f12] rounded-xl">
                      <p className="text-sm text-[#CFC6AE]">Exemples:</p>
                      <ul className="text-sm mt-2 space-y-1">
                        <li>Commande 50 EUR TTC = 1 EUR commission</li>
                        <li>Commande 150 EUR TTC = 1 EUR commission</li>
                        <li>Commande 250 EUR TTC = 2 EUR commission</li>
                        <li>Commande 500 EUR TTC = 5 EUR commission</li>
                      </ul>
                    </div>
                    <button onClick={() => setEditCommissionModal(rule)} className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition flex items-center gap-2"><Edit2 className="w-4 h-4" />Modifier</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Logs de Securite</h2>
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                <table className="w-full">
                  <thead className="bg-[#0d0f12]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Date</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Admin</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Action</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">IP</th>
                      <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityLogs.map(log => (
                      <tr key={log.id} className="border-t border-[#232a33]">
                        <td className="px-4 py-3 text-xs text-[#CFC6AE]">{log.createdAt}</td>
                        <td className="px-4 py-3">{log.adminEmail}</td>
                        <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded bg-[#3B82F6]/20 text-[#3B82F6]">{log.action}</span></td>
                        <td className="px-4 py-3 text-[#CFC6AE]">{log.ip}</td>
                        <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(log.status)}>{log.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MAINTENANCE - RESTORE BEST VERSION */}
          {activeSection === 'maintenance' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">Maintenance</h2>
              
              {/* RESTORE SECTION */}
              <div className="rounded-2xl border border-[#EF4444]/30 bg-[#14181d] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 flex items-center justify-center">
                    <RefreshCw className="w-6 h-6 text-[#EF4444]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">Restaurer la meilleure version</h3>
                    <p className="text-[#CFC6AE] mt-2">Remettre le Front (UI/Pages) dans son etat stable "best version" en cas de bug ou modification ratee.</p>
                    
                    <div className="mt-4 p-4 bg-[#0d0f12] rounded-xl">
                      <p className="text-sm font-semibold text-[#BFA26A]">Ce qui sera restaure:</p>
                      <ul className="text-sm text-[#CFC6AE] mt-2 space-y-1">
                        <li>- Pages: HomePage, GaleriePage, BoutiquePage, CartPage, etc.</li>
                        <li>- Composants: Layout, Footer, Header</li>
                        <li>- Styles: index.css, Tailwind config</li>
                        <li>- Config: App.tsx, main.tsx</li>
                      </ul>
                      <p className="text-sm font-semibold text-green-500 mt-3">Ce qui NE sera PAS touche:</p>
                      <ul className="text-sm text-[#CFC6AE] mt-2 space-y-1">
                        <li>- Base de donnees (aucune migration, aucun seed)</li>
                        <li>- Donnees utilisateur (commandes, produits, comptes)</li>
                        <li>- Fichiers .env et credentials</li>
                      </ul>
                    </div>
                    
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button onClick={() => openRestoreModal(true)} className="px-6 py-3 bg-[#3B82F6] text-white font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2">
                        <Eye className="w-4 h-4" />Preview (Dry-run)
                      </button>
                      <button onClick={() => openRestoreModal(false)} className="px-6 py-3 bg-[#EF4444] text-white font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2">
                        <RefreshCw className="w-4 h-4" />Restaurer la meilleure version
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* RESTORE LOGS */}
              <div className="rounded-2xl border border-[#232a33] bg-[#14181d] p-6">
                <h3 className="text-lg font-bold mb-4">Historique des restaurations</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#0d0f12]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Date</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Admin</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Action</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Fichiers</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Duree</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Statut</th>
                        <th className="px-4 py-3 text-left text-xs text-[#CFC6AE]">Backup</th>
                      </tr>
                    </thead>
                    <tbody>
                      {restoreLogs.map(log => (
                        <tr key={log.id} className="border-t border-[#232a33]">
                          <td className="px-4 py-3 text-xs text-[#CFC6AE]">{log.createdAt}</td>
                          <td className="px-4 py-3">{log.adminEmail}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 text-xs rounded bg-[#EF4444]/20 text-[#EF4444]">{log.action}</span></td>
                          <td className="px-4 py-3">{log.filesModified}</td>
                          <td className="px-4 py-3">{log.duration}s</td>
                          <td className="px-4 py-3"><span className={'px-2 py-1 text-xs rounded-full ' + getStatusColor(log.status)}>{log.status}</span></td>
                          <td className="px-4 py-3 text-xs text-[#CFC6AE]">{log.backupPath}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* RESTORE MODAL */}
      {restoreModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {previewMode ? <Eye className="w-5 h-5 text-[#3B82F6]" /> : <RefreshCw className="w-5 h-5 text-[#EF4444]" />}
                {previewMode ? 'Preview - Dry Run' : 'Restaurer la meilleure version'}
              </h3>
              <button onClick={closeRestoreModal} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>

            {/* RESULT VIEW */}
            {restoreResult && (
              <div className="space-y-4">
                <div className={'p-4 rounded-xl flex items-center gap-3 ' + (restoreResult.success ? 'bg-green-500/20' : 'bg-red-500/20')}>
                  {restoreResult.success ? <CheckCircle className="w-6 h-6 text-green-500" /> : <AlertTriangle className="w-6 h-6 text-red-500" />}
                  <div>
                    <p className="font-bold">{restoreResult.success ? 'Succes' : 'Echec'}</p>
                    <p className="text-sm text-[#CFC6AE]">{restoreResult.message}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#0d0f12] rounded-xl">
                  <p className="text-sm text-[#CFC6AE]">Timestamp: {restoreResult.timestamp}</p>
                  <p className="text-sm text-[#CFC6AE]">Duree: {restoreResult.duration}s</p>
                  {!previewMode && <p className="text-sm text-[#CFC6AE]">Backup: {restoreResult.backupPath}</p>}
                </div>

                <div>
                  <p className="font-semibold mb-2">Fichiers {previewMode ? 'qui seraient modifies' : 'modifies'} ({restoreResult.filesModified.length}):</p>
                  <div className="max-h-60 overflow-y-auto bg-[#0d0f12] rounded-xl p-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-[#CFC6AE]">
                          <th className="text-left pb-2">Fichier</th>
                          <th className="text-left pb-2">Action</th>
                          <th className="text-right pb-2">Taille</th>
                        </tr>
                      </thead>
                      <tbody>
                        {restoreResult.filesModified.map((file, i) => (
                          <tr key={i} className="border-t border-[#232a33]">
                            <td className="py-2 font-mono text-xs">{file.path}</td>
                            <td className="py-2"><span className="px-2 py-1 text-xs rounded bg-green-500/20 text-green-500">{file.action}</span></td>
                            <td className="py-2 text-right text-[#CFC6AE]">{(file.sizeAfter / 1024).toFixed(1)} KB</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={closeRestoreModal} className="flex-1 px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl">Fermer</button>
                  {previewMode && (
                    <button onClick={() => { setPreviewMode(false); setRestoreResult(null); setRestoreConfirmStep(0) }} className="flex-1 px-6 py-3 bg-[#EF4444] text-white font-bold rounded-xl">Appliquer maintenant</button>
                  )}
                </div>
              </div>
            )}

            {/* CONFIRMATION STEPS */}
            {!restoreResult && !isRestoring && (
              <div className="space-y-4">
                {restoreConfirmStep === 0 && (
                  <>
                    <div className="p-4 bg-yellow-500/20 rounded-xl flex items-start gap-3">
                      <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-yellow-500">Attention</p>
                        <p className="text-sm text-[#CFC6AE]">
                          {previewMode 
                            ? 'Le mode Preview va simuler la restauration sans appliquer de modifications.'
                            : 'Cette action va restaurer tous les fichiers frontend vers la version stable. Un backup sera cree automatiquement.'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="font-semibold mb-2">Fichiers qui seront {previewMode ? 'analyses' : 'restaures'} ({RESTORABLE_FILES.length}):</p>
                      <div className="max-h-40 overflow-y-auto bg-[#0d0f12] rounded-xl p-4">
                        {RESTORABLE_FILES.map((file, i) => (
                          <div key={i} className="flex justify-between text-sm py-1 border-b border-[#232a33] last:border-0">
                            <span className="font-mono text-xs">{file.path}</span>
                            <span className="text-[#CFC6AE]">{(file.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button onClick={closeRestoreModal} className="flex-1 px-6 py-3 bg-[#232a33] rounded-xl">Annuler</button>
                      <button onClick={handleRestoreConfirm} className={'flex-1 px-6 py-3 font-bold rounded-xl ' + (previewMode ? 'bg-[#3B82F6] text-white' : 'bg-[#EF4444] text-white')}>
                        {previewMode ? 'Lancer Preview' : 'Continuer'}
                      </button>
                    </div>
                  </>
                )}

                {restoreConfirmStep === 1 && !previewMode && (
                  <>
                    <div className="p-4 bg-red-500/20 rounded-xl">
                      <p className="font-bold text-red-500">Confirmation finale</p>
                      <p className="text-sm text-[#CFC6AE] mt-2">Pour confirmer la restauration, tapez <span className="font-mono font-bold">RESTAURER</span> ci-dessous:</p>
                    </div>

                    <input 
                      type="text" 
                      value={restoreConfirmText} 
                      onChange={(e) => setRestoreConfirmText(e.target.value.toUpperCase())}
                      className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#EF4444] text-center font-mono text-lg"
                      placeholder="RESTAURER"
                    />

                    <div className="flex gap-3">
                      <button onClick={() => setRestoreConfirmStep(0)} className="flex-1 px-6 py-3 bg-[#232a33] rounded-xl">Retour</button>
                      <button 
                        onClick={handleRestoreConfirm} 
                        disabled={restoreConfirmText !== 'RESTAURER'}
                        className="flex-1 px-6 py-3 bg-[#EF4444] text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirmer la restauration
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* LOADING */}
            {isRestoring && (
              <div className="py-12 text-center">
                <RefreshCw className="w-12 h-12 text-[#BFA26A] mx-auto animate-spin" />
                <p className="mt-4 text-lg font-semibold">{previewMode ? 'Analyse en cours...' : 'Restauration en cours...'}</p>
                <p className="text-[#CFC6AE]">Veuillez patienter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* EDIT PLAN MODAL */}
      {editPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Modifier {editPlanModal.nom}</h3>
              <button onClick={() => setEditPlanModal(null)} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Prix mensuel (EUR)</label>
                <input type="number" step="0.01" value={editPlanModal.prixMensuel} onChange={(e) => setEditPlanModal({...editPlanModal, prixMensuel: parseFloat(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Prix annuel (EUR)</label>
                <input type="number" step="0.01" value={editPlanModal.prixAnnuel} onChange={(e) => setEditPlanModal({...editPlanModal, prixAnnuel: parseFloat(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Limite articles</label>
                <input type="number" value={editPlanModal.limiteArticles} onChange={(e) => setEditPlanModal({...editPlanModal, limiteArticles: parseInt(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <button onClick={handleUpdatePlan} className="w-full px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT COMMISSION MODAL */}
      {editCommissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Modifier Commission</h3>
              <button onClick={() => setEditCommissionModal(null)} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Minimum (EUR)</label>
                <input type="number" step="0.01" value={editCommissionModal.minimum} onChange={(e) => setEditCommissionModal({...editCommissionModal, minimum: parseFloat(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Par tranche (EUR)</label>
                <input type="number" step="0.01" value={editCommissionModal.parTranche} onChange={(e) => setEditCommissionModal({...editCommissionModal, parTranche: parseFloat(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Tranche (EUR)</label>
                <input type="number" value={editCommissionModal.tranche} onChange={(e) => setEditCommissionModal({...editCommissionModal, tranche: parseInt(e.target.value)})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
              </div>
              <button onClick={handleUpdateCommission} className="w-full px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD ADMIN MODAL */}
      {addAdminModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#14181d] rounded-2xl border border-[#232a33] p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Ajouter un administrateur</h3>
              <button onClick={() => setAddAdminModal(false)} className="p-2 hover:bg-[#232a33] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                <input type="email" value={newAdmin.email} onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" placeholder="admin@arlink.online" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Prenom</label>
                  <input value={newAdmin.prenom} onChange={(e) => setNewAdmin({...newAdmin, prenom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
                </div>
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Nom</label>
                  <input value={newAdmin.nom} onChange={(e) => setNewAdmin({...newAdmin, nom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]" />
                </div>
              </div>
              <div>
                <label className="text-sm text-[#CFC6AE] block mb-2">Role</label>
                <select value={newAdmin.role} onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as 'ADMIN'})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A]">
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <button onClick={handleAddAdmin} className="w-full px-6 py-3 bg-[#EF4444] text-white font-bold rounded-xl">Ajouter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
