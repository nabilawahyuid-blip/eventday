import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import "./NavbarCustomer.css";

function NavbarCustomer() {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  const handleCreateEvent = () => {
    navigate("/eo/event/create");
    setMenuOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setMenuOpen(false);
  };

  return (
    <header className="customer-navbar">

      <div className="navbar-left">

        <div
          className="customer-logo"
          onClick={() =>
            navigate("/customer/dashboard")
          }
        >
          EVENT<span>DAY</span>
        </div>

        <button className="location-button">
          <svg viewBox="0 0 24 24">
            <path
              d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"
            />

            <circle
              cx="12"
              cy="10"
              r="2.5"
            />
          </svg>

          <span>Jakarta, ID</span>

          <span className="location-arrow">
            ⌄
          </span>
        </button>

      </div>

      <div className="navbar-search">

        <svg viewBox="0 0 24 24">
          <circle
            cx="11"
            cy="11"
            r="7"
          />

          <path d="m20 20-4-4" />
        </svg>

        <input
          type="text"
          placeholder="Cari artis, genre, acara, atau venue..."
        />

      </div>

      <nav className="desktop-navigation">

        <button
          className="nav-link active"
          onClick={() =>
            handleNavigation(
              "/customer/dashboard"
            )
          }
        >
          Beranda
        </button>

        <button
          className="nav-link"
          onClick={() =>
            handleNavigation(
              "/customer/tickets"
            )
          }
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
          onClick={() =>
            handleNavigation(
              "/customer/history"
            )
          }
        >
          Riwayat
        </button>

        <button
          className="profile-button"
          onClick={() =>
            handleNavigation(
              "/customer/profile"
            )
          }
        >
          <span className="profile-avatar">
            JD
          </span>

          <span>
            John D.
          </span>
        </button>

      </nav>

      <div className="mobile-header-icons">

        <button aria-label="Cari">
          <svg viewBox="0 0 24 24">
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-4-4" />
          </svg>
        </button>

        <button
          aria-label="Menu"
          onClick={() =>
            setMenuOpen(!menuOpen)
          }
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

      </div>

      {menuOpen && (
        <div className="mobile-menu">

          <button
            onClick={() =>
              handleNavigation(
                "/customer/dashboard"
              )
            }
          >
            Beranda
          </button>

          <button
            onClick={() =>
              handleNavigation(
                "/customer/tickets"
              )
            }
          >
            Tiket Saya
          </button>

          <button
            onClick={handleCreateEvent}
          >
            Buat Event
          </button>

          <button
            onClick={() =>
              handleNavigation(
                "/customer/history"
              )
            }
          >
            Riwayat
          </button>

          <button
            onClick={() =>
              handleNavigation(
                "/customer/profile"
              )
            }
          >
            Profil
          </button>

        </div>
      )}

    </header>
  );
}

export default NavbarCustomer;