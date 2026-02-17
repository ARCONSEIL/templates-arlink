import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Star } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Header } from "../../components/Header/Header";
import { Footer } from "../../components/Footer/Footer";
import { LoadingFallback } from "../../components/Loading/LazyImage";
import { API_BASE_URL } from "../../config/constants";
import "./HomePage.css";

interface Shop {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  subdomain: string;
  latitude?: number;
  longitude?: number;
}

interface Slide {
  id?: string;
  image: string;
  title: string;
  name?: string;
  subdomain?: string;
  city?: string;
  country?: string;
  category?: string;
  tagline?: string;
  isFeatured?: boolean;
}

export default function HomePage() {
  const [searchParams] = useSearchParams();

  const [activeCategory, setActiveCategory] = useState("all");

  const [currentSlide, setCurrentSlide] = useState(0);
  const [shops, setShops] = useState<Shop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const [images, setImages] = useState<Slide[]>([]);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const categories = [
    { id: "bijoux", label: "💎 Bijoux & Orfèvrerie" },
    { id: "cuir", label: "👜 Cuir & Maroquinerie" },
    { id: "bois", label: "🪵 Bois & Sculpture" },
    { id: "metal", label: "⚒️ Métal & Ferronnerie" },
    { id: "textile", label: "🧵 Textile, Soie & Broderie" },
    { id: "ceramique", label: "🏺 Poterie & Céramique" },
    { id: "verre", label: "💠 Verre & Cristal" },
    { id: "pierre", label: "💎 Pierre & Minéraux" },
    { id: "vannerie", label: "🧺 Vannerie & Tapisserie" },
    { id: "arts", label: "🎨 Arts manuels" },
    { id: "cosmetique", label: "🌿 Cosmétique naturelle" },
    { id: "accessoires", label: "👗 Accessoires & Mode" },
    { id: "art-sacre", label: "🕉️ Art sacré" },
    { id: "patisserie", label: "🍰 Pâtisserie artisanale" },
    { id: "gourmets", label: "🌶️ Produits gourmets" },
    { id: "huiles", label: "🫒 Huiles & Terroir" },
    { id: "recyclart", label: "♻️ Recycl'art" },
    { id: "culinaire", label: "🍴 Arts culinaires" },
    { id: "russe", label: "🇷🇺 Artisanat russe" },
    { id: "chinois", label: "🇨🇳 Artisanat chinois" },
    { id: "maghreb", label: "🇲🇦 Maghreb" },
    { id: "afrique-ouest", label: "🌍 Afrique Ouest" },
    { id: "afrique-centrale", label: "🌍 Afrique centrale" },
    { id: "afrique-est-sud", label: "🌍 Afrique Est & Sud" },
    { id: "indien", label: "🇮🇳 Artisanat indien" },
    { id: "coffrets", label: "🎁 Coffrets" },
    { id: "bouquets", label: "💐 Bouquets" },
  ];

  const [collections, setCollections] = useState<Array<{title: string; icon: string; description: string; count: number; image: string; link: string}>>([
    {
      title: "Saint-Valentin",
      icon: "💝",
      description: "Cadeaux romantiques faits main",
      count: 127,
      image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7",
      link: "/seasonal/valentine",
    },
    {
      title: "Printemps",
      icon: "🌸",
      description: "Collections fleuries & colorées",
      count: 203,
      image: "https://images.unsplash.com/photo-1490750967868-88aa4486c946",
      link: "/seasonal/spring",
    },
    {
      title: "Ski & Montagne",
      icon: "⛷️",
      description: "Artisanat pour l'hiver",
      count: 156,
      image: "https://images.unsplash.com/photo-1551524164-687a55dd1126",
      link: "/seasonal/ski",
    },
  ]);

  const [bannerText, setBannerText] = useState("✨ L'Exposition Mondiale de l'Artisanat – Découvrez les boutiques vedettes ✨");

  // Load dynamic collections from admin
  useEffect(() => {
    fetch(`${API_BASE_URL}/platform-content/collections`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCollections(data.map((item: any) => ({
            title: item.title,
            icon: item.icon || "✨",
            description: item.description || "",
            count: item.metadata?.count || 0,
            image: item.image || "",
            link: item.link || "#",
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Load dynamic banner from admin
  useEffect(() => {
    fetch(`${API_BASE_URL}/platform-content/banners`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBannerText(data[0].title);
        }
      })
      .catch(() => {});
  }, []);

  // Load shops
  useEffect(() => {
    fetch(`${API_BASE_URL}/shops`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setShops(data);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error loading shops:", err);
        setIsLoading(false);
      });
  }, []);

  // Load category from URL
  useEffect(() => {
    const cat = searchParams.get("cat");
    if (cat) {
      setActiveCategory(cat);
    }
  }, [searchParams]);

  // Load featured shops for carousel
  useEffect(() => {
    fetch(`${API_BASE_URL}/featured-shops`)
      .then((r) => r.json())
      .then((data) => {
        const imgs = Array.isArray(data) ? data.slice(0, 12) : [];
        setImages(
          imgs.length > 0
            ? imgs
            : [
                {
                  image:
                    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
                  title: "Artisanat",
                },
              ],
        );
      })
      .catch(() => {
        setImages([
          {
            image:
              "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
            title: "Artisanat",
          },
        ]);
      });
  }, []);

  // Carousel auto-advance
  useEffect(() => {
    if (images.length === 0) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current || isLoading) return;

    try {
      const map = L.map(mapContainerRef.current, {
        center: [20, 10],
        zoom: 2,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        {
          attribution: "© OpenStreetMap",
          maxZoom: 19,
        },
      ).addTo(map);

      mapRef.current = map;
    } catch (error) {
      console.error("Error initializing map:", error);
    }

    return () => {
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          // Map already removed
        }
        mapRef.current = null;
      }
    };
  }, [isLoading]);

  // Add markers to map
  useEffect(() => {
    const addMarkers = () => {
      if (!mapRef.current || shops.length === 0 || isLoading) return;

      try {
        markersRef.current.forEach((marker) => {
          try {
            marker.remove();
          } catch (e) {
            // Marker already removed
          }
        });
        markersRef.current = [];

        const goldIcon = L.divIcon({
          className: "custom-marker",
          html: '<div style="width:10px;height:10px;background:#C9A961;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.5);"></div>',
          iconSize: [14, 14],
          iconAnchor: [7, 7],
        });

        const countryCoords: { [key: string]: [number, number] } = {
          France: [46.6, 2.3],
          Canada: [56.1, -106.3],
          Maroc: [31.8, -7.1],
          Cameroun: [7.4, 12.4],
          Rwanda: [-1.9, 29.9],
          Espagne: [40.4, -3.7],
          Mauritanie: [21.0, -10.9],
          Sénégal: [14.5, -14.5],
          Mali: [17.6, -4.0],
          "Cote d Ivoire": [7.5, -5.5],
          "Burkina Faso": [12.4, -1.6],
        };

        shops.forEach((b) => {
          let lat, lng;

          if (b.latitude && b.longitude) {
            lat = b.latitude;
            lng = b.longitude;
          } else {
            const baseCoords = countryCoords[b.country];
            if (baseCoords) {
              lat = baseCoords[0] + (Math.random() - 0.5) * 3;
              lng = baseCoords[1] + (Math.random() - 0.5) * 3;
            } else {
              return;
            }
          }

          if (!mapRef.current) return;

          const marker = L.marker([lat, lng], { icon: goldIcon }).addTo(
            mapRef.current,
          );

          const name = b.name;
          const subdomain = b.subdomain;

          marker.bindPopup(`
            <div style="text-align:center;min-width:150px;font-family:Arial,sans-serif;padding:8px;">
              <b style="color:#C9A961;font-size:15px;display:block;margin-bottom:6px;">${name}</b>
              <span style="font-size:12px;color:#666;display:block;margin-bottom:4px;">📍 ${b.city}, ${b.country}</span>
              ${b.category ? `<span style="font-size:11px;color:#999;display:block;margin-bottom:8px;">${b.category}</span>` : ""}
              <a href="https://${subdomain}.arlink.online" style="display:inline-block;margin-top:6px;padding:6px 16px;background:#C9A961;color:#000;text-decoration:none;border-radius:6px;font-size:12px;font-weight:bold;">Visiter</a>
            </div>
          `);

          markersRef.current.push(marker);
        });
      } catch (error) {
        console.error("Error adding markers:", error);
      }
    };

    const timeout = setTimeout(addMarkers, 300);
    return () => clearTimeout(timeout);
  }, [shops, isLoading]);

  // Scroll categories
  const scrollCategories = (direction: "left" | "right") => {
    if (!categoriesRef.current) return;
    const scrollAmount = 300;
    categoriesRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const handleCategoryClick = (catId: string) => {
    setActiveCategory(catId);
    window.location.href = `/category/${catId}`;
  };

  // Touch swipe carousel
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  if (isLoading) {
    return <LoadingFallback />;
  }

  return (
    <div className="homepage">
      {/* HEADER */}
      <Header variant="default" />

      {/* CATEGORIES */}
      <div className="categories-wrapper">
        <button
          className="cat-scroll-btn left"
          onClick={() => scrollCategories("left")}
        >
          ◀
        </button>
        <div className="categories-horizontal" ref={categoriesRef}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-link ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => handleCategoryClick(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>
        <button
          className="cat-scroll-btn right"
          onClick={() => scrollCategories("right")}
        >
          ▶
        </button>
      </div>

      {/* BANNER */}
      <div className="news-banner">
        <div className="news-content">
          {bannerText}
        </div>
      </div>

      {/* COLLECTIONS */}
      <section className="collections-section">
        <div className="collections-grid">
          {collections.map((col, idx) => (
            <div
              key={idx}
              className="collection-card"
              onClick={() => (window.location.href = col.link)}
            >
              <div
                className="collection-image"
                style={{ backgroundImage: `url(${col.image})` }}
              >
                <div className="collection-overlay"></div>
              </div>
              <div className="collection-content">
                <div className="collection-icon">{col.icon}</div>
                <h3 className="collection-title">{col.title}</h3>
                <p className="collection-description">{col.description}</p>
                <span className="collection-count">{col.count} créations</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOWCASE */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* CAROUSEL */}
        <div
          className="col-span-1 lg:col-span-3 order-1"
          role="region"
          aria-label="Image carousel"
          aria-roledescription="carousel"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="relative h-150 rounded-lg overflow-hidden group">
            {images.map((slide, idx) => {
              const handleVisitShop = () => {
                if (slide.subdomain) {
                  window.location.href = `https://${slide.subdomain}.arlink.online`;
                }
              };

              return (
                <>
                  <div
                    key={slide.id || `slide-${idx}`}
                    className={`absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent carousel-slide ${idx === currentSlide ? "active" : ""}`}
                    style={{ backgroundImage: `url(${slide.image})` }}
                    aria-hidden={idx !== currentSlide}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`Image ${idx + 1} de ${images.length}`}
                  >
                  </div>
                    <div className="absolute top-0 left-0 right-0 carousel-title pointer-events-none">
                      <div className="flex items-center gap-2 mb-3">
                        {slide.isFeatured && (
                          <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 bg-arlink-gold text-black">
                            <Star size={12} /> Featured
                          </span>
                        )}
                        <span className="inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 bg-white/20 text-white">
                          {slide.category || "Shop Category"}
                        </span>
                      </div>
                      <h2 className="text-3xl font-bold mb-2 text-white">
                        {slide.name || slide.title || "Shop Name"} - {slide.city || "City"}, {slide.country || "Country"}
                      </h2>
                      <p className="text-lg text-gray-300 mb-4 max-w-2xl">
                        {slide.tagline || "Découvrez nos créations artisanales uniques"}
                      </p>
                      <button 
                        onClick={handleVisitShop}
                        className="carousel-visit pointer-events-auto"
                      >
                        Visitez La Boutique
                      </button>
                    </div>
                </>
              );
            })}

            <button
              className="carousel-btn prev"
              onClick={() =>
                setCurrentSlide(
                  (prev) => (prev - 1 + images.length) % images.length,
                )
              }
              aria-label="Image précédente"
            >
              ❮
            </button>

            <button
              className="carousel-btn next"
              onClick={() =>
                setCurrentSlide((prev) => (prev + 1) % images.length)
              }
              aria-label="Image suivante"
            >
              ❯
            </button>
          </div>

          <div className="carousel-indicators">
            {images.map((slide, idx) => (
              <button
                key={slide.id || `indicator-${idx}`}
                className={`indicator ${idx === currentSlide ? "active" : ""}`}
                onClick={() => setCurrentSlide(idx)}
                aria-label={`Aller à l'image ${idx + 1}`}
                aria-current={idx === currentSlide}
              />
            ))}
          </div>
        </div>

        {/* MAP */}
        <div ref={ mapContainerRef } className="col-span-1 lg:col-span-2 order-2">
          <div className="h-100 lg:h-150 rounded-lg overflow-hidden border border-[#3a3a3a]"></div>
        </div>
      </section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
