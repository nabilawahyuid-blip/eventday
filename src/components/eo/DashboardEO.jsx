import React, { useEffect, useState } from "react";
import {
  CalendarDays,
  Ticket,
  CircleDollarSign,
  MapPin,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

import {
  getOrganizerDashboardMetrics,
  getOrganizerRecentEvents,
  getOrganizerRecentTransactions,
} from "../../services/organizerDashboardService";

import { getPublicEventDetail } from "../../services/organizerEventService";

import "./DashboardEO.css";

function DashboardEO() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    active_events: 0,
    total_events: 0,
    total_revenue: 0,
    tickets_sold: 0,
  });

  const [events, setEvents] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const [loading, setLoading] = useState(true);
  const [eventLoading, setEventLoading] = useState(true);
  const [transactionLoading, setTransactionLoading] =
    useState(true);

  const [error, setError] = useState("");
  const [eventError, setEventError] = useState("");
  const [transactionError, setTransactionError] =
    useState("");

  useEffect(() => {
    loadDashboard();
    loadRecentEvents();
    loadRecentTransactions();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await getOrganizerDashboardMetrics();

      console.log(
        "DASHBOARD METRICS:",
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
        "Gagal mengambil metrics dashboard:",
        error
      );

      setError(
        error?.message ||
          "Gagal mengambil data dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadRecentEvents = async () => {
    try {
      setEventLoading(true);
      setEventError("");

      const response =
        await getOrganizerRecentEvents();

      console.log(
        "RECENT EVENTS:",
        response
      );

      const recentEvents = Array.isArray(
        response?.data
      )
        ? response.data
        : [];

      if (recentEvents.length === 0) {
        setEvents([]);
        return;
      }

      const eventResults =
        await Promise.all(
          recentEvents.map(async (event) => {
            const eventId =
              event?.event_id ||
              event?.id;

            let detail = {};

            if (eventId) {
              try {
                const detailResponse =
                  await getPublicEventDetail(
                    eventId
                  );

                detail =
                  detailResponse?.data || {};
              } catch (detailError) {
                console.error(
                  "Gagal mengambil detail event:",
                  eventId,
                  detailError
                );
              }
            }

            return normalizeEvent({
              ...event,
              ...detail,
              event_id: eventId,
            });
          })
        );

      setEvents(eventResults);
    } catch (error) {
      console.error(
        "Gagal mengambil event terbaru:",
        error
      );

      setEventError(
        error?.message ||
          "Gagal mengambil event terbaru."
      );

      setEvents([]);
    } finally {
      setEventLoading(false);
    }
  };

  const loadRecentTransactions = async () => {
    try {
      setTransactionLoading(true);
      setTransactionError("");

      const response =
        await getOrganizerRecentTransactions();

      console.log(
        "RECENT TRANSACTIONS:",
        response
      );

      const transactionData =
        Array.isArray(response?.data)
          ? response.data
          : [];

      setTransactions(transactionData);
    } catch (error) {
      console.error(
        "Gagal mengambil transaksi:",
        error
      );

      setTransactionError(
        error?.message ||
          "Gagal mengambil transaksi terbaru."
      );

      setTransactions([]);
    } finally {
      setTransactionLoading(false);
    }
  };

  const normalizeEvent = (event) => {
    const tickets = Array.isArray(
      event?.tickets
    )
      ? event.tickets
      : [];

    let totalQuota = 0;
    let totalRemaining = 0;

    tickets.forEach((ticket) => {
      totalQuota +=
        Number(ticket?.quota) || 0;

      totalRemaining +=
        Number(ticket?.remaining) || 0;
    });

    const ticketsSold = Math.max(
      totalQuota - totalRemaining,
      0
    );

    const progress =
      totalQuota > 0
        ? Math.min(
            Math.round(
              (ticketsSold / totalQuota) * 100
            ),
            100
          )
        : 0;

    const prices = tickets
      .map((ticket) =>
        Number(ticket?.price)
      )
      .filter(
        (price) =>
          Number.isFinite(price) &&
          price > 0
      );

    const minPrice =
      prices.length > 0
        ? Math.min(...prices)
        : 0;

    return {
      ...event,

      event_id:
        event?.event_id ||
        event?.id ||
        "",

      title:
        event?.title ||
        "Tanpa Judul",

      start_date:
        event?.start_date ||
        event?.startDate ||
        null,

      end_date:
        event?.end_date ||
        event?.endDate ||
        null,

      venue_name:
        event?.venue_name ||
        event?.venueName ||
        "-",

      status:
        event?.status ||
        "DRAFT",

      image:
        event?.image ||
        event?.banner_url ||
        event?.bannerUrl ||
        "",

      tickets,

      total_quota: totalQuota,

      total_remaining:
        totalRemaining,

      tickets_sold:
        ticketsSold,

      progress,

      min_price:
        minPrice,
    };
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "id-ID",
      {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
      }
    ).format(Number(value) || 0);
  };

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
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

  const getStatusClass = (status) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    if (normalized === "PUBLISHED") {
      return "event-active";
    }

    if (
      normalized === "ENDED" ||
      normalized === "FINISHED"
    ) {
      return "event-ended";
    }

    return "";
  };

  const getStatusLabel = (status) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    switch (normalized) {
      case "PUBLISHED":
        return "Event Aktif";

      case "DRAFT":
        return "Draft";

      case "ENDED":
      case "FINISHED":
        return "Event Berakhir";

      case "CANCELLED":
        return "Dibatalkan";

      default:
        return status || "-";
    }
  };

  const getTransactionStatusClass = (
    status
  ) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    if (
      normalized === "SUCCESS" ||
      normalized === "PAID" ||
      normalized === "COMPLETED"
    ) {
      return "status-paid";
    }

    if (
      normalized === "PENDING"
    ) {
      return "status-waiting";
    }

    if (
      normalized === "FAILED" ||
      normalized === "CANCELLED"
    ) {
      return "status-cancelled";
    }

    return "status-waiting";
  };

  const getTransactionStatusLabel = (
    status
  ) => {
    const normalized =
      String(status || "")
        .toUpperCase();

    switch (normalized) {
      case "SUCCESS":
      case "PAID":
      case "COMPLETED":
        return "Lunas";

      case "PENDING":
        return "Menunggu";

      case "FAILED":
      case "CANCELLED":
        return "Dibatalkan";

      default:
        return status || "-";
    }
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

    const apiUrl = (
      import.meta.env.VITE_NGROK_URL || ""
    ).replace(/\/$/, "");

    if (image.startsWith("/")) {
      return `${apiUrl}${image}`;
    }

    return `${apiUrl}/${image}`;
  };

  const handleDetailEvent = (eventId) => {
    if (!eventId) {
      return;
    }

    navigate(`/eo/event/${eventId}`);
  };

  const handleViewAllEvents = () => {
    navigate("/eo/event");
  };

  const handleViewAllTransactions = () => {
    navigate("/eo/transaksi");
  };

  return (
    <div className="dashboard-eo-page">

      <SidebarEO />

      <main className="dashboard-eo-main">

        <NavbarEO />

        <div className="dashboard-eo-content">

          {error && (
            <div className="dashboard-error">
              {error}
            </div>
          )}

          <div className="dashboard-page-header">
            <h1>Dashboard</h1>
          </div>

          <section className="dashboard-section">

            <div className="summary-cards">

              <div className="summary-card">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    EVENT AKTIF
                  </span>

                  <strong className="summary-card-value">
                    {loading
                      ? "..."
                      : dashboard.active_events ??
                        0}
                  </strong>

                </div>

                <div className="summary-icon summary-icon-purple">
                  <CalendarDays size={19} />
                </div>

                <div className="summary-decoration purple-decoration" />

              </div>

              <div className="summary-card">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    TIKET TERJUAL
                  </span>

                  <strong className="summary-card-value">
                    {loading
                      ? "..."
                      : dashboard.tickets_sold ??
                        0}
                  </strong>

                </div>

                <div className="summary-icon summary-icon-green">
                  <Ticket size={19} />
                </div>

                <div className="summary-decoration green-decoration" />

              </div>

              <div className="summary-card">

                <div className="summary-card-content">

                  <span className="summary-card-label">
                    PENDAPATAN BERSIH
                  </span>

                  <strong className="summary-card-value income-value">
                    {loading
                      ? "..."
                      : formatCurrency(
                          dashboard.total_revenue
                        )}
                  </strong>

                </div>

                <div className="summary-icon summary-icon-orange">
                  <CircleDollarSign size={19} />
                </div>

                <div className="summary-decoration orange-decoration" />

              </div>

            </div>

          </section>

          <section className="dashboard-section recent-event-section">

            <div className="dashboard-section-title-row">

              <h2>Event Terbaru</h2>

              <button
                type="button"
                className="see-all-button"
                onClick={
                  handleViewAllEvents
                }
              >
                Lihat Semua
              </button>

            </div>

            {eventError && (
              <div className="dashboard-error">
                {eventError}
              </div>
            )}

            {eventLoading ? (
              <div className="dashboard-empty">
                Memuat event...
              </div>
            ) : events.length === 0 ? (
              <div className="dashboard-empty">
                Belum ada event.
              </div>
            ) : (
              <div className="event-list">

                {events.map((event) => {

                  const imageUrl =
                    getImageUrl(
                      event.image
                    );

                  return (
                    <div
                      className="event-dashboard-card"
                      key={
                        event.event_id ||
                        event.id
                      }
                    >

                      <div className="event-card-top">

                        <div className="event-card-info">

                          <h3>
                            {event.title}
                          </h3>

                          <div className="event-meta">

                            <span>
                              <CalendarDays
                                size={12}
                              />

                              {formatDate(
                                event.start_date
                              )}
                            </span>

                            <span className="meta-dot">
                              •
                            </span>

                            <span>
                              <MapPin
                                size={12}
                              />

                              {event.venue_name ||
                                "-"}
                            </span>

                          </div>

                        </div>

                        <span
                          className={`event-status ${getStatusClass(
                            event.status
                          )}`}
                        >
                          {getStatusLabel(
                            event.status
                          )}
                        </span>

                      </div>

                      {imageUrl && (
                        <div
                          style={{
                            width: "100%",
                            height: "150px",
                            marginTop: "16px",
                            borderRadius: "9px",
                            overflow: "hidden",
                            background:
                              "#f2f0f7",
                          }}
                        >
                          <img
                            src={imageUrl}
                            alt={
                              event.title
                            }
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit:
                                "cover",
                              display:
                                "block",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        </div>
                      )}

                      <div className="event-progress-section">

                        <div className="event-progress-info">

                          <span>
                            Penjualan Tiket
                          </span>

                          <span>
                            {event.tickets_sold}{" "}
                            /{" "}
                            {event.total_quota}
                          </span>

                        </div>

                        <div className="event-progress-bar">

                          <div
                            className={`event-progress-fill ${
                              event.status ===
                              "PUBLISHED"
                                ? "progress-active"
                                : "progress-ended"
                            }`}
                            style={{
                              width: `${event.progress}%`,
                            }}
                          />

                        </div>

                        {event.min_price >
                          0 && (
                          <div
                            style={{
                              marginTop:
                                "7px",
                              color:
                                "#625d6d",
                              fontSize:
                                "10px",
                            }}
                          >
                            Mulai{" "}
                            {formatCurrency(
                              event.min_price
                            )}
                          </div>
                        )}

                      </div>

                      <div className="event-card-bottom">

                        <button
                          type="button"
                          className="detail-event-button"
                          onClick={() =>
                            handleDetailEvent(
                              event.event_id ||
                                event.id
                            )
                          }
                        >
                          Detail Event
                        </button>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </section>

          <section className="dashboard-section transaction-section">

            <div className="dashboard-section-title-row">

              <h2>Transaksi Terbaru</h2>

              <button
                type="button"
                className="see-all-button"
                onClick={
                  handleViewAllTransactions
                }
              >
                Lihat Semua
              </button>

            </div>

            {transactionError && (
              <div className="dashboard-error">
                {transactionError}
              </div>
            )}

            {transactionLoading ? (
              <div className="dashboard-empty">
                Memuat transaksi...
              </div>
            ) : transactions.length ===
              0 ? (
              <div className="dashboard-empty">
                Belum ada transaksi.
              </div>
            ) : (
              <div className="transaction-list">

                {transactions.map(
                  (transaction) => (
                    <div
                      className="transaction-card"
                      key={
                        transaction.order_id
                      }
                    >

                      <div className="transaction-info">

                        <h3>
                          {transaction.event_title ||
                            "Event"}
                        </h3>

                        <p>
                          {formatCurrency(
                            transaction.amount
                          )}
                        </p>

                        <strong>
                          Order ID:{" "}
                          {transaction.order_id ||
                            "-"}
                        </strong>

                      </div>

                      <div className="transaction-actions">

                        <span
                          className={`transaction-status ${getTransactionStatusClass(
                            transaction.status
                          )}`}
                        >
                          <span className="transaction-dot" />

                          {getTransactionStatusLabel(
                            transaction.status
                          )}
                        </span>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </section>

        </div>

      </main>

    </div>
  );
}

export default DashboardEO;