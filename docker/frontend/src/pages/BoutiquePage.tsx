import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Search, Share2, ShoppingCart, Heart, Minus, Plus, Star, Phone, MessageCircle } from 'lucide-react'
import { boutiquesService, productsService } from '../services/api'

interface Product {
  id: string
  nom: string
  titre?: string
  description?: string
  prix: number
  prixGros?: number
  img1?: string
  img2?: string
  img3?: string
  img4?: string
  stock?: number
  colors?: string[]
}

interface Boutique {
  id: string
  societe: string
  description?: string
  categorie?: string
  ville?: string
  pays?: string
  adresse?: string
  latitude?: number
  longitude?: number
  logo?: string
  banniere?: string
  subDomain?: string
  artisan?: {
    telephone?: string
    siteWeb?: string
  }
  reseauxSociaux?: {
    facebook?: string
    instagram?: string
    whatsapp?: string
  }
}

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  color?: string
  img?: string
}

interface Review {
  id: string
  name: string
  rating: number
  text: string
  date: string
}

interface BoutiquePageProps {
  subdomain?: string
}

export default function BoutiquePage({ subdomain }: BoutiquePageProps) {
  const { id } = useParams<{ id: string }>()
  const [boutique, setBoutique] = useState<Boutique | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'boutique' | 'product' | 'checkout'>('boutique')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [cart, setCart] = useState<CartItem[]>([])
  const [showCart, setShowCart] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [reviews, setReviews] = useState<Review[]>([])
  const [newReview, setNewReview] = useState({ name: '', rating: 5, text: '' })
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string>('')

  useEffect(() => {
    const savedCart = localStorage.getItem('arlink_cart')
    if (savedCart) {
      const parsed = JSON.parse(savedCart)
      setCart(parsed.items || [])
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('arlink_cart', JSON.stringify({ items: cart }))
  }, [cart])

  useEffect(() => {
    if (selectedProduct) {
      const savedReviews = localStorage.getItem(`reviews_${selectedProduct.id}`)
      if (savedReviews) setReviews(JSON.parse(savedReviews))
      else setReviews([])
    }
  }, [selectedProduct])

  useEffect(() => {
    const loadData = async () => {
      try {
        let boutiqueData: Boutique | null = null
        if (subdomain) {
          const response = await boutiquesService.getBySubDomain(subdomain)
          boutiqueData = response.data
        } else if (id) {
          const response = await boutiquesService.getById(id)
          boutiqueData = response.data
        }
        if (boutiqueData) {
          setBoutique(boutiqueData)
          try {
            const productsResponse = await productsService.getByBoutique(boutiqueData.id)
            setProducts(productsResponse.data || [])
          } catch {
            setProducts(generateSampleProducts())
          }
        }
      } catch (error) {
        console.error('Error loading boutique:', error)
        setBoutique({
          id: '1',
          societe: subdomain || 'Boutique Artisanale',
          description: 'Boutique artisanale authentique avec mise en valeur IA ARLink.',
          categorie: 'Bijouterie',
          ville: 'Haut Atlas',
          pays: 'Maroc',
        })
        setProducts(generateSampleProducts())
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id, subdomain])

  const generateSampleProducts = (): Product[] => [
    { id: '1', nom: 'Collier Amazigh', titre: 'Argent 925', description: 'Collier traditionnel berbere fait main avec des motifs amazighs authentiques.', prix: 89.00, stock: 12, img1: 'https://moroccanzest.com/wp-content/uploads/2019/02/moroccan-jewelry.jpg', colors: ['Argent', 'Or', 'Bronze'] },
    { id: '2', nom: 'Bracelet Touareg', titre: 'Cuir et argent', description: 'Bracelet en cuir veritable avec ornements en argent.', prix: 45.00, stock: 8, img1: 'https://static01.nyt.com/images/2024/12/06/multimedia/06sp-jewelry-atlas-inyt-01-ljtb/29sp-jewelry-atlas-inyt-01-ljtb-videoSixteenByNineJumbo1600.jpg', colors: ['Noir', 'Marron'] },
    { id: '3', nom: 'Boucles Berberes', titre: 'Argent massif', description: 'Boucles oreilles traditionnelles avec pierres semi-precieuses.', prix: 65.00, stock: 15, img1: 'https://www.shutterstock.com/image-photo/oriental-motifs-jewelry-market-fashion-600w-2655880189.jpg', colors: ['Turquoise', 'Corail', 'Ambre'] },
    { id: '4', nom: 'Bague Filigrane', titre: 'Travail artisanal', description: 'Bague en argent avec travail de filigrane delicat.', prix: 55.00, stock: 20, img1: 'https://moroccanzest.com/wp-content/uploads/2019/02/moroccan-jewelry.jpg', colors: ['Argent'] },
    { id: '5', nom: 'Pendentif Main de Fatma', titre: 'Protection', description: 'Pendentif porte-bonheur traditionnel.', prix: 35.00, stock: 25, img1: 'https://static01.nyt.com/images/2024/12/06/multimedia/06sp-jewelry-atlas-inyt-01-ljtb/29sp-jewelry-atlas-inyt-01-ljtb-videoSixteenByNineJumbo1600.jpg', colors: ['Argent', 'Or'] },
    { id: '6', nom: 'Parure Complete', titre: 'Ensemble mariage', description: 'Parure complete pour occasions speciales.', prix: 250.00, stock: 3, img1: 'https://www.shutterstock.com/image-photo/oriental-motifs-jewelry-market-fashion-600w-2655880189.jpg', colors: ['Or', 'Argent'] },
  ]

  const addToCart = (product: Product, qty: number = 1, color?: string) => {
    const existingIndex = cart.findIndex(item => item.id === product.id && item.color === color)
    if (existingIndex >= 0) {
      const newCart = [...cart]
      newCart[existingIndex].qty += qty
      setCart(newCart)
    } else {
      setCart([...cart, { id: product.id, name: product.nom, price: product.prix, qty, color, img: product.img1 }])
    }
  }

  const removeFromCart = (index: number) => setCart(cart.filter((_, i) => i !== index))

  const updateCartQty = (index: number, newQty: number) => {
    if (newQty <= 0) removeFromCart(index)
    else {
      const newCart = [...cart]
      newCart[index].qty = newQty
      setCart(newCart)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0)

  const submitReview = () => {
    if (!newReview.name || !newReview.text || !selectedProduct) return
    const review: Review = { id: Date.now().toString(), ...newReview, date: new Date().toLocaleDateString('fr-FR') }
    const updatedReviews = [...reviews, review]
    setReviews(updatedReviews)
    localStorage.setItem(`reviews_${selectedProduct.id}`, JSON.stringify(updatedReviews))
    setNewReview({ name: '', rating: 5, text: '' })
  }

  const getImageUrl = (img?: string) => {
    if (!img || img === '/') return ''
    if (img.startsWith('http')) return img
    return `https://arlink.online${img}`
  }

  // Map boutique category to galerie URL parameter
  const getCategoryKey = (categorie?: string) => {
    if (!categorie) return ''
    const categoryMap: Record<string, string> = {
      'Bijoux': 'bijoux',
      'Cuir': 'cuir',
      'Bois': 'bois',
      'Metal': 'metal',
      'Textile': 'textile',
      'Poterie': 'poterie',
      'Verre': 'verre',
      'Pierre': 'pierre',
      'Vannerie': 'vannerie',
      'Arts-manuels': 'arts-manuels',
      'Cosmetique': 'cosmetique',
      'Mode': 'mode',
      'Art-sacre': 'art-sacre',
      'Patisserie': 'patisserie',
      'Gastronomie': 'gastronomie',
      'Huiles': 'huiles',
      'Coffrets': 'coffrets',
      'Maghreb': 'maghreb',
      'Afrique-Ouest': 'afrique-ouest',
      'Afrique-centrale': 'afrique-centrale'
    }
    return categoryMap[categorie] || categorie.toLowerCase()
  }

  const galerieUrl = boutique?.categorie ? `https://arlink.online/galerie?cat=${getCategoryKey(boutique.categorie)}` : 'https://arlink.online/galerie'

  const filteredProducts = products.filter(p => 
    p.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-[#BFA26A] text-xl">Chargement...</div>
      </div>
    )
  }

  if (!boutique) {
    return (
      <div className="min-h-screen bg-[#070707] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">404</div>
          <div className="text-[#CFC6AE]">Boutique non trouvee</div>
          <Link to="/" className="mt-4 inline-block text-[#BFA26A] hover:underline">Retour</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#EDE6D2]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 bg-[#0b0b0b]/92 backdrop-blur-md border-b border-[#1d1d1d]">
        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
                        <a href={galerieUrl} className="w-10 h-10 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A] transition" title={boutique.categorie ? `Retour à la galerie ${boutique.categorie}` : 'Retour à la galerie'}>
                          <ArrowLeft className="w-5 h-5 text-[#BFA26A]" />
                        </a>
            <div>
              <div className="text-xl font-semibold tracking-wide text-[#EDE6D2]">{boutique.societe}</div>
            </div>
          </div>

          {view === 'boutique' && (
            <div className="hidden md:flex items-center bg-[#121212] border border-[#2a2a2a] rounded-xl px-3 py-2 w-[380px]">
              <Search className="w-4 h-4 text-[#CFC6AE] mr-2" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Rechercher un produit..." className="bg-transparent outline-none w-full text-sm text-[#EDE6D2]" />
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <button className="px-4 py-2 bg-[#3B82F6] text-white font-bold rounded-2xl transition flex items-center gap-2 hover:brightness-95">
              <Share2 className="w-4 h-4" />
              <span className="hidden md:block text-sm">Partager</span>
            </button>
            <button onClick={() => setShowCart(true)} className="relative px-4 py-2 bg-[#141414] border border-[#2a2a2a] rounded-2xl transition hover:border-[#BFA26A]">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && <span className="absolute -top-2 -right-2 text-xs bg-[#BFA26A] text-black px-2 py-1 rounded-full font-bold">{cartCount}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-10">
        {view === 'boutique' && (
          <section>
            <div className="rounded-3xl border border-[#1f1f1f] bg-gradient-to-r from-[#0b0b0b] to-[#111111] p-7 md:p-10">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <h2 className="text-3xl md:text-4xl font-semibold leading-tight text-[#EDE6D2]">Artisanat authentique, style premium.</h2>
                  <p className="text-[#CFC6AE] mt-2 max-w-xl">Decouvre des pieces uniques faites main. Ajoute au panier et commande rapidement.</p>
                  <div className="mt-6 bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-lg text-[#EDE6D2]">A propos de l'artisan</div>
                        <p className="text-[#CFC6AE] text-sm mt-1">Region : <span className="text-[#EDE6D2]">{boutique.ville} - {boutique.pays}</span> - Specialite : <span className="text-[#EDE6D2]">{boutique.categorie}</span></p>
                        <p className="text-[#CFC6AE] text-sm mt-3 line-clamp-2">{boutique.description}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          <span className="px-3 py-1 rounded-full text-xs border border-[#2a2a2a] text-[#CFC6AE]">Aide par l'IA</span>
                          <span className="px-3 py-1 rounded-full text-xs border border-[#2a2a2a] text-[#CFC6AE]">Fait main</span>
                          <span className="px-3 py-1 rounded-full text-xs border border-[#2a2a2a] text-[#CFC6AE]">Region artisanale</span>
                        </div>
                      </div>
                      <div className="hidden md:flex flex-col gap-2 min-w-[180px]">
                        <a href="https://wa.me/33768084103" target="_blank" rel="noopener noreferrer" className="bg-[#22C55E] text-[#031b0c] font-black rounded-2xl px-4 py-3 flex items-center justify-center gap-2 hover:brightness-95">
                          <MessageCircle className="w-4 h-4" /> WhatsApp
                        </a>
                        <a href="tel:+33768084103" className="bg-[#141414] border border-[#2a2a2a] rounded-2xl px-4 py-3 hover:border-[#3B82F6] transition flex items-center justify-center gap-2">
                          <Phone className="w-4 h-4" /> Appeler
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setView('checkout')} className="px-5 py-3 bg-[#BFA26A] text-black font-black rounded-2xl transition hover:brightness-95">Payer</button>
                </div>
              </div>
            </div>

            <div className="flex items-end justify-between mt-10 mb-6">
              <h3 className="text-xl font-semibold text-[#EDE6D2]">Produits</h3>
              <p className="text-sm text-[#CFC6AE] hidden md:block">Clique pour ouvrir la fiche produit</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} onClick={() => { setSelectedProduct(product); setQuantity(1); setSelectedColor(product.colors?.[0] || ''); setSelectedImage(product.img1 || ''); setView('product'); }} className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl overflow-hidden cursor-pointer transition hover:border-[#BFA26A] hover:-translate-y-1">
                  <div className="h-48 bg-[#141414] relative">
                    {getImageUrl(product.img1) ? <img src={getImageUrl(product.img1)} alt={product.nom} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl">📦</div>}
                    {product.stock && product.stock < 5 && <span className="absolute top-3 right-3 px-2 py-1 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-full text-xs text-[#EDE6D2]">Stock limite</span>}
                  </div>
                  <div className="p-4">
                    <h4 className="text-[#EDE6D2] font-semibold truncate">{product.nom}</h4>
                    {product.titre && <p className="text-[#CFC6AE] text-sm truncate">{product.titre}</p>}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[#BFA26A] font-bold text-lg">{Number(product.prix || 0).toFixed(2)} EUR</span>
                      <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="px-3 py-2 bg-[#BFA26A] text-black font-bold rounded-xl text-sm hover:brightness-95">+ Panier</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {view === 'product' && selectedProduct && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setView('boutique')} className="flex items-center gap-2 text-[#CFC6AE] hover:text-[#EDE6D2] transition"><ArrowLeft className="w-4 h-4" /><span>Retour boutique</span></button>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsFavorite(!isFavorite)} className="bg-[#141414] border border-[#2a2a2a] px-4 py-2 rounded-2xl transition flex items-center gap-2 hover:border-[#BFA26A]"><Heart className={`w-4 h-4 ${isFavorite ? 'fill-[#EF4444] text-[#EF4444]' : ''}`} /><span className="text-sm">Favoris</span></button>
                <button className="bg-[#3B82F6] px-4 py-2 rounded-2xl transition flex items-center gap-2 text-white font-bold hover:brightness-95"><Share2 className="w-4 h-4" /><span className="text-sm">Partager</span></button>
                <button onClick={() => setShowCart(true)} className="bg-[#141414] border border-[#2a2a2a] px-4 py-2 rounded-2xl transition flex items-center gap-2 hover:border-[#BFA26A]"><ShoppingCart className="w-4 h-4" /><span className="text-sm">Panier</span></button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl overflow-hidden shadow-xl">
                      <div className="h-[520px] bg-[#141414]"><img src={getImageUrl(selectedImage || selectedProduct.img1)} alt={selectedProduct.nom} className="w-full h-full object-cover" /></div>
                    </div>
                                        <div className="grid grid-cols-4 gap-3">
                                          {[selectedProduct.img1, selectedProduct.img2, selectedProduct.img3, selectedProduct.img4].filter(Boolean).map((img, i) => (
                                            <div key={i} onClick={() => setSelectedImage(img as string)} className={`h-20 bg-[#0f0f0f] border rounded-xl overflow-hidden cursor-pointer transition ${(selectedImage || selectedProduct.img1) === img ? 'border-[#BFA26A]' : 'border-[#1f1f1f] hover:border-[#BFA26A]'}`}><img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" /></div>
                                          ))}
                                        </div>
                  </div>

                  <div>
                    <h1 className="text-3xl font-semibold text-[#EDE6D2]">{selectedProduct.nom}</h1>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="flex text-[#BFA26A]">{[1,2,3,4,5].map(i => <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-current' : ''}`} />)}</div>
                      <span className="text-sm text-[#CFC6AE]">({reviews.length} avis)</span>
                    </div>
                    <p className="text-[#CFC6AE] mt-4 leading-relaxed">{selectedProduct.description}</p>
                    <div className="mt-6 flex items-end justify-between">
                      <div className="text-3xl font-semibold text-[#EDE6D2]">{Number(selectedProduct.prix || 0).toFixed(2)} EUR</div>
                      <div className="text-sm">{selectedProduct.stock && selectedProduct.stock > 0 ? <span className="px-3 py-1 bg-[#22C55E]/20 border border-[#22C55E]/40 rounded-full text-[#EDE6D2]">En stock ({selectedProduct.stock})</span> : <span className="px-3 py-1 bg-[#EF4444]/20 border border-[#EF4444]/40 rounded-full text-[#EDE6D2]">Rupture</span>}</div>
                    </div>

                    {selectedProduct.colors && selectedProduct.colors.length > 0 && (
                      <div className="mt-8">
                        <h3 className="text-[#EDE6D2] font-semibold mb-3">Couleur</h3>
                        <div className="flex flex-wrap gap-3">
                          {selectedProduct.colors.map(color => (
                            <button key={color} onClick={() => setSelectedColor(color)} className={`px-4 py-2 rounded-xl border transition ${selectedColor === color ? 'border-[#BFA26A] bg-[#BFA26A]/20 text-[#EDE6D2]' : 'border-[#2a2a2a] bg-[#141414] text-[#CFC6AE] hover:border-[#BFA26A]'}`}>{color}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center gap-4">
                      <span className="font-semibold">Quantite</span>
                      <div className="flex items-center border border-[#2a2a2a] rounded-2xl overflow-hidden bg-[#0f0f0f]">
                        <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 hover:bg-[#141414] transition"><Minus className="w-4 h-4" /></button>
                        <div className="px-6 py-3 font-semibold">{quantity}</div>
                        <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 hover:bg-[#141414] transition"><Plus className="w-4 h-4" /></button>
                      </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button onClick={() => { addToCart(selectedProduct, quantity, selectedColor); setShowCart(true); }} className="bg-[#BFA26A] text-black font-black py-4 rounded-2xl transition flex items-center justify-center gap-2 hover:brightness-95"><ShoppingCart className="w-4 h-4" />Ajouter au panier</button>
                      <button onClick={() => { addToCart(selectedProduct, quantity, selectedColor); setView('checkout'); }} className="bg-[#22C55E] text-[#031b0c] font-black py-4 rounded-2xl transition flex items-center justify-center gap-2 hover:brightness-95">Payer maintenant</button>
                    </div>

                    <div className="mt-6 bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-5 text-[#CFC6AE]">Livraison estimee : <span className="text-[#EDE6D2] font-semibold">3 a 7 jours</span><br />Paiement securise - Retour possible sous 7 jours</div>
                  </div>
                </div>

                <div className="mt-12">
                  <h2 className="text-2xl font-semibold text-[#EDE6D2]">Avis clients</h2>
                  <p className="text-[#CFC6AE] text-sm mt-1">Les avis sont stockes en local (demo)</p>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    <div className="lg:col-span-2 bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-6">
                      <div className="space-y-4">
                        {reviews.length === 0 ? <p className="text-[#CFC6AE]">Aucun avis pour le moment. Soyez le premier!</p> : reviews.map(review => (
                          <div key={review.id} className="border-b border-[#1f1f1f] pb-4 last:border-0">
                            <div className="flex items-center justify-between"><span className="font-semibold">{review.name}</span><span className="text-xs text-[#CFC6AE]">{review.date}</span></div>
                            <div className="flex text-[#BFA26A] mt-1">{[1,2,3,4,5].map(i => <Star key={i} className={`w-3 h-3 ${i <= review.rating ? 'fill-current' : ''}`} />)}</div>
                            <p className="text-[#CFC6AE] text-sm mt-2">{review.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-6">
                      <h3 className="text-lg font-semibold text-[#EDE6D2] mb-4">Laisser un avis</h3>
                      <label className="text-sm text-[#CFC6AE]">Nom</label>
                      <input value={newReview.name} onChange={(e) => setNewReview({...newReview, name: e.target.value})} className="mt-2 w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] text-[#EDE6D2]" placeholder="Ex: Karim" />
                      <label className="text-sm text-[#CFC6AE] mt-4 block">Note</label>
                      <div className="flex gap-2 mt-2 text-[#BFA26A] text-xl cursor-pointer">{[1,2,3,4,5].map(i => <Star key={i} onClick={() => setNewReview({...newReview, rating: i})} className={`w-6 h-6 ${i <= newReview.rating ? 'fill-current' : ''}`} />)}</div>
                      <label className="text-sm text-[#CFC6AE] mt-4 block">Commentaire</label>
                      <textarea value={newReview.text} onChange={(e) => setNewReview({...newReview, text: e.target.value})} className="mt-2 w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#3B82F6] min-h-[110px] text-[#EDE6D2]" placeholder="Ton avis..." />
                      <button onClick={submitReview} className="mt-5 w-full bg-[#3B82F6] text-white font-black py-4 rounded-2xl transition hover:brightness-95">Publier l'avis</button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:block">
                <div className="bg-[#0f0f0f] border border-[#1f1f1f] rounded-3xl p-6 sticky top-24">
                  <h3 className="text-lg font-semibold text-[#EDE6D2] mb-4">Panier</h3>
                  <div className="space-y-3 max-h-[360px] overflow-auto pr-1">
                    {cart.length === 0 ? <p className="text-[#CFC6AE] text-sm">Panier vide</p> : cart.map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-[#141414] border border-[#2a2a2a] rounded-xl p-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-[#0f0f0f]">{item.img && <img src={item.img} alt="" className="w-full h-full object-cover" />}</div>
                        <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate">{item.name}</div><div className="text-xs text-[#CFC6AE]">x{item.qty} - {item.color || '-'}</div></div>
                        <div className="text-sm font-bold text-[#BFA26A]">{(item.price * item.qty).toFixed(2)} EUR</div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[#1f1f1f] mt-5 pt-4 flex justify-between text-[#CFC6AE]"><span>Total</span><span className="text-[#EDE6D2] font-semibold">{cartTotal.toFixed(2)} EUR</span></div>
                  <button onClick={() => setView('checkout')} className="mt-4 w-full bg-[#22C55E] text-[#031b0c] font-black py-4 rounded-2xl transition hover:brightness-95">Payer maintenant</button>
                  <p className="text-xs text-[#CFC6AE] mt-3 text-center">Livraison estimee : 3-7 jours</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {view === 'checkout' && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setView('boutique')} className="flex items-center gap-2 text-[#CFC6AE] hover:text-[#EDE6D2] transition"><ArrowLeft className="w-4 h-4" /><span>Retour boutique</span></button>
            </div>
            <h1 className="text-3xl font-bold text-[#BFA26A] mb-8">Paiement</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
                <h2 className="text-xl font-bold mb-4">Informations client</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="Nom complet" />
                  <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="Telephone" />
                  <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] md:col-span-2" placeholder="Email" />
                  <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] md:col-span-2" placeholder="Adresse complete" />
                </div>
                <h2 className="text-xl font-bold mt-8 mb-4">Paiement</h2>
                <div className="grid grid-cols-1 gap-4">
                  <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="Numero de carte (demo)" />
                  <div className="grid grid-cols-2 gap-4">
                    <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="MM/AA" />
                    <input className="bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]" placeholder="CVC" />
                  </div>
                </div>
                <button onClick={() => { if (cart.length === 0) { alert('Panier vide'); return; } alert('Paiement reussi (demo)'); setCart([]); setView('boutique'); }} className="mt-6 w-full rounded-2xl bg-[#BFA26A] text-black font-black py-4 hover:brightness-95 transition">Payer maintenant</button>
                <p className="text-xs text-[#CFC6AE] mt-3">* Demo : pas de vrai paiement.</p>
              </div>
              <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
                <h2 className="text-xl font-bold mb-4">Recap commande</h2>
                <div className="space-y-3">
                  {cart.length === 0 ? <div className="text-[#CFC6AE]">Ton panier est vide.</div> : cart.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-[#CFC6AE]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-[#141414] border border-[#2a2a2a]">{item.img && <img src={item.img} alt="" className="w-full h-full object-cover" />}</div>
                        <div><div className="text-[#EDE6D2] font-semibold">{item.name}</div><div className="text-xs">x{item.qty} - {item.color || '-'}</div></div>
                      </div>
                      <div className="text-[#EDE6D2] font-bold">{(item.price * item.qty).toFixed(2)} EUR</div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[#1f1f1f] mt-6 pt-4 flex justify-between text-[#CFC6AE]"><span>Total</span><span className="text-[#BFA26A] font-bold">{cartTotal.toFixed(2)} EUR</span></div>
              </div>
            </div>
          </section>
        )}
      </main>

      {showCart && (
        <>
          <div className="fixed inset-0 bg-black/70 z-[998]" onClick={() => setShowCart(false)} />
          <aside className="fixed top-0 right-0 h-full w-[400px] max-w-full bg-[#0b0b0b]/98 backdrop-blur-md border-l border-[#1d1d1d] z-[999] flex flex-col">
            <div className="p-5 border-b border-[#1d1d1d] flex items-center justify-between">
              <div><h3 className="text-lg font-semibold">Panier</h3><p className="text-xs text-[#CFC6AE]">{cartCount} article(s)</p></div>
              <button onClick={() => setShowCart(false)} className="w-10 h-10 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A] transition text-xl">x</button>
            </div>
            <div className="flex-1 overflow-auto p-5 space-y-3">
              {cart.length === 0 ? <p className="text-[#CFC6AE] text-center py-10">Panier vide</p> : cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-[#0f0f0f] border border-[#1f1f1f] rounded-xl p-3">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#141414]">{item.img && <img src={item.img} alt="" className="w-full h-full object-cover" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{item.name}</div>
                    <div className="text-xs text-[#CFC6AE]">{item.color || '-'}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateCartQty(i, item.qty - 1)} className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A]"><Minus className="w-3 h-3" /></button>
                      <span className="text-sm font-semibold">{item.qty}</span>
                      <button onClick={() => updateCartQty(i, item.qty + 1)} className="w-7 h-7 rounded-lg bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A]"><Plus className="w-3 h-3" /></button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[#BFA26A]">{(item.price * item.qty).toFixed(2)} EUR</div>
                    <button onClick={() => removeFromCart(i)} className="text-xs text-[#EF4444] hover:underline mt-1">Supprimer</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-5 border-t border-[#1d1d1d]">
              <div className="flex justify-between mb-4"><span className="text-[#CFC6AE]">Total</span><span className="text-xl font-bold text-[#EDE6D2]">{cartTotal.toFixed(2)} EUR</span></div>
              <button onClick={() => { setShowCart(false); setView('checkout'); }} className="w-full bg-[#22C55E] text-[#031b0c] font-black py-4 rounded-2xl transition hover:brightness-95">Payer maintenant</button>
            </div>
          </aside>
        </>
      )}
    </div>
  )
}
