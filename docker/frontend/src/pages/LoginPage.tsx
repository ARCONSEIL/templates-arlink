import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login, isLoading, error } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')

    if (!email || !password) {
      setLocalError('Veuillez remplir tous les champs')
      return
    }

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setLocalError('Email ou mot de passe incorrect')
    }
  }

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col p-8">
        <Link to="/" className="flex items-center gap-2 text-cream hover:text-gold transition mb-8">
          <ArrowLeft className="w-5 h-5" />
          <span>Retour à l'accueil</span>
        </Link>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-gold font-display text-3xl mb-2">Connexion</h1>
            <p className="text-gray-400 mb-8">
              Accédez à votre espace artisan
            </p>

            {(localError || error) && (
              <div className="bg-red-500/20 border border-red-500 text-red-500 px-4 py-3 rounded-lg mb-6">
                {localError || error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-cream text-sm mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    className="w-full bg-dark-light border border-dark-medium rounded-lg px-4 py-3 pl-10 text-cream placeholder-gray-500 focus:border-gold focus:outline-none"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                </div>
              </div>

              <div>
                <label className="block text-cream text-sm mb-2">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-gray-400 text-sm cursor-pointer">
                  <input type="checkbox" className="rounded border-dark-medium" />
                  <span>Se souvenir de moi</span>
                </label>
                <Link to="/forgot-password" className="text-gold text-sm hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-gold w-full flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-dark"></div>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-400">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-gold hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-dark-medium"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-dark text-gray-400">Ou continuer avec</span>
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

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 bg-dark-light relative">
        <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center p-12">
          <div className="text-center">
            <span className="text-8xl mb-8 block">🎨</span>
            <h2 className="text-gold font-display text-4xl mb-4">ARLink</h2>
            <p className="text-cream text-xl">L'Exposition Mondiale de l'Artisanat</p>
            <p className="text-gray-400 mt-4 max-w-md">
              Rejoignez des milliers d'artisans du monde entier et exposez vos créations à une audience internationale.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
