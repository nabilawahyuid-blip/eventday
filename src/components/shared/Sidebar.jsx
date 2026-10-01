import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  LayoutDashboard,
  CalendarDays,
  UsersRound,
  UserCheck,
  ReceiptText,
  Ticket,
  FileClock,
  WalletCards,
  Settings,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const toggle = () => setOpen((prev) => !prev);
    const close = () => setOpen(false);

    window.addEventListener("admin-sidebar:toggle", toggle);
    window.addEventListener("admin-sidebar:close", close);

    return () => {
      window.removeEventListener("admin-sidebar:toggle", toggle);
      window.removeEventListener("admin-sidebar:close", close);
    };
  }, []);

  // Tutup drawer setiap pindah halaman (khusus mobile)
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const go = (path) => {
    setOpen(false);
    navigate(path);
  };

  const profileName =
    localStorage.getItem("name") ||
    localStorage.getItem("username") ||
    "Admin";
  const profileEmail = localStorage.getItem("email") || "admin@eventday.id";
  const profilePhoto =
    localStorage.getItem("photo") ||
    localStorage.getItem("profilePhoto") ||
    localStorage.getItem("avatar") ||
    localStorage.getItem("picture") ||
    "";
  const profileInitial = (profileName.trim().charAt(0) || "A").toUpperCase();

  return (
    <>
      {open && (
        <div
          className="sidebar-overlay"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`sidebar${open ? " open" : ""}`}>

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

        <button
          type="button"
          className="sidebar-close"
          onClick={() => setOpen(false)}
          aria-label="Tutup menu navigasi"
        >
          ✕
        </button>

      </div>


      {/* =====================================================
          PROFIL ADMIN (paling atas drawer mobile)
      ===================================================== */}

      <div className="sidebar-profile">
        <div className="sidebar-profile-avatar">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              alt={profileName}
            />
          ) : (
            profileInitial
          )}
        </div>

        <div className="sidebar-profile-info">
          <strong>{profileName}</strong>
          <span>{profileEmail}</span>
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
          onClick={() => go("/admin/dashboard")
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
            isActive("/event-management") ||
            isActive("/admin/event")
              ? "active"
              : ""
          }`}
          onClick={() =>
            go("/event-management")
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
            go("/admin/users")
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
            go("/admin/pengajuan-eo")
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
            go("/admin/transaksi")
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
            go("/admin/tiket")
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
            AUDIT LOG
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/audit-log")
              ? "active"
              : ""
          }`}
          onClick={() =>
            go("/admin/audit-log")
          }
        >
          <span className="sidebar-icon">
            <FileClock
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Audit Log
          </span>
        </button>


        {/* =================================================
            PENGAJUAN PAYOUT
        ================================================= */}

        <button
          type="button"
          className={`sidebar-menu-item ${
            isActive("/admin/pengajuan-payout")
              ? "active"
              : ""
          }`}
          onClick={() =>
            go("/admin/pengajuan-payout")
          }
        >
          <span className="sidebar-icon">
            <WalletCards
              size={18}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-menu-label">
            Pengajuan Payout
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
            go("/admin/pengaturan")
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

          setOpen(false);
          navigate("/login", {
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
    </>
  );
}

export default Sidebar;