import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";
import "./DashboardEO.css";

function DashboardEO() {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    eventAktif: 5,
    tiketTerjual: 500,
    reschedule: 7,
    eventTerbaru: [
      {
        id: 1,
        title: "Music Festival 2024",
        date: "25 Nov 2024",
        location: "Stadion Utama",
        sold: 200,
        total: 400,
        progress: 50,
        status: "Event Aktif",
        statusClass: "active",
      },
      {
        id: 2,
        title: "Workshop Fotografi",
        date: "01 Okt 2024",
        location: "Creative Space",
        sold: 300,
        total: 400,
        progress: 75,
        status: "Event Berakhir",
        statusClass: "finished",
      },
    ],
    transaksiTerbaru: [
      {
        id: "TRX-982734",
        customer: "Budi Santoso",
        ticket: "VIP",
        event: "Music Festival",
        amount: "Rp 1.500.000",
        status: "Lunas",
      },
      {
        id: "TRX-776218",
        customer: "Andi Wijaya",
        ticket: "Regular",
        event: "Workshop Fotografi",
        amount: "Rp 250.000",
        status: "Lunas",
      },
    ],
  });

  // TODO: Ganti dummy dengan fetch real saat endpoint EO ready.
  // Saat ini modul EO masih SCHEMA ONLY (API.md).
  // Contoh fetch nanti:
  // fetch("http://localhost:8082/api/eo/dashboard", {
  //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
  // })

  const handleDetailEvent = (eventId) => {
    navigate(`/eo/event/${eventId}`);
  };

  const handleDetailTransaction = (transactionId) => {
    navigate(`/eo/transaksi/${transactionId}`);
  };

  const handleViewAllEvents = () => {
    navigate("/eo/event");
  };

  const handleViewAllTransactions = () => {
    navigate("/eo/transaksi");
  };

  return (
    <div className="dashboard-eo-page">

      {/* 
          SIDEBAR EO
      = */}
      <SidebarEO />

      {/* 
          MAIN CONTENT
      = */}
      <main className="dashboard-eo-main">

        {/* 
            NAVBAR EO
        = */}
        <NavbarEO />

        {/* 
            CONTENT
        = */}
        <section className="dashboard-eo-content">

          {/* 
              PAGE HEADER
          = */}
          <div className="dashboard-eo-header">

            <div>
              <h1>Dashboard</h1>

              <p>
                Selamat Datang, EO
              </p>
            </div>

          </div>

          {/* 
              RINGKASAN AKTIVITAS
          = */}
          <div className="dashboard-eo-section-title">
            <h2>Ringkasan Aktivitas</h2>
          </div>

          <div className="eo-stat-grid">

            {/* EVENT AKTIF */}
            <div className="eo-stat-card">

              <div className="eo-stat-left">

                <span className="eo-stat-label">
                  EVENT AKTIF
                </span>

                <div className="eo-stat-number-row">

                  <h3>
                    {dashboardData.eventAktif}
                  </h3>

                  <span className="eo-stat-growth green">
                    ↗ +2%
                  </span>

                </div>

              </div>

              <div className="eo-stat-icon purple">
                ▣
              </div>

              <div className="eo-stat-decoration purple-decoration"></div>

            </div>

            {/* TIKET TERJUAL */}
            <div className="eo-stat-card">

              <div className="eo-stat-left">

                <span className="eo-stat-label">
                  TIKET TERJUAL
                </span>

                <div className="eo-stat-number-row">

                  <h3>
                    {dashboardData.tiketTerjual}
                  </h3>

                  <span className="eo-stat-growth green">
                    ↗ +15%
                  </span>

                </div>

              </div>

              <div className="eo-stat-icon green">
                🎟
              </div>

              <div className="eo-stat-decoration green-decoration"></div>

            </div>

            {/* RESCHEDULE */}
            <div className="eo-stat-card">

              <div className="eo-stat-left">

                <span className="eo-stat-label">
                  RESCHEDULE
                </span>

                <div className="eo-stat-number-row">

                  <h3>
                    {dashboardData.reschedule}
                  </h3>

                  <span className="eo-stat-growth gray">
                    ↔ 0%
                  </span>

                </div>

              </div>

              <div className="eo-stat-icon orange">
                ◷
              </div>

              <div className="eo-stat-decoration orange-decoration"></div>

            </div>

          </div>

          {/* 
              LOWER GRID
          = */}
          <div className="dashboard-eo-lower-grid">

            {/* 
                EVENT TERBARU
            = */}
            <div className="eo-panel">

              <div className="eo-panel-header">

                <h2>
                  Event Terbaru
                </h2>

                <button
                  type="button"
                  className="eo-view-all"
                  onClick={handleViewAllEvents}
                >
                  Lihat Semua
                </button>

              </div>

              <div className="eo-event-list">

                {dashboardData.eventTerbaru.map((event) => (

                  <div
                    className="eo-event-card"
                    key={event.id}
                  >

                    <div className="eo-event-top">

                      <div className="eo-event-info">

                        <h3>
                          {event.title}
                        </h3>

                        <p>
                          {event.date} • {event.location}
                        </p>

                      </div>

                      <span
                        className={`eo-event-status ${event.statusClass}`}
                      >
                        {event.status}
                      </span>

                    </div>

                    {/* TICKET PROGRESS */}
                    <div className="eo-event-progress-info">

                      <span>
                        {event.sold}/{event.total} Tiket Terjual
                      </span>

                      <span>
                        {event.progress}%
                      </span>

                    </div>

                    <div className="eo-event-progress">

                      <div
                        className="eo-event-progress-fill"
                        style={{
                          width: `${event.progress}%`,
                        }}
                      ></div>

                    </div>

                    {/* DETAIL BUTTON */}
                    <div className="eo-event-bottom">

                      <button
                        type="button"
                        className="eo-detail-button"
                        onClick={() =>
                          handleDetailEvent(event.id)
                        }
                      >
                        Detail Event
                      </button>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* 
                TRANSAKSI TERBARU
            = */}
            <div className="eo-panel">

              <div className="eo-panel-header">

                <h2>
                  Transaksi Terbaru
                </h2>

                <button
                  type="button"
                  className="eo-view-all"
                  onClick={handleViewAllTransactions}
                >
                  Lihat Semua
                </button>

              </div>

              <div className="eo-transaction-list">

                {dashboardData.transaksiTerbaru.map(
                  (transaction, index) => (

                    <div
                      className="eo-transaction-card"
                      key={transaction.id}
                    >

                      {/* AVATAR */}
                      <div className="eo-transaction-avatar">
                        {transaction.customer
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      {/* INFO */}
                      <div className="eo-transaction-info">

                        <h3>
                          {transaction.customer}
                        </h3>

                        <p>
                          {transaction.ticket} •{" "}
                          {transaction.event}
                        </p>

                        <span>
                          {transaction.id}
                        </span>

                      </div>

                      {/* RIGHT */}
                      <div className="eo-transaction-right">

                        <span className="eo-paid-badge">
                          {transaction.status}
                        </span>

                        <strong>
                          {transaction.amount}
                        </strong>

                        <button
                          type="button"
                          className="eo-transaction-detail"
                          onClick={() =>
                            handleDetailTransaction(
                              transaction.id
                            )
                          }
                        >
                          Detail →
                        </button>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default DashboardEO;