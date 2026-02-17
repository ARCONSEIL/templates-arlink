import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Palette, ShoppingBag, Gem, Sun, Star, Globe, Users, Zap } from 'lucide-react';
import { Header } from '../../components/Header/Header';
import { Footer } from '../../components/Footer/Footer';
import { API_BASE_URL } from '../../config/constants';
import './PromoPage.css';

interface PromoContent {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  link: string;
  badgeText: string;
  metadata: Record<string, any>;
}

const defaultPromos: Record<string, PromoContent> = {
  'artisans-du-monde': {
    id: '1',
    title: 'Artisans du Monde',
    description: 'Connectez-vous avec des artisans talentueux des 4 coins du globe. Decouvrez des creations authentiques et uniques.',
    icon: 'palette',
    image: 'https://images.unsplash.com/photo-1452860606245-08f33edfda79',
    link: '/stores',
    badgeText: '20M+ ARTISANS',
    metadata: {
      longDescription: "ARLinK rassemble plus de 20 millions d'artisans a travers le monde. Notre plateforme met en lumiere le savoir-faire unique de chaque createur, qu'il soit potier au Maroc, tisserand en Inde, ou bijoutier en France. Chaque artisan apporte une piece de son heritage culturel, creant ainsi un marche mondial de l'artisanat authentique.",
      features: [
        "Decouvrez des artisans de plus de 150 pays",
        "Chaque creation est unique et faite main",
        "Soutenez directement les artisans locaux",
        "Certifications d'authenticite pour chaque produit",
      ],
      stats: { artisans: '20M+', pays: '150+', creations: '50M+' },
    },
  },
  'boutiques-personnalisees': {
    id: '2',
    title: 'Boutiques Personnalisees',
    description: 'Chaque artisan dispose de sa propre boutique en ligne avec son sous-domaine unique.',
    icon: 'shopping-bag',
    image: 'https://images.unsplash.com/photo-1556740738-b6a63e27c4df',
    link: '/login',
    badgeText: 'GRATUIT CLASSIC',
    metadata: {
      longDescription: "Avec ARLinK, chaque artisan obtient sa propre boutique en ligne personnalisee avec un sous-domaine unique (votre-boutique.arlink.online). Configurez votre vitrine, personnalisez vos couleurs, ajoutez votre logo et commencez a vendre en quelques minutes. Notre plan Classic est entierement gratuit pour vous aider a demarrer.",
      features: [
        "Sous-domaine personnalise gratuit",
        "Design responsive adapte a tous les ecrans",
        "Gestion complete des produits et commandes",
        "Outils d'analyse et de suivi integres",
      ],
      stats: { boutiques: '500K+', templates: '50+', uptime: '99.9%' },
    },
  },
  'produits-premium': {
    id: '3',
    title: 'Produits Premium',
    description: 'De la ceramique a la joaillerie, du textile au bois sculpte. Trouvez le produit artisanal parfait.',
    icon: 'gem',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca',
    link: '/products',
    badgeText: '1000+ PRODUITS PRO',
    metadata: {
      longDescription: "Notre selection premium regroupe les plus belles creations artisanales du monde. Ceramique japonaise, joaillerie berbere, textile peruvien, bois sculpte balinais... Chaque produit est soigneusement selectionne pour sa qualite exceptionnelle et son authenticite. Nos artisans PRO beneficient d'une visibilite accrue et d'outils avances.",
      features: [
        "Plus de 1000 produits certifies Premium",
        "Garantie qualite et authenticite",
        "Livraison securisee dans le monde entier",
        "Service client dedie pour les achats Premium",
      ],
      stats: { produits: '1000+', categories: '200+', satisfaction: '98%' },
    },
  },
  'rejoignez-nous': {
    id: '4',
    title: 'Rejoignez-nous',
    description: 'Lancez votre boutique en quelques clics. Vendez vos creations au monde entier.',
    icon: 'sun',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
    link: '/login',
    badgeText: 'INSCRIPTION SIMPLE',
    metadata: {
      longDescription: "Rejoignez la communaute ARLinK et lancez votre boutique artisanale en ligne en moins de 5 minutes. Inscription gratuite, configuration simple, et vous commencez a vendre immediatement. Que vous soyez un artisan experimente ou un jeune createur, ARLinK vous offre tous les outils pour reussir dans le commerce en ligne.",
      features: [
        "Inscription gratuite en 2 minutes",
        "Aucune commission sur le plan Classic",
        "Support technique 24/7",
        "Communaute active de plus de 20M d'artisans",
      ],
      stats: { inscription: '2 min', commission: '0%', support: '24/7' },
    },
  },
};

const iconMap: Record<string, React.ComponentType<any>> = {
  'palette': Palette,
  'shopping-bag': ShoppingBag,
  'gem': Gem,
  'sun': Sun,
  'star': Star,
  'globe': Globe,
  'users': Users,
  'zap': Zap,
};

const PromoPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [content, setContent] = useState<PromoContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    fetch(`${API_BASE_URL}/platform-content/ad-cards`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const found = data.find((item: any) => {
            const itemSlug = item.title
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/^-|-$/g, '');
            return itemSlug === slug;
          });
          if (found) {
            setContent(found);
            setLoading(false);
            return;
          }
        }
        if (slug && defaultPromos[slug]) {
          setContent(defaultPromos[slug]);
        }
        setLoading(false);
      })
      .catch(() => {
        if (slug && defaultPromos[slug]) {
          setContent(defaultPromos[slug]);
        }
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="promo-page">
        <Header variant="default" />
        <div className="promo-loading">
          <div className="spinner"></div>
          <p>Chargement...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="promo-page">
        <Header variant="default" />
        <div className="promo-not-found">
          <h1>Page non trouvee</h1>
          <p>Le contenu que vous recherchez n'existe pas.</p>
          <Link to="/login" className="promo-cta-btn">Retour a l'inscription</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = iconMap[content.icon] || Palette;
  const meta = content.metadata || {};
  const features = meta.features || [];
  const stats = meta.stats || {};
  const longDesc = meta.longDescription || content.description;

  return (
    <div className="promo-page">
      <Header variant="default" />

      <div className="promo-hero" style={content.image ? { backgroundImage: `linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url(${content.image})` } : {}}>
        <Link to="/login" className="promo-back-btn">
          <ArrowLeft size={18} /> Retour
        </Link>
        <div className="promo-hero-content">
          <div className="promo-hero-icon">
            <IconComponent size={48} />
          </div>
          <h1>{content.title}</h1>
          <p className="promo-hero-desc">{content.description}</p>
          {content.badgeText && (
            <span className="promo-badge">{content.badgeText}</span>
          )}
        </div>
      </div>

      <div className="promo-body">
        <section className="promo-section">
          <h2>A propos</h2>
          <p className="promo-long-desc">{longDesc}</p>
        </section>

        {Object.keys(stats).length > 0 && (
          <section className="promo-stats-section">
            <h2>En chiffres</h2>
            <div className="promo-stats-grid">
              {Object.entries(stats).map(([key, value]) => (
                <div key={key} className="promo-stat-card">
                  <span className="promo-stat-value">{String(value)}</span>
                  <span className="promo-stat-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {features.length > 0 && (
          <section className="promo-features-section">
            <h2>Points forts</h2>
            <div className="promo-features-grid">
              {features.map((feature: string, idx: number) => (
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
          <Link to="/login" className="promo-cta-btn">S'inscrire maintenant</Link>
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default PromoPage;
