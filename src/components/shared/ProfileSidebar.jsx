import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProfileSidebar.css";

function ProfileSidebar({ open, onClose }) {
  const navigate = useNavigate();

  const profile = {
    name: "NAMA PEMILIK AKUN",
    email: "account@example.com",
    initials: "A",
  };

  const accountMenus = [
    {
      label: "Tiket Saya",
      path: "/customer/tickets",
      type: "ticket",
    },
    {
      label: "Transaksi",
      path: "/customer/history",
      type: "transaction",
    },
    {
      label: "Event Dashboard",
      path: "/eo/dashboard",
      type: "dashboard",
    },
  ];

  const securityMenus = [
    {
      label: "Ubah Sandi/Reset",
      path: "/forgot-password",
      type: "lock",
    },
    {
      label: "Refund",
      path: "/customer/refund",
      type: "refund",
    },
  ];

  const handleNavigate = (path) => {
    onClose();
    navigate(path);
  };

  const handleEditProfile = () => {
    onClose();
    navigate("/customer/profile");
  };

  const handleTerms = () => {
    onClose();
    navigate("/customer/terms");
  };

  const handlePrivacy = () => {
    onClose();
    navigate("/customer/privacy");
  };

  const handleLogout = () => {
    onClose();
    navigate("/");
  };

  if (!open) {
    return null;
  }

  return (
    <>
      <div
        className="profile-sidebar-backdrop"
        onClick={onClose}
      ></div>

      <aside className="profile-sidebar">
        <div className="profile-sidebar-content">
          <section className="sidebar-profile-user">
            <div className="sidebar-avatar">
              {profile.initials}
            </div>

            <h2>{profile.name}</h2>

            <p>{profile.email}</p>

            <button
              className="sidebar-edit-button"
              onClick={handleEditProfile}
            >
              Edit Profil
            </button>
          </section>

          <section className="sidebar-menu-section">
            <div className="sidebar-section-title">
              Account &amp; Activity
            </div>

            <div className="sidebar-menu-list">
              {accountMenus.map((menu) => (
                <SidebarMenuItem
                  key={menu.label}
                  menu={menu}
                  onClick={handleNavigate}
                />
              ))}
            </div>
          </section>

          <section className="sidebar-menu-section">
            <div className="sidebar-section-title">
              Settings &amp; Security
            </div>

            <div className="sidebar-menu-list">
              {securityMenus.map((menu) => (
                <SidebarMenuItem
                  key={menu.label}
                  menu={menu}
                  onClick={handleNavigate}
                />
              ))}
            </div>
          </section>

          <section className="sidebar-general-section">
            <button
              className="sidebar-general-item"
              onClick={handleTerms}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M7 4h10v16H7z" />
                  <path d="M9 8h6M9 12h6M9 16h4" />
                </svg>
              </span>

              <span>Syarat dan Ketentuan</span>

              <span className="sidebar-arrow"></span>
            </button>

            <button
              className="sidebar-general-item"
              onClick={handlePrivacy}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
                  <circle cx="12" cy="11" r="2.5" />
                  <path d="M8.5 17c.8-1.5 2-2.2 3.5-2.2s2.7.7 3.5 2.2" />
                </svg>
              </span>

              <span>Kebijakan Privasi</span>

              <span className="sidebar-arrow"></span>
            </button>

            <button
              className="sidebar-general-item sidebar-logout"
              onClick={handleLogout}
            >
              <span className="sidebar-icon">
                <svg viewBox="0 0 24 24">
                  <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                  <path d="M14 8l4 4-4 4" />
                  <path d="M18 12H9" />
                </svg>
              </span>

              <span>Keluar</span>

              <span className="sidebar-arrow"></span>
            </button>
          </section>
        </div>
      </aside>
    </>
  );
}

function SidebarMenuItem({ menu, onClick }) {
  return (
    <button
      className="sidebar-menu-item"
      onClick={() => onClick(menu.path)}
    >
      <span className="sidebar-icon">
        {menu.type === "ticket" && (
          <svg viewBox="0 0 24 24">
            <path d="M4 7a2 2 0 0 0 0 4 2 2 0 0 0 0 4v2h16v-2a2 2 0 0 0 0-4 2 2 0 0 0 0-4V5H4v2Z" />
            <path d="M9 8v1M9 12v1M9 16v1" />
          </svg>
        )}

        {menu.type === "transaction" && (
          <svg viewBox="0 0 24 24">
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </svg>
        )}

        {menu.type === "dashboard" && (
          <svg viewBox="0 0 24 24">
            <rect x="4" y="4" width="6" height="6" rx="1" />
            <rect x="14" y="4" width="6" height="6" rx="1" />
            <rect x="4" y="14" width="6" height="6" rx="1" />
            <rect x="14" y="14" width="6" height="6" rx="1" />
          </svg>
        )}

        {menu.type === "lock" && (
          <svg viewBox="0 0 24 24">
            <rect x="5" y="10" width="14" height="11" rx="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" />
            <circle cx="12" cy="15" r="1" />
          </svg>
        )}

        {menu.type === "refund" && (
          <svg viewBox="0 0 24 24">
            <path d="M20 7v5h-5" />
            <path d="M20 12a8 8 0 1 0 2 5" />
            <path d="M12 8v4l3 2" />
          </svg>
        )}
      </span>

      <span className="sidebar-menu-label">
        {menu.label}
      </span>

      <span className="sidebar-arrow">
        <svg viewBox="0 0 24 24">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

export default ProfileSidebar;