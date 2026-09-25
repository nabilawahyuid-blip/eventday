import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import { getMyTickets, getTicketDetail, getTicketsByOrder } from "../../services/ticketService";
import { apiFetch } from "../../services/api";
import "./OrderDetail.css";

const STATUS_LABEL = {
  UNREDEEMED: "Belum Digunakan",
  CHECKED_IN: "Sudah Digunakan",
  REDEEMED: "Sudah Digunakan",
  EXPIRED: "Tiket Expired",
};

const STATUS_TYPE = {
  UNREDEEMED: "unused",
  CHECKED_IN: "used",
  REDEEMED: "used",
  EXPIRED: "expired",
};

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
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
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

function OrderDetail() {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const [order, setOrder] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [orderNotFound, setOrderNotFound] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setOrderNotFound(true);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // 1) Ambil order info dari transactions/history
        const historyRes = await apiFetch("/api/transactions/history");
        const allOrders = historyRes?.data || [];
        const foundOrder = allOrders.find((o) => o.orderId === orderId);

        if (foundOrder) {
          setOrder(foundOrder);
        } else {
          setOrder({
            orderId,
            orderNumber: orderId.slice(0, 8).toUpperCase(),
            eventTitle: "Event",
            ticketTierName: "-",
            quantity: 0,
            totalAmount: 0,
            status: "PENDING",
            createdAt: null,
          });
        }

// 2) Ambil tiket — pakai endpoint by-order (eliminasi N+1 calls)
        let foundTickets = [];
        try {
          const res = await getTicketsByOrder(orderId);
          const tickets = res?.data || [];
          console.log("[OrderDetail] getTicketsByOrder response:", tickets);

          if (tickets.length > 0) {
            foundTickets = tickets;

            // Get eventImageUrl from first ticket
            const firstTicket = tickets[0];
            const imageUrl = firstTicket.eventImageUrl || firstTicket.eventImage;
            if (imageUrl) {
              setOrder((prev) => prev ? { ...prev, image: imageUrl } : null);
            }
          }
        } catch (err) {
          console.error("[OrderDetail] getTicketsByOrder error:", err.message);

          // Fallback to old method if new endpoint fails
          const email = localStorage.getItem("email");
          console.log("[OrderDetail] Fallback - Fetching tickets for order:", orderId, "email:", email);
          if (email) {
            try {
              const res = await getMyTickets(email);
              const allTickets = res?.data || [];
              console.log("[OrderDetail] allTickets (fallback):", allTickets);

              if (allTickets.length > 0) {
                const matchingTickets = [];

                for (let i = 0; i < Math.min(allTickets.length, 20); i++) {
                  const ticket = allTickets[i];
                  const code = ticket.ticketCode || ticket.ticketItemId;
                  if (!code) continue;

                  try {
                    const detailRes = await getTicketDetail(code);
                    console.log("[OrderDetail] issued-detail for", code, ":", detailRes);
                    const data = detailRes?.data;
                    if (data?.orderId === orderId) {
                      matchingTickets.push({
                        ...ticket,
                        ...detailRes?.data,
                      });
                    }
                  } catch (e) {
                    console.warn("[OrderDetail] issued-detail error:", e);
                  }
                }

                foundTickets = matchingTickets;
                console.log("[OrderDetail] Matching tickets for order:", orderId, ":", matchingTickets);

                if (matchingTickets.length > 0) {
                  const firstMatch = matchingTickets[0];
                  const imageUrl = firstMatch.eventImageUrl || firstMatch.eventImage;
                  if (imageUrl) {
                    setOrder((prev) => prev ? { ...prev, image: imageUrl } : null);
                  }
                }
              }
            } catch (err) {
              console.error("[OrderDetail] getMyTickets error (fallback):", err.message);
            }
          }
        }

        // 3) Fallback: localStorage
        if (foundTickets.length === 0) {
          const stored = JSON.parse(localStorage.getItem("issued_tickets") || "[]");
          foundTickets = stored.filter((t) => t.orderId === orderId);
        }

        // Set tiket
        if (foundTickets.length > 0) {
          setTickets(foundTickets);

          if (!foundOrder) {
            setOrder((prev) => ({
              ...prev,
              eventTitle: foundTickets[0].eventTitle || prev.eventTitle,
              ticketTierName: foundTickets[0].categoryName || prev.ticketTierName,
              quantity: foundTickets.length,
            }));
          }
        }
      } catch (err) {
        console.error("[OrderDetail] Error:", err.message);
        setOrderNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [orderId]);

  const canRefund = order && ["PAID", "PENDING"].includes(order.status);
  const orderStatusKey = order?.status || "PENDING";

  const downloadQR = (ticketCode) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      ticketCode,
    )}`;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${ticketCode}.png`;
    link.target = "_blank";
    link.click();
  };

  if (loading) {
    return (
      <div className="order-detail-page">
        <NavbarCustomer />
        <main className="order-detail-container">
          <div className="order-detail-loading">
            <div className="order-detail-spinner" />
            <span>Memuat detail pesanan...</span>
          </div>
        </main>
      </div>
    );
  }

  if (orderNotFound) {
    return (
      <div className="order-detail-page">
        <NavbarCustomer />
        <main className="order-detail-container">
          <div className="order-detail-empty">
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
            <p>Pesanan tidak ditemukan</p>
            <button onClick={() => navigate("/customer/tickets")}>
              Kembali ke Tiket Saya
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="order-detail-page">
      <NavbarCustomer />

      <main className="order-detail-container">
        {/* Header info order */}
        <div className="order-detail-header">
          <div className="order-header-info">
            <h1>{order.eventTitle || "Event"}</h1>

            <div className="order-header-meta">
              <span
                className={`order-status-badge ${ORDER_STATUS_TYPE[orderStatusKey] || "pending"}`}
              >
                {ORDER_STATUS_LABEL[orderStatusKey] || orderStatusKey}
              </span>

              {order.orderNumber && (
                <span className="order-number-label">
                  {order.orderNumber}
                </span>
              )}
            </div>
          </div>

          <div className="order-header-details">
            <div className="order-detail-item">
              <span className="order-detail-label">Tanggal Pesan</span>
              <span className="order-detail-value">
                {formatDateTime(order.createdAt)}
              </span>
            </div>

            <div className="order-detail-item">
              <span className="order-detail-label">Jumlah Tiket</span>
              <span className="order-detail-value">{order.quantity || tickets.length || 0}</span>
            </div>

            <div className="order-detail-item">
              <span className="order-detail-label">Total Bayar</span>
              <span className="order-detail-value order-total">
                {formatCurrency(order.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Daftar tiket */}
        <div className="order-tickets-section">
          <h2>E-Ticket ({tickets.length})</h2>

          {tickets.length === 0 ? (
            <div className="order-no-tickets">
              <p>Belum ada tiket yang diterbitkan untuk pesanan ini.</p>
            </div>
          ) : (
            <div className="order-tickets-list">
              {tickets.map((ticket, index) => (
                <TicketCard
                  key={ticket.ticketCode || ticket.ticketItemId || index}
                  ticket={ticket}
                  index={index}
                  onDownload={downloadQR}
                />
              ))}
            </div>
          )}
        </div>

        {/* Aksi */}
        <div className="order-actions">
          <button
            className="order-btn-back"
            onClick={() => navigate("/customer/tickets")}
          >
            Kembali
          </button>

          {canRefund && (
            <button
              className="order-btn-refund"
              onClick={() =>
                navigate("/customer/refund", {
                  state: { orderId: order.orderId },
                })
              }
            >
              Ajukan Refund
            </button>
          )}
        </div>
      </main>

      <footer className="order-detail-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function TicketCard({ ticket, index, onDownload }) {
  const ticketCode = ticket.ticketCode || ticket.ticketItemId || "-";
  const statusKey = ticket.checkInStatus || ticket.status || "UNREDEEMED";
  const isPlaceholder = ticket.isPlaceholder;

  return (
    <article className={`ticket-result-card ticket-card-${index + 1}`}>
      <div className="ticket-event-header">
        <div className="ticket-event-info">
          <h2>{ticket.eventTitle || "Event"}</h2>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            <span>{ticket.eventDate || "-"}</span>
          </div>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>
            <span>{ticket.venueName || "-"}</span>
          </div>
        </div>

        <span className={`ticket-usage-badge ${STATUS_TYPE[statusKey] || "unused"}`}>
          {STATUS_LABEL[statusKey] || statusKey}
        </span>
      </div>

      {!isPlaceholder && (
        <div className="ticket-qr-section">
          <div className="qr-wrapper">
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                ticketCode,
              )}`}
              alt={`QR Code ${ticketCode}`}
            />
          </div>

          <p className="qr-instruction">Tunjukan kode ini ke Staff</p>

          <div className="ticket-code">{ticketCode}</div>

          <button
            className="download-qr-button"
            onClick={() => onDownload(ticketCode)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
            <span>Unduh QR Tiket</span>
          </button>
        </div>
      )}

      {isPlaceholder && (
        <div className="ticket-placeholder-section">
          <p>Detail tiket akan tersedia setelah backend memproses.</p>
        </div>
      )}

      <div className="ticket-detail-section">
        <div className="ticket-detail-row">
          <span>Jenis Tiket</span>
          <strong>{ticket.categoryName || "-"}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Nama</span>
          <strong>{ticket.attendeeName || "-"}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Status Penggunaan</span>
          <strong className={`payment-status ${STATUS_TYPE[statusKey] || "unused"}`}>
            {STATUS_LABEL[statusKey] || statusKey}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default OrderDetail;
