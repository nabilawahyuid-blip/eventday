import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getProfile, logoutUser } from "../../services/profileService";
import "./ProfileCustomer.css";

function ProfileCustomer() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "...",
    email: "",
    username: "",
    avatarUrl: null,
    initials: "",
  });

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getProfile();
        const data = res?.data || {};
        if (cancelled) return;
        const name = data.name || "User";
        const initials = name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);
        setProfile({
          name,
          email: data.email || "",
          username: data.username || "",
          avatarUrl: data.avatarUrl || localStorage.getItem("avatarUrl") || null,
          initials,
        });
      } catch (err) {
        console.error("Gagal memuat profil:", err);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const accountMenus = [
    { label: "Tiket Saya", path: "/customer/tickets", type: "ticket" },
    { label: "Transaksi", path: "/customer/history", type: "transaction" },
  ];

  const securityMenus = [
    { label: "Ubah Sandi", path: "/customer/change-password", type: "lock" },
    { label: "Refund", path: "/customer/refund", type: "refund" },
  ];

  const handleLogout = async () => {
    const result = await Swal.fire({
      icon: "question",
      title: "Keluar?",
      text: "Apakah kamu yakin ingin keluar?",
      showCancelButton: true,
      confirmButtonText: "Ya, Keluar",
      cancelButtonText: "Batal",
      confirmButtonColor: "#5548dc",
    });
    if (!result.isConfirmed) return;

    try {
      await logoutUser();
    } catch {
      // tetap lanjut logout lokal meski API gagal
    }
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("name");
    localStorage.removeItem("username");
    localStorage.removeItem("email");
    localStorage.removeItem("role");
    navigate("/");
  };

  return (
    <div className="profile-mobile-page">
      <NavbarCustomer />

      <main className="profile-mobile-container">
        <section className="profile-mobile-user-card">
          <div className="profile-mobile-avatar">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt="Foto Profil" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
            ) : (
              profile.initials
            )}
          </div>

          <h1>{profile.name}</h1>

          {profile.username && (
            <p style={{ fontSize: "0.85rem", color: "#5143e6", fontWeight: 500, margin: "2px 0 0" }}>
              @{profile.username}
            </p>
          )}

          <p>{profile.email}</p>

          <button
            className="profile-mobile-edit"
            onClick={() => navigate("/customer/profile/edit")}
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
          <button onClick={() => navigate("/customer/terms")}>
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

          <button onClick={() => navigate("/customer/privacy")}>
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
            onClick={handleLogout}
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
            <rect x="5" y="3" width="14" height="18" rx="2" />
            <path d="M8 7h8M8 11h8M8 15h5" />
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
