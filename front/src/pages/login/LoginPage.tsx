import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE_URL, API_ENDPOINTS, APP_CONFIG } from "../../config/constants";
import { setAuthToken, setCurrentUser, getAuthHeader } from "../../utils/auth";
import { useAuth } from "../../hooks/useAuth";
import type { User } from "../../types";
import { UserRole } from "../../enums";
import { Palette, ShoppingBag, Gem, Sun } from 'lucide-react';
import { API_BASE_URL as CONTENT_API_URL } from "../../config/constants";
import "./LoginPage.css";

interface LoginResponse {
  token: string;
  user: User;
}

type UserType = "artisan" | "client";

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  // View state
  const [isFlipped, setIsFlipped] = useState(false);

  // Login form
  const [loginIdentifier, setLoginIdentifier] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Magic link
  const [magicEmail, setMagicEmail] = useState("");

  // Registration form
  const [userType, setUserType] = useState<UserType>("client");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organization, setOrganization] = useState("");
  const [phone, setPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [username, setUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Ad cards state
  const [adCards, setAdCards] = useState<Array<{icon: string; title: string; description: string; badge: string; link: string}>>([
    { icon: "palette", title: "Artisans du Monde", description: "Connectez-vous avec des artisans talentueux des 4 coins du globe. Découvrez des créations authentiques et uniques.", badge: "20M+ ARTISANS", link: "#" },
    { icon: "shopping-bag", title: "Boutiques Personnalisées", description: "Chaque artisan dispose de sa propre boutique en ligne avec son sous-domaine unique.", badge: "GRATUIT CLASSIC", link: "#" },
    { icon: "gem", title: "Produits Premium", description: "De la céramique à la joaillerie, du textile au bois sculpté. Trouvez le produit artisanal parfait.", badge: "1000+ PRODUITS PRO", link: "#" },
    { icon: "sun", title: "Rejoignez-nous", description: "Lancez votre boutique en quelques clics. Vendez vos créations au monde entier.", badge: "INSCRIPTION SIMPLE", link: "#" },
  ]);

  // Shared state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Fetch current user after login
  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.ME}`, {
        headers: getAuthHeader(),
      });
      if (response.ok) {
        const userData: User = await response.json();
        setCurrentUser(userData);
        return userData;
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
    return null;
  }, []);

  // Handle Google OAuth callback token
  useEffect(() => {
    const googleToken = searchParams.get("google_token");
    if (googleToken) {
      setAuthToken(googleToken);
      fetchCurrentUser().then((userData) => {
        if (userData) {
          login(googleToken, userData);
          const role = (userData as any)?.userRole || (userData as any)?.user_role;
          if (role?.includes("artisan")) {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        }
      });
    }
  }, [searchParams, fetchCurrentUser, login, navigate]);

  // Load dynamic ad cards from admin
  useEffect(() => {
    fetch(`${CONTENT_API_URL}/platform-content/ad-cards`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setAdCards(data.map((item: any) => ({
            icon: item.icon || "palette",
            title: item.title,
            description: item.description || "",
            badge: item.badgeText || "",
            link: item.link || "#",
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Auto-dismiss message after 5 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), APP_CONFIG.MESSAGE_AUTO_DISMISS_DURATION);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.LOGIN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: loginIdentifier, password: loginPassword }),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        setAuthToken(data.token);
        login(data.token, data.user);
        setMessage({ type: "success", text: "Connexion réussie !" });
        const role = (data.user as any)?.userRole || (data.user as any)?.user_role;
        setTimeout(() => {
          if (role?.includes("artisan")) {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Erreur d'authentification",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.MAGIC_LINK}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: magicEmail }),
      });

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Lien magique envoyé ! Vérifiez votre email (et vos spams).",
        });
        setMagicEmail("");
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Erreur lors de l'envoi",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Frontend validations
    if (regEmail !== confirmEmail) {
      setMessage({ type: "error", text: "Les emails ne correspondent pas" });
      setLoading(false);
      return;
    }
    if (regPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      setLoading(false);
      return;
    }
    if (regPassword.length < APP_CONFIG.PASSWORD_MIN_LENGTH) {
      setMessage({
        type: "error",
        text: `Le mot de passe doit contenir au moins ${APP_CONFIG.PASSWORD_MIN_LENGTH} caractères`,
      });
      setLoading(false);
      return;
    }

    try {
      const body: Record<string, string> = {
        userRole: userType === "artisan" ? UserRole.ARTISAN : UserRole.CLIENT,
        email: regEmail,
        password: regPassword,
        username,
        firstName,
        lastName,
      };
      if (phone) body.phoneNumber = phone;
      if (userType === "artisan" && organization) body.organization = organization;

      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.AUTH.REGISTER}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data: LoginResponse = await response.json();
        setAuthToken(data.token);
        const userData = await fetchCurrentUser();
        if (userData) {
          login(data.token, userData);
        }
        setMessage({ type: "success", text: "Inscription réussie !" });
        setTimeout(() => {
          if (userType === "artisan") {
            navigate("/dashboard");
          } else {
            navigate("/");
          }
        }, 1000);
      } else {
        const error = await response.json();
        setMessage({
          type: "error",
          text: error.message || "Erreur lors de l'inscription",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Erreur de connexion au serveur" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_BASE_URL}${API_ENDPOINTS.AUTH.GOOGLE}`;
  };

  return (
    <div className="login-page">
      <button
        className="btn-retour"
        onClick={() => (window.location.href = "/")}
      >
        Accueil
      </button>

      <div className="login-left">
        <div className={`login-box ${isFlipped ? "flipped" : ""}`}>
          <div className="login-box-inner">
            {/* ===== LOGIN FACE ===== */}
            <div className="login-front">
              <h1 className="login-title">ARLinK</h1>
              <p className="login-subtitle">L'ARTISANAT MONDIAL</p>

              <h2 className="login-heading">Connectez-vous</h2>

              {message && !isFlipped && (
                <div className={`login-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleLogin} className="login-form">
                <label>Email ou nom d'utilisateur</label>
                <input
                  type="text"
                  placeholder="votre@email.com ou votre pseudo"
                  value={loginIdentifier}
                  onChange={(e) => setLoginIdentifier(e.target.value)}
                  required
                />

                <label>Mot de passe</label>
                <input
                  type="password"
                  placeholder="Votre mot de passe"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />

                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? "Connexion..." : "SE CONNECTER"}
                </button>
              </form>

              <button className="link-btn forgot-password">
                Mot de passe oublié ?
              </button>

              <div className="magic-link-section">
                <p className="magic-link-label">Connexion par lien magique</p>
                <form onSubmit={handleMagicLink} className="magic-link-form">
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    required
                  />
                  <button type="submit" disabled={loading} className="magic-btn">
                    {loading ? "Envoi..." : "ENVOYER LE LIEN"}
                  </button>
                </form>
              </div>

              <div className="separator">
                <span>OU</span>
              </div>

              <div className="social-buttons">
                <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width="20"
                  />
                  Continuer avec Google
                </button>
                <button className="social-btn apple-btn" onClick={() => setMessage({ type: "error", text: "Apple Sign-In sera disponible prochainement" })}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continuer avec Apple
                </button>
                <button className="social-btn facebook-btn" onClick={() => setMessage({ type: "error", text: "Facebook Login sera disponible prochainement" })}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Continuer avec Facebook
                </button>
              </div>

              <div className="switch-view">
                <span>Vous n'avez pas de compte ?</span>
                <button
                  className="link-btn"
                  onClick={() => {
                    setIsFlipped(true);
                    setMessage(null);
                  }}
                >
                  Inscrivez-vous
                </button>
              </div>
            </div>

            {/* ===== REGISTER FACE ===== */}
            <div className="login-back">
              <h1 className="login-title">ARLinK</h1>
              <p className="login-subtitle">CRÉER VOTRE COMPTE</p>

              {message && isFlipped && (
                <div className={`login-message ${message.type}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleRegister} className="login-form register-form">
                <div className="user-type-toggle">
                  <button
                    type="button"
                    className={userType === "artisan" ? "active" : ""}
                    onClick={() => setUserType("artisan")}
                  >
                    Artisan
                  </button>
                  <button
                    type="button"
                    className={userType === "client" ? "active" : ""}
                    onClick={() => setUserType("client")}
                  >
                    Client
                  </button>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input
                      type="text"
                      placeholder="Prénom"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input
                      type="text"
                      placeholder="Nom"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {userType === "artisan" && (
                  <>
                    <label>Nom de société</label>
                    <input
                      type="text"
                      placeholder="Nom de votre société"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                    />
                    {organization && (
                      <div className="subdomain-preview">
                        <small>Votre boutique : <strong>{organization.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}.arlink.online</strong></small>
                      </div>
                    )}
                  </>
                )}

                <label>Téléphone</label>
                <input
                  type="tel"
                  placeholder="+33 6 12 34 56 78"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />

                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="votre@email.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmer email</label>
                    <input
                      type="email"
                      placeholder="Confirmez votre email"
                      value={confirmEmail}
                      onChange={(e) => setConfirmEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <label>Nom d'utilisateur</label>
                <input
                  type="text"
                  placeholder="Choisissez un nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={50}
                />

                <div className="form-row">
                  <div className="form-group">
                    <label>Mot de passe</label>
                    <input
                      type="password"
                      placeholder="Min. 10 caractères"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      required
                      minLength={10}
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirmer</label>
                    <input
                      type="password"
                      placeholder="Confirmez"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={10}
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="primary-btn">
                  {loading ? "Inscription..." : "S'INSCRIRE"}
                </button>
              </form>

              <div className="separator">
                <span>OU</span>
              </div>

              <div className="social-buttons">
                <button className="social-btn google-btn" onClick={handleGoogleLogin}>
                  <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    width="20"
                  />
                  S'inscrire avec Google
                </button>
                <button className="social-btn apple-btn" onClick={() => setMessage({ type: "error", text: "Apple Sign-In sera disponible prochainement" })}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  S'inscrire avec Apple
                </button>
                <button className="social-btn facebook-btn" onClick={() => setMessage({ type: "error", text: "Facebook Login sera disponible prochainement" })}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  S'inscrire avec Facebook
                </button>
              </div>

              <div className="switch-view">
                <span>Vous avez déjà un compte ?</span>
                <button
                  className="link-btn"
                  onClick={() => {
                    setIsFlipped(false);
                    setMessage(null);
                  }}
                >
                  Connectez-vous
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <h1 className="hero-title">Découvrez l'Artisanat Mondial</h1>
        <p className="hero-subtitle">
          Des créations uniques, des artisans passionnés, une plateforme globale
        </p>

        <div className="cards-grid">
          {adCards.map((card, idx) => {
            const IconComponent = card.icon === 'shopping-bag' ? ShoppingBag : card.icon === 'gem' ? Gem : card.icon === 'sun' ? Sun : Palette;
            return (
              <div key={idx} className="info-card" onClick={() => card.link !== '#' && (window.location.href = card.link)} style={{ cursor: card.link !== '#' ? 'pointer' : 'default' }}>
                <div className="card-icon"><IconComponent size={32} /></div>
                <h3>{card.title}</h3>
                <p>{card.description}</p>
                <button>{card.badge}</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
