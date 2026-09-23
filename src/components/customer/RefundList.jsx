import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import { getRefundHistory, getRefundOrderSummary } from "../../services/refundService";
import "./RefundList.css";

const STATUS_LABEL = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_TYPE = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function RefundList() {
  const navigate = useNavigate();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const res = await getRefundHistory();
        const data = res?.data || [];

        const enriched = await Promise.all(
          data.map(async (refund) => {
            if (!refund.orderId) return refund;
            try {
              const summaryRes = await getRefundOrderSummary(refund.orderId);
              return { ...refund, orderSummary: summaryRes?.data || null };
            } catch {
              return refund;
            }
          }),
        );

        setRefunds(enriched);
      } catch (err) {
        console.error("[RefundList] Error:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, []);

  const handleDetailRefund = (refund) => {
    navigate(`/customer/refund/${refund.refundId}`);
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const formatDate = (dateStr) => {
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
  };

  const filteredRefunds =
    filter === "all"
      ? refunds
      : refunds.filter(
          (r) => (r.status || "PENDING") === filter,
        );

  return (
    <div className="refund-list-page">
      <NavbarCustomer />

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

          <div className="refund-list-filters">
            {[
              { key: "all", label: "Semua" },
              { key: "APPROVED", label: "Disetujui" },
              { key: "PENDING", label: "Pending" },
              { key: "REJECTED", label: "Ditolak" },
            ].map((f) => (
              <button
                key={f.key}
                className={`refund-filter-btn ${filter === f.key ? "active" : ""}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {loading ? (
          <div className="refund-list-loading">
            <div className="refund-list-spinner" />
            <span>Memuat riwayat refund...</span>
          </div>
        ) : refunds.length === 0 ? (
          <div className="refund-list-empty">
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
            <p>Belum ada riwayat refund</p>
            <button onClick={() => navigate("/customer/dashboard")}>
              Kembali ke Beranda
            </button>
          </div>
        ) : (
          <section className="refund-list-grid">
            {filteredRefunds.map((refund) => (
              <RefundCard
                key={refund.refundId}
                refund={refund}
                onDetail={handleDetailRefund}
                formatDate={formatDate}
              />
            ))}
          </section>
        )}
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

function RefundCard({ refund, onDetail, formatDate }) {
  const eventTitle = refund.orderSummary?.eventTitle || "Event";

  return (
    <article className="rl-card">
      <div className="rl-card-header">
        <div className="rl-card-header-top">
          <h2>{eventTitle}</h2>

          <span
            className={`rl-status-badge ${STATUS_TYPE[refund.status] || "pending"}`}
          >
            {STATUS_LABEL[refund.status] || refund.status}
          </span>
        </div>

        <div className="rl-card-date">
          <svg viewBox="0 0 24 24">
            <rect x="4" y="5" width="16" height="15" rx="2" />
            <path d="M8 3v4M16 3v4M4 10h16" />
          </svg>
          <span>{formatDate(refund.createdAt)}</span>
        </div>
      </div>

      <div className="rl-card-divider"></div>

      <div className="rl-card-action">
        <button onClick={() => onDetail(refund)}>
          Detail Refund
        </button>
      </div>
    </article>
  );
}

export default RefundList;
