# ARLink V2 - Documentation Technique

## Informations Serveur

**Serveur Production:** 217.154.2.83
- SSH: `ssh root@217.154.2.83` (mot de passe: YmzBz5n5)
- Chemin deploiement: `/var/www/arlink-prod`

**Base de donnees PostgreSQL:**
- Host: localhost (via Docker)
- Port: 5433
- Database: arlink_v2
- User: arlink
- Password: 7asbia@ALLAHO

**Containers Docker:**
- arlink-frontend (port 8080)
- arlink-backend (port 3001)
- arlink-postgres (port 5433)
- arlink-redis (port 6380)

---

## URLs et Chemins des Pages

### Pages Publiques

| URL | Fichier Source | Description |
|-----|----------------|-------------|
| https://arlink.online/ | `/docker/frontend/src/pages/HomePage.tsx` | Page d'accueil avec carrousel et boutiques vedettes |
| https://arlink.online/galerie | `/docker/frontend/src/pages/GaleriePage.tsx` | Galerie des boutiques par categorie |
| https://arlink.online/galerie/:categorie | `/docker/frontend/src/pages/GaleriePage.tsx` | Galerie filtree par categorie |
| https://arlink.online/boutique/:id | `/docker/frontend/src/pages/BoutiquePage.tsx` | Page boutique individuelle |
| https://arlink.online/panier | `/docker/frontend/src/pages/CartPage.tsx` | Panier d'achat |
| https://arlink.online/register | `/docker/frontend/src/pages/RegisterPage.tsx` | Page d'inscription |

### Sous-domaines Boutiques

| URL | Description |
|-----|-------------|
| https://{subdomain}.arlink.online | Page boutique via sous-domaine (ex: irya.arlink.online) |

### Dashboards

| URL | Fichier Source | Acces | Description |
|-----|----------------|-------|-------------|
| https://arlink.online/dashboard | `/docker/frontend/src/pages/DashboardPage.tsx` | Tous | Redirection selon role |
| https://arlink.online/dashboard/artisan | `/docker/frontend/src/pages/DashboardArtisanPage.tsx` | Artisans | Gestion boutique, produits, commandes |
| https://arlink.online/dashboard/client | `/docker/frontend/src/pages/DashboardClientPage.tsx` | Clients | Historique commandes, favoris |
| https://arlink.online/admin | `/docker/frontend/src/pages/AdminDashboardPage.tsx` | Admin | CRM artisans, vedettes, boutiques |
| https://arlink.online/super-admin | `/docker/frontend/src/pages/SuperAdminDashboardPage.tsx` | Super Admin | Gestion admins, plans, commissions |

---

## Acces Admin

**Email:** arlink.online@gmail.com
**Mot de passe:** 7asbia@ALLAHO
**Type:** admin

Cet utilisateur a acces aux dashboards Admin et Super Admin.

---

## Structure des Fichiers Frontend

```
/docker/frontend/src/
├── App.tsx                    # Routes principales
├── index.css                  # Styles globaux
├── main.tsx                   # Point d'entree
├── pages/
│   ├── HomePage.tsx           # Page d'accueil
│   ├── GaleriePage.tsx        # Galerie boutiques
│   ├── BoutiquePage.tsx       # Page boutique
│   ├── CartPage.tsx           # Panier
│   ├── RegisterPage.tsx       # Inscription
│   ├── LoginPage.tsx          # Connexion (redirige vers /)
│   ├── DashboardPage.tsx      # Dashboard redirection
│   ├── DashboardArtisanPage.tsx  # Dashboard artisan
│   ├── DashboardClientPage.tsx   # Dashboard client
│   ├── AdminDashboardPage.tsx    # Dashboard admin
│   └── SuperAdminDashboardPage.tsx # Dashboard super admin
├── services/
│   └── api.ts                 # Services API
├── stores/
│   └── authStore.ts           # Gestion authentification
└── components/                # Composants reutilisables
```

---

## Structure Backend

```
/docker/backend/src/
├── main.ts                    # Point d'entree NestJS
├── app.module.ts              # Module principal
├── modules/
│   ├── auth/                  # Authentification (JWT, Google OAuth)
│   ├── users/                 # Gestion utilisateurs
│   ├── boutiques/             # Gestion boutiques
│   ├── products/              # Gestion produits
│   ├── orders/                # Gestion commandes
│   └── artisans/              # Gestion artisans
└── config/                    # Configuration
```

---

## API Endpoints

### Authentification
- POST `/api/auth/login` - Connexion email/password
- POST `/api/auth/register` - Inscription
- GET `/api/auth/google` - Connexion Google OAuth
- GET `/api/auth/google/callback` - Callback Google OAuth

### Boutiques
- GET `/api/boutiques` - Liste toutes les boutiques
- GET `/api/boutiques/:id` - Details boutique
- POST `/api/boutiques` - Creer boutique
- PUT `/api/boutiques/:id` - Modifier boutique

### Produits
- GET `/api/products` - Liste tous les produits
- GET `/api/products/:id` - Details produit
- POST `/api/products` - Creer produit
- PUT `/api/products/:id` - Modifier produit
- DELETE `/api/products/:id` - Supprimer produit

### Commandes
- GET `/api/orders` - Liste commandes
- POST `/api/orders` - Creer commande
- PUT `/api/orders/:id/status` - Modifier statut

---

## Commandes de Deploiement

### Build Frontend
```bash
cd /home/ubuntu/arlink-project/docker/frontend
npm run build
```

### Deployer Frontend
```bash
# Copier dist vers serveur
scp -r dist.tar.gz root@217.154.2.83:/tmp/

# Sur le serveur
docker cp /tmp/dist/. arlink-frontend:/usr/share/nginx/html/
```

### Redemarrer Services
```bash
# Sur le serveur 217.154.2.83
docker restart arlink-frontend
docker restart arlink-backend
```

---

## Base de Donnees

### Connexion
```bash
docker exec -it arlink-postgres psql -U arlink -d arlink_v2
```

### Tables Principales
- `users` - Utilisateurs (artisans, clients, admins)
- `boutiques` - Boutiques artisans
- `products` - Produits/articles
- `orders` - Commandes
- `order_items` - Lignes de commande

---

## Categories Disponibles

1. Bijoux
2. Cuir
3. Bois
4. Metal
5. Textile
6. Poterie
7. Verre
8. Pierre
9. Vannerie
10. Arts-manuels
11. Cosmetique
12. Mode
13. Art-sacre
14. Patisserie
15. Gastronomie
16. Huiles
17. Coffrets
18. Maghreb
19. Afrique-Ouest
20. Afrique-centrale

---

## Couleurs Theme

- Fond principal: #070707
- Fond cartes: #0b0b0b
- Fond inputs: #0f0f12
- Texte principal: #EDE6D2
- Texte secondaire: #CFC6AE
- Accent or: #BFA26A
- Bleu admin: #3B82F6

---

## Notes Importantes

1. **Mot de passe interne:** 7asbia@ALLAHO (pour DB et admin)
2. **Les modifications CRM sont en memoire** - pas de persistance backend actuellement
3. **Les 56 boutiques n'ont pas de photos** - impossible de les mettre en vedette
4. **Google OAuth configure** avec credentials dans variables d'environnement

---

*Document genere le 20 Janvier 2026*
*ARLink V2 - Plateforme E-commerce Artisans*
