import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="navbar">

      <div className="navbar-title">
        <h1>Dashboard</h1>

        <p>
          Selamat Datang, Admin
        </p>
      </div>


      <div className="navbar-actions">

        <button
          type="button"
          onClick={() => console.log("Notifikasi")}
        >
          ♧
        </button>


        <button
          type="button"
          onClick={() => console.log("Bantuan")}
        >
          ?
        </button>


        <div className="navbar-profile">
          A
        </div>

      </div>

    </header>
  );
}

export default Navbar;