import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FooterCustomer from "../shared/FooterCustomer";
import "./CustomerDashboard.css";

function DashboardCustomer() {
  const navigate = useNavigate();

  const [activeCategory, setActiveCategory] = useState("Semua");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");

  const heroEvents = [
    {
      title: "Konser Musik Akbar 2024",
      location: "Stadion Utama GBK, Senayan, Jakarta",
      image:
        "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Festival Musik Terbesar 2024",
      location: "Jakarta International Stadium",
      image:
        "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Music Festival Indonesia",
      location: "Gelora Bung Karno, Jakarta",
      image:
        "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const dummyEvents = [
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
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=900&q=85",
    },
  ];

  const categories = [
    "Semua",
    "Musik",
    "Konferensi",
    "Pameran",
    "Kuliner",
  ];

  const filteredEvents = dummyEvents.filter((event) => {
    const categoryMatch =
      activeCategory === "Semua" ||
      (activeCategory === "Musik" &&
        event.category === "MUSIC FESTIVAL") ||
      (activeCategory === "Konferensi" &&
        event.category === "CONFERENCE") ||
      (activeCategory === "Pameran" &&
        event.category === "EXHIBITION") ||
      (activeCategory === "Kuliner" &&
        event.category === "CULINARY");

    const searchMatch =
      event.title.toLowerCase().includes(search.toLowerCase()) ||
      event.category.toLowerCase().includes(search.toLowerCase()) ||
      event.location.toLowerCase().includes(search.toLowerCase());

    return categoryMatch && searchMatch;
  });

  const nextSlide = () => {
    setCurrentSlide((prev) =>
      prev === heroEvents.length - 1 ? 0 : prev + 1
    );
  };

  const previousSlide = () => {
    setCurrentSlide((prev) =>
      prev === 0 ? heroEvents.length - 1 : prev - 1
    );
  };

  const handleBuyTicket = (event) => {
    navigate(`/customer/event/${event.id}`);
  };

  const handleCreateEvent = () => {
    navigate("/eo/event/create");
  };

  const currentHero = heroEvents[currentSlide];

  return (
    <div className="customer-dashboard">
      <header className="customer-navbar">
        <div className="navbar-left">
          <div
            className="customer-logo"
            onClick={() => navigate("/customer/dashboard")}
          >
            EVENT<span>DAY</span>
          </div>

          <button className="location-button">
            <svg viewBox="0 0 24 24">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>

            <span>Jakarta, ID</span>
            <span className="location-arrow">⌄</span>
          </button>
        </div>

        <div className="navbar-search">
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            type="text"
            placeholder="Cari artis, genre, acara, atau venue..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <nav className="desktop-navigation">
          <button
            className="nav-link active"
            onClick={() => navigate("/customer/dashboard")}
          >
            Beranda
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/customer/tickets")}
          >
            Tiket Saya
          </button>

          <button
            className="nav-link"
            onClick={handleCreateEvent}
          >
            Buat Event
          </button>

          <button
            className="nav-link"
            onClick={() => navigate("/customer/history")}
          >
            Riwayat
          </button>

          <button
            className="profile-button"
            onClick={() => navigate("/customer/profile")}
          >
            <span className="profile-avatar">JD</span>
            <span>John D.</span>
          </button>
        </nav>

        <div className="mobile-header-icons">
          <button aria-label="Cari">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>

          <button
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-menu">
            <button
              onClick={() => navigate("/customer/dashboard")}
            >
              Beranda
            </button>

            <button
              onClick={() => navigate("/customer/tickets")}
            >
              Tiket Saya
            </button>

            <button onClick={handleCreateEvent}>
              Buat Event
            </button>

            <button
              onClick={() => navigate("/customer/history")}
            >
              Riwayat
            </button>

            <button
              onClick={() => navigate("/customer/profile")}
            >
              Profil
            </button>
          </div>
        )}
      </header>

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

        <section className="hero-section">
          <div
            className="hero-slider"
            style={{
              backgroundImage: `url(${currentHero.image})`,
            }}
          >
            <div className="hero-overlay"></div>

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

            <div className="hero-content">
              <span className="hero-badge">
                SOROTAN UTAMA
              </span>

              <h1>{currentHero.title}</h1>

              <div className="hero-location">
                <svg viewBox="0 0 24 24">
                  <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                  <circle cx="12" cy="10" r="2.5" />
                </svg>

                <span>{currentHero.location}</span>
              </div>
            </div>

            <div className="hero-dots">
              {heroEvents.map((_, index) => (
                <button
                  key={index}
                  className={
                    index === currentSlide ? "active" : ""
                  }
                  onClick={() => setCurrentSlide(index)}
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
                Jelajahi konser, festival musik, pameran, dan
                konferensi paling seru.
              </p>
            </div>

            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={
                    activeCategory === category
                      ? "active"
                      : ""
                  }
                  onClick={() =>
                    setActiveCategory(category)
                  }
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mobile-section-title">
            <h2>Terkini</h2>
          </div>

          <div className="event-grid">
            {filteredEvents.map((event) => (
              <article
                className="event-card"
                key={event.id}
              >
                <div className="event-image-wrapper">
                  <img
                    src={event.image}
                    alt={event.title}
                  />

                  <div className="event-image-overlay"></div>

                  <div className="event-image-content">
                    <span>{event.category}</span>

                    <h3>{event.title}</h3>
                  </div>
                </div>

                <div className="event-card-content">
                  <div className="event-info">
                    <div className="event-info-row">
                      <svg viewBox="0 0 24 24">
                        <rect
                          x="4"
                          y="5"
                          width="16"
                          height="15"
                          rx="2"
                        />

                        <path d="M8 3v4M16 3v4M4 10h16" />
                      </svg>

                      <span>
                        {event.date} • {event.time}
                      </span>
                    </div>

                    <div className="event-info-row">
                      <svg viewBox="0 0 24 24">
                        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />

                        <circle
                          cx="12"
                          cy="10"
                          r="2.5"
                        />
                      </svg>

                      <span>{event.location}</span>
                    </div>
                  </div>

                  <div className="event-card-bottom">
                    <span className="event-price">
                      {event.price}
                    </span>

                    <button
                      className="buy-ticket-button"
                      onClick={() =>
                        handleBuyTicket(event)
                      }
                    >
                      Beli Tiket
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <div className="empty-events">
              <h3>Belum ada event</h3>

              <p>
                Tidak ada event yang sesuai dengan pencarian
                atau kategori yang kamu pilih.
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