import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import {
  submitRefund,
  getRefundBanks,
  getRefundOrderSummary,
} from "../../services/refundService";
import "./RefundRequest.css";

function RefundRequest() {
  const navigate = useNavigate();
  const location = useLocation();

  const orderId = location.state?.orderId || null;

  const [formData, setFormData] = useState({
    accountHolderName: "",
    accountNumber: "",
    bankCode: "",
    reason: "",
  });

  const [banks, setBanks] = useState([]);
  const [orderSummary, setOrderSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bankRes = await getRefundBanks();
        setBanks(bankRes?.data || []);
      } catch (err) {
        console.error("[RefundRequest] Banks error:", err.message);
      }

      if (orderId) {
        try {
          const summaryRes = await getRefundOrderSummary(orderId);
          setOrderSummary(summaryRes?.data || null);
        } catch (err) {
          console.error("[RefundRequest] Order summary error:", err.message);
        }
      }

      setLoading(false);
    };

    fetchData();
  }, [orderId]);

  const handleChange = (field, value) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!orderId) {
      alert("Order ID tidak ditemukan. Silakan kembali dan coba lagi.");
      return;
    }

    if (!formData.accountHolderName.trim()) {
      alert("Nama pemilik rekening wajib diisi.");
      return;
    }

    if (!formData.accountNumber.trim()) {
      alert("Nomor rekening wajib diisi.");
      return;
    }

    if (!formData.bankCode) {
      alert("Bank wajib dipilih.");
      return;
    }

    if (!formData.reason.trim()) {
      alert("Alasan refund wajib diisi.");
      return;
    }

    setSubmitting(true);
    try {
      await submitRefund({
        orderId,
        reason: formData.reason,
        bankCode: formData.bankCode,
        accountNumber: formData.accountNumber,
        accountHolderName: formData.accountHolderName,
      });
      alert("Pengajuan refund berhasil dikirim.");
      navigate("/customer/refund-list");
    } catch (err) {
      console.error("[RefundRequest] Submit error:", err.message);
      alert(err.message || "Gagal mengajukan refund. Silakan coba lagi.");
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
  };

  const formatOrderId = (id) => {
    if (!id) return "-";
    return `#${id.slice(0, 8)}`;
  };

  if (loading) {
    return (
      <div className="refund-request-page">
        <NavbarCustomer />
        <main className="refund-container">
          <div className="refund-detail-loading">
            <div className="refund-detail-spinner" />
            <span>Memuat data refund...</span>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="refund-request-page">
      <NavbarCustomer />

      <header className="refund-mobile-header">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Kembali"
        >
          <svg viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>

        <div className="refund-mobile-logo">
          EVENT<span>DAY</span>
        </div>

        <div className="refund-mobile-spacer"></div>
      </header>

      <main className="refund-container">
        <section className="refund-page-heading">
          <div>
            <h1 className="desktop-refund-title">Refund</h1>
            <h1 className="mobile-refund-title">Ajukan Refund</h1>

            <p>
              Lengkapi informasi untuk mengajukan refund.
            </p>
          </div>
        </section>

        <div className="mobile-refund-ticket">
          <RefundTicket
            orderCode={formatOrderId(orderId)}
            title={orderSummary?.eventTitle || "Event"}
            ticketType={orderSummary?.ticketTierName || "-"}
            quantity={orderSummary?.ticketQuantity || 0}
            refundableAmount={orderSummary?.refundableAmount}
            grossAmount={orderSummary?.grossAmount}
          />
        </div>

        <div className="refund-content">
          <section className="refund-form-section">
            <h2>Data Refund</h2>

            <form
              className="refund-form-card"
              onSubmit={handleSubmit}
            >
              <div className="refund-form-header">
                Form Refund
              </div>

              <div className="refund-form-body">
                <div className="refund-input-group">
                  <label>
                    Nama Pemilik Rekening<span>*</span>
                  </label>

                  <input
                    type="text"
                    placeholder="Masukan Nama Pemilik Rekening"
                    value={formData.accountHolderName}
                    onChange={(e) =>
                      handleChange("accountHolderName", e.target.value)
                    }
                  />
                </div>

                <div className="refund-input-group">
                  <label>
                    Nomor Rekening<span>*</span>
                  </label>

                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Masukan Nomor Rekening"
                    value={formData.accountNumber}
                    onChange={(e) =>
                      handleChange(
                        "accountNumber",
                        e.target.value.replace(/\D/g, "")
                      )
                    }
                  />
                </div>

                <div className="refund-input-group">
                  <label>
                    Nama Bank<span>*</span>
                  </label>

                  <div className="refund-select-wrapper">
                    <select
                      value={formData.bankCode}
                      onChange={(e) =>
                        handleChange("bankCode", e.target.value)
                      }
                    >
                      <option value="" disabled>
                        Pilih Bank
                      </option>
                      {banks.map((bank) => (
                        <option key={bank.bankCode} value={bank.bankCode}>
                          {bank.bankName}
                        </option>
                      ))}
                    </select>

                    <svg viewBox="0 0 24 24">
                      <path d="m7 10 5 5 5-5" />
                    </svg>
                  </div>
                </div>

                <div className="refund-input-group">
                  <label>
                    Alasan Refund<span>*</span>
                  </label>

                  <textarea
                    placeholder="Tulis Alasan"
                    value={formData.reason}
                    onChange={(e) =>
                      handleChange("reason", e.target.value)
                    }
                  ></textarea>
                </div>
              </div>
            </form>

            <div className="refund-information">
              <div className="refund-information-icon">
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
                Pengajuan refund membutuhkan persetujuan pihak
                EO. Besaran nominal yang dikembalikan akan
                disesuaikan dengan kebijakan penyelenggara
                acara.
              </p>
            </div>
          </section>

          <aside className="refund-sidebar">
            <RefundTicket
              orderCode={formatOrderId(orderId)}
              title={orderSummary?.eventTitle || "Event"}
              ticketType={orderSummary?.ticketTierName || "-"}
              quantity={orderSummary?.ticketQuantity || 0}
              refundableAmount={orderSummary?.refundableAmount}
              grossAmount={orderSummary?.grossAmount}
            />

            <div className="desktop-refund-submit">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? "Mengirim..." : "Ajukan"}
              </button>
            </div>
          </aside>
        </div>
      </main>

      <div className="mobile-refund-submit">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? "Mengirim..." : "Ajukan"}
        </button>
      </div>

      <footer className="refund-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function RefundTicket({
  orderCode,
  title,
  ticketType,
  quantity,
  refundableAmount,
  grossAmount,
}) {
  const displayAmount = refundableAmount || grossAmount || 0;
  const qtyLabel = quantity > 0 ? `${quantity}x` : "";

  return (
    <div className="refund-ticket-card">
      <div className="refund-order-code">
        {orderCode}
      </div>

      <div className="refund-ticket-divider"></div>

      <h3>{title}</h3>

      <div className="refund-ticket-row">
        <span>Jenis Tiket</span>
        <strong>{ticketType}</strong>
      </div>

      {quantity > 0 && (
        <div className="refund-ticket-row">
          <span>Jumlah</span>
          <strong>{qtyLabel}</strong>
        </div>
      )}

      <div className="refund-ticket-divider bottom-divider"></div>

      <div className="refund-ticket-total">
        <span>Yang Dikembalikan</span>
        <strong>
          {formatCurrency(displayAmount)}
        </strong>
      </div>
    </div>
  );
}

function formatCurrency(amount) {
  return `Rp ${Number(amount || 0).toLocaleString("id-ID")}`;
}

export default RefundRequest;
