import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">

      {/* BRAND */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          E
        </div>

        <div className="sidebar-brand-info">
          <h2>EventDay</h2>
          <span>Admin Portal</span>
        </div>
      </div>


      {/* MENU */}
      <nav className="sidebar-menu">

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/dashboard") ? "active" : ""
          }`}
          onClick={() => navigate("/admin/dashboard")}
        >
          <span className="sidebar-icon">▦</span>
          Dashboard
        </button>


        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/event-management") || isActive("/admin/event") ? "active" : ""
          }`}
          onClick={() => navigate("/event-management")}
        >
          <span className="sidebar-icon">□</span>
          Event Management
        </button>


        <button
          type="button"
          className="sidebar-menu-item"
          onClick={() => navigate("/admin/users")}
        >
          <span className="sidebar-icon">♙</span>
          User Management
        </button>


        <button
          type="button"
          className="sidebar-menu-item"
          onClick={() => navigate("/admin/pengajuan-eo")}
        >
          <span className="sidebar-icon">♙</span>
          Pengajuan Akun EO
        </button>


        <button
          type="button"
          className="sidebar-menu-item"
           onClick={() => navigate("/admin/transaksi")}
        >
          <span className="sidebar-icon">▣</span>
          Transaksi
        </button>


        <button
          type="button"
          className="sidebar-menu-item"
           onClick={() => navigate("/admin/tiket")}
        >
          <span className="sidebar-icon">▤</span>
          Tiket
        </button>


        <button
          type="button"
          className="sidebar-menu-item"
          onClick={() => console.log("Pengaturan Platform")}
        >
          <span className="sidebar-icon">⚙</span>
          Pengaturan Platform
        </button>

      </nav>


      {/* LOGOUT */}
      <button
        type="button"
        className="sidebar-logout"
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

export default Sidebar;