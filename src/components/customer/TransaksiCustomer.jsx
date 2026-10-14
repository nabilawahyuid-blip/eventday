import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getTransactionHistory } from "../../services/ticketService";
import { getRefundHistory } from "../../services/refundService";
import { getEvents } from "../../services/eventService";
import "./TransaksiCustomer.css";

const STATUS_MAP = {
  PENDING: { label: "Menunggu Pembayaran", type: "waiting" },
  WAITING_PAYMENT: { label: "Menunggu Pembayaran", type: "waiting" },
  PAID: { label: "Berhasil", type: "success" },
  CANCELLED: { label: "Gagal", type: "failed" },
  EXPIRED: { label: "Gagal", type: "failed" },
  REFUND_REQUESTED: { label: "Refund Diajukan", type: "refund" },
  REFUNDED: { label: "Refund Disetujui", type: "refund" },
  REJECTED: { label: "Refund Ditolak", type: "refund" },
};

const STATUS_PRIORITY = {
  PENDING: 1,
  WAITING_PAYMENT: 1,
  PAID: 2,
  CANCELLED: 3,
  EXPIRED: 3,
  REFUND_REQUESTED: 4,
  REFUNDED: 4,
  REJECTED: 4,
};

const REFUND_STATUSES = ["REFUND_REQUESTED", "REFUNDED", "REJECTED"];
const WAITING_STATUSES = ["PENDING", "WAITING_PAYMENT"];
const PAID_STATUSES = ["PAID"];
const FAILED_STATUSES = ["CANCELLED", "EXPIRED"];

// Sama seperti MyTicket: ApiResponse {msg, status, data} bisa membawa
// status error di HTTP 200 — wajib dicek sebelum .filter.
function extractArrayResponse(res) {
  if (!res) return { list: [], errorMsg: "" };
  if (typeof res.status === "number" && res.status !== 200) {
    return { list: [], errorMsg: res.msg || res.message || `Request gagal (${res.status})` };
  }
  if (Array.isArray(res.data)) return { list: res.data, errorMsg: "" };
  if (Array.isArray(res)) return { list: res, errorMsg: "" };
  const nested = res.data?.data || res.data?.content || res.data?.items;
  if (Array.isArray(nested)) return { list: nested, errorMsg: "" };
  if (res.data == null) return { list: [], errorMsg: "" };
  return { list: [], errorMsg: res.msg || res.message || "Format data tidak dikenali." };
}

function getApiErrorMessage(err, fallback) {
  return (
    err?.data?.msg ||
    err?.data?.message ||
    err?.msg ||
    err?.message ||
    fallback
  );
}

function formatCurrency(amount) {
  if (!amount && amount !== 0) return "-";
  return `Rp${Number(amount).toLocaleString("id-ID")}`;
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function TransaksiCustomer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;
    const fetchTransactions = async () => {
      setLoading(true);
      setLoadError("");
      // allSettled: refund gagal tidak boleh menenggelamkan data transaksi.
      const [transResult, refundResult] = await Promise.allSettled([
        getTransactionHistory(),
        getRefundHistory(),
      ]);

      if (cancelled) return;

      // Sesi kedaluwarsa (401) → tendang ke login, bukan banner error.
      if (transResult.status === "rejected" && transResult.reason?.status === 401) {
        setLoading(false);
        navigate("/login", { replace: true });
        return;
      }

      const transParsed =
        transResult.status === "fulfilled"
          ? extractArrayResponse(transResult.value)
          : { list: [], errorMsg: getApiErrorMessage(transResult.reason, "Gagal memuat riwayat transaksi.") };
      const refundParsed =
        refundResult.status === "fulfilled"
          ? extractArrayResponse(refundResult.value)
          : { list: [], errorMsg: "" };

      if (transParsed.errorMsg && transParsed.list.length === 0) {
        setTransactions([]);
        setLoadError(transParsed.errorMsg);
        setLoading(false);
        return;
      }

      const data = transParsed.list;

      // Deduplikasi by orderId (backend bisa return duplikat)
      const seen = new Set();
      const unique = data.filter((o) => {
        if (!o || !o.orderId) return false;
        if (seen.has(o.orderId)) return false;
        seen.add(o.orderId);
        return true;
      });

      // Merge status refund (sumber terpisah) agar tab Refund terisi.
      const refundMap = {};
      refundParsed.list.forEach((refund) => {
        if (refund && refund.orderId) refundMap[refund.orderId] = refund.status;
      });
      const withRefundStatus = unique.map((o) => {
        const refundStatus = refundMap[o.orderId];
        if (!refundStatus) return o;
        if (refundStatus === "PENDING") return { ...o, status: "REFUND_REQUESTED" };
        if (refundStatus === "APPROVED" || refundStatus === "REFUNDED") return { ...o, status: "REFUNDED" };
        if (refundStatus === "REJECTED") return { ...o, status: "REJECTED" };
        return o;
      });

      const mapped = withRefundStatus.map((o) => {
        const statusInfo = STATUS_MAP[o.status] || { label: o.status, type: "unknown" };
        return {
          id: o.orderId,
          orderId: o.orderId,
          orderNumber: o.orderNumber,
          status: statusInfo.label,
          statusType: statusInfo.type,
          statusRaw: o.status,
          eventId: o.eventId || o.event_id || null,
          ticketType: o.ticketTierName,
          quantity: Number(o.quantity) || 0,
          ticketCount: `${o.quantity} Tiket`,
          paymentMethod: o.paymentMethod || "-",
          adminFee: o.adminFee ? formatCurrency(o.adminFee) : null,
          total: formatCurrency(o.totalAmount),
          eventTitle: o.eventTitle,
          paidAt: o.paidAt ? formatDate(o.paidAt) : null,
          expiredAt: o.expiredAt ? formatDate(o.expiredAt) : null,
          createdAt: o.createdAt ? formatDate(o.createdAt) : null,
          rawCreatedAt: o.createdAt,
        };
      });

      // Sort: Primary = status priority, Secondary = createdAt desc
      const sorted = mapped.sort((a, b) => {
        const priorityA = STATUS_PRIORITY[a.statusRaw] || 99;
        const priorityB = STATUS_PRIORITY[b.statusRaw] || 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        const da = a.rawCreatedAt ? new Date(a.rawCreatedAt).getTime() : 0;
        const db = b.rawCreatedAt ? new Date(b.rawCreatedAt).getTime() : 0;
        return db - da;
      });

      if (!cancelled) {
        setTransactions(sorted);
        setLoadError("");
        setLoading(false);
      }
    };

    fetchTransactions();
    return () => { cancelled = true; };
  }, []);

  const tabs = [
    { label: "Semua", value: "Semua" },
    { label: "Menunggu", value: "Menunggu" },
    { label: "Berhasil", value: "Berhasil" },
    { label: "Gagal", value: "Gagal" },
  ];

  // Tab refund dihapus: order refund disembunyikan total dari halaman ini.
  // Merge refund tetap dipertahankan agar status refund terdeteksi untuk filter.
  const filteredTransactions = transactions.filter((t) => {
    if (REFUND_STATUSES.includes(t.statusRaw)) return false;
    if (activeTab === "Semua") return true;
    if (activeTab === "Menunggu") return WAITING_STATUSES.includes(t.statusRaw);
    if (activeTab === "Berhasil") return PAID_STATUSES.includes(t.statusRaw);
    if (activeTab === "Gagal") return FAILED_STATUSES.includes(t.statusRaw);
    return true;
  });

  const handlePayment = async (transaction) => {
    // Utama: pakai eventId dari order bila ada (tanpa search rapuh).
    if (transaction?.eventId) {
      navigate(`/checkout/${transaction.eventId}`, {
        state: {
          orderId: transaction.orderId,
          resume: true,
          ticketTierName: transaction.ticketType,
          quantity: transaction.quantity, // WAJIB: agar form peserta = quantity order asli
        },
      });
      return;
    }
    try {
      // Fallback: cari event berdasarkan eventTitle
      const res = await getEvents({ search: transaction.eventTitle, limit: 1 });
      const { list: eventsArray } = extractArrayResponse(res);
      const foundEvent = eventsArray[0];
      if (!foundEvent?.id) throw new Error("Event tidak ditemukan");

      navigate(`/checkout/${foundEvent.id}`, {
        state: { 
          orderId: transaction.orderId, 
          resume: true,
          ticketTierName: transaction.ticketType,
          quantity: transaction.quantity, // WAJIB: agar form peserta = quantity order asli
        },
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal Lanjut Bayar",
        text: getApiErrorMessage(err, "Tidak dapat menemukan event yang sesuai. Hubungi support."),
        confirmButtonColor: "#5143e6",
      });
    }
  };

  const handleViewTicket = (transaction) => {
    navigate(`/customer/orders/${transaction.orderId}`);
  };

  if (loading) {
    return (
      <div className="transaction-page">
        <NavbarCustomer />
        <main className="transaction-container">
          <div className="transaction-loading">
            <div className="ticket-spinner" />
            <span>Memuat riwayat transaksi...</span>
          </div>
        </main>
        <FooterCustomer />
      </div>
    );
  }

  return (
    <div className="transaction-page">
      <NavbarCustomer />

      <main className="transaction-container">
        <section className="transaction-header">
          <h1>Riwayat Transaksi</h1>
          <p>Berikut riwayat transaksi tiket Anda</p>
        </section>

        <section className="transaction-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={activeTab === tab.value ? "active" : ""}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </section>

        {loadError && transactions.length === 0 && (
          <div
            role="alert"
            style={{
              margin: "0 0 16px",
              padding: "12px 16px",
              borderRadius: 10,
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <span>{loadError}</span>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#5143e6",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        <section className="transaction-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <article className="rl-card" key={transaction.id}>
                <div className="rl-card-header">
                  <div className="rl-card-header-top">
                    <h2>{transaction.eventTitle}</h2>

                    <span
                      className={`rl-status-badge ${transaction.statusType}`}
                    >
                      {transaction.status}
                    </span>
                  </div>

                  <div className="rl-card-date">
                    <svg viewBox="0 0 24 24">
                      <rect x="4" y="5" width="16" height="15" rx="2" />
                      <path d="M8 3v4M16 3v4M4 10h16" />
                    </svg>
                    <span>{transaction.createdAt}</span>
                  </div>
                </div>

                <div className="rl-card-divider"></div>

                <div className="rl-card-detail">
                  <div className="rl-detail-row">
                    <span>Jenis Tiket</span>
                    <strong>{transaction.ticketType}</strong>
                  </div>
                  <div className="rl-detail-row">
                    <span>Jumlah</span>
                    <strong>{transaction.ticketCount}</strong>
                  </div>
                  <div className="rl-detail-row">
                    <span>Metode Bayar</span>
                    <strong>{transaction.paymentMethod}</strong>
                  </div>
                  {transaction.adminFee && (
                    <div className="rl-detail-row">
                      <span>Biaya Admin</span>
                      <strong>{transaction.adminFee}</strong>
                    </div>
                  )}
                  <div className="rl-detail-row rl-detail-total">
                    <span>Total</span>
                    <strong>{transaction.total}</strong>
                  </div>
                </div>

                <div className="rl-card-action">
                  {transaction.statusType === "waiting" && (
                    <button
                      className="primary-transaction-button"
                      onClick={() => handlePayment(transaction)}
                    >
                      Bayar Sekarang
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-transaction">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M4 12a8 8 0 1 0 2.35-5.65" />
                <path d="M4 5v5h5" />
                <path d="M12 8v4l3 2" />
              </svg>
              <p>Belum ada transaksi</p>
              <button onClick={() => navigate("/customer/dashboard")}>
                Kembali ke Beranda
              </button>
            </div>
          )}
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

export default TransaksiCustomer;