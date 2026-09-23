import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import { getRefundDetail, getRefundOrderSummary } from "../../services/refundService";
import "./RefundDetail.css";

const STATUS_LABEL = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
};

const STATUS_TYPE = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
};

function RefundDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [refund, setRefund] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("ID refund tidak valid");
      setLoading(false);
      return;
    }

    const fetchDetail = async () => {
      try {
        const res = await getRefundDetail(id);
        const refundData = res?.data || null;

        if (refundData?.orderId) {
          try {
            const summaryRes = await getRefundOrderSummary(refundData.orderId);
            refundData.orderSummary = summaryRes?.data || null;
          } catch {
            // order summary optional
          }
        }

        setRefund(refundData);
      } catch (err) {
        console.error("[RefundDetail] Error:", err.message);
        setError(err.message || "Gagal memuat detail refund");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  const formatCurrency = (amount) => {
    return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="refund-detail-page">
      <NavbarCustomer />

      <header className="refund-detail-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="refund-detail-mobile-logo">
          EVENT<span>DAY</span>
        </div>

        <div className="refund-detail-mobile-spacer"></div>
      </header>

      <main className="refund-detail-container">
        <section className="refund-detail-heading">
          <h1>Detail Refund</h1>
          <p>Informasi lengkap pengajuan refund Anda</p>
        </section>

        {loading ? (
          <div className="refund-detail-loading">
            <div className="refund-detail-spinner" />
            <span>Memuat detail refund...</span>
          </div>
        ) : error ? (
          <div className="refund-detail-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            <p>{error}</p>
            <button onClick={() => navigate("/customer/refund-list")}>
              Kembali ke Daftar Refund
            </button>
          </div>
        ) : refund ? (
          <div className="refund-detail-content">
            <div className="refund-detail-card">
              <div className="refund-detail-card-header">
                <span className="refund-detail-order-code">
                  {refund.orderSummary?.eventTitle || `#${refund.orderId?.slice(0, 8)}` || "-"}
                </span>
                <span
                  className={`refund-detail-status ${STATUS_TYPE[refund.status] || "pending"}`}
                >
                  {STATUS_LABEL[refund.status] || refund.status}
                </span>
              </div>

              <div className="refund-detail-card-body">
                {refund.orderSummary && (
                  <>
                    <div className="refund-detail-row">
                      <span className="refund-detail-label">Nama Event</span>
                      <span className="refund-detail-value">{refund.orderSummary.eventTitle || "-"}</span>
                    </div>

                    <div className="refund-detail-row">
                      <span className="refund-detail-label">Jenis Tiket</span>
                      <span className="refund-detail-value">{refund.orderSummary.ticketTierName || "-"}</span>
                    </div>

                    <div className="refund-detail-row">
                      <span className="refund-detail-label">Jumlah Tiket</span>
                      <span className="refund-detail-value">{refund.orderSummary.ticketQuantity || 0}x</span>
                    </div>

                    <div className="refund-detail-divider" />
                  </>
                )}

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Jumlah Refund</span>
                  <span className="refund-detail-value highlight">
                    {formatCurrency(refund.amount)}
                  </span>
                </div>

                <div className="refund-detail-divider" />

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Nama Bank</span>
                  <span className="refund-detail-value">{refund.bankName || "-"}</span>
                </div>

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Nomor Rekening</span>
                  <span className="refund-detail-value">{refund.accountNumber || "-"}</span>
                </div>

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Nama Pemilik Rekening</span>
                  <span className="refund-detail-value">{refund.accountHolderName || "-"}</span>
                </div>

                <div className="refund-detail-divider" />

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Alasan Refund</span>
                  <span className="refund-detail-value">{refund.reason || "-"}</span>
                </div>

                <div className="refund-detail-row">
                  <span className="refund-detail-label">Tanggal Pengajuan</span>
                  <span className="refund-detail-value">{formatDate(refund.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="refund-detail-info">
              <div className="refund-detail-info-icon">
                <svg viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" />
                  <path d="M12 10v5" />
                  <circle
                    cx="12"
                    cy="7"
                    r="0.8"
                    fill="currentColor"
                    stroke="none"
                  />
                </svg>
              </div>
              <p>
                Pengajuan refund sedang diproses. Anda akan menerima
                notifikasi setelah status berubah.
              </p>
            </div>

            <div className="refund-detail-actions">
              <button
                className="refund-detail-back-btn"
                onClick={() => navigate("/customer/refund-list")}
              >
                Kembali
              </button>
            </div>
          </div>
        ) : (
          <div className="refund-detail-error">
            <p>Data refund tidak ditemukan</p>
            <button onClick={() => navigate("/customer/refund-list")}>
              Kembali ke Daftar Refund
            </button>
          </div>
        )}
      </main>

      <footer className="refund-detail-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

export default RefundDetail;
