import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  UserCheck,
  ReceiptText,
  Ticket,
  Settings,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">

      {/* =====================================================
          BRAND
      ===================================================== */}

      <div className="sidebar-brand">

        <div className="sidebar-logo">
          E
        </div>

        <div className="sidebar-brand-info">
          <h2>EventDay</h2>
          <span>Admin Portal</span>
        </div>

      </div>


      {/* =====================================================
          MENU
      ===================================================== */}

      <nav className="sidebar-menu">

        {/* =================================================
            DASHBOARD
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/dashboard")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/dashboard")
          }
        >
          <span className="sidebar-icon">
            <LayoutDashboard
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Dashboard
          </span>
        </button>


        {/* =================================================
            EVENT MANAGEMENT
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/event-management") || isActive("/admin/event") ? "active" : ""
          }`}
          onClick={() =>
            navigate("/event-management")
          }
        >
          <span className="sidebar-icon">
            <CalendarDays
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Event Management
          </span>
        </button>


        {/* =================================================
            USER MANAGEMENT
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/users")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/users")
          }
        >
          <span className="sidebar-icon">
            <UsersRound
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            User Management
          </span>
        </button>


        {/* =================================================
            PENGAJUAN AKUN EO
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/pengajuan-eo")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/pengajuan-eo")
          }
        >
          <span className="sidebar-icon">
            <UserCheck
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Pengajuan Akun EO
          </span>
        </button>


        {/* =================================================
            TRANSAKSI
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/transaksi")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/transaksi")
          }
        >
          <span className="sidebar-icon">
            <ReceiptText
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Transaksi
          </span>
        </button>


        {/* =================================================
            TIKET
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/tiket")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/tiket")
          }
        >
          <span className="sidebar-icon">
            <Ticket
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Tiket
          </span>
        </button>


        {/* =================================================
            PENGATURAN PLATFORM
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/pengaturan")
              ? "active"
              : ""
          }`}
          onClick={() =>
            navigate("/admin/pengaturan")
          }
        >
          <span className="sidebar-icon">
            <Settings
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Pengaturan Platform
          </span>
        </button>

      </nav>


      {/* =====================================================
          LOGOUT
      ===================================================== */}

      <button
        type="button"
        className="sidebar-logout"
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();

          navigate("/", {
            replace: true,
          });
        }}
      >
        <span className="sidebar-logout-icon">
          <LogOut
            size={18}
            strokeWidth={1.9}
          />
        </span>

        <span>
          Keluar
        </span>
      </button>

    </aside>
  );
}

export default Sidebar;