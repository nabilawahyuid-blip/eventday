import React from "react";
import { useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

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

  return (
    <header className="navbar">
      {/* BAGIAN KIRI: Judul dan Subtitle (Dinamis Berdasarkan Halaman) */}
      <div className="navbar-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>

      {/* BAGIAN KANAN: Tombol Notifikasi, Bantuan, dan Profil Admin */}
      <div className="navbar-actions">
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
          className="navbar-btn-icon"
          onClick={() => console.log("Bantuan")}
          title="Bantuan"
        >
          ?
        </button>

        <div className="navbar-profile-avatar">
          A
        </div>
      </div>
    </header>
  );
}

export default Navbar;