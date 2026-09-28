import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

const ADMIN_SEARCH_INDEX = [
  { label: "Dashboard", keywords: "dashboard beranda home", path: "/admin/dashboard" },
  { label: "Event Management", keywords: "event acara kelola", path: "/event-management" },
  { label: "User Management", keywords: "user pengguna", path: "/admin/users" },
  { label: "Pengajuan Akun EO", keywords: "pengajuan eo organizer", path: "/admin/pengajuan-eo" },
  { label: "Transaksi", keywords: "transaksi pembayaran order", path: "/admin/transaksi" },
  { label: "Tiket", keywords: "tiket ticket", path: "/admin/tiket" },
  { label: "Audit Log", keywords: "audit log aktivitas", path: "/admin/audit-log" },
  { label: "Pengajuan Payout", keywords: "payout pencairan dana", path: "/admin/pengajuan-payout" },
  { label: "Pengaturan Platform", keywords: "pengaturan setting platform", path: "/admin/pengaturan" },
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const getPageInfo = () => {
    switch (true) {
      case location.pathname.startsWith("/admin/dashboard"):
        return { 
          title: "Dashboard", 
          subtitle: "Selamat Datang, Admin" 
        };
      case location.pathname.startsWith("/event-management") || location.pathname.startsWith("/admin/event"):
        return { 
          title: "Event Management", 
          subtitle: "Kelola dan pantau seluruh event yang tersedia" 
        };
      case location.pathname.startsWith("/admin/users"):
        return { 
          title: "User Management", 
          subtitle: "Manage platform users, event organizers, and system administrators." 
        };
      case location.pathname.startsWith("/admin/pengajuan-eo"):
        return { 
          title: "Pengajuan Akun EO", 
          subtitle: "Verifikasi dan kelola pengajuan akun event organizer" 
        };
      case location.pathname.startsWith("/admin/transaksi"):
        return { 
          title: "Transaksi", 
          subtitle: "Pantau seluruh transaksi dan pembayaran platform" 
        };
      case location.pathname.startsWith("/admin/tiket"):
        return { 
          title: "Tiket", 
          subtitle: "Kelola data tiket dan informasi pemesanan" 
        };
      default:
        return { 
          title: "Admin Portal", 
          subtitle: "Selamat Datang, Admin" 
        };
    }
  };

  const { title, subtitle } = getPageInfo();

  const toggleSidebar = () => {
    window.dispatchEvent(
      new CustomEvent("admin-sidebar:toggle")
    );
  };

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return ADMIN_SEARCH_INDEX.filter((item) =>
      `${item.label} ${item.keywords}`.toLowerCase().includes(q)
    ).slice(0, 6);
  }, [query]);

  const goSearch = (path) => {
    setQuery("");
    setFocused(false);
    setSearchOpen(false);
    navigate(path);
  };

  const renderSearchBox = (id, autoFocus) => (
    <div className="navbar-search">
      <span className="navbar-search-icon">⌕</span>
      <input
        id={id}
        type="text"
        className="navbar-search-input"
        placeholder="Cari menu admin..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)}
        autoFocus={autoFocus}
        onKeyDown={(e) => {
          if (e.key === "Enter" && results.length > 0) {
            goSearch(results[0].path);
          }
          if (e.key === "Escape") {
            setQuery("");
            setSearchOpen(false);
          }
        }}
      />
      {focused && query.trim() && (
        <div className="navbar-search-dropdown">
          {results.length === 0 ? (
            <div className="navbar-search-empty">
              Menu tidak ditemukan
            </div>
          ) : (
            results.map((item) => (
              <button
                key={item.path}
                type="button"
                className="navbar-search-item"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => goSearch(item.path)}
              >
                {item.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );

  return (
    <header className="navbar">
      {/* BAGIAN KIRI: Hamburger (mobile) + Logo aplikasi + Judul halaman */}
      <div className="navbar-left">
        <button
          type="button"
          className="navbar-hamburger"
          onClick={toggleSidebar}
          aria-label="Buka menu navigasi"
        >
          <span />
          <span />
          <span />
        </button>

        <div className="navbar-brand" title="Eventday">
          EVENT<span>DAY</span>
        </div>

        <div className="navbar-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>

      {/* BAGIAN KANAN: Search + Notifikasi, Bantuan, dan Profil Admin */}
      <div className="navbar-actions">
        <button
          type="button"
          className="navbar-search-toggle"
          onClick={() => setSearchOpen((v) => !v)}
          aria-label="Cari menu admin"
          title="Cari"
        >
          ⌕
        </button>

        <div className="navbar-search-desktop">
          {renderSearchBox("admin-search-desktop", false)}
        </div>

        <button
          type="button"
          className="navbar-btn-icon"
          onClick={() => console.log("Notifikasi")}
          title="Notifikasi"
        >
          🔔
        </button>

        <button
          type="button"
          className="navbar-btn-icon navbar-help"
          onClick={() => console.log("Bantuan")}
          title="Bantuan"
        >
          ?
        </button>

        <div className="navbar-profile-avatar">
          A
        </div>
      </div>

      {/* BARIS SEARCH KHUSUS MOBILE (collapsible) */}
      {searchOpen && (
        <div className="navbar-search-mobile">
          {renderSearchBox("admin-search-mobile", true)}
        </div>
      )}
    </header>
  );
}

export default Navbar;