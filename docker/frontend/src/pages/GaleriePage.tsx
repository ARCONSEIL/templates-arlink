import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, MapPin, ArrowLeft } from 'lucide-react'
import { boutiquesService, productsService } from '../services/api'

interface Product {
  id: string
  nom: string
  boutiqueId: string
  img1?: string
  img2?: string
  img3?: string
  prix?: number
  vedette?: boolean
}

interface Boutique {
  id: string
  societe: string
  description?: string
  ville: string
  pays: string
  categorie: string
  logo?: string
  image?: string
  subDomain?: string
  vues?: number
  productImage?: string
  matchingProducts?: Product[]
}

const categories = [
  { key: 'bijoux', name: 'Bijoux & Orfèvrerie', icon: '💎', dbNames: ['Bijoux'], image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200' },
  { key: 'cuir', name: 'Cuir & Maroquinerie', icon: '👜', dbNames: ['Cuir'], image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=1200' },
  { key: 'bois', name: 'Bois & Sculpture', icon: '🪵', dbNames: ['Bois'], image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1200' },
  { key: 'metal', name: 'Métal & Ferronnerie', icon: '⚒️', dbNames: ['Metal'], image: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=1200' },
  { key: 'textile', name: 'Textile, Soie & Broderie', icon: '🧵', dbNames: ['Textile'], image: 'https://images.unsplash.com/photo-1558769132-cb1aea3c8db5?w=1200' },
  { key: 'poterie', name: 'Poterie & Céramique', icon: '🏺', dbNames: ['Poterie'], image: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1200' },
  { key: 'verre', name: 'Verre & Cristal', icon: '🥃', dbNames: ['Verre'], image: 'https://images.unsplash.com/photo-1541336032412-2048a678540d?w=1200' },
  { key: 'pierre', name: 'Pierre & Minéraux', icon: '💠', dbNames: ['Pierre'], image: 'https://images.unsplash.com/photo-1518687338977-932e5a197c86?w=1200' },
  { key: 'vannerie', name: 'Vannerie & Tapisserie', icon: '🧺', dbNames: ['Vannerie'], image: 'https://images.unsplash.com/photo-1584302179602-e4c3d3fd629d?w=1200' },
  { key: 'arts-manuels', name: 'Arts manuels', icon: '✋', dbNames: ['Arts-manuels'], image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200' },
  { key: 'cosmetique', name: 'Cosmétique naturelle', icon: '🌿', dbNames: ['Cosmetique'], image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=1200' },
  { key: 'mode', name: 'Accessoires & Mode', icon: '👗', dbNames: ['Mode'], image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200' },
  { key: 'art-sacre', name: 'Art sacré', icon: '🕌', dbNames: ['Art-sacre'], image: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1200' },
  { key: 'patisserie', name: 'Pâtisserie artisanale', icon: '🍰', dbNames: ['Patisserie'], image: 'https://images.unsplash.com/photo-1517433670267-30f41c098585?w=1200' },
  { key: 'gastronomie', name: 'Produits gourmets', icon: '🍽️', dbNames: ['Gastronomie'], image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200' },
  { key: 'huiles', name: 'Huiles & Terroir', icon: '🫒', dbNames: ['Huiles'], image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=1200' },
  { key: 'coffrets', name: 'Coffrets', icon: '🎁', dbNames: ['Coffrets'], image: 'https://images.unsplash.com/photo-1513884923967-4b182ef167ab?w=1200' },
  { key: 'maghreb', name: 'Maghreb', icon: '🌙', dbNames: ['Maghreb'], image: 'https://images.unsplash.com/photo-1553522991-71439aa62779?w=1200' },
  { key: 'afrique-ouest', name: 'Afrique Ouest', icon: '🌍', dbNames: ['Afrique-Ouest'], image: 'https://images.unsplash.com/photo-1523805009345-7448845a9e53?w=1200' },
  { key: 'afrique-centrale', name: 'Afrique centrale', icon: '🥁', dbNames: ['Afrique-centrale'], image: 'https://images.unsplash.com/photo-1489749798305-4fea3ae63d43?w=1200' },
]

export default function GaleriePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [boutiques, setBoutiques] = useState<Boutique[]>([])
  const [, setAllProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchMode, setIsSearchMode] = useState(false)

  useEffect(() => {
    const cat = searchParams.get('cat')
    const search = searchParams.get('search')
    
    if (search) {
      setSearchQuery(search)
      setIsSearchMode(true)
    } else if (cat) {
      const index = categories.findIndex(c => c.key === cat)
      if (index !== -1) setCurrentCategoryIndex(index)
      setIsSearchMode(false)
    }
    loadBoutiques()
  }, [searchParams])

    const loadBoutiques = async () => {
      setIsLoading(true)
      try {
        const [boutiquesResponse, productsResponse] = await Promise.all([
          boutiquesService.getAll({ status: 'active' }),
          productsService.getAll()
        ])
      
        const products: Product[] = productsResponse.data || []
        const boutiquesData: Boutique[] = boutiquesResponse.data || []
        
        setAllProducts(products)
      
        // Associate product images with boutiques - prioritize vedette product image
        const boutiquesWithImages = boutiquesData.map(boutique => {
          const boutiqueProducts = products.filter(p => p.boutiqueId === boutique.id)
          // First try to find the vedette product with an image
          const vedetteProduct = boutiqueProducts.find(p => p.vedette && p.img1 && p.img1 !== '/' && !p.img1.startsWith('blob:'))
          // Fallback to first product with a valid image
          const firstProductWithImage = vedetteProduct || boutiqueProducts.find(p => p.img1 && p.img1 !== '/' && !p.img1.startsWith('blob:'))
          const productImage = firstProductWithImage?.img1 
            ? (firstProductWithImage.img1.startsWith('http') 
                ? firstProductWithImage.img1 
                : `https://arlink.online${firstProductWithImage.img1}`)
            : undefined
          return { ...boutique, productImage, matchingProducts: boutiqueProducts }
        })
      
        setBoutiques(boutiquesWithImages)
      } catch (error) {
        console.error('Error loading boutiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

  const currentCategory = categories[currentCategoryIndex]
  
  // Filter boutiques based on search mode or category mode
  const filteredBoutiques = isSearchMode 
    ? boutiques.filter(b => {
        const query = searchQuery.toLowerCase()
        // Search in boutique name, subDomain, and location
        const matchesBoutique = b.societe?.toLowerCase().includes(query) ||
          b.subDomain?.toLowerCase().includes(query) ||
          b.description?.toLowerCase().includes(query) ||
          b.ville?.toLowerCase().includes(query) ||
          b.pays?.toLowerCase().includes(query)
        // Search in products
        const matchesProducts = b.matchingProducts?.some(p => 
          p.nom?.toLowerCase().includes(query)
        )
        return matchesBoutique || matchesProducts
      })
    : boutiques.filter(b => 
        currentCategory.dbNames.some(dbName => 
          b.categorie === dbName || 
          b.categorie?.toLowerCase() === dbName.toLowerCase()
        )
      )

  const prevCategory = () => {
    const newIndex = (currentCategoryIndex - 1 + categories.length) % categories.length
    setCurrentCategoryIndex(newIndex)
    setSearchParams({ cat: categories[newIndex].key })
  }

  const nextCategory = () => {
    const newIndex = (currentCategoryIndex + 1) % categories.length
    setCurrentCategoryIndex(newIndex)
    setSearchParams({ cat: categories[newIndex].key })
  }

  const openBoutique = (boutique: Boutique) => {
    if (boutique.subDomain) {
      window.open(`https://${boutique.subDomain}.arlink.online`, '_blank')
    } else {
      window.location.href = `/boutique/${boutique.id}`
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header with background image */}
      <div 
        className="h-[400px] flex items-center justify-center relative transition-all duration-500"
        style={{
          background: isSearchMode 
            ? `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.9)), url('https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=1200') center/cover`
            : `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.7)), url('${currentCategory.image}') center/cover`
        }}
      >
        <Link 
          to="/" 
          className="absolute top-5 left-10 w-12 h-12 rounded-xl bg-[#141414] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A] transition-all duration-300"
          title="Retour à l'accueil"
        >
          <ArrowLeft className="w-5 h-5 text-[#BFA26A]" />
        </Link>
        <div className="text-[64px] font-bold text-white flex items-center gap-5" style={{ textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          {isSearchMode ? (
            <>
              <span>🔍</span>
              <span>Résultats pour "{searchQuery}"</span>
            </>
          ) : (
            <>
              <span>{currentCategory.icon}</span>
              <span>{currentCategory.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Fixed navigation arrows - hidden in search mode */}
      {!isSearchMode && (
        <>
          <button 
            onClick={prevCategory}
            className="fixed top-1/2 left-5 -translate-y-1/2 w-[50px] h-[50px] bg-[rgba(201,169,97,0.9)] rounded-full flex items-center justify-center text-2xl text-[#0a0a0a] cursor-pointer transition-all duration-300 z-50 hover:bg-[#c9a961] hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button 
            onClick={nextCategory}
            className="fixed top-1/2 right-5 -translate-y-1/2 w-[50px] h-[50px] bg-[rgba(201,169,97,0.9)] rounded-full flex items-center justify-center text-2xl text-[#0a0a0a] cursor-pointer transition-all duration-300 z-50 hover:bg-[#c9a961] hover:scale-110"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Boutiques grid */}
      <div className="max-w-[1400px] mx-auto px-10 py-[60px]">
        {isLoading ? (
          <div className="text-center py-[100px] text-5xl text-[#c9a961]">
            ⏳ Chargement...
          </div>
        ) : filteredBoutiques.length === 0 ? (
          <div className="text-center py-[100px] text-[#888] text-xl">
            {isSearchMode 
              ? `😔 Aucun résultat pour "${searchQuery}"`
              : '😔 Aucune boutique dans cette catégorie pour le moment'
            }
          </div>
        ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
                      {filteredBoutiques.map((boutique) => (
                        <div
                          key={boutique.id}
                          onClick={() => openBoutique(boutique)}
                          className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] border-2 border-[#c9a961] rounded-[15px] overflow-hidden text-center cursor-pointer transition-all duration-300 hover:-translate-y-2.5 hover:shadow-[0_15px_50px_rgba(201,169,97,0.4)] hover:border-[#d4b270]"
                          style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}
                        >
                          {boutique.productImage || boutique.image || boutique.logo ? (
                            <div className="h-[180px] w-full overflow-hidden">
                              <img 
                                src={boutique.productImage || boutique.image || boutique.logo} 
                                alt={boutique.societe}
                                className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement
                                  target.style.display = 'none'
                                  target.parentElement!.innerHTML = `<div class="h-full flex items-center justify-center text-[80px]">${currentCategory.icon}</div>`
                                }}
                              />
                            </div>
                          ) : (
                            <div className="h-[180px] flex items-center justify-center text-[80px]">{currentCategory.icon}</div>
                          )}
                          <div className="p-5">
                            <div className="text-[22px] font-bold text-[#c9a961] mb-3">
                              {boutique.societe || 'Boutique ARLinK'}
                            </div>
                            <div className="text-base text-[#aaaaaa] flex items-center justify-center gap-2">
                              <MapPin className="w-4 h-4 text-[#c9a961]" />
                              <span>{boutique.ville || 'Ville'}, {boutique.pays || 'Pays'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
        )}
      </div>
    </div>
  )
}
