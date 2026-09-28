import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  CalendarDays,
  ReceiptText,
  WalletCards,
  RotateCcw,
  UserRound,
  LogOut,
  UserCheck,
  Menu,
  X,
} from "lucide-react";
import "./SidebarEO.css";
import { logoutOrganizer } from "../../services/organizerAuthService";

function SidebarEO() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await logoutOrganizer();
    } catch (error) {
      console.error("Logout API gagal:", error);
    } finally {
      localStorage.clear();
      sessionStorage.clear();
      navigate("/", { replace: true });
    }
  };

  const eoMenuItems = [
    {
      path: "/eo/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} strokeWidth={1.9} />,
      isExact: true,
    },
    {
      path: "/eo/event",
      label: "Event",
      icon: <CalendarDays size={18} strokeWidth={1.9} />,
    },
    {
      path: "/eo/transaksi",
      label: "Transaksi",
      icon: <ReceiptText size={18} strokeWidth={1.9} />,
    },
    {
      path: "/eo/payout",
      label: "Payout",
      icon: <WalletCards size={18} strokeWidth={1.9} />,
    },
    {
      path: "/eo/refund",
      label: "Refund",
      icon: <RotateCcw size={18} strokeWidth={1.9} />,
    },
    {
      path: "/eo/profil",
      label: "Profil",
      icon: <UserRound size={18} strokeWidth={1.9} />,
    },
  ];

  const checkIsActive = (item) => {
    return item.isExact
      ? isActive(item.path)
      : location.pathname.startsWith(item.path);
  };

  const handleNavigateMobile = (path) => {
    setIsMobileMenuOpen(false);
    navigate(path);
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="sidebar-eo">
        <div className="sidebar-eo-brand">
          <div className="sidebar-eo-logo">E</div>
          <div className="sidebar-eo-brand-text">
            <h2>EventDay</h2>
            <span>EVENT ORGANIZER</span>
          </div>
        </div>

        <nav className="sidebar-eo-menu">
          {eoMenuItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`sidebar-eo-item ${
                checkIsActive(item) ? "active" : ""
              }`}
              onClick={() => navigate(item.path)}
            >
              <span className="sidebar-eo-icon">{item.icon}</span>
              <span className="sidebar-eo-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-eo-footer">
          <button
            type="button"
            className="sidebar-eo-dashboard-btn"
            onClick={() => navigate("/customer/dashboard")}
          >
            <span className="sidebar-eo-footer-icon">
              <UserCheck size={17} strokeWidth={1.9} />
            </span>
            <span className="sidebar-eo-footer-label">Dashboard Customer</span>
          </button>

          <button
            type="button"
            className="sidebar-eo-logout"
            onClick={handleLogout}
          >
            <span className="sidebar-eo-logout-icon">
              <LogOut size={17} strokeWidth={1.9} />
            </span>
            <span className="sidebar-eo-logout-label">Keluar</span>
          </button>
        </div>
      </aside>

      {/* ================= FLOATING MOBILE BOTTOM NAV ================= */}
      <div className="mobile-eo-nav-wrapper">
        <nav className="mobile-eo-nav">
          {/* 1. MENU EO */}
          <button
            type="button"
            className={`mobile-eo-nav-item ${
              isMobileMenuOpen || location.pathname.startsWith("/eo/")
                ? "active"
                : ""
            }`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="mobile-eo-icon">
              <Menu size={20} strokeWidth={2} />
            </span>
            <span className="mobile-eo-label">Menu EO</span>
          </button>

          {/* 2. DASHBOARD CUSTOMER */}
          <button
            type="button"
            className={`mobile-eo-nav-item ${
              location.pathname.startsWith("/customer/") ? "active" : ""
            }`}
            onClick={() => {
              setIsMobileMenuOpen(false);
              navigate("/customer/dashboard");
            }}
          >
            <span className="mobile-eo-icon">
              <UserCheck size={20} strokeWidth={2} />
            </span>
            <span className="mobile-eo-label">Customer</span>
          </button>

          {/* 3. KELUAR */}
          <button
            type="button"
            className="mobile-eo-nav-item mobile-logout"
            onClick={handleLogout}
          >
            <span className="mobile-eo-icon">
              <LogOut size={20} strokeWidth={2} />
            </span>
            <span className="mobile-eo-label">Keluar</span>
          </button>
        </nav>
      </div>

      {/* ================= FLOATING MOBILE MENU POPUP ================= */}
      {isMobileMenuOpen && (
        <div
          className="mobile-popup-overlay"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="mobile-popup-content"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Indicator handle melayang */}
            <div className="mobile-popup-drag-handle"></div>

            <div className="mobile-popup-header">
              <h3>Menu Organizer</h3>
              <button
                type="button"
                className="mobile-popup-close"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-popup-grid">
              {eoMenuItems.map((item) => (
                <button
                  key={item.path}
                  type="button"
                  className={`mobile-popup-item ${
                    checkIsActive(item) ? "active" : ""
                  }`}
                  onClick={() => handleNavigateMobile(item.path)}
                >
                  <span className="mobile-popup-icon">{item.icon}</span>
                  <span className="mobile-popup-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SidebarEO;