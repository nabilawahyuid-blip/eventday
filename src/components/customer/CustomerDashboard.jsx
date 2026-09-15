import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getEvents, getFeaturedEvents } from "../../services/eventService";
import "./CustomerDashboard.css";

const CATEGORY_PARAMS = {
  Semua: "",
  Musik: "MUSIC_FESTIVAL",
  Konferensi: "CONFERENCE",
  Pameran: "EXHIBITION",
  Kuliner: "CULINARY",
};

const FALLBACK_HERO = [
  {
    id: 1,
    title: "Konser Musik Akbar 2024",
    location: "Stadion Utama GBK, Senayan, Jakarta",
    image:
      "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 2,
    title: "Festival Musik Terbesar 2024",
    location: "Jakarta International Stadium",
    image:
      "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: 3,
    title: "Music Festival Indonesia",
    location: "Gelora Bung Karno, Jakarta",
    image:
      "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=80",
  },
];

const FALLBACK_EVENTS = [
  {
    id: 1,
    category: "MUSIC FESTIVAL",
    title: "Soundwave Festival 2024",
    date: "15 Aug 2024",
    time: "19:00",
    location: "Stadion Utama Gelora Bung Karno",
    price: "Rp 250.000",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 2,
    category: "CONFERENCE",
    title: "Tech Summit Indonesia",
    date: "22 Sep 2024",
    time: "09:00",
    location: "Jakarta Convention Center",
    price: "Rp 150.000",
    image:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 3,
    category: "EXHIBITION",
    title: "Art & Creative Expo",
    date: "05 Oct 2024",
    time: "10:00",
    location: "JIExpo Kemayoran",
    price: "Rp 75.000",
    image:
      "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 4,
    category: "CULINARY",
    title: "Taste of Nusantara",
    date: "12 Oct 2024",
    time: "11:00",
    location: "Senayan Park, Jakarta",
    price: "Rp 50.000",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 5,
    category: "MUSIC FESTIVAL",
    title: "Jakarta Music Night",
    date: "19 Oct 2024",
    time: "18:30",
    location: "Istora Senayan",
    price: "Rp 300.000",
    image:
      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=85",
  },
  {
    id: 6,
    category: "CONFERENCE",
    title: "Digital Future Conference",
    date: "26 Oct 2024",
    time: "09:30",
    location: "ICE BSD City",
    price: "Rp 200.000",
    image:
      "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=80",
  },
];

const formatPrice = (price) => {
  const value = Number(price);
  if (!value) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
};

function DashboardCustomer() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [search, setSearch] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);

  const [heroSlides, setHeroSlides] = useState(FALLBACK_HERO);
  const [events, setEvents] = useState(FALLBACK_EVENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearch(urlSearch);
    setDebouncedSearch(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const loadHero = useCallback(async () => {
    try {
      const res = await getFeaturedEvents();
      console.log("HERO RESPONSE:", JSON.stringify(res, null, 2));
      const list = res?.data?.content || res?.data || [];

      if (Array.isArray(list) && list.length) {
        setHeroSlides(
          list.map((ev) => ({
            id: ev.id,
            title: ev.title,
            location: ev.location || ev.dateDisplay || "",
            image: ev.image || FALLBACK_HERO[0].image,
          })),
        );
      }
    } catch (err) {
      console.error("Gagal memuat hero:", err);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setLoading(true);

    try {
      const params = {};

      if (CATEGORY_PARAMS[activeCategory]) {
        params.category = CATEGORY_PARAMS[activeCategory];
      }

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      const res = await getEvents(params);
      console.log("EVENTS RESPONSE:", JSON.stringify(res, null, 2));
      const list = res?.data?.content || res?.data || [];

      setEvents(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Gagal memuat event:", err);
      setEvents(FALLBACK_EVENTS);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, debouncedSearch]);

  useEffect(() => {
    loadHero();
  }, [loadHero]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const categories = ["Semua", "Musik", "Konferensi", "Pameran", "Kuliner"];

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === heroSlides.length - 1 ? 0 : prev + 1));
  };

  const previousSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const handleGoToDetail = (eventId) => {
    if (eventId) {
      navigate(`/customer/event/${eventId}`);
    }
  };

  const handleBuyTicket = (e, event) => {
    e.stopPropagation();
    handleGoToDetail(event.id);
  };

  const currentHero = heroSlides[currentSlide];

  return (
    <div className="customer-dashboard">
      <NavbarCustomer />

      <main className="customer-content">
        <div className="mobile-location">
          <button className="location-button">
            <svg viewBox="0 0 24 24">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>

            <span>Lokasi</span>
          </button>
        </div>

        {/* HERO SECTION - Klukable ke Event Detail */}
        <section className="hero-section">
          <div
            className="hero-slider"
            style={{
              backgroundImage: `url(${currentHero?.image})`,
              cursor: "pointer",
            }}
            onClick={() => handleGoToDetail(currentHero?.id)}
          >
            <div className="hero-overlay"></div>

            {heroSlides.length > 1 && (
              <>
                <button
                  className="hero-arrow hero-arrow-left"
                  onClick={previousSlide}
                  aria-label="Previous"
                >
                  ‹
                </button>

                <button
                  className="hero-arrow hero-arrow-right"
                  onClick={nextSlide}
                  aria-label="Next"
                >
                  ›
                </button>
              </>
            )}

            <div className="hero-content">
              <span className="hero-badge">SOROTAN UTAMA</span>

              <h1>{currentHero?.title}</h1>

              <div className="hero-location">
                <svg viewBox="0 0 24 24">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <span>{currentHero?.location}</span>
              </div>
            </div>

            <div className="hero-dots">
              {heroSlides.map((_, index) => (
                <button
                  key={index}
                  className={index === currentSlide ? "active" : ""}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentSlide(index);
                  }}
                  aria-label={`Slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="latest-section">
          <div className="latest-header">
            <div>
              <h2>Terkini</h2>

              <p>
                Jelajahi konser, festival musik, pameran, dan konferensi paling
                seru.
              </p>
            </div>

            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={activeCategory === category ? "active" : ""}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-section-title">
            <h2>Terkini</h2>
          </div>

          {loading && <div className="dashboard-loading">Memuat event...</div>}

          {!loading && (
            <div className="event-grid">
              {events.map((event) => (
                <article
                  className="event-card"
                  key={event.id}
                  style={{ cursor: "pointer" }}
                  onClick={() => handleGoToDetail(event.id)}
                >
                  <div className="event-image-wrapper">
                    <img src={event.image} alt={event.title} />

                    <div className="event-image-overlay"></div>

                    <div className="event-image-content">
                      <span>
                        {event.categoryLabel ||
                          (event.category || "").replace(/_/g, " ")}
                      </span>

                      <h3>{event.title}</h3>
                    </div>
                  </div>

                  <div className="event-card-content">
                    <div className="event-info">
                      <div className="event-info-row">
                        <svg viewBox="0 0 24 24">
                          <rect x="4" y="5" width="16" height="15" rx="2" />
                          <path d="M8 3v4M16 3v4M4 10h16" />
                        </svg>

                        <span>
                          {event.dateDisplay || event.date}
                          {event.time ? ` • ${event.time}` : ""}
                        </span>
                      </div>

                      <div className="event-info-row">
                        <svg viewBox="0 0 24 24">
                          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                          <circle cx="12" cy="10" r="2.5" />
                        </svg>

                        <span>{event.location}</span>
                      </div>
                    </div>

                    <div className="event-card-bottom">
                      <span className="event-price">
                        {event.priceDisplay || formatPrice(event.price)}
                      </span>

                      <button
                        className="buy-ticket-button"
                        onClick={(e) => handleBuyTicket(e, event)}
                      >
                        Beli Tiket
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {!loading && events.length === 0 && (
            <div className="empty-events">
              <h3>Belum ada event</h3>

              <p>
                Tidak ada event yang sesuai dengan pencarian atau kategori yang
                kamu pilih.
              </p>
            </div>
          )}
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

export default DashboardCustomer;
