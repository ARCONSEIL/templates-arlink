import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Home, Compass, Package, Heart, ShoppingCart, Clock, Gift, User, HelpCircle, ChevronLeft, Search, Bell, Settings, Menu } from 'lucide-react'

interface Order {
  id: string
  date: string
  items: number
  total: number
  status: 'pending' | 'shipped' | 'delivered'
  shop: string
}

interface Favorite {
  id: string
  name: string
  price: number
  shop: string
  img?: string
}

export default function DashboardClientPage() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [orders] = useState<Order[]>([
    { id: 'CMD-001', date: '2026-01-15', items: 2, total: 134, status: 'delivered', shop: 'Bijoux Amazigh' },
    { id: 'CMD-002', date: '2026-01-12', items: 1, total: 89, status: 'shipped', shop: 'Artisanat Marrakech' },
    { id: 'CMD-003', date: '2026-01-10', items: 3, total: 215, status: 'pending', shop: 'Cuir Atlas' },
  ])
  const [favorites] = useState<Favorite[]>([
    { id: '1', name: 'Collier Amazigh', price: 89, shop: 'Bijoux Amazigh', img: 'https://moroccanzest.com/wp-content/uploads/2019/02/moroccan-jewelry.jpg' },
    { id: '2', name: 'Sac en cuir', price: 120, shop: 'Cuir Atlas', img: 'https://static01.nyt.com/images/2024/12/06/multimedia/06sp-jewelry-atlas-inyt-01-ljtb/29sp-jewelry-atlas-inyt-01-ljtb-videoSixteenByNineJumbo1600.jpg' },
  ])

  const navItems = [
    { id: 'home', icon: Home, label: 'Accueil' },
    { id: 'discover', icon: Compass, label: 'Decouvrir', link: '/galerie' },
    { id: 'orders', icon: Package, label: 'Mes commandes' },
    { id: 'favorites', icon: Heart, label: 'Favoris' },
    { id: 'cart', icon: ShoppingCart, label: 'Panier', link: '/panier' },
    { id: 'history', icon: Clock, label: 'Historique' },
    { id: 'offers', icon: Gift, label: 'Offres' },
    { id: 'profile', icon: User, label: 'Profil' },
    { id: 'support', icon: HelpCircle, label: 'Support' },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-[#22C55E]/20 text-[#22C55E]'
      case 'shipped': return 'bg-[#3B82F6]/20 text-[#3B82F6]'
      case 'pending': return 'bg-[#F59E0B]/20 text-[#F59E0B]'
      default: return 'bg-[#CFC6AE]/20 text-[#CFC6AE]'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livree'
      case 'shipped': return 'En transit'
      case 'pending': return 'En preparation'
      default: return status
    }
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#EDE6D2] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* MOBILE MENU BUTTON */}
      <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center">
        <Menu className="w-5 h-5" />
      </button>

      {/* MINI SIDEBAR - Hidden on mobile */}
      <aside className={`${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-[56px] bg-[#0b0b0b] border-r border-[#1f1f1f] flex flex-col fixed h-full z-40 transition-transform`}>
        <div className="p-3 border-b border-[#1f1f1f]">
          <div className="w-8 h-8 rounded-lg bg-[#BFA26A] flex items-center justify-center text-black font-bold text-sm">AR</div>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map((item) => (
            item.link ? (
              <Link key={item.id} to={item.link} className={`flex items-center justify-center w-10 h-10 mx-auto my-1 rounded-xl transition ${activeSection === item.id ? 'bg-[#1f1f1f] text-[#BFA26A]' : 'hover:bg-[#1f1f1f]/50 text-[#CFC6AE]'}`}>
                <item.icon className="w-5 h-5" />
              </Link>
            ) : (
              <button key={item.id} onClick={() => { setActiveSection(item.id); setDrawerOpen(true); setMobileMenuOpen(false); }} className={`flex items-center justify-center w-10 h-10 mx-auto my-1 rounded-xl transition ${activeSection === item.id ? 'bg-[#1f1f1f] text-[#BFA26A]' : 'hover:bg-[#1f1f1f]/50 text-[#CFC6AE]'}`}>
                <item.icon className="w-5 h-5" />
              </button>
            )
          ))}
        </nav>

        <div className="p-3 border-t border-[#1f1f1f]">
          <Link to="/" className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl hover:bg-[#1f1f1f]/50 transition text-[#CFC6AE]">
            <Home className="w-5 h-5" />
          </Link>
        </div>
      </aside>

      {/* DRAWER */}
      {drawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-30" onClick={() => setDrawerOpen(false)} />
          <aside className="fixed left-0 md:left-[56px] top-0 h-full w-full md:w-[260px] bg-[#0b0b0b] border-r border-[#1f1f1f] z-40 flex flex-col">
            <div className="p-4 border-b border-[#1f1f1f] flex items-center justify-between">
              <span className="font-semibold text-[#BFA26A]">{navItems.find(n => n.id === activeSection)?.label}</span>
              <button onClick={() => setDrawerOpen(false)} className="w-8 h-8 rounded-lg hover:bg-[#1f1f1f] flex items-center justify-center transition">
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto">
              {activeSection === 'home' && (
                <div className="space-y-4">
                  <p className="text-sm text-[#CFC6AE]">Bienvenue sur votre espace client ARLink</p>
                  <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                    <p className="text-sm font-semibold text-[#EDE6D2]">Commandes en cours</p>
                    <p className="text-2xl font-bold text-[#BFA26A] mt-1">{orders.filter(o => o.status !== 'delivered').length}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                    <p className="text-sm font-semibold text-[#EDE6D2]">Favoris</p>
                    <p className="text-2xl font-bold text-[#BFA26A] mt-1">{favorites.length}</p>
                  </div>
                </div>
              )}

              {activeSection === 'orders' && (
                <div className="space-y-3">
                  {orders.map(order => (
                    <div key={order.id} className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-[#EDE6D2]">#{order.id}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                      </div>
                      <p className="text-xs text-[#CFC6AE] mt-1">{order.shop}</p>
                      <p className="text-sm font-bold text-[#BFA26A] mt-1">{order.total} EUR</p>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'favorites' && (
                <div className="space-y-3">
                  {favorites.map(fav => (
                    <div key={fav.id} className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] flex gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#141414]">
                        {fav.img && <img src={fav.img} alt={fav.name} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate text-[#EDE6D2]">{fav.name}</p>
                        <p className="text-xs text-[#CFC6AE]">{fav.shop}</p>
                        <p className="text-sm font-bold text-[#BFA26A]">{fav.price} EUR</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'profile' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-[#BFA26A] flex items-center justify-center text-black font-bold">C</div>
                    <div>
                      <p className="font-semibold text-[#EDE6D2]">Client Demo</p>
                      <p className="text-xs text-[#CFC6AE]">client@arlink.online</p>
                    </div>
                  </div>
                  <button className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-left text-sm text-[#EDE6D2] hover:border-[#BFA26A] transition">Modifier le profil</button>
                  <button className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-left text-sm text-[#EDE6D2] hover:border-[#BFA26A] transition">Adresses de livraison</button>
                  <button className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-left text-sm text-[#EDE6D2] hover:border-[#BFA26A] transition">Moyens de paiement</button>
                </div>
              )}

              {activeSection === 'support' && (
                <div className="space-y-4">
                  <p className="text-sm text-[#CFC6AE]">Besoin d'aide? Contactez notre support</p>
                  <button className="w-full p-3 rounded-xl bg-[#BFA26A] text-black font-semibold text-sm hover:brightness-95 transition">Ouvrir un ticket</button>
                  <button className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-left text-sm text-[#EDE6D2] hover:border-[#BFA26A] transition">FAQ</button>
                  <button className="w-full p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] text-left text-sm text-[#EDE6D2] hover:border-[#BFA26A] transition">Politique de retour</button>
                </div>
              )}

              {activeSection === 'history' && (
                <div className="space-y-3">
                  <p className="text-sm text-[#CFC6AE]">Vos dernieres visites</p>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                    <p className="font-semibold text-sm text-[#EDE6D2]">Bijoux Amazigh</p>
                    <p className="text-xs text-[#CFC6AE]">Il y a 2 heures</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                    <p className="font-semibold text-sm text-[#EDE6D2]">Cuir Atlas</p>
                    <p className="text-xs text-[#CFC6AE]">Hier</p>
                  </div>
                </div>
              )}

              {activeSection === 'offers' && (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#BFA26A]/20 to-[#BFA26A]/5 border border-[#BFA26A]/30">
                    <p className="font-bold text-[#EDE6D2]">-20% sur les bijoux</p>
                    <p className="text-xs text-[#CFC6AE] mt-1">Valable jusqu'au 31 janvier</p>
                    <button className="mt-3 px-4 py-2 bg-[#BFA26A] text-black font-semibold text-sm rounded-lg hover:brightness-95 transition">Utiliser</button>
                  </div>
                  <div className="p-4 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f]">
                    <p className="font-bold text-[#EDE6D2]">Livraison gratuite</p>
                    <p className="text-xs text-[#CFC6AE] mt-1">Des 50 EUR d'achat</p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-0 md:ml-[56px]">
        {/* TOP BAR */}
        <header className="sticky top-0 z-20 bg-[#070707]/95 backdrop-blur-md border-b border-[#1f1f1f]">
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl px-3 py-2 w-full md:w-[400px] ml-12 md:ml-0">
              <Search className="w-4 h-4 text-[#CFC6AE] mr-2" />
              <input placeholder="Rechercher..." className="bg-transparent outline-none w-full text-sm text-[#EDE6D2]" />
            </div>
            <div className="flex items-center gap-2 md:gap-4 ml-2">
              <button className="w-10 h-10 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] flex items-center justify-center hover:border-[#BFA26A] transition relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center">2</span>
              </button>
              <button className="hidden md:flex w-10 h-10 rounded-xl bg-[#0f0f0f] border border-[#1f1f1f] items-center justify-center hover:border-[#BFA26A] transition">
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#BFA26A] flex items-center justify-center text-black font-bold">C</div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6">
          {/* KPI CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[#CFC6AE]">Commandes</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 text-[#EDE6D2]">{orders.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#BFA26A]/20 flex items-center justify-center">
                  <Package className="w-5 h-5 md:w-6 md:h-6 text-[#BFA26A]" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[#CFC6AE]">Favoris</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 text-[#EDE6D2]">{favorites.length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#BFA26A]/20 flex items-center justify-center">
                  <Heart className="w-5 h-5 md:w-6 md:h-6 text-[#BFA26A]" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[#CFC6AE]">En transit</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 text-[#EDE6D2]">{orders.filter(o => o.status === 'shipped').length}</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#BFA26A]/20 flex items-center justify-center">
                  <Clock className="w-5 h-5 md:w-6 md:h-6 text-[#BFA26A]" />
                </div>
              </div>
            </div>
            <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm text-[#CFC6AE]">Total</p>
                  <p className="text-xl md:text-2xl font-bold mt-1 text-[#EDE6D2]">{orders.reduce((sum, o) => sum + o.total, 0)} EUR</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#BFA26A]/20 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-[#BFA26A]" />
                </div>
              </div>
            </div>
          </div>

          {/* RECENT ORDERS */}
          <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[#EDE6D2]">Commandes recentes</h2>
              <button className="text-sm text-[#BFA26A] hover:underline">Voir tout</button>
            </div>
            <div className="space-y-3 md:space-y-4">
              {orders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-[#070707] border border-[#1f1f1f]">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-[#1f1f1f] flex items-center justify-center">
                      <Package className="w-4 h-4 md:w-5 md:h-5 text-[#CFC6AE]" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm md:text-base text-[#EDE6D2]">#{order.id}</p>
                      <p className="text-xs md:text-sm text-[#CFC6AE]">{order.shop} - {order.items} article(s)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm md:text-base text-[#EDE6D2]">{order.total} EUR</p>
                    <span className={`px-2 md:px-3 py-1 rounded-full text-xs ${getStatusColor(order.status)}`}>{getStatusLabel(order.status)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* FAVORITES */}
          <div className="rounded-2xl bg-[#0f0f0f] border border-[#1f1f1f] p-4 md:p-6">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-lg md:text-xl font-bold text-[#EDE6D2]">Mes favoris</h2>
              <button className="text-sm text-[#BFA26A] hover:underline">Voir tout</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {favorites.map(fav => (
                <div key={fav.id} className="rounded-xl bg-[#070707] border border-[#1f1f1f] overflow-hidden">
                  <div className="h-24 md:h-32 bg-[#1f1f1f]">
                    {fav.img && <img src={fav.img} alt={fav.name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-sm truncate text-[#EDE6D2]">{fav.name}</p>
                    <p className="text-xs text-[#CFC6AE]">{fav.shop}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-[#BFA26A]">{fav.price} EUR</span>
                      <button className="px-2 py-1 bg-[#BFA26A] text-black text-xs font-bold rounded-lg hover:brightness-95 transition">Acheter</button>
                    </div>
                  </div>
                </div>
              ))}
              <Link to="/galerie" className="rounded-xl bg-[#070707] border-2 border-dashed border-[#1f1f1f] flex items-center justify-center min-h-[150px] md:min-h-[200px] hover:border-[#BFA26A] transition">
                <div className="text-center">
                  <Compass className="w-6 h-6 md:w-8 md:h-8 mx-auto text-[#CFC6AE] mb-2" />
                  <p className="text-xs md:text-sm text-[#CFC6AE]">Decouvrir plus</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
