import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Eye, ChevronLeft, ChevronRight, Search, Bell, Settings, LogOut, Save, Trash2, Upload } from 'lucide-react'

interface Product {
  id: string
  nom: string
  description: string
  prix: number
  stock: number
  img?: string
  category: string
}

interface SocialNetwork {
  name: string
  url: string
  enabled: boolean
}

export default function DashboardArtisanPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeSection, setActiveSection] = useState('assistant')
  const [products, setProducts] = useState<Product[]>([
    { id: '1', nom: 'Collier Amazigh', description: 'Collier traditionnel berbere', prix: 89, stock: 12, category: 'Bijoux', img: 'https://moroccanzest.com/wp-content/uploads/2019/02/moroccan-jewelry.jpg' },
    { id: '2', nom: 'Bracelet Touareg', description: 'Bracelet en cuir et argent', prix: 45, stock: 8, category: 'Bijoux', img: 'https://static01.nyt.com/images/2024/12/06/multimedia/06sp-jewelry-atlas-inyt-01-ljtb/29sp-jewelry-atlas-inyt-01-ljtb-videoSixteenByNineJumbo1600.jpg' },
  ])
  const [socialNetworks, setSocialNetworks] = useState<SocialNetwork[]>([
    { name: 'Instagram', url: '', enabled: false },
    { name: 'TikTok', url: '', enabled: false },
    { name: 'YouTube', url: '', enabled: false },
    { name: 'Facebook', url: '', enabled: false },
    { name: 'Pinterest', url: '', enabled: false },
    { name: 'Google Business', url: '', enabled: false },
    { name: 'WhatsApp', url: '', enabled: false },
    { name: 'Site Web', url: '', enabled: false },
    { name: 'Email Pro', url: '', enabled: false },
  ])
    const [newProduct, setNewProduct] = useState({ nom: '', description: '', prix: 0, stock: 0, category: '' })
    const [shopInfo, setShopInfo] = useState({
    name: 'Ma Boutique Artisanale',
    description: 'Artisanat authentique du Maroc',
    address: 'Marrakech, Maroc',
    phone: '+212 6 00 00 00 00',
    email: 'contact@maboutique.com'
  })

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

    const handleAddProduct = () => {
      if (!newProduct.nom || !newProduct.prix) return
      const product: Product = {
        id: Date.now().toString(),
        ...newProduct
      }
      setProducts([...products, product])
      setNewProduct({ nom: '', description: '', prix: 0, stock: 0, category: '' })
    }

  const handleDeleteProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id))
  }

  const updateSocialUrl= (index: number, url: string) => {
    const updated = [...socialNetworks]
    updated[index].url = url
    setSocialNetworks(updated)
  }

  return (
    <div className="min-h-screen bg-[#0d0f12] text-[#EDE6D2] flex" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* SIDEBAR */}
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
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/10 transition">
            <LogOut className="w-4 h-4" />
            {sidebarOpen && <span className="text-sm">Deconnexion</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`flex-1 ${sidebarOpen ? 'ml-[260px]' : 'ml-[52px]'} transition-all duration-300`}>
        {/* TOP BAR */}
        <header className="sticky top-0 z-30 bg-[#0d0f12]/95 backdrop-blur-md border-b border-[#232a33]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-[#CFC6AE]">
              <span>Dashboard</span>
              <span>/</span>
              <span className="text-[#EDE6D2]">{navItems.find(n => n.id === activeSection)?.label}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center bg-[#14181d] border border-[#232a33] rounded-xl px-3 py-2 w-[280px]">
                <Search className="w-4 h-4 text-[#CFC6AE] mr-2" />
                <input placeholder="Rechercher..." className="bg-transparent outline-none w-full text-sm text-[#EDE6D2]" />
              </div>
              <button className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#EF4444] rounded-full text-[10px] flex items-center justify-center">3</span>
              </button>
              <button className="w-10 h-10 rounded-xl bg-[#14181d] border border-[#232a33] flex items-center justify-center hover:border-[#BFA26A] transition">
                <Settings className="w-4 h-4" />
              </button>
              <div className="w-10 h-10 rounded-xl bg-[#BFA26A] flex items-center justify-center text-black font-bold">A</div>
            </div>
          </div>
        </header>

        <div className="p-6">
          {/* ASSISTANT */}
          {activeSection === 'assistant' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Assistant IA</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#BFA26A] flex items-center justify-center text-2xl">🤖</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#EDE6D2]">Bonjour! Je suis votre assistant ARLink</h3>
                    <p className="text-[#CFC6AE] mt-2">Je peux vous aider a optimiser votre boutique, generer des descriptions de produits, et ameliorer votre visibilite en ligne.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition">Optimiser mes descriptions</button>
                      <button className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition">Conseils SEO</button>
                      <button className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition">Analyser mes ventes</button>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <div className="flex items-center gap-3">
                    <input placeholder="Posez votre question..." className="flex-1 bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                    <button className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition">Envoyer</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ADD PRODUCT */}
          {activeSection === 'add' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Ajouter un article</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom du produit</label>
                    <input value={newProduct.nom} onChange={(e) => setNewProduct({...newProduct, nom: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="Ex: Collier Amazigh" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Categorie</label>
                    <select value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]">
                      <option value="">Selectionner...</option>
                      <option value="Bijoux">Bijoux</option>
                      <option value="Textile">Textile</option>
                      <option value="Ceramique">Ceramique</option>
                      <option value="Cuir">Cuir</option>
                      <option value="Bois">Bois</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Description</label>
                    <textarea value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[100px]" placeholder="Decrivez votre produit..." />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Prix (EUR)</label>
                    <input type="number" value={newProduct.prix} onChange={(e) => setNewProduct({...newProduct, prix: parseFloat(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="0.00" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Stock</label>
                    <input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value) || 0})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="0" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Images</label>
                    <div className="border-2 border-dashed border-[#232a33] rounded-xl p-8 text-center hover:border-[#BFA26A] transition cursor-pointer">
                      <Upload className="w-8 h-8 mx-auto text-[#CFC6AE] mb-2" />
                      <p className="text-[#CFC6AE]">Glissez vos images ici ou cliquez pour telecharger</p>
                      <p className="text-xs text-[#CFC6AE] mt-1">PNG, JPG jusqu'a 5MB</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                  <button onClick={() => setNewProduct({ nom: '', description: '', prix: 0, stock: 0, category: '' })} className="px-6 py-3 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition">Annuler</button>
                  <button onClick={handleAddProduct} className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Save className="w-4 h-4" />Enregistrer</button>
                </div>
              </div>
            </div>
          )}

          {/* PRODUCTS LIST */}
          {activeSection === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes articles ({products.length})</h2>
                <button onClick={() => setActiveSection('add')} className="px-4 py-2 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Plus className="w-4 h-4" />Ajouter</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div key={product.id} className="rounded-3xl border border-[#232a33] bg-[#14181d] overflow-hidden">
                    <div className="h-40 bg-[#0d0f12]">
                      {product.img ? <img src={product.img} alt={product.nom} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-[#EDE6D2] truncate">{product.nom}</h4>
                      <p className="text-sm text-[#CFC6AE] truncate">{product.description}</p>
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-[#BFA26A] font-bold">{product.prix.toFixed(2)} EUR</span>
                        <span className="text-xs text-[#CFC6AE]">Stock: {product.stock}</span>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <button className="flex-1 px-3 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl text-sm hover:border-[#BFA26A] transition">Modifier</button>
                        <button onClick={() => handleDeleteProduct(product.id)} className="px-3 py-2 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-xl text-[#EF4444] hover:bg-[#EF4444]/30 transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SALES */}
          {activeSection === 'sales' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes Ventes</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-[#CFC6AE] text-sm">Chiffre d'affaires</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">1,234.00 EUR</p>
                  <p className="text-xs text-[#22C55E] mt-1">+12% ce mois</p>
                </div>
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">📦</div>
                  <p className="text-[#CFC6AE] text-sm">Commandes</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">23</p>
                  <p className="text-xs text-[#22C55E] mt-1">+5 cette semaine</p>
                </div>
                <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                  <div className="text-3xl mb-2">👥</div>
                  <p className="text-[#CFC6AE] text-sm">Clients</p>
                  <p className="text-2xl font-bold text-[#EDE6D2] mt-1">18</p>
                  <p className="text-xs text-[#22C55E] mt-1">+3 nouveaux</p>
                </div>
              </div>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <h3 className="text-lg font-semibold text-[#EDE6D2] mb-4">Dernieres ventes</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#0d0f12] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#14181d] flex items-center justify-center">📦</div>
                      <div><p className="font-semibold">Collier Amazigh</p><p className="text-xs text-[#CFC6AE]">Il y a 2 heures</p></div>
                    </div>
                    <span className="text-[#22C55E] font-bold">+89.00 EUR</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#0d0f12] rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#14181d] flex items-center justify-center">📦</div>
                      <div><p className="font-semibold">Bracelet Touareg</p><p className="text-xs text-[#CFC6AE]">Hier</p></div>
                    </div>
                    <span className="text-[#22C55E] font-bold">+45.00 EUR</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SOCIAL NETWORKS */}
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
                {[
                  { name: 'Instagram', icon: '📷', hint: 'Reels + Photos', placeholder: 'https://instagram.com/...' },
                  { name: 'TikTok', icon: '🎥', hint: 'Shorts viraux', placeholder: 'https://tiktok.com/@...' },
                  { name: 'YouTube', icon: '▶️', hint: 'Videos longues', placeholder: 'https://youtube.com/@...' },
                  { name: 'Facebook', icon: '📘', hint: 'Page pro', placeholder: 'https://facebook.com/...' },
                  { name: 'Pinterest', icon: '📌', hint: 'Inspirations', placeholder: 'https://pinterest.com/...' },
                  { name: 'Google Business', icon: '📍', hint: 'Fiche locale', placeholder: 'https://g.page/...' },
                  { name: 'WhatsApp', icon: '💬', hint: 'Contact direct', placeholder: '+1 555...' },
                  { name: 'Site Web', icon: '🌐', hint: 'Reference', placeholder: 'https://...' },
                  { name: 'Email Pro', icon: '✉️', hint: 'Contact', placeholder: 'contact@...' },
                ].map((network, index) => (
                  <div key={network.name} className="rounded-2xl border border-[#2d3743] bg-[#0f1318] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#10161d] border border-[#2d3743] flex items-center justify-center text-lg">{network.icon}</div>
                        <div>
                          <div className="font-semibold text-[#EDE6D2]">{network.name}</div>
                          <div className="text-xs text-[#CFC6AE]">{network.hint}</div>
                        </div>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full border border-[#3B82F6]/35 bg-[#3B82F6]/14 text-[#EDE6D2]">+vues</span>
                    </div>
                    <input 
                      value={socialNetworks[index]?.url || ''} 
                      onChange={(e) => updateSocialUrl(index, e.target.value)} 
                      placeholder={network.placeholder} 
                      className="w-full bg-[#0f1318] border border-[#2d3743] rounded-xl px-3 py-2 outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/15 text-[#EDE6D2] text-sm transition" 
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition">Appliquer au cadre boutique</button>
                <button className="px-6 py-3 bg-[#14181d] border border-[#2d3743] text-[#EDE6D2] font-bold rounded-xl hover:border-[#BFA26A] transition">Copier tous les liens</button>
              </div>
            </div>
          )}

          {/* INFO */}
          {activeSection === 'info' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Informations de la boutique</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom de la boutique</label>
                    <input value={shopInfo.name} onChange={(e) => setShopInfo({...shopInfo, name: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                    <input value={shopInfo.email} onChange={(e) => setShopInfo({...shopInfo, email: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Description</label>
                    <textarea value={shopInfo.description} onChange={(e) => setShopInfo({...shopInfo, description: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[100px]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Adresse</label>
                    <input value={shopInfo.address} onChange={(e) => setShopInfo({...shopInfo, address: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Telephone</label>
                    <input value={shopInfo.phone} onChange={(e) => setShopInfo({...shopInfo, phone: e.target.value})} className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition flex items-center gap-2"><Save className="w-4 h-4" />Sauvegarder</button>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE */}
          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mon Profil</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-24 h-24 rounded-full bg-[#BFA26A] flex items-center justify-center text-4xl text-black font-bold">A</div>
                  <div>
                    <h3 className="text-xl font-semibold">Artisan Demo</h3>
                    <p className="text-[#CFC6AE]">artisan@arlink.online</p>
                    <button className="mt-2 text-sm text-[#3B82F6] hover:underline">Changer la photo</button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Prenom</label>
                    <input defaultValue="Artisan" className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Nom</label>
                    <input defaultValue="Demo" className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                    <input defaultValue="artisan@arlink.online" className="w-full bg-[#0d0f12] border border-[#232a33] rounded-xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" />
                  </div>
                </div>
                <div className="mt-6 flex justify-end">
                  <button className="px-6 py-3 bg-[#BFA26A] text-black font-bold rounded-xl hover:brightness-95 transition">Mettre a jour</button>
                </div>
              </div>
            </div>
          )}

          {/* SHOP */}
          {activeSection === 'shop' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Ma Boutique</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <p className="text-[#CFC6AE]">Votre boutique est accessible a l'adresse:</p>
                <a href="#" className="text-[#3B82F6] text-lg font-semibold hover:underline mt-2 block">maboutique.arlink.online</a>
                <div className="mt-6 flex gap-3">
                  <button className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-xl hover:brightness-95 transition">Voir ma boutique</button>
                  <button className="px-4 py-2 bg-[#0d0f12] border border-[#232a33] rounded-xl hover:border-[#BFA26A] transition">Personnaliser</button>
                </div>
              </div>
            </div>
          )}

          {/* ORDERS */}
          {activeSection === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mes Commandes</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-[#0d0f12] rounded-xl">
                    <div>
                      <p className="font-semibold">#CMD-001</p>
                      <p className="text-sm text-[#CFC6AE]">2 articles - Jean Dupont</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#EDE6D2]">134.00 EUR</p>
                      <span className="px-2 py-1 bg-[#22C55E]/20 text-[#22C55E] text-xs rounded-full">Livree</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-[#0d0f12] rounded-xl">
                    <div>
                      <p className="font-semibold">#CMD-002</p>
                      <p className="text-sm text-[#CFC6AE]">1 article - Marie Martin</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-[#EDE6D2]">89.00 EUR</p>
                      <span className="px-2 py-1 bg-[#3B82F6]/20 text-[#3B82F6] text-xs rounded-full">En cours</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {activeSection === 'preview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-[#EDE6D2]">Mon Avant-gout</h2>
              <div className="rounded-3xl border border-[#232a33] bg-[#14181d] p-6">
                <p className="text-[#CFC6AE]">Previsualisation de votre boutique telle qu'elle apparait aux visiteurs.</p>
                <div className="mt-6 aspect-video bg-[#0d0f12] rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Eye className="w-12 h-12 mx-auto text-[#CFC6AE] mb-2" />
                    <p className="text-[#CFC6AE]">Apercu de la boutique</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
