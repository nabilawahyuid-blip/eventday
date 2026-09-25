import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Receipt,
  ShoppingBag,
  CreditCard,
  ArrowRight,
  User,
  Calendar,
} from "lucide-react";

import Sidebar from "../shared/Sidebar";
import Navbar from "../shared/Navbar";

// Reuse layout seragam detail admin (layout + penyeragaman sama persis
// dengan DetailPengajuanPayout — tanpa file CSS baru).
import "./DetailPengajuanPayout.css";

import {
  getAdminTransactionDetail,
  updateAdminTransactionStatus,
} from "../../services/adminTransactionService";

import {
  showSuccess,
  showError,
  showConfirm,
} from "../../utils/alert";

const STATUS_MAP = {
  PENDING: "PENDING",
  WAITING_PAYMENT: "MENUNGGU PEMBAYARAN",
  PAID: "LUNAS",
  EXPIRED: "KEDALUWARSA",
  CANCELLED: "DIBATALKAN",
  REFUNDED: "DIREFUND",
};

const CAN_ACTIONS = {
  PENDING: ["CANCELLED"],
  WAITING_PAYMENT: ["CANCELLED"],
  PAID: ["REFUNDED"],
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

function DetailTransaksi() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadDetail = async () => {
    try {
      setLoading(true);
      const res = await getAdminTransactionDetail(id);
      setData(res?.data || res);
      setError("");
    } catch (err) {
      console.error("Gagal memuat detail transaksi:", err);
      setError(
        err?.data?.msg || err?.message || "Gagal memuat detail transaksi."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) loadDetail();
  }, [id]);

  const handleBack = () => {
    navigate("/admin/transaksi");
  };

  const handleStatusChange = async (status) => {
    if (!id || !status) return;
    const label = STATUS_MAP[status] || status;
    const { isConfirmed } = await showConfirm(
      "Konfirmasi Tindakan",
      `Ubah status transaksi menjadi ${label}?`,
      "Ya, Lanjutkan",
      "Batal"
    );
    if (!isConfirmed) return;
    try {
      setSubmitting(true);
      await updateAdminTransactionStatus(id, status);
      await showSuccess(
        "Status Transaksi Diperbarui",
        "Status transaksi berhasil diubah."
      );
      await loadDetail();
    } catch (err) {
      console.error("Gagal mengubah status transaksi:", err);
      await showError(
        "Gagal Memperbarui Status Transaksi",
        err?.data?.msg || err?.message || "Gagal mengubah status."
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
            Memuat detail transaksi...
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
            {error || "Transaksi tidak ditemukan."}
            <button
              type="button"
              className="decision-button reject"
              onClick={() => navigate("/admin/transaksi")}
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
  const allowedActions = CAN_ACTIONS[rawStatus] || [];

  const customerName =
    data.customerName ||
    data.userName ||
    data.user?.name ||
    "-";
  const customerEmail =
    data.customerEmail ||
    data.userEmail ||
    data.user?.email ||
    "-";
  const customerPhone =
    data.customerPhone ||
    data.userPhone ||
    data.user?.phone ||
    "-";

  const eventName =
    data.eventTitle ||
    data.event?.title ||
    data.eventName ||
    "-";

  const tierName =
    data.ticketTierName ||
    data.tierName ||
    data.tier?.name ||
    "-";

  const quantity = data.quantity ?? data.qty ?? 1;

  const orderNumber = data.orderNumber || data.orderId || data.id || "-";

  const subtotal = Number(data.subtotal ?? data.subtotalAmount ?? 0);
  const adminFee = Number(data.adminFee ?? data.fee ?? 0);
  const discount = Number(data.discountAmount ?? data.discount ?? 0);
  const tax = Number(data.tax ?? data.taxAmount ?? 0);
  const total = Number(
    data.totalAmount ?? data.amount ?? subtotal + adminFee - discount + tax
  );

  const createdAt = data.createdAt || data.orderDate || data.transactionDate;
  const paidAt = data.paidAt || data.paymentDate;
  const expiredAt = data.expiredAt;

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
              <span>Kembali ke Daftar Transaksi</span>
            </button>
          </div>

          {/* ===================== PAGE HEADER ===================== */}
          <div className="detail-payout-header">
            <div className="detail-payout-title-wrapper">
              <h1>Detail Transaksi</h1>
              <span className="detail-payout-status">{statusLabel}</span>
              <span className="detail-payout-id">
                #{data.id || orderNumber}
              </span>
            </div>
            <span className="detail-payout-request-date">
              Dibuat pada {formatDate(createdAt)}
            </span>
          </div>

          {/* ===================== MAIN GRID ===================== */}
          <div className="detail-payout-grid">

            {/* LEFT CONTENT */}
            <div className="detail-payout-left">

              {/* RINCIAN EVENT & TIKET */}
              <section className="detail-payout-card event-payout-card">
                <div className="detail-card-header">
                  <h2>
                    <ShoppingBag size={16} strokeWidth={1.9} /> Rincian Event &amp; Tiket
                  </h2>
                  <span>Informasi pesanan</span>
                </div>

                <div className="detail-card-divider"></div>

                <div className="event-payout-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">NAMA EVENT</span>
                    <strong>{eventName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">NAMA TIER / KATEGORI</span>
                    <strong>{tierName}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">JUMLAH TIKET</span>
                    <strong>{quantity} tiket</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">NOMOR ORDER</span>
                    <strong className="normal-value">{orderNumber}</strong>
                  </div>
                </div>
              </section>

              {/* RINCIAN PEMBAYARAN */}
              <section className="detail-payout-card bank-card">
                <div className="detail-card-header">
                  <h2>
                    <CreditCard size={16} strokeWidth={1.9} /> Rincian Pembayaran
                  </h2>
                  <span>Perhitungan total transaksi</span>
                </div>

                <div className="detail-card-divider"></div>

                <div className="bank-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">SUBTOTAL</span>
                    <strong>{formatRupiah(subtotal)}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">BIAYA LAYANAN</span>
                    <strong className="fee-value">-{formatRupiah(adminFee)}</strong>
                  </div>

                  {discount > 0 && (
                    <div className="detail-field">
                      <span className="detail-field-label">DISKON</span>
                      <strong className="fee-value">-{formatRupiah(discount)}</strong>
                    </div>
                  )}

                  {tax > 0 && (
                    <div className="detail-field">
                      <span className="detail-field-label">PAJAK</span>
                      <strong>{formatRupiah(tax)}</strong>
                    </div>
                  )}
                </div>

                <div className="net-payout-box">
                  <div className="net-payout-info">
                    <span>TOTAL PEMBAYARAN</span>
                    <small>Jumlah yang dibayarkan oleh customer</small>
                  </div>
                  <strong>{formatRupiah(total)}</strong>
                </div>
              </section>

              {/* TIMELINE */}
              <section className="detail-payout-card document-card">
                <div className="detail-card-header">
                  <h2>
                    <Calendar size={16} strokeWidth={1.9} /> Linimasa Transaksi
                  </h2>
                </div>

                <div className="detail-card-divider"></div>

                <div className="bank-grid">
                  <div className="detail-field">
                    <span className="detail-field-label">DIBUAT</span>
                    <strong className="normal-value">{formatDate(createdAt)}</strong>
                  </div>

                  <div className="detail-field">
                    <span className="detail-field-label">DIBATASI WAKTU (EXPIRED)</span>
                    <strong className="normal-value">{formatDate(expiredAt)}</strong>
                  </div>

                  {paidAt && (
                    <div className="detail-field">
                      <span className="detail-field-label">DIBayar</span>
                      <strong className="normal-value">{formatDate(paidAt)}</strong>
                    </div>
                  )}
                </div>
              </section>

            </div>

            {/* RIGHT ACTION */}
            <aside className="superadmin-card">
              <div className="superadmin-header">
                <Receipt size={21} strokeWidth={1.9} />
                <h2>Aksi Admin</h2>
              </div>

              {allowedActions.length > 0 ? (
                <>
                  <div className="decision-buttons">
                    {allowedActions.map((action) => (
                      <button
                        key={action}
                        type="button"
                        className={
                          action === "CANCELLED"
                            ? "decision-button reject"
                            : "decision-button approve"
                        }
                        onClick={() => handleStatusChange(action)}
                        disabled={submitting}
                      >
                        {action === "CANCELLED" ? "Batalkan" : "Refund"}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="confirm-decision-button"
                    onClick={() => handleStatusChange(allowedActions[0])}
                    disabled={submitting}
                  >
                    <span>
                      {submitting
                        ? "Memproses..."
                        : allowedActions[0] === "CANCELLED"
                          ? "Batalkan Transaksi"
                          : "Refund Transaksi"}
                    </span>
                    <ArrowRight size={18} strokeWidth={1.8} />
                  </button>
                </>
              ) : (
                <div className="transfer-info">
                  <div className="transfer-info-icon">i</div>
                  <p>
                    Status saat ini (LUNAS/DIREFUND/EXPIRED/DIBATALKAN) sudah
                    final dan tidak dapat diubah.
                  </p>
                </div>
              )}

              {/* CUSTOMER INFO */}
              <div className="detail-field">
                <span className="detail-field-label">
                  <User size={13} strokeWidth={1.9} /> CUSTOMER
                </span>
                <strong>{customerName}</strong>
                <span className="normal-value">{customerEmail}</span>
                {customerPhone !== "-" && (
                  <span className="normal-value">{customerPhone}</span>
                )}
              </div>
            </aside>

          </div>
        </div>
      </main>
    </div>
  );
}

export default DetailTransaksi;