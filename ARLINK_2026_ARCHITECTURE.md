# ARLink Dashboard Artisan 2026 - Architecture Technique Complete

## Table des Matieres
1. [Stack Technique](#1-stack-technique)
2. [Schema Base de Donnees](#2-schema-base-de-donnees)
3. [Regles Business](#3-regles-business)
4. [API Routes](#4-api-routes)
5. [Middleware Permissions](#5-middleware-permissions)
6. [Admin Dashboard](#6-admin-dashboard)
7. [Systeme Images](#7-systeme-images)
8. [Notifications](#8-notifications)

---

## 1. Stack Technique

### Frontend
- **Framework**: Next.js 14+ (App Router) / React 18+
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: Zustand ou React Query
- **Forms**: React Hook Form + Zod validation

### Backend
- **Framework**: NestJS (TypeScript) ou Next.js API Routes
- **ORM**: Prisma (PostgreSQL)
- **Validation**: class-validator + class-transformer
- **Documentation**: Swagger/OpenAPI

### Base de Donnees
- **Primary**: PostgreSQL 15+
- **Cache**: Redis (sessions, rate limiting)

### Storage Images
- **Primary**: AWS S3 / Cloudflare R2 / MinIO
- **CDN**: CloudFront ou Cloudflare
- **Processing**: Sharp (Node.js) pour compression

### Paiement
- **International**: Stripe
- **Alternative**: PayPal
- **Local**: Virement bancaire (manuel)

### Auth
- **Methode**: JWT (access + refresh tokens)
- **Session**: Cookie HttpOnly secure
- **2FA**: TOTP optionnel pour admins

---

## 2. Schema Base de Donnees

### 2.1 Diagramme Relations

```
users (1) -----> (1) artisans
artisans (1) -----> (N) boutiques
artisans (1) -----> (N) subscriptions
boutiques (1) -----> (N) articles
articles (1) -----> (N) article_images
boutiques (1) -----> (N) orders
orders (1) -----> (N) order_items
orders (1) -----> (1) sales
artisans (1) -----> (N) tickets_support
articles (1) -----> (N) favorites
articles (1) -----> (1) analytics_articles
users (ADMIN) -----> (N) admin_actions_logs
```

### 2.2 Tables SQL

#### A) users
```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role VARCHAR(20) NOT NULL CHECK (role IN ('SUPER_ADMIN', 'ADMIN', 'ARTISAN', 'CLIENT')),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### B) artisans
```sql
CREATE TABLE artisans (
    artisan_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    prenom VARCHAR(100) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    adresse TEXT,
    pays VARCHAR(100) NOT NULL,
    ville VARCHAR(100) NOT NULL,
    photo_vedette_url VARCHAR(500),
    message_boutique TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

CREATE INDEX idx_artisans_user ON artisans(user_id);
CREATE INDEX idx_artisans_pays ON artisans(pays);
```

#### C) boutiques
```sql
CREATE TABLE boutiques (
    boutique_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES artisans(artisan_id) ON DELETE CASCADE,
    nom_boutique VARCHAR(200) NOT NULL,
    slug_sous_domaine VARCHAR(100) UNIQUE NOT NULL,
    categorie VARCHAR(100) NOT NULL, -- NON MODIFIABLE apres creation
    adresse TEXT,
    ville VARCHAR(100),
    pays VARCHAR(100),
    statut VARCHAR(20) DEFAULT 'CONSTRUCTION' CHECK (statut IN ('ACTIVE', 'CONSTRUCTION', 'SUSPENDUE')),
    logo_url VARCHAR(500),
    banner_url VARCHAR(500),
    public_url VARCHAR(500),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_boutiques_artisan ON boutiques(artisan_id);
CREATE INDEX idx_boutiques_slug ON boutiques(slug_sous_domaine);
CREATE INDEX idx_boutiques_categorie ON boutiques(categorie);
CREATE INDEX idx_boutiques_statut ON boutiques(statut);
```

#### D) subscriptions
```sql
CREATE TABLE subscriptions (
    subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artisan_id UUID NOT NULL REFERENCES artisans(artisan_id) ON DELETE CASCADE,
    plan VARCHAR(20) NOT NULL CHECK (plan IN ('BASIQUE', 'STANDARD', 'PREMIUM')),
    billing VARCHAR(20) NOT NULL CHECK (billing IN ('MENSUEL', 'ANNUEL', '15J')),
    prix DECIMAL(10, 2) NOT NULL,
    articles_limit INTEGER NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PAUSED', 'CANCELED', 'EXPIRED')),
    payment_provider VARCHAR(20) CHECK (payment_provider IN ('STRIPE', 'PAYPAL', 'VIREMENT')),
    provider_subscription_id VARCHAR(255),
    auto_renew BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_subscriptions_artisan ON subscriptions(artisan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_end_date ON subscriptions(end_date);
```

#### E) articles
```sql
CREATE TABLE articles (
    article_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    boutique_id UUID NOT NULL REFERENCES boutiques(boutique_id) ON DELETE CASCADE,
    nom VARCHAR(200) NOT NULL,
    description TEXT,
    tags TEXT[], -- PostgreSQL array
    categorie VARCHAR(100) NOT NULL, -- herite de boutique
    prix_artisan_ht DECIMAL(10, 2) NOT NULL,
    tva_rate DECIMAL(4, 2) NOT NULL DEFAULT 20.00 CHECK (tva_rate IN (0, 2.1, 5.5, 10, 20)),
    prix_public_ht DECIMAL(10, 2) GENERATED ALWAYS AS (prix_artisan_ht * 1.15) STORED,
    prix_ttc_client DECIMAL(10, 2) GENERATED ALWAYS AS (prix_artisan_ht * 1.15 * (1 + tva_rate / 100)) STORED,
    stock INTEGER DEFAULT 0,
    statut VARCHAR(20) DEFAULT 'BROUILLON' CHECK (statut IN ('ACTIF', 'BROUILLON', 'ARCHIVE')),
    fabrication_date DATE,
    temps_preparation VARCHAR(20) CHECK (temps_preparation IN ('24H', '48H', '3J', '1S', '2S')),
    produit_pret BOOLEAN DEFAULT FALSE,
    temps_livraison_estime VARCHAR(50),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_articles_boutique ON articles(boutique_id);
CREATE INDEX idx_articles_categorie ON articles(categorie);
CREATE INDEX idx_articles_statut ON articles(statut);
CREATE INDEX idx_articles_featured ON articles(is_featured);
CREATE INDEX idx_articles_prix ON articles(prix_ttc_client);
```

#### F) article_images
```sql
CREATE TABLE article_images (
    image_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    url_thumbnail VARCHAR(500),
    order_index INTEGER NOT NULL CHECK (order_index BETWEEN 1 AND 4),
    size_original_mb DECIMAL(10, 2),
    size_optimized_mb DECIMAL(10, 2),
    optimized_label VARCHAR(50) DEFAULT 'Optimise par ARLink',
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(article_id, order_index)
);

CREATE INDEX idx_article_images_article ON article_images(article_id);
```

#### G) orders
```sql
CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(20) UNIQUE NOT NULL, -- ARK-2026-XXXXX
    boutique_id UUID NOT NULL REFERENCES boutiques(boutique_id),
    artisan_id UUID NOT NULL REFERENCES artisans(artisan_id),
    client_id UUID REFERENCES users(user_id),
    client_email VARCHAR(255) NOT NULL,
    client_nom VARCHAR(200),
    client_phone VARCHAR(20),
    shipping_address TEXT NOT NULL,
    shipping_city VARCHAR(100),
    shipping_country VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    total_ht DECIMAL(10, 2) NOT NULL,
    total_tva DECIMAL(10, 2) NOT NULL,
    total_ttc DECIMAL(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'EN_ATTENTE' CHECK (status IN (
        'EN_ATTENTE', 'CONFIRMEE', 'EN_PREPARATION', 'PRETE', 
        'ENVOYEE', 'LIVREE', 'ANNULEE', 'RETOUR', 'REMBOURSEE'
    )),
    shipping_provider VARCHAR(100),
    tracking_number VARCHAR(100),
    tracking_url VARCHAR(500),
    date_envoi TIMESTAMP,
    date_livraison TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_orders_boutique ON orders(boutique_id);
CREATE INDEX idx_orders_artisan ON orders(artisan_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_orders_created ON orders(created_at);
```

#### H) order_items
```sql
CREATE TABLE order_items (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(article_id),
    article_nom VARCHAR(200) NOT NULL, -- snapshot au moment de la commande
    qty INTEGER NOT NULL CHECK (qty > 0),
    prix_unitaire_ht DECIMAL(10, 2) NOT NULL,
    prix_unitaire_ttc DECIMAL(10, 2) NOT NULL,
    tva_rate DECIMAL(4, 2) NOT NULL,
    total_ttc DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_article ON order_items(article_id);
```

#### I) sales
```sql
CREATE TABLE sales (
    sale_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID UNIQUE NOT NULL REFERENCES orders(order_id),
    artisan_id UUID NOT NULL REFERENCES artisans(artisan_id),
    amount_ttc_paid DECIMAL(10, 2) NOT NULL,
    commission_arlink DECIMAL(10, 2) NOT NULL, -- min 1 EUR
    payment_fees DECIMAL(10, 2) DEFAULT 0, -- frais Stripe/PayPal
    net_artisan DECIMAL(10, 2) NOT NULL, -- amount - commission - fees
    payment_status VARCHAR(20) DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED')),
    payout_date DATE,
    payout_reference VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sales_order ON sales(order_id);
CREATE INDEX idx_sales_artisan ON sales(artisan_id);
CREATE INDEX idx_sales_status ON sales(payment_status);
```

#### J) tickets_support
```sql
CREATE TABLE tickets_support (
    ticket_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_number VARCHAR(20) UNIQUE NOT NULL, -- TKT-2026-XXXXX
    artisan_id UUID NOT NULL REFERENCES artisans(artisan_id),
    order_id UUID REFERENCES orders(order_id),
    article_id UUID REFERENCES articles(article_id),
    category VARCHAR(30) NOT NULL CHECK (category IN ('PAIEMENT', 'COMMANDE', 'BOUTIQUE', 'PRODUIT', 'TECHNIQUE', 'AUTRE')),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    screenshot_url VARCHAR(500),
    status VARCHAR(20) DEFAULT 'OUVERT' CHECK (status IN ('OUVERT', 'EN_COURS', 'RESOLU', 'FERME')),
    priority VARCHAR(10) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    assigned_admin_id UUID REFERENCES users(user_id),
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tickets_artisan ON tickets_support(artisan_id);
CREATE INDEX idx_tickets_status ON tickets_support(status);
CREATE INDEX idx_tickets_category ON tickets_support(category);
```

#### K) favorites
```sql
CREATE TABLE favorites (
    favorite_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    article_id UUID NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(client_id, article_id)
);

CREATE INDEX idx_favorites_client ON favorites(client_id);
CREATE INDEX idx_favorites_article ON favorites(article_id);
```

#### L) analytics_articles
```sql
CREATE TABLE analytics_articles (
    analytics_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID UNIQUE NOT NULL REFERENCES articles(article_id) ON DELETE CASCADE,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    clicks_count INTEGER DEFAULT 0,
    cart_adds_count INTEGER DEFAULT 0,
    purchases_count INTEGER DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_analytics_article ON analytics_articles(article_id);
CREATE INDEX idx_analytics_views ON analytics_articles(views_count DESC);
```

#### M) admin_actions_logs
```sql
CREATE TABLE admin_actions_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(user_id),
    action_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, MERGE, SUSPEND, ACTIVATE
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('ARTISAN', 'BOUTIQUE', 'ARTICLE', 'ORDER', 'SUBSCRIPTION', 'USER', 'TICKET')),
    target_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_logs_admin ON admin_actions_logs(admin_id);
CREATE INDEX idx_admin_logs_target ON admin_actions_logs(target_type, target_id);
CREATE INDEX idx_admin_logs_created ON admin_actions_logs(created_at);
```

#### N) account_merge_requests
```sql
CREATE TABLE account_merge_requests (
    merge_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    old_email VARCHAR(255) NOT NULL,
    old_user_id UUID,
    new_user_id UUID NOT NULL REFERENCES users(user_id),
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'DONE', 'REJECTED')),
    reason TEXT,
    created_by_admin_id UUID NOT NULL REFERENCES users(user_id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_merge_status ON account_merge_requests(status);
CREATE INDEX idx_merge_admin ON account_merge_requests(created_by_admin_id);
```

---

## 3. Regles Business

### 3.1 Abonnements

| Plan | Articles Max | Prix Mensuel | Prix Annuel (10 mois = 12 actifs) |
|------|-------------|--------------|----------------------------------|
| BASIQUE | 30 | 19.99 EUR | 199.90 EUR |
| STANDARD | 60 | 50.00 EUR | 500.00 EUR |
| PREMIUM | 120 | 100.00 EUR | 700.00 EUR |

**Avantages Premium:**
- 3 pubs poussees par la communaute ARLink.online a l'international
- Boutique en vedette

**Regles:**
- Annuel = 10 mois payes = 12 mois actifs
- Afficher "2 mois offerts" pour l'annuel
- Admin peut activer offre 15 jours gratuits
- Verification limite articles avant ajout

```typescript
// Verification limite articles
async function canAddArticle(artisanId: string): Promise<boolean> {
  const subscription = await getActiveSubscription(artisanId);
  if (!subscription) return false;
  
  const currentCount = await countArticles(artisanId);
  return currentCount < subscription.articles_limit;
}
```

### 3.2 Calcul Prix

```typescript
// Formules de calcul
const MARGE_ARLINK = 0.15; // 15%

function calculatePrices(prixArtisanHT: number, tvaRate: number) {
  const prixPublicHT = prixArtisanHT * (1 + MARGE_ARLINK);
  const prixTTCClient = prixPublicHT * (1 + tvaRate / 100);
  
  return {
    prixArtisanHT: round2(prixArtisanHT),
    prixPublicHT: round2(prixPublicHT),
    prixTTCClient: round2(prixTTCClient),
    tvaAmount: round2(prixPublicHT * tvaRate / 100)
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
```

### 3.3 Commission ARLink

```typescript
// Commission = max(1 EUR, floor(prix_ttc / 100) * 1 EUR)
function calculateCommission(prixTTCClient: number): number {
  const commission = Math.floor(prixTTCClient / 100) * 1;
  return Math.max(1, commission); // minimum 1 EUR
}

// Exemples:
// 5 EUR -> 1 EUR commission
// 50 EUR -> 1 EUR commission
// 100 EUR -> 1 EUR commission
// 150 EUR -> 1 EUR commission
// 200 EUR -> 2 EUR commission
// 350 EUR -> 3 EUR commission
```

### 3.4 Minimum Commande

```typescript
const MINIMUM_ORDER = 20; // EUR

function validateCheckout(totalTTC: number): { valid: boolean; message?: string } {
  if (totalTTC < MINIMUM_ORDER) {
    return {
      valid: false,
      message: `Le minimum de commande est de ${MINIMUM_ORDER} EUR. Ajoutez ${(MINIMUM_ORDER - totalTTC).toFixed(2)} EUR pour continuer.`
    };
  }
  return { valid: true };
}
```

### 3.5 Regles Boutique

```typescript
// Categorie NON modifiable apres creation
async function updateBoutique(boutiqueId: string, data: UpdateBoutiqueDto) {
  if (data.categorie) {
    throw new ForbiddenException('La categorie ne peut pas etre modifiee');
  }
  // ... reste de la mise a jour
}

// Boutique visible seulement si photo vedette existe
async function getBoutiquePublic(slug: string) {
  const boutique = await findBySlug(slug);
  
  if (!boutique.artisan.photo_vedette_url) {
    throw new NotFoundException('Boutique non disponible');
  }
  
  return boutique;
}
```

### 3.6 Taux TVA France

| Taux | Application |
|------|-------------|
| 20% | Taux normal (defaut) |
| 10% | Restauration, travaux |
| 5.5% | Produits alimentaires, livres |
| 2.1% | Medicaments rembourses, presse |
| 0% | Export hors UE |

---

## 4. API Routes

### 4.1 Auth

#### POST /auth/register
```json
// Request
{
  "email": "artisan@example.com",
  "password": "SecurePass123!",
  "prenom": "Jean",
  "nom": "Dupont",
  "phone": "+33612345678",
  "pays": "France",
  "ville": "Paris"
}

// Response 201
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "email": "artisan@example.com",
    "role": "ARTISAN"
  },
  "artisan": {
    "artisan_id": "uuid",
    "prenom": "Jean",
    "nom": "Dupont"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /auth/login
```json
// Request
{
  "email": "artisan@example.com",
  "password": "SecurePass123!"
}

// Response 200
{
  "success": true,
  "user": {
    "user_id": "uuid",
    "email": "artisan@example.com",
    "role": "ARTISAN"
  },
  "access_token": "jwt_token",
  "refresh_token": "refresh_token"
}
```

#### POST /auth/logout
```json
// Headers: Authorization: Bearer {token}
// Response 200
{
  "success": true,
  "message": "Deconnexion reussie"
}
```

#### POST /auth/reset-password
```json
// Request
{
  "email": "artisan@example.com"
}

// Response 200
{
  "success": true,
  "message": "Email de reinitialisation envoye"
}
```

#### POST /auth/google
```json
// Request
{
  "token": "google_oauth_token"
}

// Response 200
{
  "success": true,
  "user": { ... },
  "access_token": "jwt_token",
  "is_new_user": true
}
```

### 4.2 Artisan

#### GET /artisan/me
```json
// Headers: Authorization: Bearer {token}
// Response 200
{
  "artisan_id": "uuid",
  "user_id": "uuid",
  "prenom": "Jean",
  "nom": "Dupont",
  "phone": "+33612345678",
  "whatsapp": "+33612345678",
  "adresse": "123 Rue de Paris",
  "pays": "France",
  "ville": "Paris",
  "photo_vedette_url": "https://cdn.arlink.online/photos/xxx.jpg",
  "message_boutique": "Bienvenue dans ma boutique!",
  "is_available": true,
  "subscription": {
    "plan": "STANDARD",
    "articles_limit": 60,
    "articles_used": 25,
    "end_date": "2026-12-31"
  }
}
```

#### PUT /artisan/me
```json
// Request
{
  "prenom": "Jean",
  "nom": "Dupont",
  "phone": "+33612345678",
  "whatsapp": "+33612345678",
  "adresse": "456 Avenue des Artisans",
  "message_boutique": "Nouveau message!",
  "is_available": true
}

// Response 200
{
  "success": true,
  "artisan": { ... }
}
```

### 4.3 Boutique

#### POST /boutiques
```json
// Request
{
  "nom_boutique": "Atelier Jean",
  "slug_sous_domaine": "atelier-jean",
  "categorie": "Bijoux & Orfevrerie",
  "adresse": "123 Rue de Paris",
  "ville": "Paris",
  "pays": "France"
}

// Response 201
{
  "success": true,
  "boutique": {
    "boutique_id": "uuid",
    "nom_boutique": "Atelier Jean",
    "slug_sous_domaine": "atelier-jean",
    "categorie": "Bijoux & Orfevrerie",
    "statut": "CONSTRUCTION",
    "public_url": "https://atelier-jean.arlink.online"
  }
}
```

#### GET /boutiques/me
```json
// Response 200
{
  "boutiques": [
    {
      "boutique_id": "uuid",
      "nom_boutique": "Atelier Jean",
      "slug_sous_domaine": "atelier-jean",
      "categorie": "Bijoux & Orfevrerie",
      "statut": "ACTIVE",
      "articles_count": 25,
      "orders_count": 150,
      "revenue_total": 12500.00
    }
  ]
}
```

#### PUT /boutiques/:id
```json
// Request (categorie NON modifiable)
{
  "nom_boutique": "Atelier Jean - Bijoux",
  "adresse": "456 Avenue des Artisans",
  "statut": "ACTIVE"
}

// Response 200
{
  "success": true,
  "boutique": { ... }
}
```

#### GET /b/:slug (Public)
```json
// Response 200
{
  "boutique": {
    "nom_boutique": "Atelier Jean",
    "categorie": "Bijoux & Orfevrerie",
    "ville": "Paris",
    "pays": "France",
    "logo_url": "...",
    "artisan": {
      "prenom": "Jean",
      "photo_vedette_url": "...",
      "message_boutique": "..."
    }
  },
  "articles": [
    {
      "article_id": "uuid",
      "nom": "Collier Artisanal",
      "prix_ttc_client": 89.90,
      "images": [...]
    }
  ],
  "featured_articles": [...],
  "similar_boutiques": [...]
}
```

### 4.4 Articles

#### POST /articles
```json
// Request
{
  "boutique_id": "uuid",
  "nom": "Collier Artisanal Or",
  "description": "Magnifique collier fait main...",
  "tags": ["or", "collier", "artisanal"],
  "prix_artisan_ht": 65.00,
  "tva_rate": 20,
  "stock": 5,
  "temps_preparation": "48H",
  "produit_pret": true
}

// Response 201
{
  "success": true,
  "article": {
    "article_id": "uuid",
    "nom": "Collier Artisanal Or",
    "prix_artisan_ht": 65.00,
    "prix_public_ht": 74.75,
    "prix_ttc_client": 89.70,
    "categorie": "Bijoux & Orfevrerie",
    "statut": "BROUILLON"
  }
}
```

#### GET /articles
```json
// Query: ?boutique_id=uuid&statut=ACTIF&page=1&limit=20
// Response 200
{
  "articles": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "pages": 3
  }
}
```

#### PUT /articles/:id
```json
// Request
{
  "nom": "Collier Artisanal Or 18K",
  "prix_artisan_ht": 75.00,
  "stock": 3,
  "statut": "ACTIF"
}

// Response 200
{
  "success": true,
  "article": { ... }
}
```

#### POST /articles/:id/images
```json
// Request: multipart/form-data
// file: image.jpg (max 100MB)
// order_index: 1

// Response 201
{
  "success": true,
  "image": {
    "image_id": "uuid",
    "url": "https://cdn.arlink.online/articles/xxx.jpg",
    "url_thumbnail": "https://cdn.arlink.online/articles/xxx_thumb.jpg",
    "size_original_mb": 15.5,
    "size_optimized_mb": 0.8,
    "optimized_label": "Optimise par ARLink"
  }
}
```

#### POST /articles/:id/feature
```json
// Request
{
  "is_featured": true
}

// Response 200
{
  "success": true,
  "message": "Article mis en vedette"
}
```

### 4.5 Commandes

#### GET /orders
```json
// Query: ?status=EN_ATTENTE&page=1&limit=20
// Response 200
{
  "orders": [
    {
      "order_id": "uuid",
      "order_number": "ARK-2026-00001",
      "client_nom": "Marie Martin",
      "total_ttc": 156.80,
      "status": "EN_ATTENTE",
      "items_count": 3,
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "pagination": { ... }
}
```

#### GET /orders/:id
```json
// Response 200
{
  "order": {
    "order_id": "uuid",
    "order_number": "ARK-2026-00001",
    "client_nom": "Marie Martin",
    "client_email": "marie@example.com",
    "shipping_address": "789 Rue du Client, 75001 Paris",
    "total_ht": 130.67,
    "total_tva": 26.13,
    "total_ttc": 156.80,
    "status": "EN_ATTENTE",
    "items": [
      {
        "article_nom": "Collier Artisanal Or",
        "qty": 1,
        "prix_unitaire_ttc": 89.70
      }
    ]
  }
}
```

#### PUT /orders/:id/status
```json
// Request
{
  "status": "EN_PREPARATION"
}

// Response 200
{
  "success": true,
  "order": { ... },
  "notification_sent": true
}
```

#### PUT /orders/:id/tracking
```json
// Request
{
  "shipping_provider": "Colissimo",
  "tracking_number": "1234567890",
  "tracking_url": "https://www.laposte.fr/outils/suivre-vos-envois?code=1234567890"
}

// Response 200
{
  "success": true,
  "order": { ... },
  "notification_sent": true
}
```

### 4.6 Ventes

#### GET /sales
```json
// Query: ?month=2026-01&page=1
// Response 200
{
  "sales": [
    {
      "sale_id": "uuid",
      "order_number": "ARK-2026-00001",
      "amount_ttc_paid": 156.80,
      "commission_arlink": 1.00,
      "payment_fees": 4.70,
      "net_artisan": 151.10,
      "payment_status": "PAID",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ],
  "summary": {
    "total_sales": 12500.00,
    "total_commission": 125.00,
    "total_fees": 375.00,
    "total_net": 12000.00
  }
}
```

### 4.7 Support

#### POST /tickets
```json
// Request
{
  "category": "COMMANDE",
  "subject": "Probleme avec commande ARK-2026-00001",
  "message": "Le client signale un article manquant...",
  "order_id": "uuid",
  "screenshot_url": "https://..."
}

// Response 201
{
  "success": true,
  "ticket": {
    "ticket_id": "uuid",
    "ticket_number": "TKT-2026-00001",
    "status": "OUVERT"
  }
}
```

#### GET /tickets
```json
// Response 200
{
  "tickets": [
    {
      "ticket_id": "uuid",
      "ticket_number": "TKT-2026-00001",
      "category": "COMMANDE",
      "subject": "Probleme avec commande...",
      "status": "EN_COURS",
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### 4.8 Admin

#### GET /admin/artisans
```json
// Query: ?status=active&page=1&search=jean
// Response 200
{
  "artisans": [
    {
      "artisan_id": "uuid",
      "prenom": "Jean",
      "nom": "Dupont",
      "email": "jean@example.com",
      "boutiques_count": 2,
      "articles_count": 45,
      "subscription": {
        "plan": "STANDARD",
        "status": "ACTIVE"
      },
      "is_active": true
    }
  ]
}
```

#### PUT /admin/artisans/:id/activate
```json
// Request
{
  "is_active": true,
  "reason": "Verification complete"
}

// Response 200
{
  "success": true,
  "artisan": { ... },
  "log_id": "uuid"
}
```

#### POST /admin/merge-account
```json
// Request
{
  "old_email": "ancien@example.com",
  "new_user_id": "uuid",
  "reason": "Demande de l'artisan - changement email"
}

// Response 200
{
  "success": true,
  "merge": {
    "merge_id": "uuid",
    "status": "DONE",
    "old_email": "ancien@example.com",
    "new_user_id": "uuid"
  },
  "log_id": "uuid"
}
```

#### GET /admin/logs
```json
// Query: ?admin_id=uuid&action_type=MERGE&page=1
// Response 200
{
  "logs": [
    {
      "log_id": "uuid",
      "admin": {
        "email": "admin@arlink.online"
      },
      "action_type": "MERGE",
      "target_type": "USER",
      "target_id": "uuid",
      "old_values": { "email": "ancien@example.com" },
      "new_values": { "merged_to": "uuid" },
      "created_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

### 4.9 Payments

#### POST /payments/stripe/create-session
```json
// Request
{
  "order_id": "uuid",
  "success_url": "https://arlink.online/order/success",
  "cancel_url": "https://arlink.online/order/cancel"
}

// Response 200
{
  "session_id": "cs_xxx",
  "url": "https://checkout.stripe.com/pay/cs_xxx"
}
```

#### POST /payments/paypal/create-order
```json
// Request
{
  "order_id": "uuid"
}

// Response 200
{
  "paypal_order_id": "xxx",
  "approval_url": "https://www.paypal.com/checkoutnow?token=xxx"
}
```

#### POST /payments/bank-transfer/request
```json
// Request
{
  "subscription_id": "uuid",
  "plan": "PREMIUM",
  "billing": "ANNUEL"
}

// Response 200
{
  "success": true,
  "bank_details": {
    "iban": "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
    "bic": "XXXXXXXX",
    "reference": "ARK-SUB-2026-00001",
    "amount": 399.90
  },
  "message": "Effectuez le virement avec la reference indiquee. Votre abonnement sera active sous 48h."
}
```

---

## 5. Middleware Permissions

### 5.1 Roles et Acces

| Role | Acces |
|------|-------|
| SUPER_ADMIN | Acces total, gestion admins |
| ADMIN | Gestion marketplace, support, merge, logs |
| ARTISAN | Ses ressources uniquement |
| CLIENT | Consultation, commandes, favoris |

### 5.2 Implementation

```typescript
// guards/roles.guard.ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (!requiredRoles) return true;
    
    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}

// guards/ownership.guard.ts
@Injectable()
export class OwnershipGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    // Admins peuvent tout voir
    if (['SUPER_ADMIN', 'ADMIN'].includes(user.role)) {
      return true;
    }
    
    // Verifier ownership pour artisans
    const resourceId = request.params.id;
    const resourceType = this.getResourceType(request.path);
    
    return this.verifyOwnership(user, resourceType, resourceId);
  }
  
  private async verifyOwnership(user: User, type: string, id: string): Promise<boolean> {
    const artisan = await this.artisanService.findByUserId(user.user_id);
    if (!artisan) return false;
    
    switch (type) {
      case 'boutique':
        return this.boutiqueService.belongsToArtisan(id, artisan.artisan_id);
      case 'article':
        return this.articleService.belongsToArtisan(id, artisan.artisan_id);
      case 'order':
        return this.orderService.belongsToArtisan(id, artisan.artisan_id);
      default:
        return false;
    }
  }
}

// Decorators
@Roles(Role.ADMIN, Role.SUPER_ADMIN)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('admin/artisans')
async getArtisans() { ... }

@UseGuards(JwtAuthGuard, OwnershipGuard)
@Put('articles/:id')
async updateArticle() { ... }
```

### 5.3 Verification Ownership

```typescript
// services/ownership.service.ts
@Injectable()
export class OwnershipService {
  
  // Verifier que boutique appartient a artisan
  async verifyBoutiqueOwnership(boutiqueId: string, artisanId: string): Promise<boolean> {
    const boutique = await this.boutiqueRepo.findOne({
      where: { boutique_id: boutiqueId, artisan_id: artisanId }
    });
    return !!boutique;
  }
  
  // Verifier que article appartient a artisan (via boutique)
  async verifyArticleOwnership(articleId: string, artisanId: string): Promise<boolean> {
    const article = await this.articleRepo.findOne({
      where: { article_id: articleId },
      relations: ['boutique']
    });
    return article?.boutique?.artisan_id === artisanId;
  }
  
  // Verifier que commande appartient a artisan
  async verifyOrderOwnership(orderId: string, artisanId: string): Promise<boolean> {
    const order = await this.orderRepo.findOne({
      where: { order_id: orderId, artisan_id: artisanId }
    });
    return !!order;
  }
}
```

---

## 6. Admin Dashboard

### 6.1 Fonctionnalites

1. **Dashboard Overview**
   - Total artisans actifs
   - Total boutiques
   - Total articles
   - Chiffre d'affaires mensuel
   - Commandes en attente

2. **Gestion Artisans**
   - Liste avec filtres (actif, suspendu, pays)
   - Activer/Suspendre compte
   - Voir details complet
   - Historique actions

3. **Gestion Boutiques**
   - Liste avec filtres (categorie, statut)
   - Moderer contenu
   - Mettre en vedette

4. **Support**
   - Liste tickets
   - Assigner a admin
   - Repondre
   - Fermer ticket

5. **Fusion Comptes**
   - Interface de fusion
   - Historique fusions

### 6.2 Fusion Comptes - Workflow

```typescript
// admin/merge-account.service.ts
@Injectable()
export class MergeAccountService {
  
  async mergeAccounts(
    adminId: string,
    oldEmail: string,
    newUserId: string,
    reason: string
  ): Promise<MergeResult> {
    
    // 1. Trouver ancien compte
    const oldUser = await this.userRepo.findOne({ where: { email: oldEmail } });
    
    // 2. Creer demande de fusion
    const mergeRequest = await this.mergeRepo.save({
      old_email: oldEmail,
      old_user_id: oldUser?.user_id,
      new_user_id: newUserId,
      status: 'PENDING',
      reason,
      created_by_admin_id: adminId
    });
    
    // 3. Si ancien compte existe, transferer les donnees
    if (oldUser) {
      await this.transferData(oldUser.user_id, newUserId);
    }
    
    // 4. Marquer comme complete
    mergeRequest.status = 'DONE';
    mergeRequest.processed_at = new Date();
    await this.mergeRepo.save(mergeRequest);
    
    // 5. Logger l'action
    await this.logAction(adminId, 'MERGE', 'USER', newUserId, {
      old_email: oldEmail,
      reason
    });
    
    return mergeRequest;
  }
  
  private async transferData(oldUserId: string, newUserId: string) {
    // Transferer artisan profile
    await this.artisanRepo.update(
      { user_id: oldUserId },
      { user_id: newUserId }
    );
    
    // Transferer favoris
    await this.favoriteRepo.update(
      { client_id: oldUserId },
      { client_id: newUserId }
    );
    
    // Desactiver ancien compte
    await this.userRepo.update(
      { user_id: oldUserId },
      { is_active: false, email: `merged_${oldUserId}@deleted.arlink.online` }
    );
  }
}
```

---

## 7. Systeme Images

### 7.1 Specifications

- **Taille max upload**: 100 MB
- **Formats acceptes**: JPEG, PNG, WebP, HEIC
- **Compression cible**: < 1 MB
- **Dimensions max**: 2000x2000 px
- **Thumbnail**: 400x400 px

### 7.2 Pipeline de Traitement

```typescript
// services/image.service.ts
import sharp from 'sharp';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

@Injectable()
export class ImageService {
  
  async processAndUpload(
    file: Express.Multer.File,
    articleId: string,
    orderIndex: number
  ): Promise<ImageResult> {
    
    const originalSize = file.size / (1024 * 1024); // MB
    
    // 1. Optimiser image principale
    const optimizedBuffer = await sharp(file.buffer)
      .resize(2000, 2000, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();
    
    // 2. Creer thumbnail
    const thumbnailBuffer = await sharp(file.buffer)
      .resize(400, 400, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    // 3. Upload vers S3
    const imageKey = `articles/${articleId}/${orderIndex}_${Date.now()}.jpg`;
    const thumbKey = `articles/${articleId}/${orderIndex}_${Date.now()}_thumb.jpg`;
    
    await Promise.all([
      this.uploadToS3(imageKey, optimizedBuffer),
      this.uploadToS3(thumbKey, thumbnailBuffer)
    ]);
    
    const optimizedSize = optimizedBuffer.length / (1024 * 1024);
    
    // 4. Sauvegarder en DB
    return this.imageRepo.save({
      article_id: articleId,
      url: `${this.cdnUrl}/${imageKey}`,
      url_thumbnail: `${this.cdnUrl}/${thumbKey}`,
      order_index: orderIndex,
      size_original_mb: originalSize,
      size_optimized_mb: optimizedSize,
      optimized_label: 'Optimise par ARLink'
    });
  }
  
  private async uploadToS3(key: string, buffer: Buffer) {
    await this.s3.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: 'image/jpeg',
      CacheControl: 'max-age=31536000'
    }));
  }
}
```

### 7.3 Frontend - Progress Upload

```typescript
// components/ImageUploader.tsx
export function ImageUploader({ articleId, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'optimizing' | 'done'>('idle');
  
  const handleUpload = async (file: File) => {
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_index', '1');
    
    const response = await axios.post(
      `/api/articles/${articleId}/images`,
      formData,
      {
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
          if (percent === 100) setStatus('optimizing');
        }
      }
    );
    
    setStatus('done');
    onComplete(response.data.image);
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {status === 'uploading' && <ProgressBar value={progress} />}
      {status === 'optimizing' && <span>Optimisation en cours...</span>}
      {status === 'done' && <span>Optimise par ARLink</span>}
    </div>
  );
}
```

---

## 8. Notifications

### 8.1 Types de Notifications

| Event | Destinataire | Canal |
|-------|--------------|-------|
| Nouvelle commande | Artisan | Email + Push |
| Commande confirmee | Client | Email |
| Commande envoyee | Client | Email + SMS |
| Commande livree | Client | Email |
| Ticket repondu | Artisan | Email |
| Abonnement expire | Artisan | Email |

### 8.2 Implementation

```typescript
// services/notification.service.ts
@Injectable()
export class NotificationService {
  
  async notifyOrderShipped(order: Order) {
    const template = await this.getTemplate('order_shipped');
    
    // Email
    await this.emailService.send({
      to: order.client_email,
      subject: `Votre commande ${order.order_number} a ete expediee`,
      html: this.renderTemplate(template, {
        order_number: order.order_number,
        tracking_number: order.tracking_number,
        tracking_url: order.tracking_url,
        shipping_provider: order.shipping_provider
      })
    });
    
    // SMS si numero disponible
    if (order.client_phone) {
      await this.smsService.send({
        to: order.client_phone,
        message: `ARLink: Votre commande ${order.order_number} est en route! Suivi: ${order.tracking_url}`
      });
    }
    
    // Log
    await this.logNotification(order.order_id, 'ORDER_SHIPPED', ['email', 'sms']);
  }
  
  async notifyNewOrder(order: Order) {
    const artisan = await this.artisanService.findById(order.artisan_id);
    
    await this.emailService.send({
      to: artisan.user.email,
      subject: `Nouvelle commande ${order.order_number}`,
      html: this.renderTemplate('new_order', {
        order_number: order.order_number,
        total_ttc: order.total_ttc,
        items_count: order.items.length,
        client_nom: order.client_nom
      })
    });
    
    // Push notification si app mobile
    await this.pushService.send(artisan.user_id, {
      title: 'Nouvelle commande!',
      body: `${order.client_nom} - ${order.total_ttc} EUR`,
      data: { order_id: order.order_id }
    });
  }
}
```

---

## 9. Securite

### 9.1 Checklist Securite

- [ ] HTTPS obligatoire
- [ ] JWT avec expiration courte (15min access, 7j refresh)
- [ ] Rate limiting (100 req/min par IP)
- [ ] Validation input (Zod/class-validator)
- [ ] SQL injection prevention (ORM parameterized)
- [ ] XSS prevention (sanitize HTML)
- [ ] CSRF tokens pour formulaires
- [ ] Passwords hashes (bcrypt, cost 12)
- [ ] Logs des actions sensibles
- [ ] Backup DB quotidien

### 9.2 Headers Securite

```typescript
// main.ts
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'https://cdn.arlink.online', 'data:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
  hsts: { maxAge: 31536000, includeSubDomains: true },
}));
```

---

## 10. Index et Performance

### 10.1 Index Critiques

```sql
-- Recherche articles
CREATE INDEX idx_articles_search ON articles USING gin(to_tsvector('french', nom || ' ' || description));

-- Filtres frequents
CREATE INDEX idx_articles_boutique_statut ON articles(boutique_id, statut);
CREATE INDEX idx_orders_artisan_status_date ON orders(artisan_id, status, created_at DESC);

-- Analytics
CREATE INDEX idx_analytics_views_desc ON analytics_articles(views_count DESC);
```

### 10.2 Cache Strategy

```typescript
// Redis cache pour donnees frequentes
const CACHE_TTL = {
  boutique_public: 300,      // 5 min
  categories_list: 3600,     // 1 heure
  featured_articles: 600,    // 10 min
  user_session: 86400,       // 24 heures
};
```

---

## Conclusion

Cette architecture est concue pour etre:
- **Simple**: Stack standard, pas de sur-ingenierie
- **Robuste**: Validation stricte, securite renforcee
- **Rentable**: Commission minimum garantie, pas de couts caches
- **Scalable**: PostgreSQL + Redis + CDN = millions d'utilisateurs

Prochaines etapes:
1. Valider le schema avec l'equipe
2. Implementer le MVP (auth + boutiques + articles)
3. Ajouter paiements
4. Deployer en production
5. Iterer selon feedback utilisateurs
