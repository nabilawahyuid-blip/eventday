import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./FooterCustomer.css";

function FooterCustomer() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      <footer className="customer-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>

      <nav className="customer-mobile-bottom-nav">
        <button
          className={`customer-bottom-nav-item ${
            isActive("/customer/dashboard") ? "active" : ""
          }`}
          onClick={() => navigate("/customer/dashboard")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
          </svg>

          <span>Beranda</span>
        </button>

        <button
          className={`customer-bottom-nav-item ${
            isActive("/customer/tickets") ? "active" : ""
          }`}
          onClick={() => navigate("/customer/tickets")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
            <path d="M8 9h8M8 12h8M8 15h5" />
          </svg>

          <span>Tiket</span>
        </button>

        <button
          className={`customer-bottom-nav-item ${
            location.pathname.startsWith("../register-eo")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("../register-eo")}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v8M8 12h8" />
          </svg>

          <span>Buat Event</span>
        </button>

        <button
          className={`customer-bottom-nav-item ${
            location.pathname.startsWith("/customer/history") ||
            location.pathname.startsWith("/customer/refund")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/customer/history")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 1 0 2.35-5.65" />
            <path d="M4 5v5h5" />
            <path d="M12 8v4l3 2" />
          </svg>

          <span>Transaksi</span>
        </button>

        <button
          className={`customer-bottom-nav-item ${
            isActive("/customer/profile") ? "active" : ""
          }`}
          onClick={() => navigate("/customer/profile")}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5 20c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2" />
          </svg>

          <span>Profile</span>
        </button>
      </nav>
    </>
  );
}

export default FooterCustomer;