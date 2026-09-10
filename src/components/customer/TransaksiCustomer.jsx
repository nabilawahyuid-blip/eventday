import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import "./TransaksiCustomer.css";

function TransaksiCustomer() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Semua");

  const transactions = [
    {
      id: 1,
      orderNumber: "ORD-20241025-0042",
      status: "Menunggu Pembayaran",
      statusType: "waiting",
      ticketType: "Tiket VIP",
      ticketCount: "1 Tiket",
      paymentMethod: "BCA Virtual Account",
      adminFee: "Rp 4.000",
      total: "Rp 854.000",
      eventTitle: "Judul Event",
    },
    {
      id: 2,
      orderNumber: "ORD-20241024-8921",
      status: "Berhasil",
      statusType: "success",
      ticketType: "Regular",
      ticketCount: "2 Tiket",
      paymentMethod: "QRIS",
      paidAt: "24 Okt 2024, 14:15 WIB",
      total: "Rp 1.005.000",
      eventTitle: "Judul Event",
    },
    {
      id: 3,
      orderNumber: "ORD-20241024-8922",
      status: "Berhasil",
      statusType: "success",
      ticketType: "Regular",
      ticketCount: "2 Tiket",
      paymentMethod: "QRIS",
      paidAt: "24 Okt 2024, 14:15 WIB",
      total: "Rp 1.005.000",
      eventTitle: "Judul Event",
    },
    {
      id: 4,
      orderNumber: "ORD-20241010-3109",
      status: "Gagal",
      statusType: "failed",
      ticketType: "Regular",
      ticketCount: "1 Tiket",
      paymentMethod: "Mandiri Bill Payment",
      expiredAt: "11 Okt 2024, 08:00 WIB",
      total: "Rp 350.000",
      eventTitle: "Judul Event",
    },
  ];

  const tabs = [
    {
      label: "Semua",
      value: "Semua",
    },
    {
      label: "Menunggu (1)",
      value: "Menunggu",
    },
    {
      label: "Berhasil (Paid)",
      value: "Berhasil",
    },
    {
      label: "Dibatalkan",
      value: "Dibatalkan",
    },
  ];

  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === "Semua") {
      return true;
    }

    if (activeTab === "Menunggu") {
      return transaction.statusType === "waiting";
    }

    if (activeTab === "Berhasil") {
      return transaction.statusType === "success";
    }

    if (activeTab === "Dibatalkan") {
      return transaction.statusType === "cancelled";
    }

    return true;
  });

  const handlePayment = (transaction) => {
    navigate(`/checkout/${transaction.id}`);
  };

  const handleViewTicket = (transaction) => {
    navigate(
      `/customer/ticket-success?transaction=${transaction.id}`
    );
  };

  return (
    <div className="transaction-page">
      {/* Navbar Customer */}
      <NavbarCustomer />

      <main className="transaction-container">
        <section className="transaction-header">
          <h1>Riwayat Transaksi</h1>
          <p>Berikut List Refund Anda</p>
        </section>

        <section className="transaction-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              className={
                activeTab === tab.value ? "active" : ""
              }
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </section>

        <section className="transaction-list">
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((transaction) => (
              <article
                className="transaction-card"
                key={transaction.id}
              >
                <div className="transaction-card-top">
                  <div className="order-info">
                    <span className="order-label">
                      Order #
                    </span>

                    <strong>
                      {transaction.orderNumber}
                    </strong>
                  </div>

                  <span
                    className={`transaction-status ${transaction.statusType}`}
                  >
                    {transaction.status}
                  </span>
                </div>

                <div className="transaction-event">
                  <h2>{transaction.eventTitle}</h2>

                  <div className="ticket-summary">
                    <span className="ticket-type">
                      {transaction.ticketType}
                    </span>

                    <span className="ticket-dot">•</span>

                    <span>
                      {transaction.ticketCount}
                    </span>
                  </div>
                </div>

                <div className="transaction-detail">
                  <div className="detail-row">
                    <span>Metode Bayar:</span>

                    <strong>
                      {transaction.paymentMethod}
                    </strong>
                  </div>

                  {transaction.adminFee && (
                    <div className="detail-row">
                      <span>Biaya Admin:</span>

                      <strong>
                        {transaction.adminFee}
                      </strong>
                    </div>
                  )}

                  {transaction.paidAt && (
                    <div className="detail-row">
                      <span>Dibayar pada:</span>

                      <strong>
                        {transaction.paidAt}
                      </strong>
                    </div>
                  )}

                  {transaction.expiredAt && (
                    <div className="detail-row">
                      <span>Expired pada:</span>

                      <strong className="expired-date">
                        {transaction.expiredAt}
                      </strong>
                    </div>
                  )}

                  <div className="detail-row total-row">
                    <span>
                      {transaction.statusType === "waiting"
                        ? "Total Bayar:"
                        : transaction.statusType === "failed"
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
                      onClick={() =>
                        handlePayment(transaction)
                      }
                    >
                      Bayar Sekarang
                    </button>
                  )}

                  {transaction.statusType === "success" && (
                    <button
                      className="outline-transaction-button"
                      onClick={() =>
                        handleViewTicket(transaction)
                      }
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

              <p>
                Belum ada transaksi pada kategori ini.
              </p>
            </div>
          )}
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

export default TransaksiCustomer;