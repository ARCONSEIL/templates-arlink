import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Info, Mail, HelpCircle, Globe, Gavel, BookOpen, CreditCard, FolderOpen, PenTool, Star } from 'lucide-react';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import '../promo/PromoPage.css';

interface PageContent {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  badgeText: string;
  image: string;
  longDescription: string;
  features: string[];
  stats: Record<string, string>;
  ctaText?: string;
  ctaLink?: string;
}

const pages: Record<string, PageContent> = {
  '/a-propos': {
    title: 'A propos d\'ARLinK',
    description: 'La plateforme mondiale de l\'artisanat authentique, connectant artisans et passionnes du monde entier.',
    icon: Info,
    badgeText: 'DEPUIS 2024',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7',
    longDescription: "ARLinK est nee d'une vision simple : creer un pont entre les artisans du monde entier et les amateurs d'artisanat authentique. Notre plateforme permet a chaque artisan de creer sa propre boutique en ligne avec un sous-domaine unique, de presenter ses creations et de les vendre directement aux clients du monde entier. Nous croyons que chaque piece artisanale raconte une histoire, et notre mission est de faire voyager ces histoires a travers le monde.",
    features: [
      "Plateforme multi-tenant avec boutiques personnalisees",
      "Sous-domaine unique pour chaque artisan",
      "Paiements securises et livraison internationale",
      "Communaute de plus de 20 millions d'artisans",
      "Support multilingue et multi-devises",
      "Outils d'analyse et de marketing integres",
    ],
    stats: { artisans: '20M+', pays: '150+', boutiques: '500K+', creations: '50M+' },
    ctaText: 'Rejoignez-nous',
    ctaLink: '/login',
  },
  '/contact': {
    title: 'Contactez-nous',
    description: 'Notre equipe est a votre disposition pour repondre a toutes vos questions.',
    icon: Mail,
    badgeText: 'SUPPORT 24/7',
    image: 'https://images.unsplash.com/photo-1423666639041-f56000c27a9a',
    longDescription: "Que vous soyez un artisan souhaitant rejoindre notre plateforme, un client ayant une question sur une commande, ou un partenaire interesse par une collaboration, notre equipe est la pour vous aider. Nous nous engageons a repondre a chaque demande dans les 24 heures.",
    features: [
      "Email : contact@arlink.online",
      "Support en ligne via le chat integre",
      "Formulaire de contact disponible 24/7",
      "Equipe multilingue (FR, EN, AR, ES)",
      "Temps de reponse moyen : moins de 24h",
      "Centre d'aide avec articles detailles",
    ],
    stats: { reponse: '< 24h', langues: '4', satisfaction: '97%' },
    ctaText: 'Envoyer un message',
    ctaLink: '/login',
  },
  '/aide': {
    title: 'Aide & FAQ',
    description: 'Trouvez rapidement des reponses a vos questions les plus frequentes.',
    icon: HelpCircle,
    badgeText: 'CENTRE D\'AIDE',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3',
    longDescription: "Notre centre d'aide regroupe toutes les informations necessaires pour profiter pleinement de la plateforme ARLinK. Que vous soyez artisan ou client, vous trouverez ici des guides detailles, des tutoriels et des reponses aux questions les plus courantes.",
    features: [
      "Comment creer ma boutique en ligne ?",
      "Comment ajouter et gerer mes produits ?",
      "Comment suivre mes commandes ?",
      "Comment configurer mes moyens de paiement ?",
      "Comment personnaliser ma boutique ?",
      "Comment contacter le support technique ?",
    ],
    stats: { articles: '200+', tutoriels: '50+', videos: '30+' },
    ctaText: 'Contacter le support',
    ctaLink: '/contact',
  },
  '/expo3d': {
    title: 'EXPO 3D',
    description: 'Visitez les boutiques artisanales en realite virtuelle et decouvrez les creations comme si vous y etiez.',
    icon: Globe,
    badgeText: 'EXPERIENCE IMMERSIVE',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    longDescription: "EXPO 3D est notre innovation majeure : une exposition virtuelle en 3D qui vous permet de visiter les boutiques artisanales du monde entier depuis votre ecran. Parcourez les allees virtuelles, decouvrez les produits sous tous les angles, et vivez une experience d'achat immersive et unique. Compatible avec les casques VR, les tablettes et les ordinateurs.",
    features: [
      "Visite virtuelle des boutiques en 3D",
      "Compatible VR, tablette et desktop",
      "Visualisation des produits a 360 degres",
      "Expositions thematiques saisonnieres",
      "Interaction en direct avec les artisans",
      "Evenements virtuels exclusifs",
    ],
    stats: { boutiques: '1000+', visiteurs: '50K+/mois', expositions: '12/an' },
    ctaText: 'Decouvrir l\'EXPO 3D',
    ctaLink: '/stores',
  },
  '/encheres': {
    title: 'Encheres',
    description: 'Participez a des encheres exclusives sur des pieces artisanales uniques et rares.',
    icon: Gavel,
    badgeText: 'PIECES UNIQUES',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f',
    longDescription: "Notre systeme d'encheres permet aux collectionneurs et amateurs d'art d'acquerir des pieces artisanales exceptionnelles. Chaque semaine, de nouvelles encheres sont lancees avec des creations uniques selectionnees par nos experts. Bijoux rares, ceramiques d'exception, textiles anciens... Trouvez la piece rare qui manque a votre collection.",
    features: [
      "Encheres hebdomadaires sur des pieces uniques",
      "Authentification et certification des oeuvres",
      "Systeme d'encheres securise et transparent",
      "Alertes personnalisees par categorie",
      "Livraison assuree pour chaque piece",
      "Expertise et estimation gratuite",
    ],
    stats: { encheres: '100+/mois', pieces: '5000+', pays: '80+' },
    ctaText: 'Voir les encheres en cours',
    ctaLink: '/stores',
  },
  '/guide': {
    title: 'Guide de demarrage',
    description: 'Tout ce qu\'il faut savoir pour lancer votre boutique artisanale en ligne sur ARLinK.',
    icon: BookOpen,
    badgeText: 'DEMARRAGE RAPIDE',
    image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173',
    longDescription: "Notre guide de demarrage vous accompagne pas a pas dans la creation de votre boutique en ligne. De l'inscription a la premiere vente, chaque etape est detaillee avec des conseils pratiques et des astuces pour optimiser votre presence en ligne. En moins de 30 minutes, votre boutique sera prete a accueillir ses premiers clients.",
    features: [
      "Etape 1 : Inscription et configuration du profil",
      "Etape 2 : Personnalisation de votre boutique",
      "Etape 3 : Ajout de vos premiers produits",
      "Etape 4 : Configuration des moyens de paiement",
      "Etape 5 : Lancement et promotion de votre boutique",
      "Etape 6 : Gestion des commandes et du service client",
    ],
    stats: { etapes: '6', temps: '30 min', taux: '95%' },
    ctaText: 'Creer ma boutique',
    ctaLink: '/login',
  },
  '/tarifs': {
    title: 'Tarifs',
    description: 'Des formules adaptees a chaque artisan, du debutant au professionnel.',
    icon: CreditCard,
    badgeText: 'A PARTIR DE 0 EUR',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f',
    longDescription: "ARLinK propose des formules flexibles pour accompagner chaque artisan dans son developpement. Notre plan Classic est entierement gratuit et offre toutes les fonctionnalites essentielles pour demarrer. Pour les artisans souhaitant aller plus loin, nos plans Pro et Premium offrent des outils avances, une visibilite accrue et un support prioritaire.",
    features: [
      "Classic (Gratuit) : Boutique de base, 20 produits, sous-domaine",
      "Pro (29 EUR/mois) : Produits illimites, analytics, promotions",
      "Premium (79 EUR/mois) : Priorite EXPO 3D, featured, support VIP",
      "0% de commission sur le plan Classic",
      "Paiements securises via Stripe",
      "Pas d'engagement, resiliable a tout moment",
    ],
    stats: { gratuit: '0 EUR', pro: '29 EUR', premium: '79 EUR' },
    ctaText: 'Commencer gratuitement',
    ctaLink: '/login',
  },
  '/ressources': {
    title: 'Ressources',
    description: 'Outils, templates et conseils pour developper votre activite artisanale en ligne.',
    icon: FolderOpen,
    badgeText: 'BOITE A OUTILS',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d',
    longDescription: "Notre centre de ressources met a disposition des artisans tous les outils necessaires pour reussir en ligne. Templates de boutique, guides de photographie produit, conseils marketing, tutoriels video... Tout est la pour vous aider a presenter vos creations sous leur meilleur jour et developper votre clientele.",
    features: [
      "Templates de boutique personnalisables",
      "Guide photo produit pour l'artisanat",
      "Conseils marketing et reseaux sociaux",
      "Tutoriels video pas a pas",
      "Modeles de fiches produit optimisees",
      "Outils de calcul de prix et marges",
    ],
    stats: { templates: '50+', guides: '100+', videos: '30+' },
    ctaText: 'Explorer les ressources',
    ctaLink: '/stores',
  },
  '/blog': {
    title: 'Blog ARLinK',
    description: 'Actualites, tendances et histoires inspirantes du monde de l\'artisanat.',
    icon: PenTool,
    badgeText: 'ACTUALITES',
    image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    longDescription: "Le blog ARLinK est votre source d'inspiration quotidienne. Decouvrez les histoires fascinantes de nos artisans, les tendances de l'artisanat mondial, des conseils d'experts et les dernieres actualites de la plateforme. Chaque semaine, de nouveaux articles sont publies pour vous tenir informe et inspire.",
    features: [
      "Portraits d'artisans du monde entier",
      "Tendances et innovations artisanales",
      "Conseils pour artisans entrepreneurs",
      "Actualites de la plateforme ARLinK",
      "Guides saisonniers et idees cadeaux",
      "Interviews et reportages exclusifs",
    ],
    stats: { articles: '500+', lecteurs: '100K+/mois', auteurs: '25+' },
    ctaText: 'Lire les derniers articles',
    ctaLink: '/stores',
  },
};

const InfoPage = () => {
  const location = useLocation();
  const path = location.pathname;
  const content = pages[path];

  if (!content) {
    return (
      <div className="promo-page">
        <Header variant="default" />
        <div className="promo-not-found">
          <h1>Page non trouvee</h1>
          <p>Le contenu que vous recherchez n'existe pas.</p>
          <Link to="/" className="promo-cta-btn">Retour a l'accueil</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = content.icon;

  return (
    <div className="promo-page">
      <Header variant="default" />

      <div className="promo-hero" style={{ backgroundImage: `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url(${content.image})` }}>
        <Link to="/" className="promo-back-btn">
          <ArrowLeft size={18} /> Accueil
        </Link>
        <div className="promo-hero-content">
          <div className="promo-hero-icon">
            <IconComponent size={48} />
          </div>
          <h1>{content.title}</h1>
          <p className="promo-hero-desc">{content.description}</p>
          <span className="promo-badge">{content.badgeText}</span>
        </div>
      </div>

      <div className="promo-body">
        <section className="promo-section">
          <h2>A propos</h2>
          <p className="promo-long-desc">{content.longDescription}</p>
        </section>

        {Object.keys(content.stats).length > 0 && (
          <section className="promo-stats-section">
            <h2>En chiffres</h2>
            <div className="promo-stats-grid">
              {Object.entries(content.stats).map(([key, value]) => (
                <div key={key} className="promo-stat-card">
                  <span className="promo-stat-value">{value}</span>
                  <span className="promo-stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {content.features.length > 0 && (
          <section className="promo-features-section">
            <h2>{path === '/aide' ? 'Questions frequentes' : path === '/guide' ? 'Les etapes' : path === '/tarifs' ? 'Les formules' : 'Points forts'}</h2>
            <div className="promo-features-grid">
              {content.features.map((feature, idx) => (
                <div key={idx} className="promo-feature-card">
                  <Star size={20} />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="promo-cta-section">
          <h2>Pret a commencer ?</h2>
          <p>Rejoignez des millions d'artisans sur ARLinK</p>
          <Link to={content.ctaLink || '/login'} className="promo-cta-btn">{content.ctaText || 'S\'inscrire maintenant'}</Link>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default InfoPage;
