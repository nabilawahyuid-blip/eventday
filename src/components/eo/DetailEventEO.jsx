import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import { resolveBannerUrl } from "../../utils/bannerUrl";

import {
  getOrganizerEventSalesSummary,
  getPublicEventDetail,
} from "../../services/organizerEventService";

import "./DetailEventEO.css";

function DetailEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

  // =====================================================
  // STATE
  // =====================================================
  const [event, setEvent] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [error, setError] = useState("");
  const [salesError, setSalesError] = useState("");

  // =====================================================
  // GET EVENT DETAIL
  // =====================================================
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("ID event tidak ditemukan.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await getPublicEventDetail(id);
        console.log("EVENT DETAIL RESPONSE:", response);

        const eventData =
          response?.data?.data ||
          response?.data ||
          response;

        console.log("EVENT DATA:", eventData);

        if (!eventData) {
          setError("Event tidak ditemukan.");
          setEvent(null);
          return;
        }

        setEvent(eventData);
      } catch (err) {
        console.error("Gagal mengambil detail event:", err);
        setError(err?.message || "Gagal mengambil data event.");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  // =====================================================
  // GET SALES SUMMARY
  // =====================================================
  useEffect(() => {
    const fetchSalesSummary = async () => {
      if (!id) return;

      try {
        setLoadingSales(true);
        setSalesError("");

        const response = await getOrganizerEventSalesSummary(id);
        console.log("SALES SUMMARY RESPONSE:", response);

        const salesData =
          response?.data?.data ||
          response?.data ||
          response;

        setSalesSummary(salesData);
      } catch (err) {
        console.error("Gagal mengambil statistik penjualan:", err);
        setSalesSummary(null);
        setSalesError(
          err?.message || "Gagal mengambil statistik penjualan."
        );
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSalesSummary();
  }, [id]);

  // =====================================================
  // NAVIGATION
  // =====================================================
  const handleBack = () => {
    navigate("/eo/event");
  };

  const handleEdit = () => {
    navigate(`/eo/event/${id}/edit`);
  };

  // =====================================================
  // FORMATTERS
  // =====================================================
  const formatDate = (dateValue) => {
    if (!dateValue) return "-";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return dateValue;

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) return "";

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "Rp 0";
    const number = Number(value);
    if (Number.isNaN(number)) return "Rp 0";

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getStatusText = (status) => {
    if (!status) return "Event";
    const normalized = String(status).toUpperCase();

    if (normalized === "PUBLISHED") return "Event Aktif";
    if (normalized === "DRAFT") return "Draft";
    if (normalized === "CANCELLED") return "Dibatalkan";
    if (
      normalized === "COMPLETED" ||
      normalized === "FINISHED" ||
      normalized === "ENDED"
    ) {
      return "Selesai";
    }

    return status;
  };

  const getImageUrl = (image) => resolveBannerUrl(image) || "";

  const getBanner = () => {
    const image =
      event?.banner_url ||
      event?.bannerUrl ||
      event?.image ||
      event?.banner;

    return getImageUrl(image);
  };

  const getDescription = () => {
    if (!event?.description) return ["Tidak ada deskripsi event."];
    if (Array.isArray(event.description)) return event.description;

    return String(event.description)
      .split("\n")
      .filter((item) => item.trim() !== "");
  };

  // =====================================================
  // PERBAIKAN: FACILITIES PARSER
  // =====================================================
  const getFacilities = () => {
    const facilityRaw =
      event?.facility ||
      event?.facilities ||
      event?.facility_list;

    if (!facilityRaw) return [];

    if (Array.isArray(facilityRaw)) {
      return facilityRaw
        .map((item) => (typeof item === "string" ? item : item?.name))
        .filter(Boolean);
    }

    if (typeof facilityRaw === "string") {
      return facilityRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }

    return [];
  };

  // =====================================================
  // PERBAIKAN: LINEUP PARSER
  // =====================================================
  const getLineup = () => {
    const lineupRaw =
      event?.lineup ||
      event?.lineups ||
      event?.line_up;

    if (!lineupRaw) return [];

    if (Array.isArray(lineupRaw)) {
      return lineupRaw.map((item) => {
        if (typeof item === "string") return { name: item };
        return {
          name:
            item?.name ||
            item?.artist_name ||
            item?.title ||
            "Bintang Tamu",
        };
      });
    }

    if (typeof lineupRaw === "string") {
      return lineupRaw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({ name: item }));
    }

    return [];
  };

  // =====================================================
  // TICKET DATA
  // =====================================================
  const getTickets = () => {
    const tickets =
      event?.tickets ||
      event?.ticket_categories ||
      event?.ticket_tiers ||
      event?.ticketTiers ||
      [];

    if (!Array.isArray(tickets)) return [];

    return tickets.map((ticket, index) => {
      const quota =
        Number(
          ticket?.total_quota ??
            ticket?.totalQuota ??
            ticket?.quota ??
            0
        ) || 0;

      const remaining =
        Number(
          ticket?.available_quota ??
            ticket?.availableQuota ??
            ticket?.remaining ??
            0
        ) || 0;

      const sold =
        ticket?.sold !== undefined && ticket?.sold !== null
          ? Number(ticket.sold) || 0
          : Math.max(quota - remaining, 0);

      const price =
        Number(ticket?.price ?? ticket?.ticket_price ?? 0) || 0;

      return {
        id:
          ticket?.tier_id ||
          ticket?.tierId ||
          ticket?.id ||
          ticket?.ticket_id ||
          `ticket-${index}`,
        name:
          ticket?.tier_name ||
          ticket?.tierName ||
          ticket?.name ||
          ticket?.ticket_name ||
          ticket?.category_name ||
          "Tiket",
        price,
        quota,
        remaining,
        sold,
      };
    });
  };

  const getTicketSold = () => {
    const summaryValue =
      salesSummary?.tickets_sold ??
      salesSummary?.ticket_sold ??
      salesSummary?.ticketSold ??
      salesSummary?.total_sold ??
      salesSummary?.totalSold ??
      salesSummary?.sold;

    if (summaryValue !== undefined && summaryValue !== null) {
      return Number(summaryValue) || 0;
    }

    return getTickets().reduce((total, ticket) => total + Number(ticket.sold || 0), 0);
  };

  const getTicketTotal = () => {
    return getTickets().reduce((total, ticket) => total + Number(ticket.quota || 0), 0);
  };

  const getTotalRemaining = () => {
    return getTickets().reduce((total, ticket) => total + Number(ticket.remaining || 0), 0);
  };

  const getRevenue = () => {
    const summaryRevenue =
      salesSummary?.total_revenue ??
      salesSummary?.totalRevenue ??
      salesSummary?.revenue;

    if (summaryRevenue !== undefined && summaryRevenue !== null) {
      return Number(summaryRevenue) || 0;
    }

    return getTickets().reduce((total, ticket) => total + ticket.price * ticket.sold, 0);
  };

  // CALCULATIONS
  const ticketSold = getTicketSold();
  const ticketTotal = getTicketTotal();
  const totalRemaining = getTotalRemaining();
  const revenue = getRevenue();
  const percentage =
    ticketTotal > 0
      ? Math.min(100, Math.round((ticketSold / ticketTotal) * 100))
      : 0;

  const eventDate =
    event?.start_date || event?.event_date || event?.date || event?.startDate;
  const eventEndDate =
    event?.end_date || event?.event_end_date || event?.endDate || eventDate;

  const eventTime = formatTime(eventDate);
  const eventEndTime = formatTime(eventEndDate);
  const sameDate = formatDate(eventDate) === formatDate(eventEndDate);

  const dateText = sameDate
    ? formatDate(eventDate)
    : `${formatDate(eventDate)} - ${formatDate(eventEndDate)}`;

  const timeText =
    eventTime && eventEndTime
      ? `${eventTime} - ${eventEndTime}`
      : eventTime || eventEndTime || "";

  const lineup = getLineup();
  const facilities = getFacilities();
  const tickets = getTickets();

  // LOADING & ERROR RENDER
  if (loading) {
    return (
      <div className="detail-event-eo-page">
        <SidebarEO />
        <main className="detail-event-eo-main">
          <NavbarEO />
          <div className="detail-event-eo-content">
            <div className="detail-event-page-title">
              <h1>Detail Event</h1>
            </div>
            <div className="detail-card">
              <p>Memuat data event...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-event-eo-page">
        <SidebarEO />
        <main className="detail-event-eo-main">
          <NavbarEO />
          <div className="detail-event-eo-content">
            <div className="detail-event-page-title">
              <h1>Detail Event</h1>
            </div>
            <div className="detail-card">
              <p>{error || "Event tidak ditemukan."}</p>
              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                <span className="back-arrow">←</span> Kembali ke Kelola Event
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="detail-event-eo-page">
      <SidebarEO />

      <main className="detail-event-eo-main">
        <NavbarEO />

        <div className="detail-event-eo-content">
          <div className="detail-event-page-title">
            <h1>Detail Event</h1>
          </div>

          <div className="detail-event-eo-top-nav">
            <button
              type="button"
              className="back-button"
              onClick={handleBack}
            >
              <span className="back-arrow">←</span> Kembali ke Kelola Event
            </button>
          </div>

          {/* HERO */}
          <section className="detail-event-eo-hero-card">
            <div className="banner-wrapper">
              {getBanner() ? (
                <img
                  src={getBanner()}
                  alt={event.title || "Event"}
                  className="event-banner"
                  onError={(e) => {
                    console.error("Banner gagal dimuat:", e.currentTarget.src);
                    e.currentTarget.style.display = "none";
                    const wrapper = e.currentTarget.parentElement;
                    if (wrapper && !wrapper.querySelector(".banner-error-message")) {
                      const message = document.createElement("div");
                      message.className = "banner-error-message";
                      message.textContent = "Banner gagal dimuat";
                      message.style.cssText = `
                        width: 100%;
                        height: 100%;
                        min-height: 300px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f2f2f2;
                        color: #777;
                        font-size: 16px;
                      `;
                      wrapper.appendChild(message);
                    }
                  }}
                />
              ) : (
                <div
                  className="event-banner"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f2f2f2",
                    color: "#777",
                    minHeight: "300px",
                  }}
                >
                  Banner belum tersedia
                </div>
              )}

              <span className="status-badge active">
                {getStatusText(event.status)}
              </span>
            </div>

            <div className="hero-info">
              <h2>{event.title || "Tanpa Judul"}</h2>
              <p className="event-id">
                <span className="event-id-icon">▣</span> ID Event:{" "}
                {event.event_id || event.eventId || event.id || id}
              </p>
            </div>
          </section>

          {/* CONTENT GRID */}
          <div className="detail-event-eo-content-grid">
            {/* LEFT COLUMN */}
            <div className="detail-event-left-column">
              {/* META */}
              <section className="detail-card meta-card">
                <h3>{event.title || "Nama Event"}</h3>
                <div className="meta-list">
                  <span>
                    <span className="meta-icon tag-icon">◇</span>
                    {event.category || "Kategori Event"}
                  </span>
                  <span>
                    <span className="meta-icon">▣</span>
                    {dateText}
                    {timeText ? ` ${timeText}` : ""}
                  </span>
                  <span>
                    <span className="meta-icon location-icon">♧</span>
                    {event.venue_name ||
                      event.venueName ||
                      event.location ||
                      event.venue ||
                      "Lokasi belum tersedia"}
                  </span>
                </div>
              </section>

              {/* DESCRIPTION */}
              <section className="detail-card">
                <h2>Deskripsi Event</h2>
                <div className="description-text">
                  {getDescription().map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </section>

              {/* FACILITIES (DIPERBAIKI RENDER NYA) */}
              <section className="detail-card">
                <h2>Fasilitas</h2>
                <div className="facilities-text">
                  {facilities.length > 0 ? (
                    <ul style={{ paddingLeft: "18px", margin: 0 }}>
                      {facilities.map((facility, index) => (
                        <li key={index} style={{ marginBottom: "6px" }}>
                          {facility}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>Tidak ada fasilitas yang tercantum.</p>
                  )}
                </div>
              </section>

              {/* LINEUP */}
              <section className="detail-card lineup-card">
                <h2>LineUp</h2>
                <div className="lineup-grid">
                  {lineup.length > 0 ? (
                    lineup.map((person, index) => (
                      <div className="lineup-item" key={index}>
                        <div className="lineup-avatar">
                          <span>♙</span>
                        </div>
                        <span>{person.name}</span>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada lineup.</p>
                  )}
                </div>
              </section>

              {/* TICKET CATEGORY */}
              <section className="detail-card">
                <h2>Kategori Tiket</h2>
                <div className="ticket-detail-list">
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div className="ticket-detail-row" key={ticket.id}>
                        <div>
                          <strong>{ticket.name}</strong>
                          <span>
                            {ticket.sold} terjual dari {ticket.quota}
                          </span>
                        </div>
                        <strong>{formatCurrency(ticket.price)}</strong>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada data tiket.</p>
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN */}
            <aside className="detail-event-right-column">
              <button
                type="button"
                className="edit-event-btn"
                onClick={handleEdit}
              >
                Edit Event
              </button>

              {/* SALES STATISTICS */}
              <section className="detail-card stats-card">
                <h2>Statistik Penjualan</h2>

                {salesError && (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#b34c4c",
                      marginBottom: "10px",
                    }}
                  >
                    Statistik realtime tidak tersedia. Menampilkan data dari tiket event.
                  </p>
                )}

                <div className="stats-divider-top" />

                <div className="sales-text-row">
                  <span>
                    {loadingSales
                      ? "Memuat..."
                      : `${ticketSold}/${ticketTotal} Tiket Terjual`}
                  </span>
                  <span>{loadingSales ? "..." : `${percentage}%`}</span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <hr className="stats-divider" />

                {/* CATEGORY BREAKDOWN */}
                <div className="category-breakdown">
                  <h4>RINCIAN PER KATEGORI</h4>
                  {tickets.length > 0 ? (
                    tickets.map((ticket) => (
                      <div className="category-row" key={ticket.id}>
                        <div className="cat-info">
                          <span className="cat-name">{ticket.name}</span>
                          <span className="cat-price">
                            {formatCurrency(ticket.price)}
                          </span>
                        </div>
                        <span className="cat-count">
                          {ticket.sold} / {ticket.quota}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p>Belum ada data kategori tiket.</p>
                  )}
                </div>

                <hr className="stats-divider" />

                {/* EXTRA SALES INFO */}
                <div className="sales-summary-extra">
                  <div>
                    <span>Tiket Tersisa</span>
                    <strong>{totalRemaining}</strong>
                  </div>
                  <div>
                    <span>Pendapatan</span>
                    <strong>{formatCurrency(revenue)}</strong>
                  </div>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailEventEO;