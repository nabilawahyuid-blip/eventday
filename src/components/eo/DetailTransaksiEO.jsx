// src/pages/DetailTransaksiEO.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, User, Calendar, MapPin, Ticket, CreditCard, Download } from "lucide-react";
import Swal from "sweetalert2";

import SidebarEO from "../shared/SidebarEO";
import NavbarEO from "../shared/NavbarEO";

// Service & Utilities
import { getOrganizerRecentTransactions } from "../../services/organizerDashboardService";
import { getPublicEventDetail } from "../../services/organizerEventService";
import { resolveBannerUrl } from "../../utils/bannerUrl";

import "./DetailTransaksiEO.css";

function DetailTransaksi() {
  const navigate = useNavigate();
  const { id } = useParams(); // Mengambil ID dari URL (/eo/transaksi/:id)

  const [transaction, setTransaction] = useState(null);
  const [eventDetail, setEventDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // FETCH DATA TRANSAKSI & DETAIL EVENT
  // =====================================================
  useEffect(() => {
    const fetchTransactionDetail = async () => {
      try {
        setLoading(true);
        setError("");

        // 1. Ambil list transaksi EO
        const response = await getOrganizerRecentTransactions();
        const transactions = Array.isArray(response?.data) ? response.data : [];

        // 2. Cari transaksi yang sesuai dengan order_id / id dari URL
        const foundTrx = transactions.find(
          (t) => String(t?.order_id || t?.id) === String(id)
        );

        if (!foundTrx) {
          const errorMsg = "Data transaksi tidak ditemukan.";
          setError(errorMsg);
          setTransaction(null);

          Swal.fire({
            icon: "error",
            title: "Data Tidak Ditemukan",
            text: errorMsg,
            confirmColor: "#5d55db",
          });
          return;
        }

        setTransaction(foundTrx);

        // 3. Jika transaksi memiliki event_id, ambil detail event publiknya
        const eventId = foundTrx?.event_id || foundTrx?.eventId;
        if (eventId) {
          try {
            const eventRes = await getPublicEventDetail(eventId);
            setEventDetail(eventRes?.data || null);
          } catch (eventErr) {
            console.error("Gagal mengambil detail event:", eventErr);
          }
        }
      } catch (err) {
        console.error("Gagal mengambil detail transaksi:", err);
        const errorMsg = err?.message || "Terjadi kesalahan saat memuat data.";
        setError(errorMsg);

        Swal.fire({
          icon: "error",
          title: "Gagal Memuat Data",
          text: errorMsg,
          confirmColor: "#5d55db",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTransactionDetail();
    }
  }, [id]);

  // =====================================================
  // HELPER FORMATTING
  // =====================================================
  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Number(number) || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();
    if (["PAID", "SUCCESS", "COMPLETED", "LUNAS", "SETTLEMENT"].includes(normalized)) {
      return "paid";
    }
    if (["PENDING", "WAITING_PAYMENT", "MENUNGGU"].includes(normalized)) {
      return "waiting";
    }
    return "cancelled";
  };

  const getStatusLabel = (status) => {
    const normalized = String(status || "").toUpperCase();
    switch (normalized) {
      case "PAID":
      case "SUCCESS":
      case "SETTLEMENT":
      case "COMPLETED":
      case "LUNAS":
        return "Lunas";
      case "PENDING":
      case "WAITING_PAYMENT":
      case "MENUNGGU":
        return "Menunggu Pembayaran";
      case "FAILED":
      case "CANCELLED":
      case "EXPIRED":
      case "DIBATALKAN":
        return "Dibatalkan";
      default:
        return status || "-";
    }
  };

  const handleBack = () => {
    navigate("/eo/transaksi");
  };

  // =====================================================
  // POPUP EXPORT & DOWNLOAD VIA SWEETALERT2
  // =====================================================
  const handleDownload = () => {
    const currentOrderId = transaction?.order_id || transaction?.id || id;

    Swal.fire({
      title: "Export & Unduh Dokumen",
      text: `Pilih format ekspor untuk Order ID #${currentOrderId}:`,
      icon: "question",
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: "🖨️ Cetak / Save PDF",
      denyButtonText: "📄 File CSV Detail",
      cancelButtonText: "Batal",
      confirmButtonColor: "#5d55db",
      denyButtonColor: "#28a745",
      cancelButtonColor: "#858596",
      customClass: {
        popup: "swal-export-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        // OPSI 1: CETAK DOKUMEN / SAVE AS PDF
        window.print();
      } else if (result.isDenied) {
        // OPSI 2: DOWNLOAD FILE CSV TRANSAKSI
        try {
          const csvHeader = "Order ID,Pelanggan,Event,Total,Status,Metode Pembayaran,Tanggal\n";
          const csvRow = `"${currentOrderId}","${transaction?.customer_name || "Pelanggan"}","${transaction?.event_title || "Event"}","${transaction?.total_amount || 0}","${getStatusLabel(transaction?.status)}","${transaction?.payment_method || "-"}","${transaction?.paid_at || transaction?.created_at || "-"}"\n`;

          const blob = new Blob([csvHeader + csvRow], { type: "text/csv;charset=utf-8;" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `Transaksi_${currentOrderId}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          Swal.fire({
            icon: "success",
            title: "Berhasil Diunduh",
            text: `File CSV transaksi #${currentOrderId} berhasil tersimpan.`,
            confirmColor: "#5d55db",
            timer: 2000,
          });
        } catch (csvErr) {
          Swal.fire({
            icon: "error",
            title: "Gagal Mengunduh",
            text: "Gagal membuat file CSV transaksi.",
            confirmColor: "#5d55db",
          });
        }
      }
    });
  };

  // =====================================================
  // RENDER & FIELD MAPPING DB TABEL orders
  // =====================================================
  const orderId = transaction?.order_id || transaction?.id || id;
  const totalAmount = Number(transaction?.total_amount ?? transaction?.amount ?? 0);
  const adminFee = Number(transaction?.admin_fee ?? 0);
  const quantity = Number(transaction?.quantity ?? 1);
  const subtotal = totalAmount > adminFee ? totalAmount - adminFee : totalAmount;
  const bannerUrl = resolveBannerUrl(eventDetail?.image || eventDetail?.bannerUrl);

  return (
    <div className="detail-transaksi-page">
      <SidebarEO />

      <main className="detail-transaksi-main">
        <NavbarEO />

        <div className="detail-transaksi-content">
          <button
            type="button"
            className="back-transaction-button"
            onClick={handleBack}
          >
            <ArrowLeft size={16} /> &nbsp; Kembali ke Daftar Transaksi
          </button>

          {loading ? (
            <div className="detail-loading-box">
              <p>Memuat detail transaksi...</p>
            </div>
          ) : error || !transaction ? (
            <div className="detail-error-box">
              <p>{error || "Data transaksi tidak ditemukan."}</p>
            </div>
          ) : (
            <>
              {/* HEADER */}
              <div className="detail-transaction-header">
                <div>
                  <h1>Detail Transaksi</h1>
                  <p>Order ID: {orderId}</p>
                </div>

                <span
                  className={`detail-status ${getStatusClass(transaction?.status)}`}
                >
                  ✓ {getStatusLabel(transaction?.status)}
                </span>
              </div>

              {/* MAIN GRID */}
              <div className="detail-transaction-grid">
                {/* LEFT COLUMN */}
                <div className="detail-left-column">
                  {/* INFORMASI PELANGGAN */}
                  <section className="detail-box">
                    <div className="detail-box-title">
                      <div className="detail-title-icon">
                        <User size={18} />
                      </div>
                      <h2>Informasi Pelanggan</h2>
                    </div>

                    <div className="detail-divider"></div>

                    <div className="customer-info-grid">
                      <div className="info-field">
                        <span>CUSTOMER ID</span>
                        <strong>
                          {transaction?.customer_id || "-"}
                        </strong>
                      </div>

                      <div className="info-field">
                        <span>NAMA PELANGGAN</span>
                        <strong>
                          {transaction?.customer_name ||
                            transaction?.event_title ||
                            "Pelanggan"}
                        </strong>
                      </div>
                    </div>
                  </section>

                  {/* DETAIL ACARA */}
                  <section className="detail-box event-detail-box">
                    <div className="detail-box-title">
                      <div className="detail-title-icon">
                        <Calendar size={18} />
                      </div>
                      <h2>Detail Acara</h2>
                    </div>

                    <div className="detail-divider"></div>

                    <div className="event-detail-content">
                      {bannerUrl ? (
                        <div
                          className="event-detail-image"
                          style={{ overflow: "hidden", borderRadius: "8px" }}
                        >
                          <img
                            src={bannerUrl}
                            alt={transaction?.event_title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        </div>
                      ) : (
                        <div className="event-detail-image">
                          <div className="event-image-pattern">
                            <span>EVENTDAY</span>
                            <strong>
                              {transaction?.event_title || "EVENT"}
                            </strong>
                          </div>
                        </div>
                      )}

                      <div className="event-detail-info">
                        <h3>
                          {transaction?.event_title ||
                            eventDetail?.title ||
                            "Nama Event"}
                        </h3>

                        <div className="event-info-grid" style={{ marginTop: "12px" }}>
                          <div>
                            <span>
                              <Calendar size={12} /> TANGGAL EVENT
                            </span>
                            <strong>
                              {formatDate(
                                eventDetail?.start_date ||
                                  eventDetail?.date ||
                                  transaction?.created_at
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              <MapPin size={12} /> LOKASI
                            </span>
                            <strong>
                              {eventDetail?.venue_name ||
                                eventDetail?.location ||
                                "-"}
                            </strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* RIGHT COLUMN */}
                <div className="detail-right-column">
                  {/* RINGKASAN PESANAN */}
                  <section className="detail-box order-summary-box">
                    <div className="detail-box-title">
                      <div className="detail-title-icon">
                        <Ticket size={18} />
                      </div>
                      <h2>Ringkasan Pesanan</h2>
                    </div>

                    <div className="detail-divider"></div>

                    <div className="ticket-summary">
                      <div className="ticket-summary-main">
                        <strong>Tiket Event</strong>
                        <span>{quantity} Tiket</span>
                      </div>

                      <strong className="ticket-price">
                        {formatRupiah(subtotal)}
                      </strong>
                    </div>

                    <div className="price-list">
                      <div>
                        <span>Subtotal</span>
                        <strong>{formatRupiah(subtotal)}</strong>
                      </div>

                      {adminFee > 0 && (
                        <div>
                          <span>Biaya Admin</span>
                          <strong>{formatRupiah(adminFee)}</strong>
                        </div>
                      )}
                    </div>

                    <div className="total-payment">
                      <div>
                        <span>Total</span>
                        <strong>Pembayaran</strong>
                      </div>
                      <strong>{formatRupiah(totalAmount)}</strong>
                    </div>
                  </section>

                  {/* DETAIL PEMBAYARAN */}
                  <section className="detail-box payment-detail-box">
                    <div className="detail-box-title">
                      <div className="detail-title-icon">
                        <CreditCard size={18} />
                      </div>
                      <h2>Detail Pembayaran</h2>
                    </div>

                    <div className="detail-divider"></div>

                    <div className="payment-info">
                      <div>
                        <span>METODE PEMBAYARAN</span>
                        <strong>
                          {transaction?.payment_method
                            ? String(transaction.payment_method).toUpperCase()
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <span>TANGGAL PEMBAYARAN</span>
                        <strong>
                          {transaction?.paid_at
                            ? formatDate(transaction.paid_at)
                            : transaction?.created_at
                            ? formatDate(transaction.created_at)
                            : "-"}
                        </strong>
                      </div>

                      <div>
                        <span>TRANSACTION ID GATEWAY</span>
                        <strong className="reference-number">
                          {transaction?.transaction_id_gateway || "-"}
                        </strong>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="download-ticket-button"
                      onClick={handleDownload}
                    >
                      <Download size={16} /> &nbsp; Unduh E-Ticket
                    </button>
                  </section>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default DetailTransaksi;