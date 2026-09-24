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
  REFUND_REQUESTED: "Refund Diajukan",
  REFUNDED: "Refund Disetujui",
  REJECTED: "Refund Ditolak",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REFUND: "Refund",
};

const ORDER_STATUS_TYPE = {
  PAID: "paid",
  PENDING: "pending",
  REFUND_REQUESTED: "refund-requested",
  REFUNDED: "refunded",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
  REFUND: "refund",
};

const FILTER_OPTIONS = [
  { key: "all", label: "Semua" },
  { key: "PAID", label: "Terbayar" },
  { key: "PENDING", label: "Menunggu" },
  { key: "EXPIRED", label: "Kedaluwarsa" },
  { key: "REFUND", label: "Refund" },
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
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // Fetch both transaction history and refund history in parallel
        const [transRes, refundRes] = await Promise.all([
          getTransactionHistory(),
          getRefundHistory(),
        ]);

        const transData = transRes?.data || [];
        const refundData = refundRes?.data || [];

        // Deduplikasi by orderId (backend bisa return duplikat)
        const seen = new Set();
        const unique = transData.filter((o) => {
          if (seen.has(o.orderId)) return false;
          seen.add(o.orderId);
          return true;
        });

        // Build refund map: orderId -> refund info
        const refundMap = {};
        refundData.forEach((refund) => {
          if (refund.orderId) {
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
            return {
              ...order,
              refundInfo,
              status: orderStatus,
            };
          }
          return order;
        });

        // Fetch event images from issued-detail for each order
        try {
          // Get my-tickets to map tickets to orders
          const myTicketsRes = await getMyTicketsAuth();
          const myTickets = myTicketsRes?.data || [];

          // Group tickets by orderId, take first ticket per order
          const ticketByOrderId = {};
          myTickets.forEach((t) => {
            if (t.orderId && !ticketByOrderId[t.orderId] && (t.ticketCode || t.ticketItemId)) {
              ticketByOrderId[t.orderId] = t.ticketCode || t.ticketItemId;
            }
          });

          // Fetch eventImageUrl from issued-detail for each order (parallel, max 10 to avoid overload)
          const orderIdsWithTickets = Object.keys(ticketByOrderId).slice(0, 10);
          const imagePromises = orderIdsWithTickets.map(async (orderId) => {
            const ticketCode = ticketByOrderId[orderId];
            try {
              const detailRes = await getTicketDetail(ticketCode);
              const imageUrl = detailRes?.data?.eventImageUrl || detailRes?.data?.eventImage || null;
              return { orderId, imageUrl };
            } catch {
              return { orderId, imageUrl: null };
            }
          });

          const imageResults = await Promise.all(imagePromises);
          const imageMap = {};
          imageResults.forEach(({ orderId, imageUrl }) => {
            if (imageUrl) imageMap[orderId] = imageUrl;
          });

          // Merge image URLs into merged orders
          const withImages = merged.map((order) => ({
            ...order,
            image: imageMap[order.orderId] || order.image || order.bannerUrl || null,
          }));

          setOrders(withImages);
        } catch (imgErr) {
          console.warn("[MyTicket] Failed to fetch event images:", imgErr);
          setOrders(merged);
        }
      } catch (err) {
        console.error("[MyTicket] transactions/history error:", err.message);

        // Fallback: coba dari my-tickets lalu group by orderId
        try {
          const res = await getMyTicketsAuth();
          const tickets = res?.data || [];
          const orderMap = {};
          tickets.forEach((t) => {
            const oid = t.orderId;
            if (!oid) return;
            if (!orderMap[oid]) {
              orderMap[oid] = {
                orderId: oid,
                orderNumber: oid.slice(0, 8).toUpperCase(),
                eventTitle: t.eventTitle || "Event",
                ticketTierName: t.categoryName || "-",
                quantity: 0,
                totalAmount: 0,
                status: t.checkInStatus || "PENDING",
                createdAt: t.issuedAt || null,
                tickets: [],
              };
            }
            orderMap[oid].quantity += 1;
            orderMap[oid].tickets.push(t);
          });
          setOrders(Object.values(orderMap));
        } catch (err2) {
          console.error("[MyTicket] my-tickets fallback error:", err2.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const isPendingOrder = (order) => PENDING_STATUSES.includes(order?.status);

  const REFUND_STATUSES = ["REFUND_REQUESTED", "REFUNDED", "REJECTED"];

  const NON_REFUND_STATUSES = ["PAID", "PENDING", "WAITING_PAYMENT", "EXPIRED"];

  const filteredOrders = (filter === "all"
    ? orders.filter((o) => NON_REFUND_STATUSES.includes(o.status))
    : filter === "REFUND"
    ? orders.filter((o) => REFUND_STATUSES.includes(o.status))
    : orders.filter((o) => o.status === filter)
  ).sort((a, b) => {
    const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return db - da;
  });

  const handleOrderClick = async (order) => {
    if (isPendingOrder(order)) {
      // Cari eventId berdasarkan eventTitle
      try {
        const res = await getEvents({ search: order.eventTitle, limit: 1 });
        // Handle berbagai struktur response: array langsung, pagination wrapper {data: [], items: [], content: []}
        const rawData = res?.data;
        const eventsArray = Array.isArray(rawData)
          ? rawData
          : (rawData?.data || rawData?.items || rawData?.content || []);
        const foundEvent = eventsArray[0];
        if (!foundEvent?.id) throw new Error("Event tidak ditemukan");

        navigate(`/checkout/${foundEvent.id}`, {
          state: { 
            orderId: order.orderId, 
            resume: true,
            ticketTierName: order.ticketTierName  // kirim tier yang dipilih
          },
        });
      } catch (err) {
        console.error("[MyTicket] Gagal cari eventId:", err);
        Swal.fire({
          icon: "error",
          title: "Gagal Lanjut Bayar",
          text: "Tidak dapat menemukan event yang sesuai. Hubungi support.",
          confirmButtonColor: "#5548dc",
        });
      }
    } else {
      navigate(`/customer/orders/${order.orderId}`);
    }
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
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </section>

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
          <section className="my-ticket-list">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.orderId}
                order={order}
                onClick={handleOrderClick}
              />
            ))}
          </section>
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
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
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
