import { create } from 'zustand'
import { authService } from '../services/api'

interface User {
  id: string
  email: string
  nom?: string
  prenom?: string
  type: string
}

interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: (data: { email: string; nom?: string; prenom?: string; googleId: string }) => Promise<void>
  register: (data: { email: string; password: string; nom?: string; prenom?: string; type?: string }) => Promise<void>
  logout: () => void
  checkAuth: () => Promise<void>
  setToken: (token: string) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

    login: async (email: string, password: string) => {
      set({ isLoading: true, error: null })
      try {
        const response = await authService.login(email, password)
        const { access_token, user } = response.data
        localStorage.setItem('token', access_token)
        set({ user, token: access_token, isLoading: false })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed'
        set({ error: errorMessage, isLoading: false })
        throw error
      }
    },

    loginWithGoogle: async (data: { email: string; nom?: string; prenom?: string; googleId: string }) => {
      set({ isLoading: true, error: null })
      try {
        const response = await authService.loginWithGoogle(data)
        const { access_token, user } = response.data
        localStorage.setItem('token', access_token)
        set({ user, token: access_token, isLoading: false })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Google login failed'
        set({ error: errorMessage, isLoading: false })
        throw error
      }
    },

  register: async (data) => {
    set({ isLoading: true, error: null })
    try {
      const response = await authService.register(data)
      const { access_token, user } = response.data
      localStorage.setItem('token', access_token)
      set({ user, token: access_token, isLoading: false })
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed'
      set({ error: errorMessage, isLoading: false })
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('token')
    set({ user: null, token: null })
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    set({ isLoading: true })
    try {
      const response = await authService.getProfile()
      set({ user: response.data, isLoading: false })
    } catch {
      localStorage.removeItem('token')
      set({ user: null, token: null, isLoading: false })
    }
  },

  setToken: (token: string) => {
    localStorage.setItem('token', token)
    set({ token })
  },
}))
