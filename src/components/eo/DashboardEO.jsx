import React from "react";

import {
  CalendarDays,
  Ticket,
  CircleDollarSign,
  Receipt,
  ArrowRight,
  Wallet,
} from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import "./DashboardEO.css";

function DashboardEO() {
  // =====================================================
  // DATA EVENT
  // =====================================================

  const events = [
    {
      id: 1,
      title: "Music Festival 2024",
      date: "15 Nov 2024",
      location: "Stadion Utama",
      sold: 200,
      total: 400,
      percentage: 50,
      status: "Event Aktif",
    },
    {
      id: 2,
      title: "Workshop Fotografi",
      date: "01 Okt 2024",
      location: "Creative Space",
      sold: 300,
      total: 400,
      percentage: 75,
      status: "Event Berakhir",
    },
  ];

  // =====================================================
  // DATA TRANSAKSI
  // =====================================================

  const transactions = [
    {
      id: 1,
      customer: "Nama Customer",
      ticket: "Tiket Yang Dipesan",
      transactionId: "TRX-9921",
      status: "Lunas",
    },
    {
      id: 2,
      customer: "Nama Customer 2",
      ticket: "Tiket Yang Dipesan",
      transactionId: "TRX-9923",
      status: "Menunggu",
    },
  ];

  return (
    <div className="dashboard-eo-page">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <SidebarEO />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className="dashboard-eo-main">

        {/* =====================================================
            NAVBAR
        ===================================================== */}

        <NavbarEO />


        {/* =====================================================
            CONTENT
        ===================================================== */}

        <div className="dashboard-eo-content">

          {/* =====================================================
              PAGE TITLE
          ===================================================== */}

          <div className="dashboard-page-header">
            <h1>Dashboard</h1>
          </div>


          {/* =====================================================
              RINGKASAN AKTIVITAS
          ===================================================== */}

          <section className="dashboard-section">

            <div className="dashboard-section-header">
              <h2>Ringkasan Aktivitas</h2>
            </div>


            <div className="summary-cards">

              {/* =================================================
                  EVENT AKTIF
              ================================================= */}

              <div className="summary-card summary-event">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    EVENT AKTIF
                  </span>

                  <strong className="summary-card-value">
                    5
                  </strong>

                </div>


                <div className="summary-icon summary-icon-purple">
                  <CalendarDays
                    size={17}
                    strokeWidth={2}
                  />
                </div>


                <div className="summary-decoration purple-decoration"></div>

              </div>


              {/* =================================================
                  TIKET TERJUAL
              ================================================= */}

              <div className="summary-card summary-ticket">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    TIKET TERJUAL
                  </span>

                  <strong className="summary-card-value">
                    500
                  </strong>

                </div>


                <div className="summary-icon summary-icon-green">
                  <Ticket
                    size={17}
                    strokeWidth={2}
                  />
                </div>


                <div className="summary-decoration green-decoration"></div>

              </div>


              {/* =================================================
                  PENDAPATAN BERSIH
              ================================================= */}

              <div className="summary-card summary-income">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    PENDAPATAN BERSIH
                  </span>

                  <strong className="summary-card-value income-value">
                    Rp. 30.000.000
                  </strong>

                </div>


                <div className="summary-icon summary-icon-orange">
                  <CircleDollarSign
                    size={17}
                    strokeWidth={2}
                  />
                </div>


                <div className="summary-decoration orange-decoration"></div>

              </div>

            </div>

          </section>


          {/* =====================================================
              EVENT TERBARU
          ===================================================== */}

          <section className="dashboard-section recent-event-section">

            <div className="dashboard-section-title-row">

              <h2>Event Terbaru</h2>

              <button
                type="button"
                className="see-all-button"
              >
                Lihat Semua
              </button>

            </div>


            <div className="event-list">

              {events.map((event) => (

                <div
                  className="event-dashboard-card"
                  key={event.id}
                >

                  {/* =============================================
                      EVENT HEADER
                  ============================================= */}

                  <div className="event-card-top">

                    <div className="event-card-info">

                      <h3>
                        {event.title}
                      </h3>


                      <div className="event-meta">

                        <span>

                          <CalendarDays
                            size={12}
                            strokeWidth={1.8}
                          />

                          {event.date}

                        </span>


                        <span className="meta-dot">
                          •
                        </span>


                        <span>
                          {event.location}
                        </span>

                      </div>

                    </div>


                    {/* =========================================
                        EVENT STATUS
                    ========================================= */}

                    <span
                      className={`event-status ${
                        event.status === "Event Aktif"
                          ? "event-active"
                          : "event-ended"
                      }`}
                    >
                      {event.status}
                    </span>

                  </div>


                  {/* =============================================
                      PROGRESS
                  ============================================= */}

                  <div className="event-progress-section">

                    <div className="event-progress-info">

                      <span>
                        {event.sold}/{event.total} Tiket Terjual
                      </span>

                      <span>
                        {event.percentage}%
                      </span>

                    </div>


                    <div className="event-progress-bar">

                      <div
                        className={`event-progress-fill ${
                          event.status === "Event Aktif"
                            ? "progress-active"
                            : "progress-ended"
                        }`}
                        style={{
                          width: `${event.percentage}%`,
                        }}
                      ></div>

                    </div>

                  </div>


                  {/* =============================================
                      BUTTON
                  ============================================= */}

                  <div className="event-card-bottom">

                    <button
                      type="button"
                      className="detail-event-button"
                    >
                      Detail Event
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>


          {/* =====================================================
              TRANSAKSI TERBARU
          ===================================================== */}

          <section className="dashboard-section transaction-section">

            <div className="dashboard-section-title-row">

              <h2>Transaksi Terbaru</h2>

              <button
                type="button"
                className="see-all-button"
              >
                Lihat Semua
              </button>

            </div>


            <div className="transaction-list">

              {transactions.map((transaction) => (

                <div
                  className="transaction-card"
                  key={transaction.id}
                >

                  {/* =============================================
                      INFORMASI TRANSAKSI
                  ============================================= */}

                  <div className="transaction-info">

                    <h3>
                      {transaction.customer}
                    </h3>


                    <p>
                      {transaction.ticket}
                    </p>


                    <strong>
                      ID TRANSAKSI: {transaction.transactionId}
                    </strong>

                  </div>


                  {/* =============================================
                      STATUS & ACTION
                  ============================================= */}

                  <div className="transaction-actions">

                    <span
                      className={`transaction-status ${
                        transaction.status === "Lunas"
                          ? "status-paid"
                          : transaction.status === "Menunggu"
                          ? "status-waiting"
                          : "status-cancelled"
                      }`}
                    >

                      <span className="transaction-dot"></span>

                      {transaction.status}

                    </span>


                    <button
                      type="button"
                      className="detail-transaction-button"
                    >
                      Detail Transaksi
                    </button>

                  </div>

                </div>

              ))}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default DashboardEO;