import React from "react";
import { useNavigate } from "react-router-dom";
import "./NavbarEO.css";

function NavbarEO() {
  const navigate = useNavigate();

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
          className="navbar-eo-avatar"
          onClick={() => navigate("/eo/profil")}
        >
          E
        </button>
      </div>
    </header>
  );
}

export default NavbarEO;