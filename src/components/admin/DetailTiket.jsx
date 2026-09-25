import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  User,
  ShieldAlert,
  QrCode,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

// Reuse layout seragam detail admin (layout + penyeragaman sama persis
// dengan DetailPengajuanPayout — tanpa file CSS baru).
import "./DetailPengajuanPayout.css";

import {
  getAdminTicketDetail,
  checkinAdminTicket,
  revokeAdminTicket,
} from "../../services/adminTicketService";

import {
  showSuccess,
  showError,
  showConfirm,
} from "../../utils/alert";

const STATUS_MAP = {
  UNREDEEMED: "BELUM DIGUNAKAN",
  USED: "DIGUNAKAN",
  CHECKED_IN: "CHECKED IN",
  EXPIRED: "KEDALUWARSA",
  REFUNDED: "DIREFUND",
  REVOKED: "DICABUT",
};

const formatRupiah = (value) => {
  const num = Number(value);
  if (Number.isNaN(num) || value === null || value === undefined) return "-";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso);
  return d.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function DetailTiket() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getAdminTicketDetail(id);
      setData(res?.data || res);
      setError("");
    } catch (err) {
      console.error("Gagal memuat detail tiket:", err);
      setError(err?.data?.msg || err?.message || "Gagal memuat detail tiket.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const handleBack = () => {
    navigate("/admin/tiket");
  };

  const handleAction = async () => {
    if (!id) return;
    const st = String(
      data?.checkInStatus || data?.status || ""
    ).toUpperCase();
    const action = st === "UNREDEEMED" ? "checkin" : "revoke";

    const code = data?.ticketCode || data?.id || id;
    const { isConfirmed } = await showConfirm(
      "Konfirmasi Tindakan",
      `${action === "checkin" ? "Check-in" : "Revoke"} tiket ${code}?`,
      "Ya, Lanjutkan",
      "Batal"
    );
    if (!isConfirmed) return;

    try {
      setSubmitting(true);
      if (action === "checkin") {
        await checkinAdminTicket(id);
      } else {
        await revokeAdminTicket(id);
      }
      await showSuccess(
        "Tiket Berhasil Diproses",
        action === "checkin"
          ? "Tiket berhasil di-check-in."
          : "Tiket berhasil dicabut."
      );
      await loadDetail();
    } catch (err) {
      console.error("Gagal memproses tiket:", err);
      await showError(
        "Gagal Memproses Tiket",
        err?.data?.msg || err?.message || "Gagal memproses tiket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="detail-payout-page">
        <Sidebar />
        <main className="detail-payout-main">
          <Navbar />
          <div className="detail-payout-content detail-payout-empty">
            Memuat detail tiket...
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="detail-payout-page">
        <Sidebar />
        <main className="detail-payout-main">
          <Navbar />
          <div className="detail-payout-content detail-payout-empty">
            {error || "Tiket tidak ditemukan."}
            <button
              type="button"
              className="decision-button reject"
              onClick={() => navigate("/admin/tiket")}
            >
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  const rawStatus = String(data.checkInStatus || data.status || "").toUpperCase();
  const statusLabel = STATUS_MAP[rawStatus] || data.status || "-";

  const eventName =
    data.eventTitle ||
    data.event?.title ||
    data.eventName ||
    "-";
  const eventDate = data.eventDate || data.event?.date || data.date;
  const venueName =
    data.venueName ||
    data.venue ||
    data.event?.venueName ||
    data.location ||
    "-";

  const tierName =
    data.tierName ||
    data.categoryName ||
    data.ticketType ||
    data.type ||
    "-";

  const price = formatRupiah(
    data.price ?? data.tierPrice ?? data.amount
  );

  const ticketCode = data.ticketCode || data.code || data.id || "-";
  const orderNumber =
    data.orderNumber || data.orderId || data.order?.orderNumber || "-";

  const attendeeName =
    data.attendeeName || data.attendee?.name || "-";
  const attendeeEmail =
    data.attendeeEmail || data.attendee?.email || "-";
  const attendeeNik =
    data.attendeeIdentityNumber ||
    data.attendeeNik ||
    data.attendee?.identityNumber ||
    "-";

  const issuedAt = data.issuedAt || data.createdAt;
  const checkInAt = data.checkInAt || data.usedAt;

  const canAction =
    rawStatus === "UNREDEEMED" ||
    rawStatus === "USED" ||
    rawStatus === "";

  return (
    <div className="detail-payout-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="detail-payout-main">
        {/* NAVBAR */}
        <Navbar />

        <div className="detail-payout-content">

          {/* ===================== TOP ===================== */}
          <div className="detail-payout-back">
            <button type="button" onClick={handleBack}>
              <ArrowLeft size={15} strokeWidth={1.8} />
              <span>Kembali ke Daftar Tiket</span>
            </button>
          </div>

          {/* ===================== PAGE HEADER ===================== */}
          <div className="detail-payout-header">
            <div className="detail-payout-title-wrapper">
              <h1>Detail Tiket</h1>
              <span className="detail-payout-status">{statusLabel}</span>
              <span className="detail-payout-id">#{ticketCode}</span>
            </div>
            <span className="detail-payout-request-date">
              Diterbitkan pada {formatDate(issuedAt)}
            </span>
          </div>

          {/* ===================== MAIN GRID ===================== */}
          <div className="detail-payout-grid">

            {/* LEFT CONTENT */}
            <div className="detail-payout-left">

              {/* RINCIAN EVENT */}
              <section className="detail-payout-card event-payout-card">
                <div className="detail-card-header">
                  <h2>
                    <Ticket size={16} strokeWidth={1.9} /> Rincian Event &amp; Tiket
                  </h2>
                  <span>Informasi tiket</span>
                </div>

                <div className="detail-card-divider"></div>

                <div className="event-payout-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">NAMA EVENT</span>
                    <strong>{eventName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">KATEGORI / TIER</span>
                    <strong>{tierName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">JADWAL EVENT</span>
                    <strong className="normal-value">{formatDate(eventDate)}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">TEMPAT / VENUE</span>
                    <strong className="normal-value">{venueName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">HARGA TIKET</span>
                    <strong>{price}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">NOMOR ORDER</span>
                    <strong className="normal-value">{orderNumber}</strong>
                  </div>
                </div>
              </section>

              {/* ATTENDEE */}
              <section className="detail-payout-card bank-card">
                <div className="detail-card-header">
                  <h2>
                    <User size={16} strokeWidth={1.9} /> Pemilik Tiket
                  </h2>
                  <span>Data peserta terdaftar</span>
                </div>

                <div className="detail-card-divider"></div>

                <div className="bank-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">NAMA PESERTA</span>
                    <strong>{attendeeName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">EMAIL</span>
                    <strong className="normal-value">{attendeeEmail}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">NOMOR IDENTITAS</span>
                    <strong className="normal-value">{attendeeNik}</strong>
                  </div>
                </div>
              </section>

              {/* STATUS & CHECK-IN */}
              <section className="detail-payout-card document-card">
                <div className="detail-card-header">
                  <h2>
                    <QrCode size={16} strokeWidth={1.9} /> Status &amp; Check-in
                  </h2>
                </div>

                <div className="detail-card-divider"></div>

                <div className="bank-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">STATUS TIKET</span>
                    <strong>{statusLabel}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">DITERBITKAN PADA</span>
                    <strong className="normal-value">{formatDate(issuedAt)}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">CHECK-IN PADA</span>
                    <strong className="normal-value">{formatDate(checkInAt)}</strong>
                  </div>
                </div>
              </section>

            </div>

            {/* RIGHT ACTION */}
            <aside className="superadmin-card">
              <div className="superadmin-header">
                <ShieldAlert size={21} strokeWidth={1.9} />
                <h2>Aksi Admin</h2>
              </div>

              {canAction ? (
                <>
                  <div className="decision-buttons">
                    <button
                      type="button"
                      className={
                        rawStatus === "UNREDEEMED"
                          ? "decision-button approve"
                          : "decision-button reject"
                      }
                      onClick={handleAction}
                      disabled={submitting}
                    >
                      {rawStatus === "UNREDEEMED" ? "Check-in" : "Revoke"}
                    </button>
                  </div>

                  <button
                    type="button"
                    className="confirm-decision-button"
                    onClick={handleAction}
                    disabled={submitting}
                  >
                    <span>
                      {submitting
                        ? "Memproses..."
                        : rawStatus === "UNREDEEMED"
                          ? "Check-in Tiket"
                          : "Revoke / Cabut Tiket"}
                    </span>
                  </button>
                </>
              ) : (
                <div className="transfer-info">
                  <div className="transfer-info-icon">i</div>
                  <p>
                    Status tiket (KEDALUWARSA / DIREFUND / DICABUT) sudah
                    final dan tidak dapat diubah.
                  </p>
                </div>
              )}

              <div className="detail-payout-card">
                <div className="detail-field">
                  <span className="detail-field-label">
                    <MapPin size={13} strokeWidth={1.9} /> LOKASI
                  </span>
                  <strong>{venueName}</strong>
                </div>
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailTiket;