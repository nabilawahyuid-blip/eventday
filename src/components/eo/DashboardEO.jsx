// src/components/eo/DashboardEO.jsx

import React, { useEffect, useState } from "react";

import {
  CalendarDays,
  Ticket,
  CircleDollarSign,
} from "lucide-react";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerDashboard,
  getOrganizerRecentEvents,
  getOrganizerRecentTransactions,
} from "../../services/organizerDashboardService";

import "./DashboardEO.css";

function DashboardEO() {
  // =====================================================
  // STATE DASHBOARD
  // =====================================================

  const [dashboard, setDashboard] = useState({
    active_events: 0,
    total_events: 0,
    total_revenue: 0,
    tickets_sold: 0,
  });

  // =====================================================
  // STATE EVENT
  // =====================================================

  const [events, setEvents] = useState([]);

  // =====================================================
  // STATE TRANSAKSI
  // =====================================================

  const [transactions, setTransactions] = useState([]);

  // =====================================================
  // STATE LOADING
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);
  const [transactionLoading] = useState(false);

  // =====================================================
  // STATE ERROR
  // =====================================================

  const [error, setError] = useState("");
  const [eventError, setEventError] = useState("");
  const [transactionError, setTransactionError] =
    useState("");

  // =====================================================
  // LOAD SEMUA DATA
  // =====================================================

  useEffect(() => {
    loadDashboard();
    loadRecentEvents();
    loadRecentTransactions();
  }, []);

  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getOrganizerDashboard();

      console.log(
        "DASHBOARD RESPONSE:",
        response
      );

      setDashboard(
        response?.data || {
          active_events: 0,
          total_events: 0,
          total_revenue: 0,
          tickets_sold: 0,
        }
      );
    } catch (error) {
      console.error(
        "Gagal mengambil dashboard:",
        error
      );

      setError(
        error?.message ||
          "Gagal mengambil data dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // LOAD EVENT TERBARU
  // =====================================================

  const loadRecentEvents = async () => {
    try {
      setEventLoading(true);
      setEventError("");

      const response =
        await getOrganizerRecentEvents();

      console.log(
        "RECENT EVENTS RESPONSE:",
        response
      );

      const eventData = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      setEvents(eventData);
    } catch (error) {
      console.error(
        "Gagal mengambil event terbaru:",
        error
      );

      setEventError(
        error?.message ||
          "Gagal mengambil event terbaru"
      );

      setEvents([]);
    } finally {
      setEventLoading(false);
    }
  };

  // =====================================================
  // LOAD TRANSAKSI TERBARU
  // =====================================================

  const loadRecentTransactions = async () => {
    try {
      setTransactionError("");

      const response =
        await getOrganizerRecentTransactions();

      console.log(
        "RECENT TRANSACTIONS RESPONSE:",
        response
      );

      const transactionData = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      setTransactions(transactionData);
    } catch (error) {
      console.error(
        "Gagal mengambil transaksi terbaru:",
        error
      );

      setTransactionError(
        error?.message ||
          "Gagal mengambil transaksi terbaru"
      );

      setTransactions([]);
    }
  };

  // =====================================================
  // FORMAT RUPIAH
  // =====================================================

  const formatRupiah = (number) => {
    return new Intl.NumberFormat(
      "id-ID"
    ).format(Number(number) || 0);
  };

  // =====================================================
  // FORMAT TANGGAL
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "-";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return dateString;
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // FORMAT STATUS EVENT
  // =====================================================

  const getEventStatus = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (normalized === "PUBLISHED") {
      return "Event Aktif";
    }

    if (normalized === "DRAFT") {
      return "Draft";
    }

    if (
      normalized === "ENDED" ||
      normalized === "FINISHED"
    ) {
      return "Event Berakhir";
    }

    if (status) {
      return status;
    }

    return "-";
  };

  // =====================================================
  // CLASS STATUS EVENT
  // =====================================================

  const getEventStatusClass = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (normalized === "PUBLISHED") {
      return "event-active";
    }

    return "event-ended";
  };

  // =====================================================
  // FORMAT STATUS TRANSAKSI
  // =====================================================

  const getTransactionStatus = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (
      normalized === "PAID" ||
      normalized === "SUCCESS" ||
      normalized === "SETTLEMENT"
    ) {
      return "Lunas";
    }

    if (
      normalized === "PENDING" ||
      normalized === "WAITING_PAYMENT"
    ) {
      return "Menunggu";
    }

    if (
      normalized === "CANCELLED" ||
      normalized === "CANCELED" ||
      normalized === "FAILED"
    ) {
      return "Dibatalkan";
    }

    return status || "-";
  };

  // =====================================================
  // CLASS STATUS TRANSAKSI
  // =====================================================

  const getTransactionStatusClass = (status) => {
    const normalized =
      String(status || "").toUpperCase();

    if (
      normalized === "PAID" ||
      normalized === "SUCCESS" ||
      normalized === "SETTLEMENT"
    ) {
      return "status-paid";
    }

    if (
      normalized === "PENDING" ||
      normalized === "WAITING_PAYMENT"
    ) {
      return "status-waiting";
    }

    return "status-cancelled";
  };

  // =====================================================
  // RENDER
  // =====================================================

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
              ERROR DASHBOARD
          ===================================================== */}

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

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
                    {loading
                      ? "..."
                      : dashboard?.active_events ?? 0}
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
                    {loading
                      ? "..."
                      : dashboard?.tickets_sold ?? 0}
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

                    {loading
                      ? "..."
                      : `Rp. ${formatRupiah(
                          dashboard?.total_revenue
                        )}`}

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

            {/* =================================================
                ERROR EVENT
            ================================================= */}

            {eventError && (
              <div className="dashboard-error">
                {eventError}
              </div>
            )}

            <div className="event-list">

              {/* =================================================
                  LOADING EVENT
              ================================================= */}

              {eventLoading ? (

                <div className="dashboard-empty-state">
                  Memuat event...
                </div>

              ) : events.length === 0 ? (

                /* =================================================
                    EMPTY EVENT
                ================================================= */

                <div className="dashboard-empty-state">
                  Belum ada event terbaru.
                </div>

              ) : (

                /* =================================================
                    EVENT DATA
                ================================================= */

                events.map((event) => {

                  const eventStatus =
                    getEventStatus(
                      event?.status
                    );

                  return (
                    <div
                      className="event-dashboard-card"
                      key={event?.event_id}
                    >

                      {/* =============================================
                          EVENT HEADER
                      ============================================= */}

                      <div className="event-card-top">

                        <div className="event-card-info">

                          <h3>
                            {event?.title ||
                              "Tanpa Judul Event"}
                          </h3>

                          <div className="event-meta">

                            <span>

                              <CalendarDays
                                size={12}
                                strokeWidth={1.8}
                              />

                              {formatDate(
                                event?.start_date
                              )}

                            </span>

                            <span className="meta-dot">
                              •
                            </span>

                            <span>
                              {event?.venue_name ||
                                "Lokasi belum tersedia"}
                            </span>

                          </div>

                        </div>

                        {/* =========================================
                            EVENT STATUS
                        ========================================= */}

                        <span
                          className={`event-status ${getEventStatusClass(
                            event?.status
                          )}`}
                        >
                          {eventStatus}
                        </span>

                      </div>

                      {/* =============================================
                          PROGRESS
                      ============================================= */}

                      <div className="event-progress-section">

                        <div className="event-progress-info">

                          <span>
                            Data penjualan
                          </span>

                          <span>
                            -
                          </span>

                        </div>

                        <div className="event-progress-bar">

                          <div
                            className={`event-progress-fill ${getEventStatusClass(
                              event?.status
                            ) === "event-active"
                              ? "progress-active"
                              : "progress-ended"
                            }`}
                            style={{
                              width: "0%",
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
                  );
                })
              )}

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

            {/* =================================================
                ERROR TRANSAKSI
            ================================================= */}

            {transactionError && (
              <div className="dashboard-error">
                {transactionError}
              </div>
            )}

            <div className="transaction-list">

              {/* =================================================
                  LOADING TRANSAKSI
              ================================================= */}

              {transactionLoading ? (

                <div className="dashboard-empty-state">
                  Memuat transaksi...
                </div>

              ) : transactions.length === 0 ? (

                /* =================================================
                    EMPTY TRANSAKSI
                ================================================= */

                <div className="dashboard-empty-state">
                  Belum ada transaksi terbaru.
                </div>

              ) : (

                /* =================================================
                    TRANSACTION DATA
                ================================================= */

                transactions.map((transaction) => {

                  const transactionStatus =
                    getTransactionStatus(
                      transaction?.status
                    );

                  return (
                    <div
                      className="transaction-card"
                      key={transaction?.order_id}
                    >

                      {/* =============================================
                          INFORMASI TRANSAKSI
                      ============================================= */}

                      <div className="transaction-info">

                        <h3>
                          {transaction?.event_title ||
                            "Event"}
                        </h3>

                        <p>
                          {transaction?.amount != null
                            ? `Rp. ${formatRupiah(
                                transaction.amount
                              )}`
                            : "Nominal tidak tersedia"}
                        </p>

                        <strong>
                          ID TRANSAKSI:{" "}
                          {transaction?.order_id ||
                            "-"}
                        </strong>

                      </div>

                      {/* =============================================
                          STATUS & ACTION
                      ============================================= */}

                      <div className="transaction-actions">

                        <span
                          className={`transaction-status ${getTransactionStatusClass(
                            transaction?.status
                          )}`}
                        >

                          <span className="transaction-dot"></span>

                          {transactionStatus}

                        </span>

                        <button
                          type="button"
                          className="detail-transaction-button"
                        >
                          Detail Transaksi
                        </button>

                      </div>

                    </div>
                  );
                })
              )}

            </div>

          </section>

        </div>

      </main>

    </div>
  );
}

export default DashboardEO;