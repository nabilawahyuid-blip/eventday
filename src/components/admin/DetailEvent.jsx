import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getAdminEventDetail,
  getAdminEventSales,
  deleteAdminEvent,
  updateAdminEventStatus,
} from "../../services/adminEventService";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";
import "./DetailEvent.css";

function DetailEvent() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [sales, setSales] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);

  const fetchDetail = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const [detailRes, salesRes] = await Promise.allSettled([
        getAdminEventDetail(id),
        getAdminEventSales(id),
      ]);
      if (detailRes.status === "fulfilled") {
        setEvent(detailRes.value?.data ?? null);
      } else {
        throw detailRes.reason;
      }
      if (salesRes.status === "fulfilled") {
        setSales(salesRes.value?.data ?? null);
      }
    } catch (err) {
      console.error("Gagal memuat detail event:", err);
      setError(err?.data?.msg || err?.message || "Gagal memuat detail event.");
      setEvent(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // Setujui pengajuan event (DRAFT → PUBLISHED/Aktif)
  const handleApprove = async () => {
    if (!window.confirm("Setujui event ini? Status menjadi AKTIF dan tampil ke customer.")) return;
    try {
      setApproving(true);
      await updateAdminEventStatus(id, "PUBLISHED");
      alert("Event disetujui dan aktif.");
      await fetchDetail();
    } catch (err) {
      console.error("Gagal menyetujui event:", err);
      alert(err?.data?.msg || err?.message || "Gagal menyetujui event.");
    } finally {
      setApproving(false);
    }
  };

  // Tolak pengajuan event (DRAFT → CANCELLED) + alasan penolakan
  const handleReject = async () => {
    const reason = window.prompt("Alasan penolakan (opsional):", "");
    if (reason === null) return; // user batal
    try {
      setRejecting(true);
      await updateAdminEventStatus(id, "CANCELLED", reason || null);
      alert("Event ditolak.");
      await fetchDetail();
    } catch (err) {
      console.error("Gagal menolak event:", err);
      alert(err?.data?.msg || err?.message || "Gagal menolak event.");
    } finally {
      setRejecting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Hapus event ini? (soft delete → status DELETED)")) return;
    try {
      setDeleting(true);
      await deleteAdminEvent(id);
      alert("Event berhasil dihapus.");
      navigate("/admin/event-management");
    } catch (err) {
      console.error("Gagal menghapus event:", err);
      alert(err?.data?.msg || err?.message || "Gagal menghapus event.");
    } finally {
      setDeleting(false);
    }
  };

  // == STATE LOADING / ERROR ==
  if (loading) {
    return (
      <div className="detail-event-page">
        <Sidebar />
        <main className="detail-main">
          <Navbar />
          <section className="detail-content">
            <p style={{ padding: 30, color: "#8d889a" }}>Memuat detail event...</p>
          </section>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-event-page">
        <Sidebar />
        <main className="detail-main">
          <Navbar />
          <section className="detail-content">
            <div className="detail-page-header">
              <div><h2>Detail Event</h2></div>
              <button type="button" className="back-button" onClick={() => navigate("/admin/event-management")}>
                ← KEMBALI
              </button>
            </div>
            <p style={{ padding: 30, color: "#dc6868" }}>{error || "Event tidak ditemukan."}</p>
          </section>
        </main>
      </div>
    );
  }

  // == NORMALISASI FIELD BE → UI ==
  const rawStatus = String(event.status || "PUBLISHED").toUpperCase();
  // DRAFT = pengajuan EO yang menunggu persetujuan admin
  const statusLabel =
    rawStatus === "PUBLISHED" ? "EVENT AKTIF"
    : rawStatus === "DRAFT" ? "DRAFT — Menunggu Persetujuan"
    : rawStatus === "CANCELLED" ? "DITOLAK"
    : rawStatus === "COMPLETED" ? "SELESAI"
    : rawStatus;
  // Warna: draft = kuning, aktif = hijau, selesai/ditolak = merah
  const statusClass =
    rawStatus === "DRAFT" ? "draft"
    : rawStatus === "CANCELLED" || rawStatus === "COMPLETED" ? "finished"
    : "";
  const isDraft = rawStatus === "DRAFT";

  const category = String(event.category || "").replace(/_/g, " ");
  let dateLabel = event.startDate || "-";
  let timeLabel = "-";
  try {
    if (event.startDate) {
      const d = new Date(event.startDate);
      dateLabel = d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      timeLabel = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    }
  } catch { /* pakai mentah */ }

  const ticketsSold =
    sales?.totalTicketsSold ?? event?.salesSummary?.ticketsSold ?? 0;
  const totalTickets =
    (event.ticketTiers || []).reduce((a, t) => a + (Number(t.totalQuota) || 0), 0) || 0;
  const percentage = totalTickets > 0 ? (ticketsSold / totalTickets) * 100 : 0;

  // ==
  // RENDER
  // ==

  return (
    <div className="detail-event-page">

      {/* ======
          SIDEBAR
      ======= */}

      <Sidebar />


      {/* ======
          MAIN AREA
      ======= */}

      <main className="detail-main">

        {/* ======
            NAVBAR
        ======= */}

        <Navbar />


        {/* ======
            CONTENT
        ======= */}

        <section className="detail-content">

          {/* ======
              PAGE HEADER
          ======= */}

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
                navigate("/admin/event-management")
              }
            >
              ← KEMBALI
            </button>

          </div>


          {/* ======
              EVENT CARD
          ======= */}

          <article className="detail-card">

            {/* ====
                HERO EVENT
            ===== */}

            <div
              className="detail-hero"
              style={
                event.bannerUrl
                  ? {
                      backgroundImage: `url(${event.bannerUrl})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }
                  : undefined
              }
            >

              {/* STATUS */}

              <span
                className={`event-status ${statusClass}`}
              >
                ● {statusLabel}
              </span>


              {/* CATEGORY */}

              <span className="hero-category">
                {category}
              </span>


              {/* EVENT VISUAL */}

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

            </div>


            {/* ====
                EVENT BODY
            ===== */}

            <div className="detail-body">

              {/* TITLE */}

              <div className="event-title-section">

                <h1>
                  {event.title}
                </h1>

              </div>


              {/* META */}

              <div className="event-meta">

                <div className="meta-item">

                  <span className="meta-icon">
                    ▣
                  </span>

                  <span>
                    {dateLabel}
                  </span>

                </div>


                <div className="meta-item">

                  <span className="meta-icon">
                    ◷
                  </span>

                  <span>
                    {timeLabel}
                  </span>

                </div>


                <div className="meta-item">

                  <span className="meta-icon">
                    ◉
                  </span>

                  <span>
                    {event.venueName || "-"}
                  </span>

                </div>

              </div>


              {/* DIVIDER */}

              <div className="detail-divider"></div>


              {/* ====
                  DESCRIPTION
              ===== */}

              <section className="description-section">

                <h3>
                  Deskripsi Event
                </h3>

                <p>
                  {event.description || "-"}
                </p>

              </section>


              {/* ====
                  TICKET SALES
              ===== */}

              <section className="ticket-section">

                <div className="ticket-header">

                  <div>

                    <h3>
                      Penjualan Tiket
                    </h3>

                    <p>
                      Total tiket terjual dari kuota tersedia
                    </p>

                  </div>


                  <div className="ticket-count">

                    <strong>
                      {ticketsSold}
                    </strong>

                    <span>
                      / {totalTickets}
                    </span>

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
                    {Math.round(percentage)}% Terjual
                  </span>

                </div>

              </section>


              {/* ====
                  EVENT INFORMATION
              ===== */}

              <div className="event-extra-info">

                <div className="extra-item">

                  <span>
                    Penyelenggara
                  </span>

                  <strong>
                    {event.organizerName || "-"}
                  </strong>

                </div>


                <div className="extra-item">

                  <span>
                    Status Event
                  </span>

                  <strong>
                    {statusLabel}
                  </strong>

                </div>


                <div className="extra-item">

                  <span>
                    Event ID
                  </span>

                  <strong>
                    {event.eventId || id}
                  </strong>

                </div>

              </div>


              {/* ====
                  ACTION
              ===== */}

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
                    navigate(`/admin/event/edit/${event.eventId || id}`)
                  }
                >
                  Edit Event
                </button>


                <button
                  type="button"
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={deleting}
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
