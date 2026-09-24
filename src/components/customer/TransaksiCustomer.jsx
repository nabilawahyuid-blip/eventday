import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getTransactionHistory } from "../../services/ticketService";
import "./TransaksiCustomer.css";

const STATUS_MAP = {
  PENDING: { label: "Menunggu Pembayaran", type: "waiting" },
  WAITING_PAYMENT: { label: "Menunggu Pembayaran", type: "waiting" },
  PAID: { label: "Berhasil", type: "success" },
  CANCELLED: { label: "Dibatalkan", type: "cancelled" },
  EXPIRED: { label: "Kedaluwarsa", type: "cancelled" },
  REFUND_REQUESTED: { label: "Refund Diajukan", type: "refund" },
  REFUNDED: { label: "Refund Disetujui", type: "refund" },
  REJECTED: { label: "Refund Ditolak", type: "rejected" },
};

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
            ticketType: o.ticketTierName,
            ticketCount: `${o.quantity} Tiket`,
            paymentMethod: o.paymentMethod || "-",
            adminFee: o.adminFee ? formatCurrency(o.adminFee) : null,
            total: formatCurrency(o.totalAmount),
            eventTitle: o.eventTitle,
            paidAt: o.paidAt ? formatDate(o.paidAt) : null,
            expiredAt: o.expiredAt ? formatDate(o.expiredAt) : null,
            createdAt: o.createdAt ? formatDate(o.createdAt) : null,
          };
        });

        setTransactions(mapped);
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
    { label: "Dibatalkan", value: "Dibatalkan" },
  ];

  const filteredTransactions = transactions.filter((t) => {
    if (activeTab === "Semua") return true;
    if (activeTab === "Menunggu") return t.statusType === "waiting";
    if (activeTab === "Berhasil") return t.statusType === "success";
    if (activeTab === "Dibatalkan") return t.statusType === "cancelled";
    return true;
  });

  const handlePayment = (transaction) => {
    navigate(`/checkout/${transaction.orderId}`, {
      state: { orderId: transaction.orderId, resume: true },
    });
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
              <article className="transaction-card" key={transaction.id}>
                <div className="transaction-card-top">
                  <div className="order-info">
                    <span className="order-label">Order #</span>
                    <strong>{transaction.orderNumber}</strong>
                  </div>
                  <span className={`transaction-status ${transaction.statusType}`}>
                    {transaction.status}
                  </span>
                </div>

                <div className="transaction-event">
                  <h2>{transaction.eventTitle}</h2>
                  <div className="ticket-summary">
                    <span className="ticket-type">{transaction.ticketType}</span>
                    <span className="ticket-dot">•</span>
                    <span>{transaction.ticketCount}</span>
                  </div>
                </div>

                <div className="transaction-detail">
                  <div className="detail-row">
                    <span>Metode Bayar:</span>
                    <strong>{transaction.paymentMethod}</strong>
                  </div>

                  {transaction.adminFee && (
                    <div className="detail-row">
                      <span>Biaya Admin:</span>
                      <strong>{transaction.adminFee}</strong>
                    </div>
                  )}

                  {transaction.paidAt && (
                    <div className="detail-row">
                      <span>Dibayar pada:</span>
                      <strong>{transaction.paidAt}</strong>
                    </div>
                  )}

                  {transaction.expiredAt && (
                    <div className="detail-row">
                      <span>Expired pada:</span>
                      <strong className="expired-date">{transaction.expiredAt}</strong>
                    </div>
                  )}

                  <div className="detail-row total-row">
                    <span>
                      {transaction.statusType === "waiting"
                        ? "Total Bayar:"
                        : transaction.statusType === "cancelled"
                        ? "Total Tagihan:"
                        : "Total Transaksi:"}
                    </span>
                    <strong>{transaction.total}</strong>
                  </div>
                </div>

                <div className="transaction-card-footer">
                  {transaction.statusType === "waiting" && (
                    <button
                      className="primary-transaction-button"
                      onClick={() => handlePayment(transaction)}
                    >
                      Bayar Sekarang
                    </button>
                  )}

                  {transaction.statusType === "success" && (
                    <button
                      className="outline-transaction-button"
                      onClick={() => handleViewTicket(transaction)}
                    >
                      Lihat Tiket
                    </button>
                  )}
                </div>
              </article>
            ))
          ) : (
            <div className="empty-transaction">
              <h3>Tidak ada transaksi</h3>
              <p>Belum ada transaksi pada kategori ini.</p>
            </div>
          )}
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

const tabs = [
  { label: "Semua", value: "Semua" },
  { label: "Menunggu", value: "Menunggu" },
  { label: "Berhasil", value: "Berhasil" },
  { label: "Dibatalkan", value: "Dibatalkan" },
];

export default TransaksiCustomer;