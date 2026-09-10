import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import "./ProfileCustomer.css";

function ProfileCustomer() {
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

  return (
    <div className="profile-mobile-page">
      <NavbarCustomer />

      <main className="profile-mobile-container">
        <section className="profile-mobile-user-card">
          <div className="profile-mobile-avatar">
            {profile.initials}
          </div>

          <h1>{profile.name}</h1>

          <p>{profile.email}</p>

          <button
            className="profile-mobile-edit"
            onClick={() =>
              alert("Halaman Edit Profil belum dibuat.")
            }
          >
            Edit Profil
          </button>
        </section>

        <section className="profile-mobile-section">
          <div className="profile-mobile-section-title">
            Account &amp; Activity
          </div>

          <div className="profile-mobile-menu-list">
            {accountMenus.map((menu) => (
              <ProfileMobileMenu
                key={menu.label}
                menu={menu}
                onClick={() => navigate(menu.path)}
              />
            ))}
          </div>
        </section>

        <section className="profile-mobile-section">
          <div className="profile-mobile-section-title">
            Settings &amp; Security
          </div>

          <div className="profile-mobile-menu-list">
            {securityMenus.map((menu) => (
              <ProfileMobileMenu
                key={menu.label}
                menu={menu}
                onClick={() => navigate(menu.path)}
              />
            ))}
          </div>
        </section>

        <section className="profile-mobile-general">
          <button
            onClick={() =>
              alert(
                "Halaman Syarat dan Ketentuan belum dibuat."
              )
            }
          >
            <span className="profile-mobile-icon">
              <svg viewBox="0 0 24 24">
                <path d="M7 4h10v16H7z" />
                <path d="M9 8h6M9 12h6M9 16h4" />
              </svg>
            </span>

            <span>Syarat dan Ketentuan</span>

            <span className="profile-mobile-arrow">
              <svg viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </button>

          <button
            onClick={() =>
              alert(
                "Halaman Kebijakan Privasi belum dibuat."
              )
            }
          >
            <span className="profile-mobile-icon">
              <svg viewBox="0 0 24 24">
                <path d="M12 3 20 6v6c0 5-3.4 8-8 10-4.6-2-8-5-8-10V6l8-3Z" />
                <circle cx="12" cy="11" r="2.5" />
              </svg>
            </span>

            <span>Kebijakan Privasi</span>

            <span className="profile-mobile-arrow">
              <svg viewBox="0 0 24 24">
                <path d="m9 5 7 7-7 7" />
              </svg>
            </span>
          </button>

          <button
            className="profile-mobile-logout"
            onClick={() => navigate("/")}
          >
            <span className="profile-mobile-icon">
              <svg viewBox="0 0 24 24">
                <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" />
                <path d="M14 8l4 4-4 4" />
                <path d="M18 12H9" />
              </svg>
            </span>

            <span>Keluar</span>

            <span className="profile-mobile-arrow"></span>
          </button>
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

function ProfileMobileMenu({ menu, onClick }) {
  return (
    <button
      className="profile-mobile-menu-item"
      onClick={onClick}
    >
      <span className="profile-mobile-icon">
        {menu.type === "ticket" && (
          <svg viewBox="0 0 24 24">
            <path d="M4 7a2 2 0 0 0 0 4 2 2 0 0 0 0 4v2h16v-2a2 2 0 0 0 0-4 2 2 0 0 0 0-4V5H4v2Z" />
            <path d="M9 8v1M9 12v1M9 16v1" />
          </svg>
        )}

        {menu.type === "transaction" && (
          <svg viewBox="0 0 24 24">
            <rect
              x="5"
              y="3"
              width="14"
              height="18"
              rx="2"
            />
            <path d="M8 7h8M8 11h8M8 15h5" />
          </svg>
        )}

        {menu.type === "dashboard" && (
          <svg viewBox="0 0 24 24">
            <rect
              x="4"
              y="4"
              width="6"
              height="6"
              rx="1"
            />
            <rect
              x="14"
              y="4"
              width="6"
              height="6"
              rx="1"
            />
            <rect
              x="4"
              y="14"
              width="6"
              height="6"
              rx="1"
            />
            <rect
              x="14"
              y="14"
              width="6"
              height="6"
              rx="1"
            />
          </svg>
        )}

        {menu.type === "lock" && (
          <svg viewBox="0 0 24 24">
            <rect
              x="5"
              y="10"
              width="14"
              height="11"
              rx="2"
            />
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

      <span>{menu.label}</span>

      <span className="profile-mobile-arrow">
        <svg viewBox="0 0 24 24">
          <path d="m9 5 7 7-7 7" />
        </svg>
      </span>
    </button>
  );
}

export default ProfileCustomer;