import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import { ChevronLeft, ChevronRight, Search, User, Menu } from 'lucide-react'
import { boutiquesService, categoriesService, productsService } from '../services/api'
import { useAuthStore } from '../stores/authStore'

const CATEGORIES = [
  { nom: 'Bijoux & Orfèvrerie', slug: 'bijoux', emoji: '💎', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Cuir & Maroquinerie', slug: 'cuir', emoji: '👜', image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Bois & Sculpture', slug: 'bois', emoji: '🪵', image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Métal & Ferronnerie', slug: 'metal', emoji: '⚒️', image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Textile, Soie & Broderie', slug: 'textile', emoji: '🧵', image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8db5?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Poterie & Céramique', slug: 'poterie', emoji: '🏺', image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Verre & Cristal', slug: 'verre', emoji: '🥃', image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Pierre & Minéraux', slug: 'pierre', emoji: '💠', image: 'https://images.unsplash.com/photo-1518687338977-932e5a197c86?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Vannerie & Tapisserie', slug: 'vannerie', emoji: '🧺', image: 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Arts manuels', slug: 'arts-manuels', emoji: '✋', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Cosmétique naturelle', slug: 'cosmetique', emoji: '🌿', image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Accessoires & Mode', slug: 'mode', emoji: '👗', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Art sacré', slug: 'art-sacre', emoji: '🕌', image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Pâtisserie artisanale', slug: 'patisserie', emoji: '🍰', image: 'https://images.unsplash.com/photo-1517433670267-30f41c098585?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Produits gourmets', slug: 'gastronomie', emoji: '🍽️', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Huiles & Terroir', slug: 'huiles', emoji: '🫒', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=800&q=60' },
  { nom: "Recycl'art", slug: 'recyclart', emoji: '♻️', image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Arts culinaires', slug: 'culinaire', emoji: '🍳', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Artisanat russe', slug: 'russe', emoji: '🪆', image: 'https://images.unsplash.com/photo-1547448526-5e9d68b4f5a5?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Artisanat chinois', slug: 'chinois', emoji: '🏮', image: 'https://images.unsplash.com/photo-1547981609-4b6bfe67ca0b?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Maghreb', slug: 'maghreb', emoji: '🌙', image: 'https://images.unsplash.com/photo-1553522991-71439aa62779?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Afrique Ouest', slug: 'afrique-ouest', emoji: '🌍', image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Afrique centrale', slug: 'afrique-centrale', emoji: '🥁', image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Afrique Est & Sud', slug: 'afrique-est', emoji: '🦁', image: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Artisanat indien', slug: 'indien', emoji: '🪷', image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Coffrets', slug: 'coffrets', emoji: '🎁', image: 'https://images.unsplash.com/photo-1513884923967-4b182ef167ab?auto=format&fit=crop&w=800&q=60' },
  { nom: 'Bouquets', slug: 'bouquets', emoji: '💐', image: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=800&q=60' },
]

interface Product {
  id: string
  nom: string
  boutiqueId: string
  img1?: string
  img2?: string
  img3?: string
  prix?: number
}

interface MapBoutique {
  id: string
  societe: string
  ville: string
  pays: string
  latitude: number
  longitude: number
  categorie: string
  logo?: string
  image?: string
  subDomain?: string
  featured?: boolean
  featuredImage?: string
  productImage?: string
}

const FEATURED_BOUTIQUE_IMAGES: Record<string, string> = {
  'irya': 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
  'afrikration': 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400',
  'raphiecosmetiques': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
  'diaspoartisans': 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=400',
  'adtrustinc': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=400',
  'radisa': 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400',
  'darlakbira': 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
  'inspiroartium': 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
}


export default function HomePage() {
  const navigate = useNavigate()
  const [mapBoutiques, setMapBoutiques] = useState<MapBoutique[]>([])
  const [categories] = useState(CATEGORIES)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [showLoginSidebar, setShowLoginSidebar] = useState(false)
  const [activeTab, setActiveTab] = useState<'connexion' | 'inscription'>('connexion')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('')
  const { user, logout, login, register } = useAuthStore()

  useEffect(() => {
    loadMapData()
    loadCategories()
  }, [])

    const loadMapData = async () => {
      try {
        const [boutiquesResponse, productsResponse] = await Promise.all([
          boutiquesService.getMapData(),
          productsService.getAll()
        ])
      
        const products: Product[] = productsResponse.data || []
        const boutiquesData: MapBoutique[] = boutiquesResponse.data || []
      
        // Associate product images with boutiques
        const boutiquesWithImages = boutiquesData.map(boutique => {
          const boutiqueProducts = products.filter(p => p.boutiqueId === boutique.id)
          const firstProductWithImage = boutiqueProducts.find(p => p.img1 && p.img1 !== '/')
          const productImage = firstProductWithImage?.img1 
            ? (firstProductWithImage.img1.startsWith('http') 
                ? firstProductWithImage.img1 
                : `https://arlink.online${firstProductWithImage.img1}`)
            : undefined
          return { ...boutique, productImage }
        })
      
        setMapBoutiques(boutiquesWithImages)
      } catch (error) {
        console.error('Error loading map data:', error)
      }
    }

  const loadCategories = async () => {
    // Keep using local CATEGORIES with images - don't overwrite with API data
    // The API categories don't have image URLs, so we use the hardcoded ones
    try {
      await categoriesService.getAll()
      // Categories are already set from CATEGORIES constant with images
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const nextSlide = () => {
    setCarouselIndex((prev) => (prev + 1) % Math.ceil(categories.length / 5))
  }

  const prevSlide = () => {
    setCarouselIndex((prev) => (prev - 1 + Math.ceil(categories.length / 5)) % Math.ceil(categories.length / 5))
  }

  const visibleCategories = categories.slice(carouselIndex * 5, carouselIndex * 5 + 5)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/galerie?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Header */}
      <header className="bg-dark-light border-b border-dark-medium px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <span className="text-gold text-2xl font-display font-bold">ARLink</span>
              <span className="text-cream text-sm hidden md:block">L'Exposition Mondiale de l'Artisanat</span>
            </Link>
          </div>

                    <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-8">
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Rechercher un artisan, une boutique..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-dark border border-dark-medium rounded-lg px-4 py-2 pl-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 cursor-pointer" onClick={handleSearch} />
                      </div>
                    </form>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard" className="text-cream hover:text-gold transition">
                  Dashboard
                </Link>
                <button onClick={logout} className="text-cream hover:text-gold transition">
                  Déconnexion
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowLoginSidebar(true)}
                className="flex items-center gap-2 text-cream hover:text-gold transition"
              >
                <User className="w-5 h-5" />
                <span className="hidden md:block">Connexion</span>
              </button>
            )}
            <button className="md:hidden text-cream">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - 60% Carousel / 40% Map */}
      <main className="flex-1 flex flex-col lg:flex-row relative" style={{ height: '400px' }}>
        {/* Carousel Section - 60% */}
        <section className="lg:w-3/5 bg-dark p-6 flex flex-col h-[400px]">
          <h2 className="text-gold font-display text-xl mb-4 italic">Explorez par Catégorie</h2>
          
          <div className="flex-1 relative flex items-center">
            <button
              onClick={prevSlide}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-cream rounded-full flex items-center justify-center transition"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex gap-4 justify-center items-center h-full px-14 w-full">
              {visibleCategories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/galerie?cat=${cat.slug}`}
                  className="relative overflow-hidden rounded-xl bg-[#1a1a1a] hover:ring-2 hover:ring-gold transition flex-1 max-w-[160px] h-[200px] group"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-80 group-hover:opacity-100 transition"
                    style={{ backgroundImage: `url(${cat.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                    <span className="text-3xl mb-1 block">{cat.emoji}</span>
                    <span className="text-gold font-medium text-sm underline">{cat.nom}</span>
                  </div>
                </Link>
              ))}
            </div>

            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-cream rounded-full flex items-center justify-center transition"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: Math.ceil(categories.length / 5) }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCarouselIndex(i)}
                className={`w-2 h-2 rounded-full transition ${
                  i === carouselIndex ? 'bg-gold' : 'bg-[#3a3a3a]'
                }`}
              />
            ))}
          </div>
        </section>

        {/* Map Section - 40% */}
        <section className="lg:w-2/5 bg-dark h-[400px] relative">
          <MapContainer
            center={[20, 0]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            className="dark-map"
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            {mapBoutiques.map((boutique) => (
              <CircleMarker
                key={boutique.id}
                center={[boutique.latitude, boutique.longitude]}
                radius={4}
                pathOptions={{
                  color: '#d4c4a8',
                  fillColor: '#d4c4a8',
                  fillOpacity: 0.9,
                  weight: 1,
                }}
              >
                <Popup>
                  <div className="text-center">
                    <strong>{boutique.societe}</strong>
                    <br />
                    <span>{boutique.ville}, {boutique.pays}</span>
                    <br />
                    {boutique.subDomain ? (
                      <a
                        href={`https://${boutique.subDomain}.arlink.online`}
                        className="text-gold hover:underline"
                      >
                        Voir la boutique
                      </a>
                    ) : (
                      <Link
                        to={`/boutique/${boutique.id}`}
                        className="text-gold hover:underline"
                      >
                        Voir la boutique
                      </Link>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          
          {/* Login/Register Sidebar - covers only map width */}
          {showLoginSidebar && (
            <div className="absolute inset-0 z-[9999] bg-[#0a0a0a]/98 overflow-y-auto border-l-2 border-gold">
              {/* Header */}
              <div className="p-4 border-b border-gold flex justify-between items-center">
                <h2 className="text-gold font-display text-xl">Bienvenue</h2>
                <button
                  onClick={() => setShowLoginSidebar(false)}
                  className="text-gold hover:text-cream text-2xl w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#2a2a2a] transition"
                >
                  x
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gold">
                <button
                  onClick={() => setActiveTab('connexion')}
                  className={`flex-1 py-3 text-center font-medium transition relative ${
                    activeTab === 'connexion' ? 'text-gold' : 'text-gray-500 hover:text-[#e1c587]'
                  }`}
                >
                  Connexion
                  {activeTab === 'connexion' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('inscription')}
                  className={`flex-1 py-3 text-center font-medium transition relative ${
                    activeTab === 'inscription' ? 'text-gold' : 'text-gray-500 hover:text-[#e1c587]'
                  }`}
                >
                  Inscription
                  {activeTab === 'inscription' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gold" />
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === 'connexion' ? (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    try {
                      await login(loginEmail, loginPassword)
                      setShowLoginSidebar(false)
                      navigate('/dashboard')
                    } catch (err) {
                      console.error('Login error:', err)
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Email</label>
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Mot de passe</label>
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="********"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                      <div className="text-right mt-2">
                        <a href="#" className="text-[#e1c587] text-sm hover:text-gold transition">
                          Mot de passe oublie ?
                        </a>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-gold text-[#0a0a0a] py-3 rounded-md font-semibold hover:bg-[#e1c587] transition transform hover:-translate-y-0.5">
                      Se connecter
                    </button>

                    <div className="flex items-center my-6">
                      <div className="flex-1 h-px bg-gold" />
                      <span className="px-4 text-gray-500 text-sm">OU</span>
                      <div className="flex-1 h-px bg-gold" />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => window.location.href = 'https://arlink.online/api/auth/google'}
                      className="w-full bg-[#2a2a2a] border border-gold text-cream py-3 rounded-md font-medium hover:bg-[#3a3a3a] transition flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Continuer avec Google
                    </button>
                  </form>
                ) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault()
                    if (registerPassword !== registerConfirmPassword) {
                      alert('Les mots de passe ne correspondent pas')
                      return
                    }
                    try {
                      await register({
                        email: registerEmail,
                        password: registerPassword,
                        nom: registerName,
                        prenom: '',
                        type: 'artisan'
                      })
                      setShowLoginSidebar(false)
                      navigate('/dashboard')
                    } catch (err) {
                      console.error('Register error:', err)
                    }
                  }} className="space-y-4">
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Nom complet</label>
                      <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="Jean Dupont"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Email</label>
                      <input
                        type="email"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        placeholder="votre@email.com"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Mot de passe</label>
                      <input
                        type="password"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        placeholder="********"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gold text-sm mb-2 font-medium">Confirmer mot de passe</label>
                      <input
                        type="password"
                        value={registerConfirmPassword}
                        onChange={(e) => setRegisterConfirmPassword(e.target.value)}
                        placeholder="********"
                        className="w-full bg-[#2a2a2a] border border-gold rounded-md px-4 py-3 text-cream placeholder-gray-500 focus:border-[#e1c587] focus:outline-none transition"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-gold text-[#0a0a0a] py-3 rounded-md font-semibold hover:bg-[#e1c587] transition transform hover:-translate-y-0.5">
                      Creer mon compte
                    </button>

                    <div className="flex items-center my-6">
                      <div className="flex-1 h-px bg-gold" />
                      <span className="px-4 text-gray-500 text-sm">OU</span>
                      <div className="flex-1 h-px bg-gold" />
                    </div>

                    <button 
                      type="button" 
                      onClick={() => window.location.href = 'https://arlink.online/api/auth/google'}
                      className="w-full bg-[#2a2a2a] border border-gold text-cream py-3 rounded-md font-medium hover:bg-[#3a3a3a] transition flex items-center justify-center gap-3"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      S'inscrire avec Google
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

            {/* Featured Boutiques - Admin managed (paid placement) */}
            <section className="bg-dark-light p-6 border-t border-dark-medium">
              <h2 className="text-gold font-display text-xl mb-4">Boutiques en Vedette</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {(() => {
                  // Priority boutiques that should always appear first if they have images
                  const prioritySubdomains = ['afrikration', 'ateliercreatif', 'adhamed', 'darlakbira', 'missdattes', 'azurhouse', 'irya', 'solutionseneve']
                  const boutiquesWithImages = mapBoutiques.filter(b => b.productImage)
                  const priorityBoutiques = boutiquesWithImages.filter(b => 
                    b.subDomain && prioritySubdomains.includes(b.subDomain.toLowerCase())
                  )
                  const otherBoutiques = boutiquesWithImages.filter(b => 
                    !b.subDomain || !prioritySubdomains.includes(b.subDomain.toLowerCase())
                  )
                  return [...priorityBoutiques, ...otherBoutiques].slice(0, 6)
                })().map((boutique) => {
                  const imageUrl = boutique.productImage || boutique.image || boutique.logo || (boutique.subDomain ? FEATURED_BOUTIQUE_IMAGES[boutique.subDomain.toLowerCase()] : null)
                  return boutique.subDomain ? (
                    <a
                      key={boutique.id}
                      href={`https://${boutique.subDomain}.arlink.online`}
                      className="card p-4 text-center group hover:border-gold transition"
                    >
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-dark-medium">
                        {imageUrl ? (
                          <img src={imageUrl} alt={boutique.societe} className="w-full h-full object-cover group-hover:scale-110 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🏪</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-cream font-medium text-sm truncate">{boutique.societe}</h3>
                      <p className="text-gray-500 text-xs">{boutique.ville}</p>
                    </a>
                  ) : (
                    <Link
                      key={boutique.id}
                      to={`/boutique/${boutique.id}`}
                      className="card p-4 text-center group hover:border-gold transition"
                    >
                      <div className="w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden bg-dark-medium">
                        {imageUrl ? (
                          <img src={imageUrl} alt={boutique.societe} className="w-full h-full object-cover group-hover:scale-110 transition" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-2xl">🏪</span>
                          </div>
                        )}
                      </div>
                      <h3 className="text-cream font-medium text-sm truncate">{boutique.societe}</h3>
                      <p className="text-gray-500 text-xs">{boutique.ville}</p>
                    </Link>
                  )
                })}
              </div>
            </section>

      {/* Footer */}
      <footer className="bg-dark border-t border-dark-medium px-6 py-6">
        <div className="flex flex-wrap items-center justify-center gap-4 text-[#d4c4a8] text-sm mb-4">
          <Link to="/about" className="hover:text-gold transition">A propos</Link>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/blog" className="hover:text-gold transition">Blog</Link>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/contact" className="hover:text-gold transition">Contact</Link>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/aide" className="hover:text-gold transition">Aide</Link>
          <span className="text-[#d4c4a8]">•</span>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/expo3d" className="hover:text-gold transition flex items-center gap-1">
            <span>🌐</span> Exposition 3D
          </Link>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/encheres" className="hover:text-gold transition flex items-center gap-1">
            <span>⚖️</span> Enchères
          </Link>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 text-[#d4c4a8] text-sm mb-4">
          <Link to="/apps" className="hover:text-gold transition flex items-center gap-1">
            <span>📱</span> Applications mobiles
          </Link>
          <span className="text-[#d4c4a8]">•</span>
          <Link to="/revendeur" className="hover:text-gold transition flex items-center gap-1">
            <span>👑</span> Devenir revendeur
          </Link>
        </div>
        <div className="flex items-center justify-center gap-6 mb-4">
          <a href="https://facebook.com/arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://instagram.com/arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="https://twitter.com/arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl font-bold">
            𝕏
          </a>
          <a href="https://linkedin.com/company/arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
          <a href="https://youtube.com/arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
          </a>
          <a href="https://tiktok.com/@arlink" target="_blank" rel="noopener noreferrer" className="text-[#d4c4a8] hover:text-gold transition text-xl">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
          </a>
        </div>
        <div className="text-center text-[#d4c4a8] text-sm">
          © 2025 ARLinK - Tous droits réservés
        </div>
      </footer>

    </div>
  )
}
