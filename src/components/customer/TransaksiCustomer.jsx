import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getTransactionHistory } from "../../services/ticketService";
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

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await getTransactionHistory();
        const data = res?.data || [];

        // Deduplikasi by orderId (backend bisa return duplikat)
        const seen = new Set();
        const unique = data.filter((o) => {
          if (seen.has(o.orderId)) return false;
          seen.add(o.orderId);
          return true;
        });

        const mapped = unique.map((o) => {
          const statusInfo = STATUS_MAP[o.status] || { label: o.status, type: "unknown" };
          return {
            id: o.orderId,
            orderId: o.orderId,
            orderNumber: o.orderNumber,
            status: statusInfo.label,
            statusType: statusInfo.type,
            statusRaw: o.status,
            ticketType: o.ticketTierName,
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

        setTransactions(sorted);
      } catch (err) {
        console.error("[TransaksiCustomer] Gagal memuat riwayat:", err);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const tabs = [
    { label: "Semua", value: "Semua" },
    { label: "Menunggu", value: "Menunggu" },
    { label: "Berhasil", value: "Berhasil" },
    { label: "Gagal", value: "Gagal" },
    { label: "Refund", value: "Refund" },
  ];

  const REFUND_STATUSES = ["REFUND_REQUESTED", "REFUNDED", "REJECTED"];
  const WAITING_STATUSES = ["PENDING", "WAITING_PAYMENT"];
  const PAID_STATUSES = ["PAID"];
  const FAILED_STATUSES = ["CANCELLED", "EXPIRED"];

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Menunggu") return WAITING_STATUSES.includes(t.statusRaw);
    if (activeTab === "Berhasil") return PAID_STATUSES.includes(t.statusRaw);
    if (activeTab === "Gagal") return FAILED_STATUSES.includes(t.statusRaw);
    if (activeTab === "Refund") return REFUND_STATUSES.includes(t.statusRaw);
    return true;
  });

  const handlePayment = async (transaction) => {
    try {
      // Cari event berdasarkan eventTitle untuk mendapatkan eventId yang benar
      const res = await getEvents({ search: transaction.eventTitle, limit: 1 });
      const rawData = res?.data;
      const eventsArray = Array.isArray(rawData)
        ? rawData
        : (rawData?.data || rawData?.items || rawData?.content || []);
      const foundEvent = eventsArray[0];
      if (!foundEvent?.id) throw new Error("Event tidak ditemukan");

      navigate(`/checkout/${foundEvent.id}`, {
        state: { 
          orderId: transaction.orderId, 
          resume: true,
          ticketTierName: transaction.ticketType
        },
      });
    } catch (err) {
      console.error("[TransaksiCustomer] Gagal cari eventId:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Lanjut Bayar",
        text: "Tidak dapat menemukan event yang sesuai. Hubungi support.",
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