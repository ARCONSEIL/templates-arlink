/**
 * Application Constants
 * Centralized configuration for API endpoints, storage keys, and app settings
 */

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.arlink.online/api';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    ADMIN_LOGIN: '/auth/admin-login',
    REGISTER: '/auth/create-user',
    MAGIC_LINK: '/auth/magic-link',
    VERIFY: '/auth/verify',
    GOOGLE: '/auth/google',
    GOOGLE_CALLBACK: '/auth/google/callback',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    BY_ID: (id: string) => `/products/${id}`,
    PUBLISH: (id: string) => `/products/${id}/publish`,
  },

  // Artisan
  ARTISAN: {
    SHOP: '/artisan/shop',
    STATS: '/artisan/stats',
    PRODUCTS: '/artisan/products',
    PRODUCT_BY_ID: (id: string) => `/artisan/products/${id}`,
  },

  // Upload
  UPLOAD: {
    IMAGE: '/media/upload',
  },

  // Shops
  SHOPS: {
    BASE: '/shops',
    BY_SUBDOMAIN: (subdomain: string) => `/shops/${subdomain}`,
    PRODUCTS: (subdomain: string) => `/shops/${subdomain}/products`,
    TOP_RATED: '/shops/top-rated',
    FEATURED: '/shops/featured',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
  },

  // Payments
  PAYMENTS: {
    BASE: '/payments',
  },
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'arlink_token',
  CART: 'arlink_cart',
  USER: 'arlink_user',
  THEME: 'arlink_theme',
  LANGUAGE: 'arlink_language',
} as const;

// App Configuration
export const APP_CONFIG = {
  NAME: 'ARLinK',
  TAGLINE: "L'ARTISANAT MONDIAL",
  DEFAULT_LANGUAGE: 'fr',
  PASSWORD_MIN_LENGTH: 10,
  MESSAGE_AUTO_DISMISS_DURATION: 5000, // milliseconds
  SEARCH_DEBOUNCE_DELAY: 300, // milliseconds
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
} as const;

// Image Compression Settings
export const IMAGE_COMPRESSION = {
  ORIGINAL: {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
  },
  MEDIUM: {
    maxWidth: 800,
    maxHeight: 800,
    quality: 0.8,
  },
  THUMBNAIL: {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.75,
  },
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  SHOP_LIMIT: 20,
  PRODUCT_LIMIT: 20,
} as const;

// Categories
export const CATEGORIES = [
  { id: 'bijoux', label: 'Bijoux', icon: '💍' },
  { id: 'ceramique', label: 'Céramique', icon: '🏺' },
  { id: 'textile', label: 'Textile', icon: '🧵' },
  { id: 'cuir', label: 'Cuir', icon: '👜' },
  { id: 'bois', label: 'Bois', icon: '🪵' },
  { id: 'verre', label: 'Verre', icon: '🫙' },
  { id: 'metal', label: 'Métal', icon: '⚒️' },
  { id: 'papier', label: 'Papier', icon: '📄' },
  { id: 'cosmetiques', label: 'Cosmétiques', icon: '🧴' },
  { id: 'savons', label: 'Savons', icon: '🧼' },
  { id: 'bougies', label: 'Bougies', icon: '🕯️' },
  { id: 'decoration', label: 'Décoration', icon: '🖼️' },
  { id: 'mobilier', label: 'Mobilier', icon: '🪑' },
  { id: 'vetements', label: 'Vêtements', icon: '👗' },
  { id: 'accessoires', label: 'Accessoires', icon: '👒' },
  { id: 'chaussures', label: 'Chaussures', icon: '👞' },
  { id: 'jouets', label: 'Jouets', icon: '🧸' },
  { id: 'instruments', label: 'Instruments', icon: '🎸' },
  { id: 'art', label: 'Art', icon: '🎨' },
  { id: 'sculpture', label: 'Sculpture', icon: '🗿' },
  { id: 'photographie', label: 'Photographie', icon: '📷' },
  { id: 'epicerie', label: 'Épicerie', icon: '🍯' },
  { id: 'the-cafe', label: 'Thé & Café', icon: '☕' },
  { id: 'chocolat', label: 'Chocolat', icon: '🍫' },
  { id: 'confiserie', label: 'Confiserie', icon: '🍬' },
  { id: 'spiritueux', label: 'Spiritueux', icon: '🍷' },
  { id: 'encens', label: 'Encens', icon: '🔥' },
  { id: 'autre', label: 'Autre', icon: '✨' },
] as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  ADMIN_LOGIN: '/admin-login',
  REGISTER: '/register',
  VERIFY: '/verify',
  DASHBOARD: '/dashboard',
  DASHBOARD_STATS: '/dashboard/stats',
  DASHBOARD_PRODUCTS: '/dashboard/products',
  DASHBOARD_SHOP: '/dashboard/shop',
  DASHBOARD_ORDERS: '/dashboard/orders',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_SHOPS: '/admin/shops',
  ADMIN_MODERATION: '/admin/moderation',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_SETTINGS: '/admin/settings',
  BOUTIQUE: (subdomain: string) => `/${subdomain}`,
} as const;
