import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  WalletCards,
  RotateCcw,
  UserRound,
  LogOut,
} from "lucide-react";
import "./SidebarEO.css";
import { logoutOrganizer } from "../../services/organizerAuthService";

function SidebarEO() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = async () => {
    try {
      await logoutOrganizer();
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();

      navigate("/", {
        replace: true,
      });
    }
  };

  return (
    <aside className="sidebar-eo">
      <div className="sidebar-eo-brand">
        <div className="sidebar-eo-logo">
          E
        </div>

        <div className="sidebar-eo-brand-text">
          <h2>EventDay</h2>
          <span>EVENT ORGANIZER</span>
        </div>
      </div>

      <nav className="sidebar-eo-menu">
        <button
          type="button"
          className={`sidebar-eo-item ${
            isActive("/eo/dashboard") ? "active" : ""
          }`}
          onClick={() => navigate("/eo/dashboard")}
        >
          <span className="sidebar-eo-icon">
            <LayoutDashboard
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Dashboard
          </span>
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
          <span className="sidebar-eo-icon">
            <CalendarDays
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Event
          </span>
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
          <span className="sidebar-eo-icon">
            <ReceiptText
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Transaksi
          </span>
        </button>

        <button
          type="button"
          className={`sidebar-eo-item ${
            location.pathname.startsWith("/eo/payout")
              ? "active"
              : ""
          }`}
          onClick={() => navigate("/eo/payout")}
        >
          <span className="sidebar-eo-icon">
            <WalletCards
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Pengajuan Payout
          </span>
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
          <span className="sidebar-eo-icon">
            <RotateCcw
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Refund
          </span>
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
          <span className="sidebar-eo-icon">
            <UserRound
              size={17}
              strokeWidth={1.9}
            />
          </span>

          <span className="sidebar-eo-label">
            Profil
          </span>
        </button>
      </nav>

      <button
        type="button"
        className="sidebar-eo-logout"
        onClick={handleLogout}
      >
        <span className="sidebar-eo-logout-icon">
          <LogOut
            size={17}
            strokeWidth={1.9}
          />
        </span>

        <span className="sidebar-eo-logout-label">
          Keluar
        </span>
      </button>
    </aside>
  );
}

export default SidebarEO;