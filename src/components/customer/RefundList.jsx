import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import "./RefundList.css";

function RefundList() {
  const navigate = useNavigate();

  const refunds = [
    {
      id: 1,
      title: "Judul Event",
      date: "15 Aug 2024 • 19:00 (Waktu Pengajuan)",
      status: "Disetujui",
      statusType: "approved",
    },
    {
      id: 2,
      title: "Judul Event",
      date: "16 Aug 2024 • 19:00 (Waktu Pengajuan)",
      status: "Pending",
      statusType: "pending",
    },
    {
      id: 3,
      title: "Judul Event",
      date: "17 Aug 2024 • 19:00 (Waktu Pengajuan)",
      status: "Ditolak",
      statusType: "rejected",
    },
    {
      id: 4,
      title: "Judul Event",
      date: "16 Aug 2024 • 19:00 (Waktu Pengajuan)",
      status: "Pending",
      statusType: "pending",
    },
  ];

  const handleDetailRefund = (refund) => {
    navigate(`/customer/refund/${refund.id}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="refund-list-page">
      <NavbarCustomer />

      <header className="refund-list-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="refund-list-mobile-logo">
          EVENT<span>DAY</span>
        </div>

        <div className="refund-list-mobile-actions">
          <button type="button" aria-label="Cari">
            <svg viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
          </button>

          <button type="button" aria-label="Menu">
            <svg viewBox="0 0 24 24">
              <path d="M4 7h16" />
              <path d="M4 12h16" />
              <path d="M4 17h16" />
            </svg>
          </button>
        </div>
      </header>

      <main className="refund-list-container">
        <section className="refund-list-heading">
          <h1 className="desktop-refund-list-title">
            Refund List
          </h1>

          <h1 className="mobile-refund-list-title">
            Permintaan Refund List
          </h1>

          <p className="desktop-refund-list-description">
            Berikut List Refund Anda
          </p>
        </section>

        <section className="refund-list-grid">
          {refunds.map((refund) => (
            <RefundCard
              key={refund.id}
              refund={refund}
              onDetail={handleDetailRefund}
            />
          ))}
        </section>
      </main>

      <nav className="refund-list-mobile-bottom-nav">
        <button
          className="refund-bottom-nav-item"
          onClick={() =>
            handleNavigation("/customer/dashboard")
          }
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
          </svg>

          <span>Beranda</span>
        </button>

        <button
          className="refund-bottom-nav-item"
          onClick={() =>
            handleNavigation("/customer/tickets")
          }
        >
          <svg viewBox="0 0 24 24">
            <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
            <path d="M8 9h8M8 12h8M8 15h5" />
          </svg>

          <span>Tiket</span>
        </button>

        <button
          className="refund-bottom-nav-item"
          onClick={() =>
            handleNavigation("/eo/event/create")
          }
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v8M8 12h8" />
          </svg>

          <span>Buat Event</span>
        </button>

        <button className="refund-bottom-nav-item active">
          <svg viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 1 0 2.35-5.65" />
            <path d="M4 5v5h5" />
            <path d="M12 8v4l3 2" />
          </svg>

          <span>Transaksi</span>
        </button>

        <button
          className="refund-bottom-nav-item"
          onClick={() =>
            handleNavigation("/customer/profile")
          }
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5 20c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2" />
          </svg>

          <span>Profile</span>
        </button>
      </nav>

      <footer className="refund-list-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function RefundCard({ refund, onDetail }) {
  return (
    <article className="refund-card">
      <div className="refund-card-top">
        <h2>{refund.title}</h2>

        <span
          className={`refund-status ${refund.statusType}`}
        >
          {refund.status}
        </span>
      </div>

      <div className="refund-date">
        <svg viewBox="0 0 24 24">
          <rect
            x="4"
            y="5"
            width="16"
            height="15"
            rx="2"
          />
          <path d="M8 3v4M16 3v4M4 10h16" />
        </svg>

        <span>{refund.date}</span>
      </div>

      <div className="refund-card-divider"></div>

      <div className="refund-card-action">
        <button onClick={() => onDetail(refund)}>
          Detail Refund
        </button>
      </div>
    </article>
  );
}

export default RefundList;