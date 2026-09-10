import React from "react";
import "./NavbarEO.css";

function NavbarEO() {
  return (
    <header className="navbar-eo">

      <div className="navbar-eo-title">
        <strong>Dashboard</strong>

        <span>
          Selamat Datang, EO
        </span>
      </div>

      <div className="navbar-eo-actions">

        <button
          type="button"
          className="navbar-eo-icon"
          onClick={() => console.log("Notifikasi")}
        >
          ♧
        </button>

        <button
          type="button"
          className="navbar-eo-icon"
          onClick={() => console.log("Pengaturan")}
        >
          ⚙
        </button>

        <div className="navbar-eo-avatar">
          E
        </div>

      </div>

    </header>
  );
}

export default NavbarEO;