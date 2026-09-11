import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ProfileSidebar from "./ProfileSidebar";
import "./NavbarCustomer.css";

function NavbarCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const isProfilePage =
    location.pathname === "/customer/profile";

  const handleLogoClick = () => {
    navigate("/customer/dashboard");
  };

  const handleProfileClick = () => {
    setMenuOpen(false);

    if (window.innerWidth <= 768) {
      navigate("/customer/profile");
      return;
    }

    setProfileOpen((prev) => !prev);
  };

  const handleMobileMenu = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();

    const keyword = searchValue.trim();

    if (!keyword) {
      navigate("/customer/dashboard");
      return;
    }

    navigate(`/customer/dashboard?search=${encodeURIComponent(keyword)}`);
    setSearchValue("");
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/customer/dashboard");
    }
  };

  return (
    <>
      <header className="customer-navbar">
        <div className="navbar-left">
          <button
            className={`mobile-back-button ${
              isProfilePage ? "show" : ""
            }`}
            onClick={handleBack}
            aria-label="Kembali"
          >
            <svg viewBox="0 0 24 24">
              <path d="M19 12H5" />
              <path d="m12 19-7-7 7-7" />
            </svg>
          </button>

          <div
            className="customer-logo"
            onClick={handleLogoClick}
          >
            EVENT<span>DAY</span>
          </div>

          <button className="location-button">
            <svg viewBox="0 0 24 24">
              <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>

            <span>Jakarta, ID</span>

            <span className="location-arrow">
              ⌄
            </span>
          </button>
        </div>

        <form className="navbar-search" onSubmit={handleSearchSubmit}>
          <svg viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>

          <input
            type="text"
            placeholder="Cari artis, genre, acara, atau venue..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </form>

        <nav className="desktop-navigation">
          <button
            className={`nav-link ${
              location.pathname === "/customer/dashboard"
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/customer/dashboard")
            }
          >
            Beranda
          </button>

          <button
            className={`nav-link ${
              location.pathname.startsWith(
                "/customer/tickets"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/customer/tickets")
            }
          >
            Tiket
          </button>

          <button
            className={`nav-link ${
              location.pathname.startsWith(
                "/eo/event/create"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/eo/event/create")
            }
          >
            Buat Event
          </button>

          <button
            className={`nav-link ${
              location.pathname.startsWith(
                "/customer/history"
              ) ||
              location.pathname.startsWith(
                "/customer/refund"
              )
                ? "active"
                : ""
            }`}
            onClick={() =>
              navigate("/customer/history")
            }
          >
            Transaksi
          </button>

          <button
            className={`profile-button ${
              profileOpen || isProfilePage
                ? "active"
                : ""
            }`}
            onClick={handleProfileClick}
          >
            <span className="profile-avatar">
              A
            </span>

            <span>Adit</span>

            <svg
              className="profile-chevron"
              viewBox="0 0 24 24"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </nav>

        <div className="mobile-header-icons">
          <button
            className="mobile-search-button"
            aria-label="Cari"
          >
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>
          </button>

          <button
            className="mobile-menu-button"
            aria-label="Menu"
            onClick={() =>
              setMenuOpen((prev) => !prev)
            }
          >
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mobile-navbar-menu">
            <button
              onClick={() =>
                handleMobileMenu(
                  "/customer/dashboard"
                )
              }
            >
              Beranda
            </button>

            <button
              onClick={() =>
                handleMobileMenu(
                  "/customer/tickets"
                )
              }
            >
              Tiket
            </button>

            <button
              onClick={() =>
                handleMobileMenu(
                  "/eo/event/create"
                )
              }
            >
              Buat Event
            </button>

            <button
              onClick={() =>
                handleMobileMenu(
                  "/customer/history"
                )
              }
            >
              Transaksi
            </button>

            <button
              onClick={() =>
                handleMobileMenu(
                  "/customer/profile"
                )
              }
            >
              Profile
            </button>
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