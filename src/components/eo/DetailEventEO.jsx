import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerEventSalesSummary,
  getPublicEventDetail,
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
  const [salesError, setSalesError] = useState("");

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

        const response =
          await getPublicEventDetail(id);

        console.log(
          "EVENT DETAIL RESPONSE:",
          response
        );

        const eventData =
          response?.data || null;

        if (!eventData) {
          setError("Event tidak ditemukan.");
          setEvent(null);
          return;
        }

        setEvent(eventData);
      } catch (err) {
        console.error(
          "Gagal mengambil detail event:",
          err
        );

        setError(
          err?.message ||
            "Gagal mengambil data event."
        );

        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  useEffect(() => {
    const fetchSalesSummary = async () => {
      if (!id) {
        return;
      }

      try {
        setLoadingSales(true);
        setSalesError("");

        const response =
          await getOrganizerEventSalesSummary(id);

        console.log(
          "SALES SUMMARY RESPONSE:",
          response
        );

        setSalesSummary(
          response?.data || null
        );
      } catch (err) {
        console.error(
          "Gagal mengambil statistik penjualan:",
          err
        );

        setSalesSummary(null);

        setSalesError(
          err?.message ||
            "Gagal mengambil statistik penjualan."
        );
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
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return date.toLocaleDateString(
      "id-ID",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  };

  const formatTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleTimeString(
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }
    );
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
      return "Rp 0";
    }

    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
      }
    ).format(number);
  };

  const getStatusText = (status) => {
    if (!status) {
      return "Event";
    }

    const normalized =
      String(status).toUpperCase();

    if (normalized === "PUBLISHED") {
      return "Event Aktif";
    }

    if (normalized === "DRAFT") {
      return "Draft";
    }

    if (
      normalized === "CANCELLED"
    ) {
      return "Dibatalkan";
    }

    if (
      normalized === "COMPLETED" ||
      normalized === "FINISHED" ||
      normalized === "ENDED"
    ) {
      return "Selesai";
    }

    return status;
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    const baseUrl = (
      import.meta.env.VITE_NGROK_URL || ""
    ).replace(/\/$/, "");

    if (image.startsWith("/")) {
      return `${baseUrl}${image}`;
    }

    return `${baseUrl}/${image}`;
  };

  const getBanner = () => {
    const image =
      event?.image ||
      event?.banner_url ||
      event?.bannerUrl ||
      event?.banner;

    const imageUrl =
      getImageUrl(image);

    if (imageUrl) {
      return imageUrl;
    }

    return "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85";
  };

  const getDescription = () => {
    if (!event?.description) {
      return [
        "Tidak ada deskripsi event.",
      ];
    }

    if (
      Array.isArray(event.description)
    ) {
      return event.description;
    }

    return String(event.description)
      .split("\n")
      .filter(
        (item) =>
          item.trim() !== ""
      );
  };

  const getFacilities = () => {
    const facility =
      event?.facility;

    if (!facility) {
      return "-";
    }

    if (Array.isArray(facility)) {
      return facility.join(", ");
    }

    return facility;
  };

  const getLineup = () => {
    const lineup =
      event?.lineup;

    if (!lineup) {
      return [];
    }

    if (Array.isArray(lineup)) {
      return lineup.map((item) => {
        if (
          typeof item === "string"
        ) {
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

    if (
      typeof lineup === "string"
    ) {
      return lineup
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => ({
          name: item,
        }));
    }

    return [];
  };

  const getTickets = () => {
    const tickets =
      event?.tickets ||
      event?.ticket_categories ||
      event?.ticket_tiers ||
      [];

    if (!Array.isArray(tickets)) {
      return [];
    }

    return tickets.map((ticket) => {
      const quota =
        Number(ticket?.quota) || 0;

      const remaining =
        Number(ticket?.remaining) || 0;

      const sold =
        ticket?.sold !== undefined
          ? Number(ticket.sold) || 0
          : Math.max(
              quota - remaining,
              0
            );

      return {
        id:
          ticket?.id ||
          ticket?.ticket_id ||
          Math.random(),

        name:
          ticket?.name ||
          ticket?.ticket_name ||
          ticket?.category_name ||
          ticket?.tier_name ||
          "Tiket",

        price:
          Number(ticket?.price) ||
          Number(
            ticket?.ticket_price
          ) ||
          0,

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

    if (
      summaryValue !== undefined &&
      summaryValue !== null
    ) {
      return Number(summaryValue) || 0;
    }

    const tickets =
      getTickets();

    return tickets.reduce(
      (total, ticket) =>
        total +
        Number(ticket.sold || 0),
      0
    );
  };

  const getTicketTotal = () => {
    const tickets =
      getTickets();

    return tickets.reduce(
      (total, ticket) =>
        total +
        Number(ticket.quota || 0),
      0
    );
  };

  const getTotalRemaining = () => {
    const tickets =
      getTickets();

    return tickets.reduce(
      (total, ticket) =>
        total +
        Number(
          ticket.remaining || 0
        ),
      0
    );
  };

  const getRevenue = () => {
    const summaryRevenue =
      salesSummary?.total_revenue ??
      salesSummary?.totalRevenue ??
      salesSummary?.revenue;

    if (
      summaryRevenue !== undefined &&
      summaryRevenue !== null
    ) {
      return Number(
        summaryRevenue
      ) || 0;
    }

    return getTickets().reduce(
      (total, ticket) =>
        total +
        ticket.price *
          ticket.sold,
      0
    );
  };

  const ticketSold =
    getTicketSold();

  const ticketTotal =
    getTicketTotal();

  const totalRemaining =
    getTotalRemaining();

  const revenue =
    getRevenue();

  const percentage =
    ticketTotal > 0
      ? Math.min(
          100,
          Math.round(
            (ticketSold /
              ticketTotal) *
              100
          )
        )
      : 0;

  const eventDate =
    event?.start_date ||
    event?.event_date ||
    event?.date ||
    event?.startDate;

  const eventEndDate =
    event?.end_date ||
    event?.event_end_date ||
    event?.endDate ||
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
    : `${formatDate(
        eventDate
      )} - ${formatDate(
        eventEndDate
      )}`;

  const timeText =
    eventTime && eventEndTime
      ? `${eventTime} - ${eventEndTime}`
      : eventTime ||
        eventEndTime ||
        "";

  const lineup =
    getLineup();

  const tickets =
    getTickets();

  if (loading) {
    return (
      <div className="detail-event-eo-page">
        <SidebarEO />

        <main className="detail-event-eo-main">
          <NavbarEO />

          <div className="detail-event-eo-content">
            <div className="detail-event-page-title">
              <h1>
                Detail Event
              </h1>
            </div>

            <div className="detail-card">
              <p>
                Memuat data event...
              </p>
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
              <h1>
                Detail Event
              </h1>
            </div>

            <div className="detail-card">
              <p>
                {error ||
                  "Event tidak ditemukan."}
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

  return (
    <div className="detail-event-eo-page">
      <SidebarEO />

      <main className="detail-event-eo-main">
        <NavbarEO />

        <div className="detail-event-eo-content">

          <div className="detail-event-page-title">
            <h1>
              Detail Event
            </h1>
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
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1600&q=85";
                }}
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
                      event.venue ||
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

              <section className="detail-card">

                <h2>
                  Kategori Tiket
                </h2>

                <div className="ticket-detail-list">

                  {tickets.length > 0 ? (
                    tickets.map(
                      (ticket) => (
                        <div
                          className="ticket-detail-row"
                          key={ticket.id}
                        >
                          <div>
                            <strong>
                              {ticket.name}
                            </strong>

                            <span>
                              {ticket.sold}{" "}
                              terjual dari{" "}
                              {ticket.quota}
                            </span>
                          </div>

                          <strong>
                            {formatCurrency(
                              ticket.price
                            )}
                          </strong>
                        </div>
                      )
                    )
                  ) : (
                    <p>
                      Belum ada data tiket.
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

                {salesError && (
                  <p
                    style={{
                      fontSize: "10px",
                      color: "#b34c4c",
                      marginBottom:
                        "10px",
                    }}
                  >
                    Statistik realtime
                    tidak tersedia.
                    Menampilkan data
                    dari tiket event.
                  </p>
                )}

                <div className="stats-divider-top" />

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
                  />

                </div>

                <hr className="stats-divider" />

                <div className="category-breakdown">

                  <h4>
                    RINCIAN PER KATEGORI
                  </h4>

                  {tickets.length > 0 ? (
                    tickets.map(
                      (ticket) => (
                        <div
                          className="category-row"
                          key={ticket.id}
                        >

                          <div className="cat-info">

                            <span className="cat-name">
                              {
                                ticket.name
                              }
                            </span>

                            <span className="cat-price">
                              {formatCurrency(
                                ticket.price
                              )}
                            </span>

                          </div>

                          <span className="cat-count">
                            {ticket.sold}
                            {" / "}
                            {ticket.quota}
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

                <hr className="stats-divider" />

                <div className="sales-summary-extra">

                  <div>
                    <span>
                      Tiket Tersisa
                    </span>

                    <strong>
                      {totalRemaining}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Pendapatan
                    </span>

                    <strong>
                      {formatCurrency(
                        revenue
                      )}
                    </strong>
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