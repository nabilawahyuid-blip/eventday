import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./SidebarEO.css";

function SidebarEO() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <aside className="sidebar-eo">

      {/* BRAND */}
      <div className="sidebar-eo-brand">

        <div className="sidebar-eo-logo">
          E
        </div>

        <div className="sidebar-eo-brand-text">
          <h2>EventDay</h2>
          <span>EVENT ORGANIZER</span>
        </div>

      </div>

      {/* MENU */}
      <nav className="sidebar-eo-menu">

        <button
          type="button"
          className={`sidebar-eo-item ${
            isActive("/eo/dashboard") ? "active" : ""
          }`}
          onClick={() => navigate("/eo/dashboard")}
        >
          <span>▦</span>
          Dashboard
        </button>

        <button
          type="button"
          className={`sidebar-eo-item ${
            location.pathname.startsWith("/eo/event")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/eo/event")}
        >
          <span>□</span>
          Event
        </button>

        <button
          type="button"
          className={`sidebar-eo-item ${
            location.pathname.startsWith("/eo/transaksi")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/eo/transaksi")}
        >
          <span>▣</span>
          Transaksi
        </button>

        <button
          type="button"
          className={`sidebar-eo-item ${
            location.pathname.startsWith("/eo/refund")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/eo/refund")}
        >
          <span>↶</span>
          Refund
        </button>

        <button
          type="button"
          className={`sidebar-eo-item ${
            location.pathname.startsWith("/eo/profil")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/eo/profil")}
        >
          <span>◎</span>
          Profil
        </button>

      </nav>

      {/* LOGOUT */}
      <button
        type="button"
        className="sidebar-eo-logout"
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          navigate("/", { replace: true });
        }}
      >
        <span>↪</span>
        Keluar
      </button>

    </aside>
  );
}

export default SidebarEO;