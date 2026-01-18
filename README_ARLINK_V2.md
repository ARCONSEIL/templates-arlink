# ARLink V2 - L'Exposition Mondiale de l'Artisanat

## Version: Devin AI - Janvier 2026

---

## 1. PRESENTATION DU PROJET

ARLink V2 est une plateforme de marketplace artisanale permettant aux artisans du monde entier de presenter et vendre leurs creations. La plateforme offre une experience immersive avec une carte interactive, des boutiques personnalisees en sous-domaines, et un systeme de gestion complet.

**URL de production:** https://arlink.online
**Serveur:** 217.154.2.83

---

## 2. TECHNOLOGIES UTILISEES

### Backend
- **Framework:** NestJS v10.x (Node.js)
- **Langage:** TypeScript
- **Base de donnees:** PostgreSQL 15
- **ORM:** TypeORM
- **Cache:** Redis 7
- **Authentification:** JWT (JSON Web Tokens)
- **API:** REST API

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite 5.x
- **Langage:** TypeScript
- **Styling:** Tailwind CSS
- **Carte:** Leaflet + React-Leaflet
- **State Management:** Zustand
- **HTTP Client:** Axios
- **Icons:** Lucide React

### Infrastructure
- **Containerisation:** Docker + Docker Compose
- **Serveur Web:** Nginx (reverse proxy)
- **OS Serveur:** Linux (Debian/Ubuntu)

---

## 3. STRUCTURE DU PROJET

```
arlink-project/
├── docker/
│   ├── docker-compose.yml          # Configuration Docker
│   ├── backend/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── nest-cli.json
│   │   └── src/
│   │       ├── main.ts             # Point d'entree
│   │       ├── app.module.ts       # Module principal
│   │       └── modules/
│   │           ├── artisans/       # Gestion des artisans
│   │           │   ├── artisan.entity.ts
│   │           │   ├── artisans.controller.ts
│   │           │   ├── artisans.service.ts
│   │           │   └── artisans.module.ts
│   │           ├── boutiques/      # Gestion des boutiques
│   │           │   ├── boutique.entity.ts
│   │           │   ├── boutiques.controller.ts
│   │           │   ├── boutiques.service.ts
│   │           │   └── boutiques.module.ts
│   │           ├── products/       # Gestion des produits
│   │           │   ├── product.entity.ts
│   │           │   ├── products.controller.ts
│   │           │   ├── products.service.ts
│   │           │   └── products.module.ts
│   │           ├── categories/     # Gestion des categories
│   │           ├── users/          # Gestion des utilisateurs
│   │           ├── auth/           # Authentification JWT
│   │           └── stats/          # Statistiques
│   │
│   └── frontend/
│       ├── Dockerfile
│       ├── package.json
│       ├── vite.config.ts
│       ├── tsconfig.json
│       ├── index.html
│       ├── nginx.conf              # Config Nginx frontend
│       └── src/
│           ├── main.tsx            # Point d'entree React
│           ├── App.tsx             # Routeur principal
│           ├── index.css           # Styles globaux Tailwind
│           ├── services/
│           │   └── api.ts          # Services API (Axios)
│           ├── stores/
│           │   └── authStore.ts    # State Zustand
│           └── pages/
│               ├── HomePage.tsx        # Page d'accueil
│               ├── GaleriePage.tsx     # Galerie par categorie
│               ├── BoutiquePage.tsx    # Page boutique
│               ├── CartPage.tsx        # Panier
│               ├── DashboardPage.tsx   # Dashboard general
│               ├── DashboardArtisanPage.tsx  # Dashboard artisan
│               ├── DashboardClientPage.tsx   # Dashboard client
│               ├── LoginPage.tsx       # Connexion
│               └── RegisterPage.tsx    # Inscription
│
├── nginx/
│   └── arlink-v2.conf              # Config Nginx serveur
│
└── CAHIER_DES_CHARGES_ARLINK_V2.md # Specifications
```

---

## 4. BASE DE DONNEES

### Tables principales

**artisans**
- id (UUID, PK)
- userId (UUID, FK)
- nom, prenom
- telephone, email
- adresse, ville, pays
- bio, specialite
- createdAt, updatedAt

**boutiques**
- id (UUID, PK)
- artisanId (UUID, FK)
- societe (nom de la boutique)
- subDomain (sous-domaine unique)
- description
- categorie, sousCategorie
- ville, pays, adresse
- latitude, longitude
- logo, banniere, image
- featured (boolean)
- featuredOrder (int)
- status (active/inactive)
- vues, visites
- horaires, reseauxSociaux
- createdAt, updatedAt

**products**
- id (UUID, PK)
- boutiqueId (UUID, FK)
- nom, titre, description
- prix, prixGros
- img1, img2, img3, img4
- stock
- vedette (boolean)
- status
- createdAt, updatedAt

**users**
- id (UUID, PK)
- email (unique)
- password (hash)
- nom, prenom
- type (client/artisan/admin)
- createdAt, updatedAt

### Donnees actuelles
- 56 boutiques migrees depuis MySQL
- 20 categories actives
- 23 produits de demonstration

---

## 5. API ENDPOINTS

### Authentification
- POST /api/auth/register - Inscription
- POST /api/auth/login - Connexion
- GET /api/auth/me - Profil utilisateur

### Boutiques
- GET /api/boutiques - Liste des boutiques
- GET /api/boutiques/:id - Boutique par ID
- GET /api/boutiques/subdomain/:subdomain - Boutique par sous-domaine
- GET /api/boutiques/categorie/:categorie - Boutiques par categorie
- GET /api/boutiques/featured - Boutiques en vedette
- GET /api/boutiques/map - Donnees pour la carte
- GET /api/boutiques/search?q= - Recherche

### Produits
- GET /api/products - Liste des produits
- GET /api/products/:id - Produit par ID
- GET /api/products/boutique/:boutiqueId - Produits d'une boutique
- GET /api/products/vedettes - Produits en vedette

### Artisans
- GET /api/artisans - Liste des artisans
- GET /api/artisans/:id - Artisan par ID
- GET /api/artisans/map - Donnees carte artisans

---

## 6. CONFIGURATION DOCKER

### docker-compose.yml
```yaml
services:
  postgres:
    image: postgres:15-alpine
    ports: "5433:5432"
    environment:
      POSTGRES_DB: arlink_v2
      POSTGRES_USER: arlink
      POSTGRES_PASSWORD: arlink_secure_2026

  redis:
    image: redis:7-alpine
    ports: "6380:6379"

  backend:
    build: ./backend
    ports: "3001:3000"
    depends_on: postgres, redis

  frontend:
    build: ./frontend
    ports: "8080:80"
```

### Ports utilises
- PostgreSQL: 5433 (externe) -> 5432 (interne)
- Redis: 6380 (externe) -> 6379 (interne)
- Backend: 3001 (externe) -> 3000 (interne)
- Frontend: 8080 (externe) -> 80 (interne)

---

## 7. DEPLOIEMENT

### Commandes de deploiement
```bash
# Se connecter au serveur
ssh root@217.154.2.83

# Aller dans le dossier du projet
cd /var/www/arlink-prod

# Reconstruire et redemarrer
docker compose build --no-cache
docker compose up -d

# Voir les logs
docker compose logs -f

# Verifier le statut
docker compose ps
```

### Variables d'environnement Backend (.env)
```
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=arlink
DATABASE_PASSWORD=arlink_secure_2026
DATABASE_NAME=arlink_v2
JWT_SECRET=arlink_jwt_secret_2026
REDIS_HOST=redis
REDIS_PORT=6379
```

### Variables d'environnement Frontend (.env)
```
VITE_API_URL=https://arlink.online/api
```

---

## 8. FONCTIONNALITES IMPLEMENTEES

### Page d'accueil (HomePage)
- Carrousel de 27 categories avec images
- Carte Leaflet interactive avec points des boutiques
- Boutiques en vedette
- Barre de recherche
- Sidebar de connexion/inscription
- Footer avec liens et reseaux sociaux

### Galerie (GaleriePage)
- Navigation par categorie avec fleches
- Filtrage des boutiques par categorie
- Header avec image de fond dynamique
- Grille de boutiques cliquables

### Boutique (BoutiquePage)
- Affichage des informations de la boutique
- Grille de produits
- Fiche produit detaillee
- Panier d'achat
- Systeme d'avis clients
- Boutons de contact (WhatsApp, telephone)

### Dashboards
- Dashboard artisan avec gestion des produits
- Dashboard client avec historique
- Statistiques de vues et visites

### Authentification
- Inscription avec choix du type (client/artisan)
- Connexion avec JWT
- Protection des routes

---

## 9. PALETTE DE COULEURS

```css
/* Couleurs principales */
--dark: #070707;           /* Fond principal */
--dark-card: #0b0b0b;      /* Fond des cartes */
--dark-input: #0f0f0f;     /* Fond des inputs */
--dark-border: #1f1f1f;    /* Bordures */

--gold: #BFA26A;           /* Or/Accent principal */
--beige: #d4c4a8;          /* Beige clair */
--text-primary: #EDE6D2;   /* Texte principal */
--text-secondary: #CFC6AE; /* Texte secondaire */
```

---

## 10. CATEGORIES (27)

1. Bijoux & Orfevrerie
2. Cuir & Maroquinerie
3. Bois & Sculpture
4. Metal & Ferronnerie
5. Textile, Soie & Broderie
6. Poterie & Ceramique
7. Verre & Cristal
8. Pierre & Mineraux
9. Vannerie & Tapisserie
10. Arts manuels
11. Cosmetique naturelle
12. Accessoires & Mode
13. Art sacre
14. Patisserie artisanale
15. Produits gourmets
16. Huiles & Terroir
17. Recycl'art
18. Arts culinaires
19. Artisanat russe
20. Artisanat chinois
21. Maghreb
22. Afrique Ouest
23. Afrique centrale
24. Afrique Est & Sud
25. Artisanat indien
26. Coffrets
27. Bouquets

---

## 11. PROBLEMES CONNUS / A CORRIGER

1. **Pages boutiques avec produits API:** Erreur `prix.toFixed is not a function` quand les produits viennent de l'API avec prix null/string. Fix applique dans le code source mais necessite rebuild Docker.

2. **Barre de recherche:** Non fonctionnelle sur la page d'accueil.

3. **Categories manquantes dans GaleriePage:** Seulement 20 categories sur 27 sont mappees.

4. **Footer:** Doit etre mis a jour avec les liens corrects sur toutes les pages.

---

## 12. PROCHAINES ETAPES

1. Corriger l'erreur prix.toFixed dans les boutiques
2. Implementer la recherche fonctionnelle
3. Ajouter les 7 categories manquantes dans GaleriePage
4. Migrer les vrais produits depuis MySQL
5. Implementer le systeme de paiement
6. Ajouter le systeme de credits/abonnements
7. Implementer l'avatar vendeur IA
8. Ajouter les encheres et expo 3D

---

## 13. ACCES SERVEURS

### Serveur Production (217)
- IP: 217.154.2.83
- User: root
- Chemin: /var/www/arlink-prod

### Serveur Source MySQL (232)
- IP: 212.132.71.232
- User: root
- DB: arlink232
- User DB: root

---

## 14. COMMANDES UTILES

```bash
# Voir les boutiques
docker exec arlink-postgres psql -U arlink -d arlink_v2 -c "SELECT societe, categorie FROM boutiques LIMIT 10;"

# Voir les produits
docker exec arlink-postgres psql -U arlink -d arlink_v2 -c "SELECT nom, prix FROM products LIMIT 10;"

# Redemarrer un service
docker compose restart frontend

# Voir les logs d'un service
docker compose logs -f backend

# Entrer dans un container
docker exec -it arlink-backend sh
```

---

## 15. CONTACT

Projet developpe par Devin AI pour ARCONSEIL
Session: https://app.devin.ai/sessions/719f713e263d463dada227ec287ff3bf

---

*Document genere le 18 Janvier 2026*
