import React from "react";
import { useNavigate } from "react-router-dom";
import "./StatusRegisterEO.css";

function StatusRegisterEO() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const handleDashboard = () => {
    navigate("/customer/dashboard");
  };

  return (
    <div className="status-eo-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <header className="status-eo-header">

        <button
          type="button"
          className="status-eo-back"
          onClick={handleBack}
          aria-label="Kembali"
        >
          <span>←</span>
        </button>

        <h1>Daftar EO</h1>

      </header>


      {/* =========================================
          MAIN CONTENT
      ========================================= */}

      <main className="status-eo-main">

        {/* =========================================
            BRAND
        ========================================= */}

        <div className="status-eo-brand">

          <div className="status-eo-logo">
            <span className="status-logo-event">
              EVENT
            </span>

            <span className="status-logo-day">
              DAY
            </span>
          </div>

          <div className="status-eo-subtitle">
            <span className="status-logo-event">
              EVENT
            </span>

            <span className="status-logo-organizer">
              {" "}ORGANIZER
            </span>
          </div>

        </div>


        {/* =========================================
            CARD
        ========================================= */}

        <section className="status-eo-card">

          {/* TITLE */}

          <h2>
            Informasi Event Organizer
          </h2>


          {/* =====================================
              STATUS ICON
          ===================================== */}

          <div className="status-eo-icon-wrapper">

            <div className="status-eo-icon-circle">

              <div className="status-eo-building">

                <div className="building-roof"></div>

                <div className="building-body">

                  <div className="building-column"></div>

                  <div className="building-column"></div>

                  <div className="building-column"></div>

                </div>

                <div className="building-base"></div>

              </div>

            </div>

            {/* STATUS DOT */}

            <div className="status-eo-dot"></div>

          </div>


          {/* =====================================
              STATUS BADGE
          ===================================== */}

          <div className="status-eo-badge">

            <span className="status-eo-badge-dot"></span>

            <span>
              Menunggu Persetujuan
            </span>

          </div>


          {/* =====================================
              STATUS TITLE
          ===================================== */}

          <h3>
            Permohonan Sedang Ditinjau
          </h3>


          {/* =====================================
              DESCRIPTION
          ===================================== */}

          <p className="status-eo-description">
            Terima kasih telah mendaftar sebagai Event
            Organizer di EVENTDAY. Tim kami sedang
            memverifikasi kelengkapan dokumen dan
            legalitas profil Anda.
          </p>


          {/* =====================================
              BUTTON
          ===================================== */}

          <button
            type="button"
            className="status-eo-dashboard-button"
            onClick={handleDashboard}
          >
            Kembali Ke Dashboard
          </button>

        </section>

      </main>

    </div>
  );
}

export default StatusRegisterEO;