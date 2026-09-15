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
                  AKTIVITAS TRANSAKSI (DISAMAKAN UKURAN & STRUKTUR DENGAN EVENT)
              = */}

              <div className="dashboard-card transactions-card">

                <div className="card-header">
                  <h3>Aktivitas Terbaru</h3>
                </div>

                <div className="transaction-list">

                  {/* TRANSACTION 1 */}
                  <button
                    type="button"
                    className="transaction-item"
                    onClick={() => handleTransactionClick("Nama Customer 1")}
                  >
                    <div className="event-image">
                      <span>N1</span>
                    </div>

                    <div className="event-info">
                      <h4>Nama Customer 1</h4>
                      <div className="transaction-text-wrapper">
                        <p className="trx-desc">🎫 Tiket Yang Dipesan</p>
                        <p className="trx-code">TRX-9922</p>
                      </div>
                    </div>

                    <div className="event-status published">
                      Lunas
                    </div>

                    <span className="event-more">
                      ⋮
                    </span>
                  </button>

                  {/* TRANSACTION 2 */}
                  <button
                    type="button"
                    className="transaction-item"
                    onClick={() => handleTransactionClick("Nama Customer 2")}
                  >
                    <div className="event-image">
                      <span>N2</span>
                    </div>

                    <div className="event-info">
                      <h4>Nama Customer 2</h4>
                      <div className="transaction-text-wrapper">
                        <p className="trx-desc">🎫 Tiket Yang Dipesan</p>
                        <p className="trx-code">TRX-9923</p>
                      </div>
                    </div>

                    <div className="event-status draft">
                      Menunggu
                    </div>

                    <span className="event-more">
                      ⋮
                    </span>
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