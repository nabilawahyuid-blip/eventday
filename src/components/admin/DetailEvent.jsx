import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminEventDetail,
  getAdminEventSales,
  deleteAdminEvent,
  updateAdminEventStatus,
  approveAdminEvent,
  rejectAdminEvent,
} from "../../services/adminEventService";

import {
  showConfirm,
  showSuccess,
  showError,
  showWarning,
  showInfo,
} from "../../utils/alert";

import { resolveBannerUrl } from "../../utils/bannerUrl";

import {
  Calendar,
  Clock,
  MapPin,
  Tag,
  Building2,
  Hash,
  Info,
  Check,
  X,
  Pencil,
  Trash2,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

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

  // Status change loading states (tombol Setujui/Tolak/Hapus)
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
          await getAdminEventDetail(id);

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

        // Load sales summary after event data is loaded
        loadAdminEventSales(eventData.eventId || eventData.id);
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

  const loadAdminEventSales = async (eventId) => {
    if (!eventId) return;

    try {
      setSalesLoading(true);
      const response = await getAdminEventSales(eventId);

      const summary =
        response?.data?.data ||
        response?.data ||
        response;

      setSalesSummary(summary);
    } catch (err) {
      /*
       * Sales summary bukan alasan untuk menggagalkan halaman detail.
       * Jika admin tapi belum punya akses organizer, atau bukan organizer,
       * tetap tampilkan event saja.
       */
      console.warn("Sales summary tidak tersedia:", err);
      setSalesSummary(null);
    } finally {
      setSalesLoading(false);
    }
  };

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
  // HANDLE APPROVE/REJECT/DELETE
  // =====================================================

  const handleApprove = async () => {
    setApproving(true);
    try {
      await approveAdminEvent(eventId);
      setEvent((prev) => ({
        ...prev,
        status: "PUBLISHED",
      }));
      showSuccess("Event disetujui & dipublikasikan!");
      setApproving(false);
    } catch (err) {
      console.error("Gagal menyetujui event:", err);
      showError("Gagal menyetujui event", err?.data?.msg || err?.message);
      setApproving(false);
    }
  };

  const handleReject = async () => {
    setRejecting(true);
    try {
      await rejectAdminEvent(eventId, "Ditolak oleh admin");
      setEvent((prev) => ({
        ...prev,
        status: "REJECTED",
      }));
      showSuccess("Event ditolak!");
      setRejecting(false);
    } catch (err) {
      console.error("Gagal menolak event:", err);
      showError("Gagal menolak event", err?.data?.msg || err?.message);
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAdminEvent(eventId);
      setEvent(null);
      navigate("/event-management");
      showSuccess("Event dihapus (soft delete).");
      setDeleting(false);
    } catch (err) {
      console.error("Gagal menghapus event:", err);
      showError("Gagal menghapus event", err?.data?.msg || err?.message);
      setDeleting(false);
    }
  };

  // =====================================================
  // BANNER URL
  // =====================================================

  const bannerUrl = resolveBannerUrl(
    event?.banner_url ||
      event?.bannerUrl
  );

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

  // "MUSIC_FESTIVAL" → "Music Festival" untuk tampilan
  const categoryLabel = String(category)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) =>
      c.toUpperCase()
    );

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

  // Status yang masih bisa disetujui/ditolak admin:
  // - DRAFT            (draft lokal, belum diajukan)
  // - PENDING_APPROVAL (diajukan EO, menunggu persetujuan)
  // - REJECTED         (bisa diajukan ulang oleh admin)
  const showApprovalActions = [
    "DRAFT",
    "PENDING_APPROVAL",
    "REJECTED",
  ].includes(normalizedStatus);

  // Label ramah untuk badge "Status Event"
  const statusLabel =
    normalizedStatus === "PUBLISHED"
      ? "Aktif"
      : normalizedStatus === "DRAFT"
        ? "Draft"
        : normalizedStatus === "PENDING_APPROVAL"
          ? "Menunggu Persetujuan"
          : normalizedStatus === "REJECTED"
            ? "Ditolak"
            : normalizedStatus === "COMPLETED" ||
                normalizedStatus === "FINISHED"
              ? "Selesai"
              : normalizedStatus === "CANCELLED"
                ? "Dibatalkan"
                : normalizedStatus === "DELETED"
                  ? "Dihapus"
                  : normalizedStatus || "-";

  // Kelas warna badge status: draft/kuning (belum tayang),
  // finished/merah (selesai/ditolak/dibatalkan), lainnya hijau
  const statusClass =
    normalizedStatus === "DRAFT" ||
    normalizedStatus === "PENDING_APPROVAL"
      ? "draft"
      : normalizedStatus === "COMPLETED" ||
          normalizedStatus === "FINISHED" ||
          normalizedStatus === "REJECTED" ||
          normalizedStatus === "CANCELLED"
        ? "finished"
        : "";

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

            <div className="detail-page-title-wrap">
              <h2>
                Detail Event
              </h2>

              <p className="detail-page-subtitle">
                Informasi lengkap event beserta
                data penjualan tiket.
              </p>
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
                      backgroundSize: "cover",
                      backgroundPosition: "center",
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
                ● {statusLabel}
              </span>

              {/* CATEGORY */}

              <span className="hero-category">
                {categoryLabel}
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
                    <Calendar size={15} strokeWidth={2} />
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
                    <Clock size={15} strokeWidth={2} />
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
                    <MapPin size={15} strokeWidth={2} />
                  </span>

                  <span>
                    {location}
                  </span>

                </div>

              </div>

              {/* =================================================
                  STATUS NOTICE
              ================================================= */}

              {showApprovalActions && (
                <div
                  className={`status-notice ${
                    normalizedStatus ===
                    "REJECTED"
                      ? "notice-rejected"
                      : "notice-waiting"
                  }`}
                >
                  <Info size={16} strokeWidth={2} />

                  <span>
                    {normalizedStatus ===
                    "REJECTED"
                      ? "Event ini ditolak dan tidak tampil di publik. Setujui untuk mempublikasikannya kembali."
                      : normalizedStatus ===
                        "PENDING_APPROVAL"
                        ? "Event ini diajukan dan sedang menunggu persetujuan. Setujui agar tampil di halaman pembeli."
                        : "Event ini masih berupa draf dan belum tampil untuk pembeli."}
                  </span>

                </div>
              )}

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
                          dari {totalTickets}{" "}
                          tiket
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
                    % dari kuota terjual
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

                  <span className="extra-icon">
                    <Building2 size={15} strokeWidth={2} />
                  </span>

                  <div>
                    <span>Penyelenggara</span>

                    <strong>{organizer}</strong>
                  </div>

                </div>

                <div className="extra-item">

                  <span className="extra-icon">
                    <Tag size={15} strokeWidth={2} />
                  </span>

                  <div>
                    <span>Kategori</span>

                    <strong>{categoryLabel}</strong>
                  </div>

                </div>

                <div className="extra-item">

                  <span className="extra-icon">
                    <Info size={15} strokeWidth={2} />
                  </span>

                  <div>
                    <span>Status Event</span>

                    <strong>{statusLabel}</strong>
                  </div>

                </div>

                <div className="extra-item">

                  <span className="extra-icon">
                    <Hash size={15} strokeWidth={2} />
                  </span>

                  <div>
                    <span>Event ID</span>

                    <strong>{eventId}</strong>
                  </div>

                </div>

              </div>

              {/* =================================================
                  ACTION
              ================================================= */}

              <div className="detail-actions">

                {showApprovalActions && (
                  <div className="approval-group">

                    <button
                      type="button"
                      className="approve-button"
                      onClick={handleApprove}
                      disabled={approving || rejecting}
                    >
                      <Check size={16} strokeWidth={2.5} />
                      {approving
                        ? "Menyetujui..."
                        : "Setujui"}
                    </button>

                    <button
                      type="button"
                      className="reject-button"
                      onClick={handleReject}
                      disabled={approving || rejecting}
                    >
                      <X size={16} strokeWidth={2.5} />
                      {rejecting
                        ? "Menolak..."
                        : "Tolak"}
                    </button>

                  </div>
                )}

                <div className="manage-group">

                  <button
                    type="button"
                    className="edit-button"
                    onClick={() =>
                      navigate(
                        `/admin/event/edit/${eventId}`
                      )
                    }
                    disabled={approving || rejecting}
                  >
                    <Pencil size={15} strokeWidth={2} />
                    Edit Event
                  </button>

                  <button
                    type="button"
                    className="delete-button"
                    onClick={handleDelete}
                    disabled={deleting}
                  >
                    <Trash2 size={15} strokeWidth={2} />
                    {deleting
                      ? "Menghapus..."
                      : "Hapus Event"}
                  </button>

                </div>

              </div>

            </div>

          </article>

        </section>

      </main>

    </div>
  );
}

export default DetailEvent;
