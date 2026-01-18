import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react'

interface CartItem {
  id: string
  name: string
  price: number
  qty: number
  color?: string
  img?: string
}

interface CustomerInfo {
  fullName: string
  phone: string
  email: string
  address: string
}

interface PaymentInfo {
  cardNumber: string
  expiry: string
  cvc: string
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    address: ''
  })
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: '',
    expiry: '',
    cvc: ''
  })
  const [isProcessing, setIsProcessing] = useState(false)

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

  const updateQty = (index: number, newQty: number) => {
    if (newQty <= 0) {
      setCart(cart.filter((_, i) => i !== index))
    } else {
      const newCart = [...cart]
      newCart[index].qty = newQty
      setCart(newCart)
    }
  }

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const shipping = cart.length > 0 ? 5.99 : 0
  const grandTotal = cartTotal + shipping

  const handlePayment = () => {
    if (cart.length === 0) {
      alert('Votre panier est vide')
      return
    }
    if (!customerInfo.fullName || !customerInfo.email || !customerInfo.address) {
      alert('Veuillez remplir vos informations')
      return
    }
    
    setIsProcessing(true)
    setTimeout(() => {
      setIsProcessing(false)
      alert('Paiement reussi (demo) - Merci pour votre commande!')
      setCart([])
      setCustomerInfo({ fullName: '', phone: '', email: '', address: '' })
      setPaymentInfo({ cardNumber: '', expiry: '', cvc: '' })
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#070707] text-[#EDE6D2]" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="sticky top-0 z-50 bg-[#0b0b0b]/95 backdrop-blur-md border-b border-[#1d1d1d]">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 text-[#CFC6AE] hover:text-[#EDE6D2] transition">
            <ArrowLeft className="w-5 h-5" />
            <span>Retour</span>
          </Link>
          <h1 className="text-xl font-semibold text-[#BFA26A]">Panier & Paiement</h1>
          <div className="w-20"></div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-5 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* LEFT: Payment Form */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
              <h2 className="text-xl font-bold text-[#EDE6D2] mb-6">Informations client</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Nom complet</label>
                  <input
                    type="text"
                    value={customerInfo.fullName}
                    onChange={(e) => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                    placeholder="Jean Dupont"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Telephone</label>
                  <input
                    type="tel"
                    value={customerInfo.phone}
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Email</label>
                  <input
                    type="email"
                    value={customerInfo.email}
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                    placeholder="jean@exemple.com"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Adresse de livraison</label>
                  <textarea
                    value={customerInfo.address}
                    onChange={(e) => setCustomerInfo({...customerInfo, address: e.target.value})}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2] min-h-[80px]"
                    placeholder="123 Rue de Paris, 75001 Paris"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
              <h2 className="text-xl font-bold text-[#EDE6D2] mb-6">Paiement par carte</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-[#CFC6AE] block mb-2">Numero de carte</label>
                  <input
                    type="text"
                    value={paymentInfo.cardNumber}
                    onChange={(e) => setPaymentInfo({...paymentInfo, cardNumber: e.target.value})}
                    className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                    placeholder="4242 4242 4242 4242"
                    maxLength={19}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">Date d'expiration</label>
                    <input
                      type="text"
                      value={paymentInfo.expiry}
                      onChange={(e) => setPaymentInfo({...paymentInfo, expiry: e.target.value})}
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                      placeholder="MM/AA"
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <label className="text-sm text-[#CFC6AE] block mb-2">CVC</label>
                    <input
                      type="text"
                      value={paymentInfo.cvc}
                      onChange={(e) => setPaymentInfo({...paymentInfo, cvc: e.target.value})}
                      className="w-full bg-[#111] border border-[#2a2a2a] rounded-2xl px-4 py-3 outline-none focus:border-[#BFA26A] text-[#EDE6D2]"
                      placeholder="123"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="mt-6 w-full rounded-2xl bg-[#BFA26A] text-black font-black py-4 hover:brightness-95 transition disabled:opacity-50"
              >
                {isProcessing ? 'Traitement...' : `Payer ${grandTotal.toFixed(2)} EUR`}
              </button>
              
              <p className="text-xs text-[#CFC6AE] mt-4 text-center">
                Mode demo - Aucun paiement reel ne sera effectue
              </p>
            </div>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
              <h2 className="text-xl font-bold text-[#EDE6D2] mb-6">Votre commande</h2>
              
              {cart.length === 0 ? (
                <div className="text-center py-10">
                  <div className="text-4xl mb-4">🛒</div>
                  <p className="text-[#CFC6AE]">Votre panier est vide</p>
                  <Link to="/galerie" className="mt-4 inline-block text-[#BFA26A] hover:underline">
                    Decouvrir les boutiques
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-4">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-[#0f0f0f] flex-shrink-0">
                        {item.img ? (
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#EDE6D2] truncate">{item.name}</h4>
                        {item.color && <p className="text-xs text-[#CFC6AE]">{item.color}</p>}
                        <p className="text-[#BFA26A] font-bold mt-1">{item.price.toFixed(2)} EUR</p>
                        
                        <div className="flex items-center gap-3 mt-2">
                          <button
                            onClick={() => updateQty(index, item.qty - 1)}
                            className="w-8 h-8 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A] transition"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="font-semibold w-8 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(index, item.qty + 1)}
                            className="w-8 h-8 rounded-lg bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center hover:border-[#BFA26A] transition"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-bold text-[#EDE6D2]">{(item.price * item.qty).toFixed(2)} EUR</p>
                        <button
                          onClick={() => removeItem(index)}
                          className="mt-2 text-[#EF4444] hover:text-[#EF4444]/80 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="rounded-3xl border border-[#1f1f1f] bg-[#0f0f0f] p-6">
                <h3 className="text-lg font-semibold text-[#EDE6D2] mb-4">Resume</h3>
                
                <div className="space-y-3 text-[#CFC6AE]">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span className="text-[#EDE6D2]">{cartTotal.toFixed(2)} EUR</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="text-[#EDE6D2]">{shipping.toFixed(2)} EUR</span>
                  </div>
                  <div className="border-t border-[#1f1f1f] pt-3 flex justify-between text-lg">
                    <span className="font-semibold text-[#EDE6D2]">Total</span>
                    <span className="font-bold text-[#BFA26A]">{grandTotal.toFixed(2)} EUR</span>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-[#141414] border border-[#2a2a2a] rounded-2xl">
                  <p className="text-sm text-[#CFC6AE]">
                    Livraison estimee : <span className="text-[#EDE6D2] font-semibold">3 a 7 jours ouvrables</span>
                  </p>
                  <p className="text-sm text-[#CFC6AE] mt-1">
                    Retours gratuits sous 14 jours
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
