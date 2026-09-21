import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import { getMyTickets, getTicketDetail } from "../../services/ticketService";
import "./MyTicket.css";

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

function MyTicket() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchTickets = async () => {
      const email = localStorage.getItem("email");

      // 1) Coba ambil dari backend
      if (email) {
        try {
          const res = await getMyTickets(email);
          const data = res?.data || [];

          if (data.length > 0) {
            // Fetch detail tiap tiket untuk dapat event data
            const enriched = await Promise.all(
              data.map(async (ticket) => {
                try {
                  const detailRes = await getTicketDetail(ticket.ticketItemId);
                  return { ...ticket, ...detailRes?.data };
                } catch {
                  return ticket;
                }
              }),
            );
            setTickets(enriched);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error("[MyTicket] Backend error:", err.message);
        }
      }

      // 2) Fallback: ambil dari localStorage
      const stored = JSON.parse(localStorage.getItem("issued_tickets") || "[]");
      setTickets(stored);
      setLoading(false);
    };

    fetchTickets();
  }, []);

  const filteredTickets =
    filter === "all"
      ? tickets
      : tickets.filter(
          (t) => (t.checkInStatus || t.status || "UNREDEEMED") === filter,
        );

  const handleDetailTicket = (ticket) => {
    navigate("/customer/ticket-success", {
      state: { ticket, fromMyTicket: true },
    });
  };

  return (
    <div className="my-ticket-page">
      <NavbarCustomer />

      <main className="my-ticket-container">
        <section className="my-ticket-heading">
          <div>
            <h1>Tiket Saya</h1>

            <p>
              Kelola semua tiket acara Anda yang akan datang dan yang telah
              lewat di sini.
            </p>
          </div>

          <div className="my-ticket-filters">
            {[
              { key: "all", label: "Semua Tiket" },
              { key: "UNREDEEMED", label: "Belum Digunakan" },
              { key: "CHECKED_IN", label: "Sudah Digunakan" },
              { key: "EXPIRED", label: "Expired" },
            ].map((f) => (
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
            <span>Memuat tiket...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
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
            <p>Belum ada tiket</p>
            <button onClick={() => navigate("/customer/dashboard")}>
              Jelajahi Event
            </button>
          </div>
        ) : (
          <section className="my-ticket-list">
            {filteredTickets.map((ticket) => (
              <TicketCard
                key={ticket.ticketItemId || ticket.ticketCode}
                ticket={ticket}
                onDetail={handleDetailTicket}
              />
            ))}
          </section>
        )}
      </main>

      <FooterCustomer />
    </div>
  );
}

function TicketCard({ ticket, onDetail }) {
  const statusKey = ticket.checkInStatus || ticket.status || "UNREDEEMED";

  return (
    <article className="my-ticket-card">
      <div className="ticket-image-section">
        {ticket.eventImageUrl ? (
          <img src={ticket.eventImageUrl} alt={ticket.eventTitle || "Event"} />
        ) : (
          <div className="ticket-image-placeholder" />
        )}

        <div className="ticket-image-overlay"></div>

        <span
          className={`ticket-status-badge ${STATUS_TYPE[statusKey] || "unused"}`}
        >
          {STATUS_LABEL[statusKey] || statusKey}
        </span>

        <div className="ticket-image-content">
          <span className="ticket-category">{ticket.categoryName || "-"}</span>

          <h2>{ticket.eventTitle || "Event"}</h2>
        </div>
      </div>

      <div className="ticket-card-content">
        <div className="ticket-card-info">
          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>

            <span>{ticket.eventDate || "-"}</span>
          </div>

          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>

            <span>{ticket.venueName || "-"}</span>
          </div>
        </div>

        <div className="ticket-card-divider"></div>

        <div className="ticket-card-action">
          <button onClick={() => onDetail(ticket)}>Detail Tiket</button>
        </div>
      </div>
    </article>
  );
}

export default MyTicket;
