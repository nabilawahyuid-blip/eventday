import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import "./MyTicket.css";

function MyTicket() {
  const navigate = useNavigate();

  const tickets = [
    {
      id: 1,
      title: "Neon Nights 2024",
      category: "MUSIC FESTIVAL",
      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=900&q=85",
      date: "15 Aug 2024 • 19:00",
      location: "Stadium Utama Gelora Bung Karno",
      status: "Sudah Di Gunakan",
      statusType: "used",
    },
    {
      id: 2,
      title: "Tech Summit Summit '24",
      category: "CONFERENCE",
      image:
        "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=900&q=85",
      date: "22 Sep 2024 • 09:00",
      location: "Jakarta Convention Center",
      status: "Belum Di Gunakan",
      statusType: "unused",
    },
    {
      id: 3,
      title: "Taste of Nusantara",
      category: "EXHIBITION",
      image:
        "https://images.unsplash.com/photo-1576618148400-ae9f8a3f6f67?auto=format&fit=crop&w=900&q=85",
      date: "05 Oct 2024 • 10:00",
      location: "JIExpo Kemayoran",
      status: "Tiket Expired",
      statusType: "expired",
    },
  ];

  const handleDetailTicket = (ticket) => {
    navigate(`/customer/ticket-success?ticket=${ticket.id}`);
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

          <button
            className="all-ticket-button"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Semua Tiket
          </button>
        </section>

        <section className="my-ticket-list">
          {tickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              onDetail={handleDetailTicket}
            />
          ))}
        </section>
      </main>

      <FooterCustomer />
    </div>
  );
}

function TicketCard({ ticket, onDetail }) {
  return (
    <article className="my-ticket-card">
      <div className="ticket-image-section">
        <img src={ticket.image} alt={ticket.title} />

        <div className="ticket-image-overlay"></div>

        <span
          className={`ticket-status-badge ${ticket.statusType}`}
        >
          {ticket.status}
        </span>

        <div className="ticket-image-content">
          <span className="ticket-category">
            {ticket.category}
          </span>

          <h2>{ticket.title}</h2>
        </div>
      </div>

      <div className="ticket-card-content">
        <div className="ticket-card-info">
          <div className="ticket-info-item">
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

            <span>{ticket.date}</span>
          </div>

          <div className="ticket-info-item">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />

              <circle
                cx="12"
                cy="9"
                r="2.3"
              />
            </svg>

            <span>{ticket.location}</span>
          </div>
        </div>

        <div className="ticket-card-divider"></div>

        <div className="ticket-card-action">
          <button
            onClick={() => onDetail(ticket)}
          >
            Detail Tiket
          </button>
        </div>
      </div>
    </article>
  );
}

export default MyTicket;