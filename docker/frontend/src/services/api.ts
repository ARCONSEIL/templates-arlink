import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; nom?: string; prenom?: string; type?: string }) =>
    api.post('/auth/register', data),
  getProfile: () => api.get('/auth/me'),
}

export const boutiquesService = {
  getAll: (params?: Record<string, string>) => api.get('/boutiques', { params }),
  getById: (id: string) => api.get(`/boutiques/${id}`),
  getBySubDomain: (subDomain: string) => api.get(`/boutiques/subdomain/${subDomain}`),
  getByCategorie: (categorie: string) => api.get(`/boutiques/categorie/${categorie}`),
  getFeatured: (limit?: number) => api.get('/boutiques/featured', { params: { limit } }),
  getMapData: () => api.get('/boutiques/map'),
  search: (query: string) => api.get('/boutiques/search', { params: { q: query } }),
  create: (data: Record<string, unknown>) => api.post('/boutiques', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/boutiques/${id}`, data),
  delete: (id: string) => api.delete(`/boutiques/${id}`),
}

export const productsService = {
  getAll: (params?: Record<string, string>) => api.get('/products', { params }),
  getById: (id: string) => api.get(`/products/${id}`),
  getByBoutique: (boutiqueId: string) => api.get(`/products/boutique/${boutiqueId}`),
  getVedettes: (limit?: number) => api.get('/products/vedettes', { params: { limit } }),
  search: (query: string) => api.get('/products/search', { params: { q: query } }),
  create: (data: Record<string, unknown>) => api.post('/products', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/products/${id}`, data),
  delete: (id: string) => api.delete(`/products/${id}`),
}

export const categoriesService = {
  getAll: () => api.get('/categories'),
  getById: (id: string) => api.get(`/categories/${id}`),
  getBySlug: (slug: string) => api.get(`/categories/slug/${slug}`),
}

export const artisansService = {
  getAll: (params?: Record<string, string>) => api.get('/artisans', { params }),
  getById: (id: string) => api.get(`/artisans/${id}`),
  getMapData: () => api.get('/artisans/map'),
  getMyProfile: () => api.get('/artisans/me'),
  create: (data: Record<string, unknown>) => api.post('/artisans', data),
  update: (id: string, data: Record<string, unknown>) => api.put(`/artisans/${id}`, data),
}

export const statsService = {
  getGlobal: () => api.get('/stats'),
  getArtisan: (artisanId: string) => api.get(`/stats/artisan/${artisanId}`),
  getBoutique: (boutiqueId: string) => api.get(`/stats/boutique/${boutiqueId}`),
}

export default api
