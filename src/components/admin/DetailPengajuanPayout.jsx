import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  ShieldCheck,
  ArrowRight,
  Building2,
  Check,
  FileText,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

import "./DetailPengajuanPayout.css";

import {
  getAdminPayoutDetail,
  updateAdminPayoutStatus,
  getPayoutReconciliation,
} from "../../services/adminPayoutService";

const STATUS_MAP = {
  PENDING: "PENDING",
  PROCESSING: "DIPROSES",
  APPROVED: "DISETUJUI",
  REJECTED: "DITOLAK",
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

function DetailPengajuanPayout() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [decision, setDecision] = useState("");
  const [note, setNote] = useState("");

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getAdminPayoutDetail(id);
      setData(res?.data || res);
      setError("");
    } catch (err) {
      console.error("Gagal memuat detail payout:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat detail payout."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const handleBack = () => {
    navigate("/admin/pengajuan-payout");
  };

  const handleConfirm = async () => {
    if (!id) return;
    if (!decision) {
      alert("Silakan pilih keputusan terlebih dahulu.");
      return;
    }

    try {
      setSubmitting(true);
      const status = decision === "approved" ? "APPROVED" : "REJECTED";
      await updateAdminPayoutStatus(id, status, note || null);
      alert(
        decision === "approved"
          ? "Pengajuan payout disetujui."
          : "Pengajuan payout ditolak."
      );
      navigate("/admin/pengajuan-payout");
    } catch (err) {
      console.error("Gagal mengubah status payout:", err);
      alert(
        err?.data?.msg || err?.message || "Gagal mengubah status payout."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewDocument = async () => {
    if (!id) return;
    try {
      const res = await getPayoutReconciliation(id);
      const url =
        res?.data?.reconciliationDocumentUrl ||
        res?.reconciliationDocumentUrl ||
        res?.data?.url ||
        res?.url ||
        res?.data?.fileUrl;
      if (url) {
        window.open(url, "_blank");
      } else {
        alert("URL dokumen rekonsiliasi tidak tersedia di respons.");
      }
    } catch (err) {
      console.error("Gagal mengambil dokumen rekonsiliasi:", err);
      alert(
        err?.data?.msg ||
          err?.message ||
          "Gagal mengambil dokumen rekonsiliasi."
      );
    }
  };

  if (loading) {
    return (
      <div className="detail-payout-page">
        <Sidebar />
        <main className="detail-payout-main">
          <Navbar />
          <div className="detail-payout-content detail-payout-empty">
            Memuat detail payout...
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
            {error || "Payout tidak ditemukan."}
            <button
              type="button"
              className="decision-button reject"
              onClick={() => navigate("/admin/pengajuan-payout")}
            >
              Kembali
            </button>
          </div>
        </main>
      </div>
    );
  }

  const rawStatus = String(data.status || "PENDING").toUpperCase();
  const statusLabel = STATUS_MAP[rawStatus] || data.status;

  const eventName =
    data.event?.title ||
    data.eventTitle ||
    data.eventName ||
    "-";

  const organizerName =
    data.organizerName ||
    data.organizer?.name ||
    data.user?.name ||
    data.userName ||
    "-";

  const gross = Number(
    data.amount ?? data.grossAmount ?? data.totalAmount ?? 0
  );

  const fee = Number(
    data.platformFee ?? (Number.isNaN(gross) ? 0 : gross * 0.05)
  );

  const net = Number.isNaN(gross) ? 0 : Math.max(gross - fee, 0);

  const totalSold = data.totalTicketsSold ?? data.ticketsSold ?? "-";
  const quota = data.ticketQuota ?? data.quota ?? "-";

  const bankName = data.bankName || "-";
  const accountNumber = data.accountNumber || data.bankAccountNumber || "-";
  const accountName = data.accountName || data.bankAccountName || "-";
  const bankVerified = data.bankVerified ?? data.isBankVerified ?? false;

  const requestDate =
    data.createdAt || data.requestDate || data.submittedAt;

  return (
    <div className="detail-payout-page">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN */}
      <main className="detail-payout-main">
        {/* NAVBAR */}
        <Navbar />

        <div className="detail-payout-content">

          {/* =====================================================
              TOP
          ===================================================== */}

          <div className="detail-payout-back">
            <button
              type="button"
              onClick={handleBack}
            >
              <ArrowLeft
                size={15}
                strokeWidth={1.8}
              />

              <span>Kembali ke Daftar Payout</span>
            </button>
          </div>


          {/* =====================================================
              PAGE HEADER
          ===================================================== */}

          <div className="detail-payout-header">

            <div className="detail-payout-title-wrapper">

              <h1>
                Review Pengajuan Payout
              </h1>

              <span className="detail-payout-status">
                {statusLabel}
              </span>

              <span className="detail-payout-id">
                #{data.id || "-"}
              </span>

            </div>

            <span className="detail-payout-request-date">
              Diajukan pada {formatDate(requestDate)}
            </span>

          </div>


          {/* =====================================================
              MAIN GRID
          ===================================================== */}

          <div className="detail-payout-grid">

            {/* =================================================
                LEFT CONTENT
            ================================================= */}

            <div className="detail-payout-left">


              {/* =================================================
                  EVENT & PAYOUT
              ================================================= */}

              <section className="detail-payout-card event-payout-card">

                <div className="detail-card-header">

                  <h2>
                    Rincian Event &amp; Payout
                  </h2>

                  <span>
                    Kalkulasi Sistem Otomatis
                  </span>

                </div>

                <div className="detail-card-divider"></div>


                <div className="event-payout-grid">

                  {/* EVENT */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      NAMA EVENT
                    </span>

                    <strong>
                      {eventName}
                    </strong>

                  </div>


                  {/* ORGANIZER */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      EVENT ORGANIZER
                    </span>

                    <strong>
                      {organizerName}
                    </strong>

                  </div>


                  {/* TICKET */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      TOTAL TIKET TERJUAL
                    </span>

                    <strong>
                      {totalSold !== "-" && quota !== "-"
                        ? `${totalSold} / ${quota}`
                        : totalSold}
                    </strong>

                  </div>


                  {/* REVENUE */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      TOTAL DANA DIAJUKAN
                    </span>

                    <strong>
                      {formatRupiah(gross)}
                    </strong>

                  </div>


                  {/* FEE */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      BIAYA LAYANAN / PLATFORM FEE
                    </span>

                    <strong className="fee-value">
                      -{formatRupiah(fee)}
                    </strong>

                  </div>

                </div>


                {/* NET PAYOUT */}

                <div className="net-payout-box">

                  <div className="net-payout-info">

                    <span>
                      TOTAL DANA BERSIH (NET PAYOUT)
                    </span>

                    <small>
                      Jumlah bersih yang akan ditransfer ke rekening EO
                    </small>

                  </div>

                  <strong>
                    {formatRupiah(net)}
                  </strong>

                </div>

              </section>


              {/* =================================================
                  BANK ACCOUNT
              ================================================= */}

              <section className="detail-payout-card bank-card">

                <div className="detail-card-header">

                  <h2>
                    Rekening Tujuan Transfer
                  </h2>

                </div>

                <div className="detail-card-divider"></div>


                <div className="bank-grid">

                  {/* BANK */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      BANK TUJUAN
                    </span>

                    <div className="bank-name">

                      <span className="bank-logo">
                        {bankName.slice(0, 3).toUpperCase()}
                      </span>

                      <strong>
                        {bankName}
                      </strong>

                    </div>

                  </div>


                  {/* ACCOUNT NUMBER */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      NOMOR REKENING
                    </span>

                    <strong className="normal-value">
                      {accountNumber}
                    </strong>

                  </div>


                  {/* ACCOUNT NAME */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      ATAS NAMA REKENING
                    </span>

                    <strong>
                      {accountName}
                    </strong>

                  </div>


                  {/* VALIDATION */}

                  <div className="detail-field">

                    <span className="detail-field-label">
                      STATUS VALIDASI REKENING
                    </span>

                    <span
                      className={
                        bankVerified
                          ? "verified-badge"
                          : "unverified-badge"
                      }
                    >

                      <Check
                        size={14}
                        strokeWidth={2}
                      />

                      {bankVerified
                        ? "Terverifikasi Otomatis"
                        : "Belum Terverifikasi"}

                    </span>

                  </div>

                </div>

              </section>


              {/* =================================================
                  DOCUMENTS
              ================================================= */}

              <section className="detail-payout-card document-card">

                <div className="detail-card-header">

                  <h2>
                    Dokumen Pendukung Payout
                  </h2>

                </div>

                <div className="detail-card-divider"></div>


                <div className="document-list">

                  {/* DOCUMENT REKONSILIASI */}

                  <div className="document-item">

                    <div className="document-item-left">

                      <div className="document-icon pdf-icon">

                        <FileText
                          size={17}
                          strokeWidth={1.8}
                        />

                      </div>

                      <div className="document-info">

                        <strong>
                          Laporan Rekonsiliasi Penjualan Tiket
                        </strong>

                        <span>
                          Dokumen resmi payout
                        </span>

                      </div>

                    </div>

                    <button
                      type="button"
                      onClick={handleViewDocument}
                    >
                      Lihat Dokumen
                    </button>

                  </div>

                </div>

              </section>

            </div>


            {/* =================================================
                RIGHT ACTION
            ================================================= */}

            <aside className="superadmin-card">

              {/* TITLE */}

              <div className="superadmin-header">

                <ShieldCheck
                  size={21}
                  strokeWidth={1.9}
                />

                <h2>
                  Aksi Superadmin
                </h2>

              </div>


              {/* DECISION */}

              <div className="decision-buttons">

                <button
                  type="button"
                  className={`decision-button reject ${
                    decision === "rejected"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setDecision("rejected")
                  }
                >
                  Tolak
                </button>

                <button
                  type="button"
                  className={`decision-button approve ${
                    decision === "approved"
                      ? "selected"
                      : ""
                  }`}
                  onClick={() =>
                    setDecision("approved")
                  }
                >
                  Setujui
                </button>

              </div>


              {/* NOTE */}

              <div className="internal-note">

                <label>
                  CATATAN INTERNAL (OPSIONAL)
                </label>

                <textarea
                  value={note}
                  onChange={(e) =>
                    setNote(e.target.value)
                  }
                  placeholder={
                    "Tambahkan catatan persetujuan\natau alasan penolakan..."
                  }
                />

              </div>


              {/* CONFIRM */}

              <button
                type="button"
                className="confirm-decision-button"
                onClick={handleConfirm}
                disabled={submitting}
              >
                <span>
                  {submitting
                    ? "Memproses..."
                    : "Konfirmasi Keputusan"}
                </span>

                <ArrowRight
                  size={18}
                  strokeWidth={1.8}
                />
              </button>


              {/* INFO */}

              <div className="transfer-info">

                <div className="transfer-info-icon">
                  i
                </div>

                <p>
                  Dana yang disetujui akan diproses
                  transfer otomatis via Payment
                  Gateway atau kliring manual dalam
                  1x24 jam kerja.
                </p>

              </div>

            </aside>

          </div>

        </div>
      </main>
    </div>
  );
}

export default DetailPengajuanPayout;