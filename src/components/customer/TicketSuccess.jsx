import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import { getMyTickets } from "../../services/ticketService";
import "./TicketSuccess.css";

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

function TicketSuccess() {
  const navigate = useNavigate();
  const location = useLocation();

  const stateEvent = location.state?.event || null;
  const stateBuyers = location.state?.buyers || [];
  const orderId = location.state?.orderId || null;
  const orderNumber = location.state?.orderNumber || null;

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    const fetchTickets = async () => {
      const email = localStorage.getItem("email");
      if (!email) return;

      setLoading(true);
      try {
        console.log("[TicketSuccess] Fetch tiket untuk email:", email, "orderId:", orderId);
        const res = await getMyTickets(email);
        console.log("[TicketSuccess] Response backend:", res);

        const allTickets = res?.data || [];
        console.log("[TicketSuccess] Jumlah tiket dari backend:", allTickets.length);
        if (allTickets.length > 0) {
          console.log("[TicketSuccess] Tiket pertama:", allTickets[0]);
        }

        const filtered = orderId
          ? allTickets.filter((t) => t.orderId === orderId)
          : allTickets;

        console.log("[TicketSuccess] Setelah filter orderId:", filtered.length, "tiket");
        if (filtered.length > 0) {
          setTickets(filtered);
          setUsedFallback(false);
        } else {
          console.log("[TicketSuccess] Tidak ada tiket dari backend, pakai fallback");
          setUsedFallback(true);
        }
      } catch (err) {
        console.error("[TicketSuccess] ERROR:", err.message);
        console.error("[TicketSuccess] Full error:", err);
        setUsedFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [orderId]);

  const displayTickets = usedFallback
    ? stateBuyers.map((b, i) => ({
        ticketCode: `TK-${String(i + 1).padStart(3, "0")}`,
        attendeeName: b.name || b.fullName || "-",
        categoryName: stateEvent?.category || "-",
        status: "UNREDEEMED",
        eventTitle: stateEvent?.title || "Event",
        eventDate: stateEvent?.date || "-",
        venueName: stateEvent?.location || stateEvent?.venue || "-",
        orderId: orderId || null,
        eventImageUrl: stateEvent?.image || null,
      }))
    : tickets;

  // Simpan tiket ke localStorage agar MyTicket bisa tampilkan
  useEffect(() => {
    if (displayTickets.length > 0) {
      const stored = JSON.parse(localStorage.getItem("issued_tickets") || "[]");
      const existingCodes = new Set(stored.map((t) => t.ticketCode));
      const newTickets = displayTickets.filter(
        (t) => !existingCodes.has(t.ticketCode)
      );
      if (newTickets.length > 0) {
        localStorage.setItem(
          "issued_tickets",
          JSON.stringify([...stored, ...newTickets])
        );
      }
    }
  }, [displayTickets]);

  const displayEvent = usedFallback && stateEvent
    ? {
        title: stateEvent.title || "Event",
        date: stateEvent.date || "-",
        location: stateEvent.location || stateEvent.venue || "-",
      }
    : displayTickets.length > 0
    ? {
        title: displayTickets[0].eventTitle || "Event",
        date: displayTickets[0].eventDate || "-",
        location: displayTickets[0].venueName || "-",
      }
    : { title: "Event", date: "-", location: "-" };

  const downloadQR = (ticketCode) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
      ticketCode
    )}`;
    const link = document.createElement("a");
    link.href = qrUrl;
    link.download = `${ticketCode}.png`;
    link.target = "_blank";
    link.click();
  };

  return (
    <div className="ticket-success-page">
      <NavbarCustomer />

      <main className="ticket-success-container">
        <div className="success-message">
          <strong>Pembayaran Berhasil</strong>
          <span>Tiket Berhasil Diterbitkan</span>
          {orderNumber && (
            <span className="order-number">Nomor Pesanan: {orderNumber}</span>
          )}
        </div>

        {loading ? (
          <div className="ticket-loading">
            <div className="ticket-spinner" />
            <span>Memuat tiket...</span>
          </div>
        ) : displayTickets.length === 0 ? (
          <div className="ticket-empty">
            <p>Belum ada tiket yang diterbitkan.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {displayTickets.map((ticket, index) => (
              <TicketCard
                key={ticket.ticketCode || ticket.ticketId || index}
                ticket={ticket}
                event={displayEvent}
                index={index}
                onDownload={downloadQR}
              />
            ))}
          </div>
        )}

        <div className="success-actions">
          <button
            className="dashboard-button"
            onClick={() => navigate("/customer/dashboard")}
          >
            Ke Dashboard
          </button>

          <button
            className="my-ticket-button"
            onClick={() => navigate("/customer/tickets")}
          >
            Ke Tiket Saya
          </button>

          <button
            className="refund-button"
            onClick={() =>
              navigate("/customer/refund", {
                state: { orderId },
              })
            }
          >
            Ajukan Refund
          </button>
        </div>
      </main>

      <footer className="ticket-success-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function TicketCard({ ticket, event, index, onDownload }) {
  const ticketCode = ticket.ticketCode || "-";
  const statusKey = ticket.status || "UNREDEEMED";

  return (
    <article className={`ticket-result-card ticket-card-${index + 1}`}>
      <div className="ticket-event-header">
        <div className="ticket-event-info">
          <h2>{ticket.eventTitle || event.title}</h2>

          <div className="ticket-info-row">
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

            <span>{ticket.eventDate || event.date}</span>
          </div>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>

            <span>{ticket.venueName || event.location}</span>
          </div>
        </div>

        <span className={`ticket-usage-badge ${STATUS_TYPE[statusKey] || "unused"}`}>
          {STATUS_LABEL[statusKey] || statusKey}
        </span>
      </div>

      <div className="ticket-qr-section">
        <div className="qr-wrapper">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              ticketCode
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
          <strong className="payment-status">
            {STATUS_LABEL[statusKey] || statusKey}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default TicketSuccess;
