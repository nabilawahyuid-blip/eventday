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
import "./MyTicket.css";

const ORDER_STATUS_LABEL = {
  PAID: "Terbayar",
  PENDING: "Menunggu",
  REFUND_REQUESTED: "Refund Diajukan",
  REFUNDED: "Refund Disetujui",
  REJECTED: "Refund Ditolak",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
};

const ORDER_STATUS_TYPE = {
  PAID: "paid",
  PENDING: "pending",
  REFUND_REQUESTED: "refund-requested",
  REFUNDED: "refunded",
  REJECTED: "rejected",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
};

const FILTER_OPTIONS = [
  { key: "all", label: "Semua" },
  { key: "PAID", label: "Terbayar" },
  { key: "PENDING", label: "Menunggu Pembayaran" },
  { key: "REFUND_REQUESTED", label: "Refund Diajukan" },
  { key: "REFUNDED", label: "Refund Disetujui" },
  { key: "EXPIRED", label: "Kedaluwarsa" },
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

function MyTicket() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
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

        setOrders(unique);
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

  const filteredOrders = (filter === "all"
    ? orders
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

  return (
    <article
      className="my-ticket-card"
      onClick={() => !isPending && onClick(order)}
      style={{ cursor: isPending ? "default" : "pointer" }}
    >
      <div className="ticket-image-section">
        <div className="ticket-image-placeholder" />
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
          ) : (
            <button onClick={(e) => { e.stopPropagation(); onClick(order); }}>Lihat Detail</button>
          )}
        </div>
      </div>
    </article>
  );
}

export default MyTicket;
