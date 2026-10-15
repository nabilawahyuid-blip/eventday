import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import {
  getTransactionHistory,
  getMyTicketsAuth,
} from "../../services/ticketService";
import { getEvents } from "../../services/eventService";
import { getRefundHistory } from "../../services/refundService";
import "./MyTicket.css";

const ORDER_STATUS_LABEL = {
  PAID: "Terbayar",
  PENDING: "Menunggu",
  WAITING_PAYMENT: "Menunggu Pembayaran",
  REFUND_REQUESTED: "Refund Diajukan",
  REFUNDED: "Refund Disetujui",
  REJECTED: "Refund Ditolak",
  EXPIRED: "Gagal Bayar",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
};

const ORDER_STATUS_TYPE = {
  PAID: "paid",
  PENDING: "pending",
  WAITING_PAYMENT: "pending",
  REFUND_REQUESTED: "refund-requested",
  REFUNDED: "refunded",
  REJECTED: "rejected",
  EXPIRED: "failed",
  CANCELLED: "cancelled",
  REFUND: "refund",
};

const FILTER_OPTIONS = [
  { key: "all", label: "Semua" },
  { key: "PAID", label: "Terbayar" },
  { key: "PENDING", label: "Menunggu" },
  { key: "EXPIRED", label: "Gagal" },
];

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
    });
  } catch {
    return dateStr;
  }
}

const PENDING_STATUSES = ["PENDING", "WAITING_PAYMENT"];
const REFUND_STATUSES = ["REFUND_REQUESTED", "REFUNDED", "REJECTED"];

// Backend membungkus payload dalam ApiResponse {msg, status, data}.
// HTTP 200 bisa membawa status error di body, dan apiFetch melempar
// Error (dengan .status + .data) untuk HTTP non-2xx. Keduanya harus
// ditangani sebelum .filter agar tidak kena "filter is not a function".
function extractArrayResponse(res) {
  if (!res) return { list: [], errorMsg: "" };
  // ApiResponse error via HTTP 200: { status: 4xx/5xx, msg, data }
  if (typeof res.status === "number" && res.status !== 200) {
    return { list: [], errorMsg: res.msg || res.message || `Request gagal (${res.status})` };
  }
  if (Array.isArray(res.data)) return { list: res.data, errorMsg: "" };
  if (Array.isArray(res)) return { list: res, errorMsg: "" };
  // Bentuk pagination wrapper { data: { data/content/items: [] } }
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

function getCategoryColor(title) {
  if (!title) return "#6c757d";
  const categories = {
    "MUSIC": "#e91e63",
    "KONSER": "#e91e63",
    "CONCERT": "#e91e63",
    "FESTIVAL": "#9c27b0",
    "CONFERENCE": "#2196f3",
    "KONFERENSI": "#2196f3",
    "EXHIBITION": "#ff9800",
    "PAMERAN": "#ff9800",
    "CULINARY": "#4caf50",
    "KULINER": "#4caf50",
    "WORKSHOP": "#00bcd4",
    "SEMINAR": "#00bcd4",
  };
  const upperTitle = title.toUpperCase();
  for (const [key, color] of Object.entries(categories)) {
    if (upperTitle.includes(key)) return color;
  }
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const hue = hash % 360;
  return `hsl(${hue}, 60%, 45%)`;
}

function getCategoryInitial(title) {
  if (!title) return "?";
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return words[0][0].toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function MyTicket() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0); // Halaman aktif, dimulai dari 0
  const pageSize = 6;

  useEffect(() => {
    let cancelled = false;
    const fetchOrders = async () => {
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
          : { list: [], errorMsg: "" }; // refund gagal = perlakukan sebagai tanpa refund, bukan error fatal

      const transData = transParsed.list;
      const refundData = refundParsed.list;

      // Deduplikasi by orderId (backend bisa return duplikat)
      const seen = new Set();
      const unique = transData.filter((o) => {
        if (!o || !o.orderId) return false;
        if (seen.has(o.orderId)) return false;
        seen.add(o.orderId);
        return true;
      });

      // Build refund map: orderId -> refund info
      const refundMap = {};
      refundData.forEach((refund) => {
        if (refund && refund.orderId) {
          refundMap[refund.orderId] = {
            refundId: refund.refundId,
            status: refund.status, // PENDING, APPROVED, REJECTED, etc.
            amount: refund.amount,
            reason: refund.reason,
            createdAt: refund.createdAt,
          };
        }
      });

      // Merge refund info into orders
      const merged = unique.map((order) => {
        const refundInfo = refundMap[order.orderId];
        // Gambar langsung dari payload history — tanpa N+1 issued-detail.
        const image =
          order.image ||
          order.bannerUrl ||
          order.eventImageUrl ||
          order.eventImage ||
          order.eventBannerUrl ||
          null;
        if (refundInfo) {
          // Determine order status based on refund status
          let orderStatus = order.status;
          if (refundInfo.status === "PENDING") {
            orderStatus = "REFUND_REQUESTED";
          } else if (refundInfo.status === "APPROVED" || refundInfo.status === "REFUNDED") {
            orderStatus = "REFUNDED";
          } else if (refundInfo.status === "REJECTED") {
            orderStatus = "REJECTED";
          }
          return { ...order, refundInfo, status: orderStatus, image };
        }
        return { ...order, image };
      });

      if (merged.length > 0 || !transParsed.errorMsg) {
        if (!cancelled) {
          setOrders(merged);
          setLoadError("");
          setLoading(false);
        }
        return;
      }

      // Transaksi gagal total → fallback my-tickets lalu group by orderId
      try {
        const res = await getMyTicketsAuth();
        if (cancelled) return;
        const { list: tickets, errorMsg } = extractArrayResponse(res);
        const orderMap = {};
        tickets.forEach((t) => {
          const oid = t?.orderId;
          if (!oid) return;
          if (!orderMap[oid]) {
            orderMap[oid] = {
              orderId: oid,
              orderNumber: String(oid).slice(0, 8).toUpperCase(),
              eventTitle: t.eventTitle || "Event",
              ticketTierName: t.categoryName || "-",
              quantity: 0,
              totalAmount: 0,
              status: t.checkInStatus || "PENDING",
              createdAt: t.issuedAt || null,
              tickets: [],
              image: t.eventImageUrl || t.eventImage || null,
            };
          }
          orderMap[oid].quantity += 1;
          orderMap[oid].tickets.push(t);
        });
        const fallbackOrders = Object.values(orderMap);
        setOrders(fallbackOrders);
        setLoadError(fallbackOrders.length > 0 ? "" : (errorMsg || transParsed.errorMsg));
      } catch (err2) {
        if (cancelled) return;
        if (err2?.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setOrders([]);
        setLoadError(getApiErrorMessage(err2, transParsed.errorMsg || "Gagal memuat pesanan."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOrders();
    return () => { cancelled = true; };
  }, []);

  const isPendingOrder = (order) => PENDING_STATUSES.includes(order?.status);

  const NON_REFUND_STATUSES = ["PAID", "PENDING", "WAITING_PAYMENT", "EXPIRED"];

  // Status priority: lower number = higher priority (appears first)
  const STATUS_PRIORITY = {
    PENDING: 1,
    WAITING_PAYMENT: 1,
    PAID: 2,
    EXPIRED: 3,
    CANCELLED: 4,
  };

  const getStatusPriority = (status) => STATUS_PRIORITY[status] || 99;

  // Tab refund dihapus: order refund disembunyikan total dari halaman ini.
  // Merge refund tetap dipertahankan agar status refund terdeteksi untuk filter.
  const filteredOrders = (filter === "all"
    ? orders.filter((o) => NON_REFUND_STATUSES.includes(o.status))
    : orders.filter((o) => o.status === filter)
  ).sort((a, b) => {
    // Primary sort: status priority (pending first, then paid, then expired)
    const priorityA = getStatusPriority(a.status);
    const priorityB = getStatusPriority(b.status);
    if (priorityA !== priorityB) return priorityA - priorityB;

    // Secondary sort: createdAt descending (newest first within same status)
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  // Pagination client-side di atas hasil filter/sort yang sudah dimuat.
  // Endpoint riwayat transaksi/refund tidak mengekspos page/size, sehingga
  // nomor halaman dihitung dari data lokal dan bukan dari metadata backend.
  const totalElements = filteredOrders.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const paginatedOrders = filteredOrders.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize
  );
  const pageNumbers = (() => {
    if (totalPages <= 1) return [];
    const maxButtons = 5;
    let start = Math.max(0, safePage - Math.floor(maxButtons / 2));
    const end = Math.min(totalPages, start + maxButtons);
    start = Math.max(0, end - maxButtons);
    return Array.from({ length: end - start }, (_, index) => start + index);
  })();
  const rangeStart = totalElements === 0 ? 0 : safePage * pageSize + 1;
  const rangeEnd = Math.min(totalElements, (safePage + 1) * pageSize);

  useEffect(() => {
    if (page !== safePage) {
      setPage(safePage);
    }
  }, [page, safePage]);

  const handleOrderClick = async (order) => {
    if (isPendingOrder(order)) {
      // Utama: pakai eventId dari order bila ada (tanpa search rapuh).
      const directEventId = order?.eventId || order?.event_id;
      if (directEventId) {
        navigate(`/checkout/${directEventId}`, {
          state: {
            orderId: order.orderId,
            resume: true,
            ticketTierName: order.ticketTierName, // kirim tier yang dipilih
            quantity: order.quantity, // WAJIB: agar form peserta = quantity order asli
          },
        });
        return;
      }
      // Fallback: cari eventId berdasarkan eventTitle
      try {
        const res = await getEvents({ search: order.eventTitle, limit: 1 });
        // Handle berbagai struktur response: array langsung, pagination wrapper {data: [], items: [], content: []}
        const { list: eventsArray } = extractArrayResponse(res);
        const foundEvent = eventsArray[0];
        if (!foundEvent?.id) throw new Error("Event tidak ditemukan");

        navigate(`/checkout/${foundEvent.id}`, {
          state: { 
            orderId: order.orderId, 
            resume: true,
            ticketTierName: order.ticketTierName,  // kirim tier yang dipilih
            quantity: order.quantity, // WAJIB: agar form peserta = quantity order asli
          },
        });
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Gagal Lanjut Bayar",
          text: getApiErrorMessage(err, "Tidak dapat menemukan event yang sesuai. Hubungi support."),
          confirmButtonColor: "#5548dc",
        });
      }
    } else {
      navigate(`/customer/orders/${order.orderId}`);
    }
  };

  const handleRetry = () => {
    setPage(0);
    setLoadError("");
    setLoading(true);
    window.location.reload();
  };

  return (
    <div className="my-ticket-page">
      <NavbarCustomer />

      <main className="my-ticket-container">
        <section className="my-ticket-heading">
          <div>
            <h1>Tiket Saya</h1>
            <p>
              Kelola semua pesanan dan tiket acara Anda di sini.
            </p>
          </div>

          <div className="my-ticket-filters">
            {FILTER_OPTIONS.map((f) => (
              <button
                key={f.key}
                className={`filter-button ${filter === f.key ? "active" : ""}`}
                onClick={() => {
                  setFilter(f.key);
                  setPage(0);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

        {loadError && orders.length === 0 && !loading && (
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
              onClick={handleRetry}
              style={{
                flexShrink: 0,
                padding: "8px 14px",
                borderRadius: 8,
                border: "none",
                background: "#5548dc",
                color: "#fff",
                cursor: "pointer",
              }}
            >
              Coba Lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="my-ticket-loading">
            <div className="ticket-spinner" />
            <span>Memuat pesanan...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="my-ticket-empty">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M2 10h20" />
              <path d="M9 15h.01M15 15h.01" />
            </svg>
            <p>Belum ada pesanan</p>
            <button onClick={() => navigate("/customer/dashboard")}>
              Jelajahi Event
            </button>
          </div>
        ) : (
          <>
            <section className="my-ticket-list">
              {paginatedOrders.map((order) => (
                <OrderCard
                  key={order.orderId}
                  order={order}
                  onClick={handleOrderClick}
                />
              ))}
            </section>

            {totalPages > 1 && (
              <div className="my-ticket-pagination">
                <span className="my-ticket-pagination-info">
                  Menampilkan {rangeStart}–{rangeEnd} dari {totalElements} pesanan
                </span>

                <div className="my-ticket-pagination-controls">
                  <button
                    type="button"
                    className="my-ticket-page-button"
                    disabled={safePage === 0}
                    onClick={() =>
                      setPage((previous) => Math.max(0, previous - 1))
                    }
                    aria-label="Halaman sebelumnya"
                  >
                    ‹
                  </button>

                  {pageNumbers.map((pageNumber) => (
                    <button
                      key={pageNumber}
                      type="button"
                      className={
                        pageNumber === safePage
                          ? "my-ticket-page-button active"
                          : "my-ticket-page-button"
                      }
                      onClick={() => setPage(pageNumber)}
                      aria-label={`Halaman ${pageNumber + 1}`}
                      aria-current={
                        pageNumber === safePage ? "page" : undefined
                      }
                    >
                      {pageNumber + 1}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="my-ticket-page-button"
                    disabled={safePage >= totalPages - 1}
                    onClick={() =>
                      setPage((previous) =>
                        Math.min(totalPages - 1, previous + 1)
                      )
                    }
                    aria-label="Halaman berikutnya"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <FooterCustomer />
    </div>
  );
}

function OrderCard({ order, onClick }) {
  const statusKey = order.status || "PENDING";
  const label = ORDER_STATUS_LABEL[statusKey] || statusKey;
  const type = ORDER_STATUS_TYPE[statusKey] || "pending";
  const isPending = PENDING_STATUSES.includes(statusKey);
  const hasRefund = !!order.refundInfo;
  const refundStatus = order.refundInfo?.status;

  // Handle click based on order status and refund status
  const handleCardClick = (e) => {
    e.stopPropagation();
    
    if (isPending) {
      onClick(order); // Lanjut bayar
    } else if (hasRefund) {
      // Show warning for refund requested/processed orders
      let message = "";
      if (refundStatus === "PENDING") {
        message = "Refund untuk pesanan ini sudah diajukan dan sedang diproses.";
      } else if (refundStatus === "APPROVED" || refundStatus === "REFUNDED") {
        message = "Refund untuk pesanan ini sudah disetujui dan dana akan dikembalikan.";
      } else if (refundStatus === "REJECTED") {
        message = "Pengajuan refund untuk pesanan ini telah ditolak.";
      } else {
        message = "Pesanan ini sudah memiliki pengajuan refund.";
      }
      Swal.fire({
        icon: "info",
        title: "Refund Sudah Diajukan",
        text: message,
        confirmButtonColor: "#5548dc",
      });
    } else {
      onClick(order); // Lihat detail
    }
  };

  return (
    <article
      className="my-ticket-card"
      onClick={handleCardClick}
      style={{ cursor: isPending ? "default" : "pointer" }}
    >
      <div className="ticket-image-section">
        {order.image || order.bannerUrl ? (
          <img 
            src={order.image || order.bannerUrl} 
            alt={order.eventTitle || "Event"} 
            className="ticket-event-image"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        ) : (
          <div className="ticket-image-placeholder" style={{ backgroundColor: getCategoryColor(order.eventTitle) }}>
            <span className="placeholder-text">{getCategoryInitial(order.eventTitle)}</span>
          </div>
        )}
        <div className="ticket-image-overlay"></div>

        <span className={`ticket-status-badge ${type}`}>
          {label}
        </span>

        <div className="ticket-image-content">
          <span className="ticket-category">{order.ticketTierName || "-"}</span>
          <h2>{order.eventTitle || "Event"}</h2>
        </div>
      </div>

      <div className="ticket-card-content">
        <div className="ticket-card-info">
          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            <span>{formatDate(order.createdAt)}</span>
          </div>

          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>{order.quantity || 0} Tiket</span>
          </div>

          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
              <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
            </svg>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="ticket-card-divider"></div>

        <div className="ticket-card-action">
          {isPending ? (
            <button className="resume-payment-btn" onClick={(e) => { e.stopPropagation(); onClick(order); }}>
              Lanjut Bayar
            </button>
          ) : hasRefund ? (
            <button className="refund-status-btn" onClick={(e) => { e.stopPropagation(); onClick(order); }}>
              {refundStatus === "PENDING" ? "Refund Diproses" : 
               refundStatus === "APPROVED" || refundStatus === "REFUNDED" ? "Refund Disetujui" :
               refundStatus === "REJECTED" ? "Refund Ditolak" : "Refund Diajukan"}
            </button>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onClick(order); }}>Lihat Detail</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default MyTicket;
