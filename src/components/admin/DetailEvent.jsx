import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminEventDetail,
  getAdminEventSales,
  deleteAdminEvent,
  updateAdminEventStatus,
} from "../../services/adminEventService";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import {
  getPublicEventDetail,
  getOrganizerEventSalesSummary,
} from "../../services/organizerEventService";

import "./DetailEvent.css";

function DetailEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================

  const [event, setEvent] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [salesLoading, setSalesLoading] = useState(false);

  const [error, setError] = useState("");

  // =====================================================
  // LOAD EVENT DETAIL
  // =====================================================

  useEffect(() => {
    const loadEvent = async () => {
      try {
        setLoading(true);
        setError("");

        if (!id) {
          throw new Error(
            "ID event tidak ditemukan."
          );
        }

        console.log(
          "GET EVENT DETAIL:",
          id
        );

        const response =
          await getPublicEventDetail(id);

        console.log(
          "EVENT DETAIL RESPONSE:",
          response
        );

        /*
         * Kemungkinan struktur response:
         *
         * {
         *   success: true,
         *   data: {
         *      event_id: "...",
         *      title: "...",
         *      ...
         *   }
         * }
         *
         * atau:
         *
         * {
         *   data: {...}
         * }
         */

        const eventData =
          response?.data?.data ||
          response?.data ||
          response;

        if (!eventData) {
          throw new Error(
            "Data event tidak ditemukan."
          );
        }

        setEvent(eventData);
      } catch (err) {
        console.error(
          "Gagal mengambil detail event:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil detail event."
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [id]);

  // =====================================================
  // LOAD SALES SUMMARY
  // =====================================================

  useEffect(() => {
    const loadSalesSummary = async () => {
      if (!event) {
        return;
      }

      const eventId =
        event.event_id ||
        event.eventId ||
        event.id;

      if (!eventId) {
        return;
      }

      try {
        setSalesLoading(true);

        const response =
          await getOrganizerEventSalesSummary(
            eventId
          );

        console.log(
          "SALES SUMMARY RESPONSE:",
          response
        );

        const summary =
          response?.data?.data ||
          response?.data ||
          response;

        setSalesSummary(summary);
      } catch (err) {
        /*
         * Sales summary bukan alasan
         * untuk menggagalkan halaman detail.
         *
         * Jadi kalau endpoint sales summary
         * gagal, halaman event tetap ditampilkan.
         */

        console.warn(
          "Sales summary tidak tersedia:",
          err
        );

        setSalesSummary(null);
      } finally {
        setSalesLoading(false);
      }
    };

    loadSalesSummary();
  }, [event]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return value;
      }

      return new Intl.DateTimeFormat(
        "id-ID",
        {
          day: "2-digit",
          month: "long",
          year: "numeric",
        }
      ).format(date);
    } catch {
      return value;
    }
  };

  // =====================================================
  // FORMAT DATE RANGE
  // =====================================================

  const formatDateRange = (
    startDate,
    endDate
  ) => {
    if (!startDate) {
      return "-";
    }

    const start = new Date(startDate);

    if (Number.isNaN(start.getTime())) {
      return startDate;
    }

    if (!endDate) {
      return formatDate(startDate);
    }

    const end = new Date(endDate);

    if (Number.isNaN(end.getTime())) {
      return formatDate(startDate);
    }

    const sameDay =
      start.toDateString() ===
      end.toDateString();

    if (sameDay) {
      return formatDate(startDate);
    }

    return `${formatDate(
      startDate
    )} - ${formatDate(endDate)}`;
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatTime = (value) => {
    if (!value) {
      return "-";
    }

    try {
      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return "-";
      }

      return new Intl.DateTimeFormat(
        "id-ID",
        {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }
      ).format(date) + " WIB";
    } catch {
      return "-";
    }
  };

  // =====================================================
  // FORMAT TIME RANGE
  // =====================================================

  const formatTimeRange = (
    startDate,
    endDate
  ) => {
    if (!startDate) {
      return "-";
    }

    if (!endDate) {
      return formatTime(startDate);
    }

    return `${formatTime(
      startDate
    )} - ${formatTime(endDate)}`;
  };

  // =====================================================
  // FORMAT CURRENCY
  // =====================================================

  const formatCurrency = (value) => {
    const number = Number(value);

    if (Number.isNaN(number)) {
      return "Rp 0";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(number);
  };

  // =====================================================
  // BANNER URL
  // =====================================================

  const getBannerUrl = (bannerUrl) => {
    if (!bannerUrl) {
      return null;
    }

    /*
     * Kalau backend mengembalikan URL lengkap:
     *
     * https://domain.com/uploads/banner.jpg
     *
     * langsung digunakan.
     */

    if (
      bannerUrl.startsWith("http://") ||
      bannerUrl.startsWith("https://")
    ) {
      return bannerUrl;
    }

    /*
     * Kalau backend mengembalikan:
     *
     * /uploads/banner.jpg
     *
     * atau:
     *
     * uploads/banner.jpg
     *
     * kita gunakan origin dari API.
     */

    const apiUrl = (
      import.meta.env.VITE_NGROK_URL ||
      ""
    ).replace(/\/$/, "");

    if (bannerUrl.startsWith("/")) {
      return `${apiUrl}${bannerUrl}`;
    }

    return `${apiUrl}/${bannerUrl}`;
  };

  // =====================================================
  // GET EVENT VALUES
  // =====================================================

  const eventId =
    event?.event_id ||
    event?.eventId ||
    event?.id ||
    id;

  const title =
    event?.title ||
    "Untitled Event";

  const category =
    event?.category ||
    "Event";

  const description =
    event?.description ||
    "Belum ada deskripsi event.";

  const location =
    event?.venue_name ||
    event?.venueName ||
    event?.location ||
    "Lokasi belum tersedia";

  const startDate =
    event?.start_date ||
    event?.startDate;

  const endDate =
    event?.end_date ||
    event?.endDate;

  const status =
    event?.status ||
    "UNKNOWN";

  const organizer =
    event?.organizer_name ||
    event?.organizerName ||
    event?.organizer?.name ||
    event?.organizer ||
    "-";

  const bannerUrl = getBannerUrl(
    event?.banner_url ||
      event?.bannerUrl
  );

  // =====================================================
  // TICKET DATA
  // =====================================================

  const ticketTiers =
    event?.tickets ||
    event?.ticket_tiers ||
    event?.ticketTiers ||
    [];

  // =====================================================
  // SALES DATA
  // =====================================================

  const ticketsSold = Number(
    salesSummary?.total_tickets_sold ??
      salesSummary?.tickets_sold ??
      salesSummary?.ticketsSold ??
      0
  );

  const totalTicketsFromSummary =
    Number(
      salesSummary?.total_quota ??
        salesSummary?.totalTickets ??
        0
    );

  const totalTicketsFromTiers =
    ticketTiers.reduce(
      (total, ticket) =>
        total +
        Number(
          ticket?.total_quota ??
            ticket?.totalQuota ??
            ticket?.quota ??
            0
        ),
      0
    );

  const totalTickets =
    totalTicketsFromSummary ||
    totalTicketsFromTiers ||
    Number(
      event?.total_quota ||
        event?.totalQuota ||
        0
    );

  // =====================================================
  // PERCENTAGE
  // =====================================================

  const percentage = useMemo(() => {
    if (!totalTickets) {
      return 0;
    }

    const result =
      (ticketsSold / totalTickets) * 100;

    return Math.min(
      Math.max(result, 0),
      100
    );
  }, [
    ticketsSold,
    totalTickets,
  ]);

  // =====================================================
  // STATUS
  // =====================================================

  const normalizedStatus =
    String(status).toUpperCase();

  const isDraft =
    normalizedStatus === "DRAFT";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="detail-event-page">
        <Sidebar />

        <main className="detail-main">
          <Navbar />

          <section className="detail-content">
            <div className="detail-loading">
              <div className="loading-spinner">
                ⟳
              </div>

              <p>
                Memuat detail event...
              </p>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // =====================================================
  // ERROR
  // =====================================================

  if (error || !event) {
    return (
      <div className="detail-event-page">
        <Sidebar />

        <main className="detail-main">
          <Navbar />

          <section className="detail-content">
            <div className="detail-error">
              <h2>
                Gagal Memuat Event
              </h2>

              <p>
                {error ||
                  "Data event tidak ditemukan."}
              </p>

              <button
                type="button"
                className="back-button"
                onClick={() =>
                  navigate(
                    "/event-management"
                  )
                }
              >
                ← KEMBALI
              </button>
            </div>
          </section>
        </main>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="detail-event-page">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />

      {/* =================================================
          MAIN
      ================================================= */}

      <main className="detail-main">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <Navbar />

        {/* =================================================
            CONTENT
        ================================================= */}

        <section className="detail-content">

          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="detail-page-header">

            <div>
              <h2>
                Detail Event
              </h2>
            </div>

            <button
              type="button"
              className="back-button"
              onClick={() =>
                navigate(
                  "/event-management"
                )
              }
            >
              ← KEMBALI
            </button>

          </div>

          {/* =================================================
              EVENT CARD
          ================================================= */}

          <article className="detail-card">

            {/* =================================================
                HERO EVENT
            ================================================= */}

            <div
              className={`detail-hero ${
                bannerUrl
                  ? "has-banner"
                  : ""
              }`}
              style={
                bannerUrl
                  ? {
                      backgroundImage: `url("${bannerUrl}")`,
                    }
                  : undefined
              }
            >

              {/* DARK OVERLAY */}
              {bannerUrl && (
                <div className="hero-overlay"></div>
              )}

              {/* STATUS */}

              <span
                className={`event-status ${statusClass}`}
              >
                ● {normalizedStatus}
              </span>

              {/* CATEGORY */}

              <span className="hero-category">
                {category}
              </span>

              {/* FALLBACK VISUAL */}

              {!bannerUrl && (
                <div className="hero-visual">

                  <div className="hero-circle circle-one"></div>

                  <div className="hero-circle circle-two"></div>

                  <div className="hero-stage">

                    <div className="stage-light"></div>

                    <div className="stage-light"></div>

                    <div className="stage-screen">
                      EVENTDAY
                    </div>

                  </div>

                </div>
              )}

            </div>

            {/* =================================================
                EVENT BODY
            ================================================= */}

            <div className="detail-body">

              {/* =================================================
                  TITLE
              ================================================= */}

              <div className="event-title-section">

                <h1>
                  {title}
                </h1>

              </div>

              {/* =================================================
                  META
              ================================================= */}

              <div className="event-meta">

                {/* DATE */}

                <div className="meta-item">

                  <span className="meta-icon">
                    ▣
                  </span>

                  <span>
                    {formatDateRange(
                      startDate,
                      endDate
                    )}
                  </span>

                </div>

                {/* TIME */}

                <div className="meta-item">

                  <span className="meta-icon">
                    ◷
                  </span>

                  <span>
                    {formatTimeRange(
                      startDate,
                      endDate
                    )}
                  </span>

                </div>

                {/* LOCATION */}

                <div className="meta-item">

                  <span className="meta-icon">
                    ◉
                  </span>

                  <span>
                    {location}
                  </span>

                </div>

              </div>

              {/* =================================================
                  DIVIDER
              ================================================= */}

              <div className="detail-divider"></div>

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <section className="description-section">

                <h3>
                  Deskripsi Event
                </h3>

                <p>
                  {description}
                </p>

              </section>

              {/* =================================================
                  TICKET SALES
              ================================================= */}

              <section className="ticket-section">

                <div className="ticket-header">

                  <div>

                    <h3>
                      Penjualan Tiket
                    </h3>

                    <p>
                      Total tiket terjual
                      dari kuota tersedia
                    </p>

                  </div>

                  <div className="ticket-count">

                    {salesLoading ? (
                      <span>
                        ...
                      </span>
                    ) : (
                      <>
                        <strong>
                          {ticketsSold}
                        </strong>

                        <span>
                          / {totalTickets}
                        </span>
                      </>
                    )}

                  </div>

                </div>

                {/* PROGRESS */}

                <div className="progress-wrapper">

                  <div className="progress-track">

                    <div
                      className="progress-fill"
                      style={{
                        width: `${percentage}%`,
                      }}
                    ></div>

                  </div>

                </div>

                <div className="progress-info">

                  <span>
                    {Math.round(
                      percentage
                    )}
                    % Terjual
                  </span>

                </div>

              </section>

              {/* =================================================
                  TICKET TIERS
              ================================================= */}

              {ticketTiers.length > 0 && (
                <section className="ticket-tier-section">

                  <div className="ticket-header">

                    <div>
                      <h3>
                        Kategori Tiket
                      </h3>

                      <p>
                        Daftar tiket yang tersedia
                        untuk event ini
                      </p>
                    </div>

                  </div>

                  <div className="ticket-tier-list">

                    {ticketTiers.map(
                      (
                        ticket,
                        index
                      ) => {

                        const tierName =
                          ticket?.tier_name ||
                          ticket?.tierName ||
                          ticket?.name ||
                          `Kategori ${index + 1}`;

                        const price =
                          ticket?.price || 0;

                        const quota =
                          ticket?.total_quota ||
                          ticket?.totalQuota ||
                          ticket?.quota ||
                          0;

                        const available =
                          ticket?.available_quota ??
                          ticket?.availableQuota ??
                          quota;

                        return (
                          <div
                            className="ticket-tier-item"
                            key={
                              ticket?.tier_id ||
                              ticket?.tierId ||
                              index
                            }
                          >

                            <div>
                              <strong>
                                {tierName}
                              </strong>

                              <span>
                                Kuota: {quota}
                              </span>
                            </div>

                            <div>
                              <strong>
                                {formatCurrency(
                                  price
                                )}
                              </strong>

                              <span>
                                Tersedia:{" "}
                                {available}
                              </span>
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                </section>
              )}

              {/* =================================================
                  EVENT INFORMATION
              ================================================= */}

              <div className="event-extra-info">

                <div className="extra-item">

                  <span>
                    Penyelenggara
                  </span>

                  <strong>
                    {organizer}
                  </strong>

                </div>

                <div className="extra-item">

                  <span>
                    Status Event
                  </span>

                  <strong>
                    {normalizedStatus}
                  </strong>

                </div>

                <div className="extra-item">

                  <span>
                    Event ID
                  </span>

                  <strong>
                    {eventId}
                  </strong>

                </div>

              </div>

              {/* =================================================
                  ACTION
              ================================================= */}

              <div className="detail-actions">

                {isDraft && (
                  <>
                    <button
                      type="button"
                      className="edit-button"
                      onClick={handleApprove}
                      disabled={approving || rejecting}
                    >
                      {approving ? "Menyetujui..." : "Setujui"}
                    </button>

                    <button
                      type="button"
                      className="delete-button"
                      onClick={handleReject}
                      disabled={approving || rejecting}
                    >
                      {rejecting ? "Menolak..." : "Tolak"}
                    </button>
                  </>
                )}

                <button
                  type="button"
                  className="edit-button"
                  onClick={() =>
                    navigate(
                      `/admin/event/edit/${eventId}`
                    )
                  }
                >
                  Edit Event
                </button>

                <button
                  type="button"
                  className="delete-button"
                  onClick={() =>
                    console.log(
                      "Hapus event:",
                      eventId
                    )
                  }
                >
                  {deleting ? "Menghapus..." : "Hapus Event"}
                </button>

              </div>

            </div>

          </article>

        </section>

      </main>

    </div>
  );
}

export default DetailEvent;
