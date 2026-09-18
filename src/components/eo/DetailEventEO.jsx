import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerEvents,
  getOrganizerEventSalesSummary,
} from "../../services/organizerEventService";

import "./DetailEventEO.css";

function DetailEventEO() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [salesSummary, setSalesSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getOrganizerEvents();

        const eventList = Array.isArray(response?.data)
          ? response.data
          : [];

        const selectedEvent = eventList.find(
          (item) =>
            String(item.event_id) === String(id) ||
            String(item.id) === String(id)
        );

        if (!selectedEvent) {
          setError("Event tidak ditemukan.");
          setEvent(null);
          return;
        }

        setEvent(selectedEvent);
      } catch (err) {
        console.error("Gagal mengambil detail event:", err);

        setError(
          err?.message || "Gagal mengambil data event."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      if (!id) return;

      try {
        setLoadingSales(true);

        const response =
          await getOrganizerEventSalesSummary(id);

        console.log(
          "SALES SUMMARY RESPONSE:",
          response
        );

        setSalesSummary(response?.data || null);
      } catch (err) {
        console.error(
          "Gagal mengambil statistik penjualan:",
          err
        );

        setSalesSummary(null);
      } finally {
        setLoadingSales(false);
      }
    };

    fetchSalesSummary();
  }, [id]);

  const handleBack = () => {
    navigate("/eo/event");
  };

  const handleEdit = () => {
    navigate(`/eo/event/${id}/edit`);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "-";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatCurrency = (value) => {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Rp 0";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(number);
  };

  const getStatusText = (status) => {
    if (!status) return "Event";

    const normalized = String(status).toUpperCase();

    if (normalized === "PUBLISHED") {
      return "Event Aktif";
    }

    if (normalized === "DRAFT") {
      return "Draft";
    }

    if (normalized === "CANCELLED") {
      return "Dibatalkan";
    }

    if (normalized === "COMPLETED") {
      return "Selesai";
    }

    return status;
  };

  const getBanner = () => {
    return (
      event?.banner_url ||
      event?.banner ||
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85"
    );
  };

  const getDescription = () => {
    if (!event?.description) {
      return ["Tidak ada deskripsi event."];
    }

    if (Array.isArray(event.description)) {
      return event.description;
    }

    return String(event.description)
      .split("\n")
      .filter((item) => item.trim() !== "");
  };

  const getFacilities = () => {
    if (!event?.facility) {
      return "-";
    }

    if (Array.isArray(event.facility)) {
      return event.facility.join(", ");
    }

    return event.facility;
  };

  const getLineup = () => {
    if (!event?.lineup) {
      return [];
    }

    if (Array.isArray(event.lineup)) {
      return event.lineup.map((item) => {
        if (typeof item === "string") {
          return {
            name: item,
          };
        }

        return {
          name:
            item?.name ||
            item?.artist_name ||
            item?.title ||
            "Bintang Tamu",
        };
      });
    }

    if (typeof event.lineup === "string") {
      return event.lineup
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({
          name: item,
        }));
    }

    return [];
  };

  const getTicketCategories = () => {
    const source =
      salesSummary?.categories ||
      salesSummary?.ticket_categories ||
      salesSummary?.ticket_tiers ||
      salesSummary?.tickets ||
      event?.ticket_categories ||
      event?.ticket_tiers ||
      event?.tickets ||
      [];

    if (!Array.isArray(source)) {
      return [];
    }

    return source.map((item) => ({
      name:
        item?.name ||
        item?.ticket_name ||
        item?.category_name ||
        item?.tier_name ||
        "Tiket",

      price:
        item?.price ??
        item?.ticket_price ??
        item?.amount ??
        0,

      sold:
        item?.sold ??
        item?.sold_count ??
        item?.tickets_sold ??
        item?.quantity_sold ??
        0,

      quota:
        item?.quota ??
        item?.total_quota ??
        item?.totalQuota ??
        item?.capacity ??
        0,
    }));
  };

  const getTicketSold = () => {
    const value =
      salesSummary?.ticketSold ??
      salesSummary?.ticket_sold ??
      salesSummary?.totalSold ??
      salesSummary?.total_sold ??
      salesSummary?.sold ??
      salesSummary?.ticketsSold ??
      salesSummary?.tickets_sold;

    if (value !== undefined && value !== null) {
      return Number(value) || 0;
    }

    const categories = getTicketCategories();

    return categories.reduce(
      (total, item) => total + Number(item.sold || 0),
      0
    );
  };

  const getTicketTotal = () => {
    const value =
      salesSummary?.ticketTotal ??
      salesSummary?.ticket_total ??
      salesSummary?.totalQuota ??
      salesSummary?.total_quota ??
      salesSummary?.quota ??
      salesSummary?.capacity ??
      salesSummary?.ticketsTotal ??
      salesSummary?.tickets_total;

    if (value !== undefined && value !== null) {
      return Number(value) || 0;
    }

    const categories = getTicketCategories();

    return categories.reduce(
      (total, item) => total + Number(item.quota || 0),
      0
    );
  };

  const ticketSold = getTicketSold();
  const ticketTotal = getTicketTotal();

  const percentage =
    ticketTotal > 0
      ? Math.min(
          100,
          Math.round(
            (ticketSold / ticketTotal) * 100
          )
        )
      : 0;

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
              <p>
                {error || "Event tidak ditemukan."}
              </p>

              <button
                type="button"
                className="back-button"
                onClick={handleBack}
              >
                <span className="back-arrow">
                  ←
                </span>
                Kembali ke Kelola Event
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const eventDate =
    event.start_date ||
    event.event_date ||
    event.date;

  const eventEndDate =
    event.end_date ||
    event.event_end_date ||
    eventDate;

  const eventTime =
    formatTime(eventDate);

  const eventEndTime =
    formatTime(eventEndDate);

  const sameDate =
    formatDate(eventDate) ===
    formatDate(eventEndDate);

  const dateText = sameDate
    ? formatDate(eventDate)
    : `${formatDate(eventDate)} - ${formatDate(
        eventEndDate
      )}`;

  const timeText =
    eventTime && eventEndTime
      ? `${eventTime} - ${eventEndTime}`
      : eventTime || eventEndTime || "";

  const lineup = getLineup();

  const categories =
    getTicketCategories();

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
              <span className="back-arrow">
                ←
              </span>
              Kembali ke Kelola Event
            </button>
          </div>

          <section className="detail-event-eo-hero-card">
            <div className="banner-wrapper">
              <img
                src={getBanner()}
                alt={
                  event.title ||
                  "Event"
                }
                className="event-banner"
              />

              <span className="status-badge active">
                {getStatusText(
                  event.status
                )}
              </span>
            </div>

            <div className="hero-info">
              <h2>
                {event.title ||
                  "Tanpa Judul"}
              </h2>

              <p className="event-id">
                <span className="event-id-icon">
                  ▣
                </span>
                ID Event:{" "}
                {event.event_id ||
                  event.id ||
                  id}
              </p>
            </div>
          </section>

          <div className="detail-event-eo-content-grid">
            <div className="detail-event-left-column">
              <section className="detail-card meta-card">
                <h3>
                  {event.title ||
                    "Nama Event"}
                </h3>

                <div className="meta-list">
                  <span>
                    <span className="meta-icon tag-icon">
                      ◇
                    </span>

                    {event.category ||
                      "Kategori Event"}
                  </span>

                  <span>
                    <span className="meta-icon">
                      ▣
                    </span>

                    {dateText}

                    {timeText
                      ? ` ${timeText}`
                      : ""}
                  </span>

                  <span>
                    <span className="meta-icon location-icon">
                      ♧
                    </span>

                    {event.venue_name ||
                      event.location ||
                      "Lokasi belum tersedia"}
                  </span>
                </div>
              </section>

              <section className="detail-card">
                <h2>
                  Deskripsi Event
                </h2>

                <div className="description-text">
                  {getDescription().map(
                    (
                      paragraph,
                      index
                    ) => (
                      <p
                        key={index}
                      >
                        {paragraph}
                      </p>
                    )
                  )}
                </div>
              </section>

              <section className="detail-card">
                <h2>
                  Fasilitas
                </h2>

                <div className="facilities-text">
                  <p>
                    {getFacilities()}
                  </p>
                </div>
              </section>

              <section className="detail-card lineup-card">
                <h2>
                  LineUp
                </h2>

                <div className="lineup-grid">
                  {lineup.length > 0 ? (
                    lineup.map(
                      (
                        person,
                        index
                      ) => (
                        <div
                          className="lineup-item"
                          key={index}
                        >
                          <div className="lineup-avatar">
                            <span>
                              ♙
                            </span>
                          </div>

                          <span>
                            {
                              person.name
                            }
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p>
                      Belum ada lineup.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="detail-event-right-column">
              <button
                type="button"
                className="edit-event-btn"
                onClick={handleEdit}
              >
                Edit Event
              </button>

              <section className="detail-card stats-card">
                <h2>
                  Statistik Penjualan
                </h2>

                <div className="stats-divider-top"></div>

                <div className="sales-text-row">
                  <span>
                    {loadingSales
                      ? "Memuat..."
                      : `${ticketSold}/${ticketTotal} Tiket Terjual`}
                  </span>

                  <span>
                    {loadingSales
                      ? "..."
                      : `${percentage}%`}
                  </span>
                </div>

                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${percentage}%`,
                    }}
                  ></div>
                </div>

                <hr className="stats-divider" />

                <div className="category-breakdown">
                  <h4>
                    RINCIAN PER KATEGORI
                  </h4>

                  {categories.length > 0 ? (
                    categories.map(
                      (
                        category,
                        index
                      ) => (
                        <div
                          className="category-row"
                          key={index}
                        >
                          <div className="cat-info">
                            <span className="cat-name">
                              {
                                category.name
                              }
                            </span>

                            <span className="cat-price">
                              {formatCurrency(
                                category.price
                              )}
                            </span>
                          </div>

                          <span className="cat-count">
                            {category.sold}
                            {category.quota
                              ? ` / ${category.quota}`
                              : ""}
                          </span>
                        </div>
                      )
                    )
                  ) : (
                    <p>
                      Belum ada data
                      kategori tiket.
                    </p>
                  )}
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