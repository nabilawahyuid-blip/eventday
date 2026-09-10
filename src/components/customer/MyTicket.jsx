import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
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

  const handleBottomNavigation = (path) => {
    navigate(path);
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
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
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

      <nav className="my-ticket-mobile-bottom-nav">
        <button
          className="bottom-nav-item"
          onClick={() => handleBottomNavigation("/customer/dashboard")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z" />
          </svg>

          <span>Beranda</span>
        </button>

        <button className="bottom-nav-item active">
          <svg viewBox="0 0 24 24">
            <path d="M5 7.5A2.5 2.5 0 0 1 7.5 5h9A2.5 2.5 0 0 1 19 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 5 16.5v-9Z" />
            <path d="M8 9h8M8 12h8M8 15h5" />
          </svg>

          <span>Tiket</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => handleBottomNavigation("/eo/event/create")}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="8.5" />
            <path d="M12 8v8M8 12h8" />
          </svg>

          <span>Buat Event</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => handleBottomNavigation("/customer/history")}
        >
          <svg viewBox="0 0 24 24">
            <path d="M4 12a8 8 0 1 0 2.35-5.65" />
            <path d="M4 5v5h5" />
            <path d="M12 8v4l3 2" />
          </svg>

          <span>Transaksi</span>
        </button>

        <button
          className="bottom-nav-item"
          onClick={() => handleBottomNavigation("/customer/profile")}
        >
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="3.2" />
            <path d="M5 20c.8-3.4 3.1-5.2 7-5.2s6.2 1.8 7 5.2" />
          </svg>

          <span>Profile</span>
        </button>
      </nav>

      <footer className="my-ticket-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
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
              <circle cx="12" cy="9" r="2.3" />
            </svg>

            <span>{ticket.location}</span>
          </div>
        </div>

        <div className="ticket-card-divider"></div>

        <div className="ticket-card-action">
          <button onClick={() => onDetail(ticket)}>
            Detail Tiket
          </button>
        </div>
      </div>
    </article>
  );
}

export default MyTicket;