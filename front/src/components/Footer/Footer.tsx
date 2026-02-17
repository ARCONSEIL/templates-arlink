import { Link } from 'react-router-dom';
import { LanguageSelector } from '../LanguageSelector';
import { SiFacebook, SiInstagram, SiX, SiTiktok, SiApple, SiGoogleplay } from '@icons-pack/react-simple-icons';
import './Footer.css'

export interface FooterProps {
  showNewsletter?: boolean;
  showSocialLinks?: boolean;
  className?: string;
}

export function Footer({
  showSocialLinks = true,
  className = '',
}: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Facebook', href: 'https://facebook.com', icon: <SiFacebook size={18} /> },
    { name: 'Instagram', href: 'https://instagram.com', icon: <SiInstagram size={18} /> },
    { name: 'X', href: 'https://x.com', icon: <SiX size={18} /> },
    { name: 'TikTok', href: 'https://tiktok.com', icon: <SiTiktok size={18} /> },
  ];

  return (
    <footer className={`footer ${className}`} role="contentinfo" aria-label="Footer">
      <div className="footer-content">
        {/* LOGO & DESCRIPTION */}
        <div className="footer-logo">
          <Link to="/" className="organization-logo" aria-label="ARLinK - Accueil">
            <div className="logo-icon">
              <img src="/logo-trans.png" alt="ARLinK" width="50" height="50" />
            </div>
            <div className="organization-name">
              <span className="logo-name">ARLinK</span>
              <div className="logo-tagline">
                <span>L'ARTISANAT MONDIAL</span>
              </div>
            </div>
          </Link>
          <p>La plateforme mondiale de l'artisanat authentique</p>
          
          {/* LANGUAGE SELECTOR */}
          <div className="footer-language" role="group" aria-label="Sélection de la langue">
            <LanguageSelector />
          </div>
        </div>

        {/* NAVIGATION */}
        <div className="footer-section">
          <h4>Navigation</h4>
          <nav aria-label="Navigation principale">
            <ul role="list">
              <li><Link to="/a-propos">À propos</Link></li>
              <li><Link to="/contact">Contact</Link></li>
              <li><Link to="/aide">Aide & FAQ</Link></li>
              <li><Link to="/terms">Conditions d'utilisation</Link></li>
              <li><Link to="/privacy">Confidentialité</Link></li>
              <li><Link to="/expo3d">EXPO 3D</Link></li>
              <li><Link to="/encheres">Enchères</Link></li>
            </ul>
          </nav>
        </div>

        {/* FOR ARTISANS */}
        <div className="footer-section">
          <h4>Pour les artisans</h4>
          <nav aria-label="Pour les artisans">
            <ul role="list">
              <li><Link to="/login">Créer ma boutique</Link></li>
              <li><Link to="/guide">Guide de démarrage</Link></li>
              <li><Link to="/tarifs">Tarifs</Link></li>
              <li><Link to="/ressources">Ressources</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/expo3d">EXPO 3D</Link></li>
              <li><Link to="/encheres">Enchères</Link></li>
            </ul>
          </nav>
        </div>

        {/* SOCIAL LINKS */}
        {showSocialLinks && (
          <div className="footer-section">
            <h4>Suivez-nous</h4>
            <div 
              className="footer-socials" 
              role="list" 
              aria-label="Liens vers les réseaux sociaux"
            >
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${social.name} (ouvre dans un nouvel onglet)`}
                  className="social-link"
                  role="listitem"
                >
                  <span aria-hidden="true" style={{ display: 'inline-flex' }}>{social.icon}</span>
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
            
            {/* APP LINKS */}
            <div className="app-links">
              <h5>Télécharger l'app</h5>
              <div className="app-buttons" role="list" aria-label="Liens de téléchargement de l'application">
                <a
                  href="#"
                  className="app-button"
                  role="listitem"
                  aria-label="Télécharger sur l'App Store"
                >
                  <SiApple size={16} /> App Store
                </a>
                <a
                  href="#"
                  className="app-button"
                  role="listitem"
                  aria-label="Disponible sur Google Play"
                >
                  <SiGoogleplay size={16} /> Google Play
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div className="footer-bottom" role="contentinfo" aria-label="Bas de page">
        <p>© {currentYear} <strong>ARLinK</strong> – Tous droits réservés</p>
      </div>
    </footer>
  );
}

export default Footer;
