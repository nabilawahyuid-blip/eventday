import React, { useState, useEffect, useRef, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getEvents } from "../../services/eventService";
import { getProfile } from "../../services/profileService";
import ProfileSidebar from "./ProfileSidebar";
import "./NavbarCustomer.css";

const DEBOUNCE_MS = 400;

function NavbarCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: localStorage.getItem("name") || "USER",
    email: localStorage.getItem("email") || "",
    username: "",
    avatarUrl: null,
    initials: "U",
  });

  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const data = res?.data || {};
        const name = data.name || localStorage.getItem("name") || "USER";
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setUserProfile({
          name,
          email: data.email || localStorage.getItem("email") || "",
          username: data.username || "",
          avatarUrl: data.avatarUrl || localStorage.getItem("avatarUrl") || null,
          initials,
        });
      } catch {
        const name = localStorage.getItem("name") || "USER";
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setUserProfile((prev) => ({ ...prev, name, initials, avatarUrl: localStorage.getItem("avatarUrl") || null }));
      }
    };
    loadProfile();
  }, []);

  const isProfilePage = location.pathname === "/customer/profile";

  const handleLogoClick = () => {
    navigate("/customer/dashboard");
  };

  const handleMobileMenu = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleProfileClick = () => {
    setMenuOpen(false);
    if (window.innerWidth <= 768) {
      navigate("/customer/profile");
      return;
    }
    setProfileOpen((prev) => !prev);
  };

  const fetchSearchResults = useCallback(async (keyword) => {
    if (!keyword || keyword.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setSearchLoading(true);
    try {
      const res = await getEvents({ search: keyword, size: 8 });
      const list = res?.data?.content || res?.data || [];
      setSearchResults(Array.isArray(list) ? list : []);
      setShowDropdown(true);
    } catch {
      setSearchResults([]);
      setShowDropdown(true);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchValue(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSearchResults(val.trim());
    }, DEBOUNCE_MS);
  };

  const handleResultClick = (eventId) => {
    setShowDropdown(false);
    setSearchOpen(false);
    setSearchValue("");
    navigate(`/customer/event/${eventId}`);
  };

  const handleSearchToggle = () => {
    setSearchOpen((prev) => !prev);
    setShowDropdown(false);
    setSearchResults([]);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const formatPrice = (price) => {
    const value = Number(price);
    if (!value) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const mobileMenuSections = [
    {
      title: "Account & Activity",
      items: [
        { label: "Tiket Saya", path: "/customer/tickets", type: "ticket" },
        { label: "Transaksi", path: "/customer/history", type: "transaction" },
        { label: "Event Dashboard", path: "/eo/dashboard", type: "dashboard" },
      ],
    },
    {
      title: "Settings & Security",
      items: [
        { label: "Ubah Sandi/Reset", path: "/forgot-password", type: "lock" },
        { label: "Refund", path: "/customer/refund-list", type: "refund" },
      ],
    },
  ];

  return (
    <>
      <header className="customer-navbar">
        <div className="navbar-left">
          <button
            className={`mobile-back-button ${isProfilePage ? "show" : ""}`}
            onClick={() => navigate(-1)}
            aria-label="Kembali"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          <div className="customer-logo" onClick={handleLogoClick}>
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

        {/* DESKTOP SEARCH */}
        <div className="navbar-search" ref={searchRef}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="text"
            placeholder="Cari artis, genre, acara, atau venue..."
            value={searchValue}
            onChange={handleSearchChange}
            onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
          />
          {searchLoading && <span className="search-spinner" />}

          {showDropdown && (
            <div className="search-dropdown">
              {searchResults.length > 0 ? (
                <>
                  <div className="search-dropdown-header">
                    Hasil Pencarian
                  </div>
                  {searchResults.map((ev) => (
                    <button
                      key={ev.id}
                      className="search-dropdown-item"
                      type="button"
                      onClick={() => handleResultClick(ev.id)}
                    >
                      <img
                        src={ev.image || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=100&q=60"}
                        alt={ev.title}
                        className="search-dropdown-img"
                      />
                      <div className="search-dropdown-info">
                        <span className="search-dropdown-title">{ev.title}</span>
                        <span className="search-dropdown-meta">
                          {ev.dateDisplay || ev.date || ""}
                          {ev.location ? ` • ${ev.location}` : ""}
                        </span>
                      </div>
                      <span className="search-dropdown-price">
                        {ev.priceDisplay || formatPrice(ev.price)}
                      </span>
                    </button>
                  ))}
                </>
              ) : (
                <div className="search-dropdown-empty">
                  Tidak ada event ditemukan
                </div>
              )}
            </div>
          )}
        </div>

        <nav className="desktop-navigation">
          <button
            className={`nav-link ${location.pathname === "/customer/dashboard" ? "active" : ""}`}
            onClick={() => navigate("/customer/dashboard")}
          >
            Beranda
          </button>
          <button
            className={`nav-link ${location.pathname.startsWith("/customer/tickets") ? "active" : ""}`}
            onClick={() => navigate("/customer/tickets")}
          >
            Tiket
          </button>
          <button
            className={`nav-link ${location.pathname.startsWith("/register-eo") ? "active" : ""}`}
            onClick={() => navigate("/register-eo")}
          >
            Buat Event
          </button>
          <button
            className={`nav-link ${location.pathname.startsWith("/customer/history") || location.pathname.startsWith("/customer/refund") ? "active" : ""}`}
            onClick={() => navigate("/customer/history")}
          >
            Transaksi
          </button>

          <button
            className={`profile-button ${profileOpen || isProfilePage ? "active" : ""}`}
            onClick={handleProfileClick}
          >
            <span className="profile-avatar">
              {userProfile.avatarUrl ? (
                <img src={userProfile.avatarUrl} alt="Foto Profil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                userProfile.initials
              )}
            </span>
            <span>{userProfile.name}</span>
            <svg className="profile-chevron" viewBox="0 0 24 24">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </nav>

        <div className="mobile-header-icons">
          <button className="mobile-search-button" aria-label="Cari" onClick={handleSearchToggle}>
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>
          <button className="mobile-menu-button" aria-label="Menu" onClick={() => setMenuOpen((prev) => !prev)}>
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>

        {/* MOBILE SEARCH DROPDOWN */}
        {searchOpen && (
          <div className="mobile-search-overlay" ref={searchRef}>
            <div className="mobile-search-form">
              <button type="button" className="mobile-search-back" onClick={handleSearchToggle}>
                <svg viewBox="0 0 24 24">
                  <path d="M19 12H5" />
                  <path d="m12 19-7-7 7-7" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Cari event..."
                value={searchValue}
                onChange={handleSearchChange}
                autoFocus
              />
              {searchLoading && <span className="search-spinner" />}
            </div>

            {showDropdown && (
              <div className="mobile-search-results">
                {searchResults.length > 0 ? (
                  searchResults.map((ev) => (
                    <button
                      key={ev.id}
                      className="mobile-search-result-item"
                      type="button"
                      onClick={() => handleResultClick(ev.id)}
                    >
                      <img
                        src={ev.image || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=100&q=60"}
                        alt={ev.title}
                        className="mobile-search-result-img"
                      />
                      <div className="mobile-search-result-info">
                        <span className="mobile-search-result-title">{ev.title}</span>
                        <span className="mobile-search-result-meta">
                          {ev.dateDisplay || ev.date || ""}
                          {ev.location ? ` • ${ev.location}` : ""}
                        </span>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="mobile-search-empty">Tidak ada event ditemukan</div>
                )}
              </div>
            )}
          </div>
        )}

        {/* MOBILE HAMBURGER MENU — ProfileSidebar style */}
        {menuOpen && (
          <div className="mobile-hamburger-menu">
            <div className="hamburger-profile">
              <div className="hamburger-avatar">
                {userProfile.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Foto Profil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                ) : (
                  userProfile.initials
                )}
              </div>
              <div className="hamburger-profile-text">
                <span className="hamburger-name">{userProfile.name}</span>
                <span className="hamburger-email">{userProfile.email}</span>
              </div>
              <button
                className="hamburger-edit-btn"
                onClick={() => handleMobileMenu("/customer/profile/edit")}
              >
                Edit Profil
              </button>
            </div>

            {mobileMenuSections.map((section) => (
              <div key={section.title} className="hamburger-section">
                <div className="hamburger-section-title">{section.title}</div>
                {section.items.map((item) => (
                  <button
                    key={item.label}
                    className="hamburger-menu-item"
                    onClick={() => handleMobileMenu(item.path)}
                  >
                    <span className="hamburger-icon">
                      {item.type === "ticket" && (
                        <svg viewBox="0 0 24 24">
                          <path d="M4 7a2 2 0 0 0 0 4 2 2 0 0 0 0 4v2h16v-2a2 2 0 0 0 0-4 2 2 0 0 0 0-4V5H4v2Z" />
                          <path d="M9 8v1M9 12v1M9 16v1" />
                        </svg>
                      )}
                      {item.type === "transaction" && (
                        <svg viewBox="0 0 24 24">
                          <rect x="5" y="3" width="14" height="18" rx="2" />
                          <path d="M8 7h8M8 11h8M8 15h5" />
                        </svg>
                      )}
                      {item.type === "dashboard" && (
                        <svg viewBox="0 0 24 24">
                          <rect x="4" y="4" width="6" height="6" rx="1" />
                          <rect x="14" y="4" width="6" height="6" rx="1" />
                          <rect x="4" y="14" width="6" height="6" rx="1" />
                          <rect x="14" y="14" width="6" height="6" rx="1" />
                        </svg>
                      )}
                      {item.type === "lock" && (
                        <svg viewBox="0 0 24 24">
                          <rect x="5" y="10" width="14" height="11" rx="2" />
                          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
                          <circle cx="12" cy="15" r="1" />
                        </svg>
                      )}
                      {item.type === "refund" && (
                        <svg viewBox="0 0 24 24">
                          <path d="M20 7v5h-5" />
                          <path d="M20 12a8 8 0 1 0 2 5" />
                          <path d="M12 8v4l3 2" />
                        </svg>
                      )}
                    </span>
                    <span className="hamburger-label">{item.label}</span>
                    <span className="hamburger-arrow">
                      <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
                    </span>
                  </button>
                ))}
              </div>
            ))}

            <div className="hamburger-section">
              <button className="hamburger-menu-item" onClick={() => handleMobileMenu("/customer/terms")}>
                <span className="hamburger-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M7 4h10v16H7z" />
                    <path d="M9 8h6M9 12h6M9 16h4" />
                  </svg>
                </span>
                <span className="hamburger-label">Syarat dan Ketentuan</span>
                <span className="hamburger-arrow">
                  <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
                </span>
              </button>

              <button className="hamburger-menu-item" onClick={() => handleMobileMenu("/customer/privacy")}>
                <span className="hamburger-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
                    <circle cx="12" cy="11" r="2.5" />
                    <path d="M8.5 17c.8-1.5 2-2.2 3.5-2.2s2.7.7 3.5 2.2" />
                  </svg>
                </span>
                <span className="hamburger-label">Kebijakan Privasi</span>
                <span className="hamburger-arrow">
                  <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
                </span>
              </button>

              <button className="hamburger-menu-item hamburger-logout" onClick={() => handleMobileMenu("/")}>
                <span className="hamburger-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                    <path d="M14 8l4 4-4 4" />
                    <path d="M18 12H9" />
                  </svg>
                </span>
                <span className="hamburger-label">Keluar</span>
                <span className="hamburger-arrow">
                  <svg viewBox="0 0 24 24"><path d="m9 5 7 7-7 7" /></svg>
                </span>
              </button>
            </div>
          </div>
        )}
      </header>

      <ProfileSidebar
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}

export default NavbarCustomer;
