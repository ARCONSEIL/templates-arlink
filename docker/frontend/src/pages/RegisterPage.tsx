import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Store } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register, isLoading, error } = useAuthStore()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    type: 'artisan',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setLocalError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setLocalError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setLocalError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    if (!acceptTerms) {
      setLocalError('Veuillez accepter les conditions d\'utilisation')
      return
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        type: formData.type,
      })
      navigate('/dashboard')
    } catch {
      setLocalError('Une erreur est survenue lors de l\'inscription')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-dark-light relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <span className="text-8xl mb-8 block">🏪</span>
            <h2 className="text-gold font-display text-4xl mb-4">Rejoignez ARLink</h2>
            <p className="text-cream text-xl">Créez votre boutique en ligne</p>
            <p className="text-gray-400 mt-4 max-w-md">
              Exposez vos créations artisanales à une audience mondiale et développez votre activité.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-gold text-3xl font-bold">56+</p>
                <p className="text-gray-400 text-sm">Boutiques</p>
              </div>
              <div>
                <p className="text-gold text-3xl font-bold">29</p>
                <p className="text-gray-400 text-sm">Catégories</p>
              </div>
              <div>
                <p className="text-gold text-3xl font-bold">15+</p>
                <p className="text-gray-400 text-sm">Pays</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 overflow-y-auto">
        <Link to="/" className="flex items-center gap-2 text-cream hover:text-gold transition mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-gold font-display text-3xl mb-2">Créer un compte</h1>
            <p className="text-gray-400 mb-8">
              Commencez votre aventure artisanale
            </p>

            {(localError || error) && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                {localError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Account Type */}
              <div>
                <label className="block text-cream text-sm mb-2">Type de compte</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'client' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition ${
                      formData.type === 'client'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-dark-medium text-cream hover:border-gold'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    <span>Client</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'artisan' })}
                    className={`flex items-center justify-center gap-2 px-4 py-3 border rounded-lg transition ${
                      formData.type === 'artisan'
                        ? 'border-gold bg-gold/10 text-gold'
                        : 'border-dark-medium text-cream hover:border-gold'
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span>Artisan</span>
                  </button>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-cream text-sm mb-2">Prénom</label>
                  <div className="relative">
                    <input
                      type="text"
                      name="prenom"
                      value={formData.prenom}
                      onChange={handleChange}
                      placeholder="Jean"
                      className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 pl-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                    />
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  </div>
                </div>
                <div>
                  <label className="block text-cream text-sm mb-2">Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Dupont"
                    className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-cream text-sm mb-2">Email *</label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="votre@email.com"
                    className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 pl-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-cream text-sm mb-2">Mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 pl-10 pr-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-cream"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-gray-500 text-xs mt-1">Minimum 8 caractères</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-cream text-sm mb-2">Confirmer le mot de passe *</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 pl-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>

              {/* Terms */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 rounded border-dark-medium"
                  />
                  <span className="text-gray-400 text-sm">
                    J'accepte les{' '}
                    <Link to="/terms" className="text-gold hover:underline">
                      conditions d'utilisation
                    </Link>{' '}
                    et la{' '}
                    <Link to="/privacy" className="text-gold hover:underline">
                      politique de confidentialité
                    </Link>
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-dark"></div>
                ) : (
                  'Créer mon compte'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-gold hover:underline">
                  Se connecter
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-medium"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark text-gray-400">Ou s'inscrire avec</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-dark-medium rounded-lg text-cream hover:border-gold transition">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Google</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-dark-medium rounded-lg text-cream hover:border-gold transition">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  <span>Facebook</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
