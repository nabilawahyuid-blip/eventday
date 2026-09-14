import React from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DashboardAdmin.css";

function DashboardAdmin() {
  const navigate = useNavigate();

  // ======
  // VIEW ALL EVENT
  // ======

  const handleViewAll = () => {
    navigate("/event-management");
  };

  // ======
  // EVENT CLICK
  // ======

  const handleEventClick = (eventId) => {
    navigate(`/admin/event/${eventId}`);
  };

  // ======
  // TRANSACTION CLICK
  // ======

  const handleTransactionClick = (name) => {
    alert(`Transaksi ${name} dipilih`);
  };

  return (
    <div className="admin-dashboard">

      {/* ======
          SHARED COMPONENTS (SIDEBAR & NAVBAR)
      ====== */}
      <Sidebar />
      
      <div className="dashboard-wrapper" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Navbar />

        {/* =
            MAIN CONTENT
        = */}

        <main className="dashboard-main">

          <div className="dashboard-content">

            {/* =
                STATISTICS
            = */}

            <section className="stats-grid">

              {/* ======
                  EVENT AKTIF
              ====== */}

              <div className="stat-card">

                <div className="stat-card-header">

                  <span>
                    EVENT AKTIF
                  </span>

                  <div className="stat-icon blue">
                    📅
                  </div>

                </div>

                <h2>
                  5
                </h2>

                <p className="stat-positive">
                  Total event berjalan
                </p>

              </div>

              {/* ======
                  TOTAL USER
              ====== */}

              <div className="stat-card">

                <div className="stat-card-header">

                  <span>
                    TOTAL USER
                  </span>

                  <div className="stat-icon purple">
                    👥
                  </div>

                </div>

                <h2>
                  500
                </h2>

                <p className="stat-positive">
                  Pengguna terdaftar
                </p>

              </div>

              {/* ======
                  TOTAL PENDAPATAN
              ====== */}

              <div className="stat-card">

                <div className="stat-card-header">

                  <span>
                    TOTAL PENDAPATAN
                  </span>

                  <div className="stat-icon orange">
                    Rp
                  </div>

                </div>

                <h2>
                  Rp. 30.000.000
                </h2>

                <p className="stat-positive">
                  Akumulasi penjualan
                </p>

              </div>

            </section>

            {/* =
                LOWER CONTENT
            = */}

            <section className="dashboard-grid">

              {/* =
                  EVENT TERBARU
              = */}

              <div className="dashboard-card events-card">

                <div className="card-header">

                  <h3>
                    Event Terbaru
                  </h3>

                  <button
                    type="button"
                    className="view-all"
                    onClick={handleViewAll}
                  >
                    Lihat Semua
                  </button>

                </div>

                <div className="event-list">

                  {/* ======
                      EVENT 1
                  ====== */}

                  <button
                    type="button"
                    className="event-item"
                    onClick={() => handleEventClick(2)}
                  >

                    <div className="event-image">

                      <span>
                        J
                      </span>

                    </div>

                    <div className="event-info">

                      <h4>
                        Konser Musik Jakarta 2024
                      </h4>

                      <p>
                        📅 15 Agustus 2024 • 📍 ICE BSD, Tangerang
                      </p>

                    </div>

                    <div className="event-status published">
                      Aktif
                    </div>

                    <span className="event-more">
                      ⋮
                    </span>

                  </button>

                  {/* ======
                      EVENT 2
                  ====== */}

                  <button
                    type="button"
                    className="event-item"
                    onClick={() => handleEventClick(3)}
                  >

                    <div className="event-image event-image-light">

                      <span>
                        A
                      </span>

                    </div>

                    <div className="event-info">

                      <h4>
                        Tech Conference Indonesia
                      </h4>

                      <p>
                        📅 22 September 2024 • 📍 ICE BSD
                      </p>

                    </div>

                    <div className="event-status draft">
                      Draft
                    </div>

                    <span className="event-more">
                      ⋮
                    </span>

                  </button>

                  {/* ======
                      EVENT 3
                  ====== */}

                  <button
                    type="button"
                    className="event-item"
                    onClick={() => handleEventClick(4)}
                  >

                    <div className="event-image">

                      <span>
                        F
                      </span>

                    </div>

                    <div className="event-info">

                      <h4>
                        Festival Kuliner Nusantara
                      </h4>

                      <p>
                        📅 10 Oktober 2024 • 📍 GBK Senayan
                      </p>

                    </div>

                    <div className="event-status published">
                      Selesai
                    </div>

                    <span className="event-more">
                      ⋮
                    </span>

                  </button>

                </div>

              </div>

              {/* =
                  AKTIVITAS TRANSAKSI
              = */}

              <div className="dashboard-card transactions-card">

                <div className="card-header">

                  <h3>
                    Aktivitas Terbaru
                  </h3>

                </div>

                <div className="transaction-list">

                  {/* ======
                      TRANSACTION 1
                  ====== */}

                  <button
                    type="button"
                    className="transaction-item"
                    onClick={() =>
                      handleTransactionClick("Nama Customer 1")
                    }
                  >

                    <div className="transaction-avatar">
                      N1
                    </div>

                    <div className="transaction-info">

                      <p>

                        <strong>
                          Nama Customer 1
                        </strong>

                        <br />

                        Tiket Yang Dipesan

                        <br />

                        <strong>
                          TRANSAKSI TRX-9922
                        </strong>

                      </p>

                      <span>
                        2 mins ago
                      </span>

                    </div>

                    <strong className="transaction-price success-badge">
                      Lunas
                    </strong>

                  </button>

                  {/* ======
                      TRANSACTION 2
                  ====== */}

                  <button
                    type="button"
                    className="transaction-item"
                    onClick={() =>
                      handleTransactionClick("Nama Customer 2")
                    }
                  >

                    <div className="transaction-avatar">
                      N2
                    </div>

                    <div className="transaction-info">

                      <p>

                        <strong>
                          Nama Customer 2
                        </strong>

                        <br />

                        Tiket Yang Dipesan

                        <br />

                        <strong>
                          TRANSAKSI TRX-9923
                        </strong>

                      </p>

                      <span>
                        15 mins ago
                      </span>

                    </div>

                    <strong className="transaction-price pending-badge">
                      Menunggu
                    </strong>

                  </button>

                </div>

              </div>

            </section>

          </div>

        </main>

      </div>

    </div>
  );
}

export default DashboardAdmin;