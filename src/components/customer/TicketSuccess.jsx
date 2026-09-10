import React from "react";
import { useNavigate } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import "./TicketSuccess.css";

function TicketSuccess() {
  const navigate = useNavigate();

  const tickets = [
    {
      code: "TK-894-ABC",
      name: "Adit Ramadhan",
      ticketType: "Early Bird",
      paymentStatus: "Lunas",
      usageStatus: "Belum Di Gunakan",
    },
    {
      code: "TK-895-ABC",
      name: "Adam",
      ticketType: "Early Bird",
      paymentStatus: "Lunas",
      usageStatus: "Belum Di Gunakan",
    },
  ];

  const event = {
    title: "Judul Event",
    date: "02 Februari 2027, 20:00",
    location: "Lokasi/Venue Event",
  };

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

  const handleRefund = () => {
    alert("Pengajuan refund akan diproses.");
  };

  return (
    <div className="ticket-success-page">
      <NavbarCustomer />

      <main className="ticket-success-container">
        <div className="success-message">
          <strong>Pembayaran Berhasil</strong>
          <span>Tiket Berhasil Diterbitkan</span>
        </div>

        <div className="ticket-list">
          {tickets.map((ticket, index) => (
            <TicketCard
              key={ticket.code}
              ticket={ticket}
              event={event}
              index={index}
              onDownload={downloadQR}
            />
          ))}
        </div>

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
            onClick={() => navigate("/customer/refund")}
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
  return (
    <article className={`ticket-result-card ticket-card-${index + 1}`}>
      <div className="ticket-event-header">
        <div className="ticket-event-info">
          <h2>{event.title}</h2>

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

            <span>{event.date}</span>
          </div>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>

            <span>{event.location}</span>
          </div>
        </div>

        <span className="ticket-usage-badge">
          {ticket.usageStatus}
        </span>
      </div>

      <div className="ticket-qr-section">
        <div className="qr-wrapper">
          <img
            src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
              ticket.code
            )}`}
            alt={`QR Code ${ticket.code}`}
          />
        </div>

        <p className="qr-instruction">
          Tunjukan kode ini ke Staff
        </p>

        <div className="ticket-code">
          {ticket.code}
        </div>

        <button
          className="download-qr-button"
          onClick={() => onDownload(ticket.code)}
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
          <strong>{ticket.ticketType}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Nama</span>
          <strong>{ticket.name}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Status Pembayaran</span>
          <strong className="payment-status">
            {ticket.paymentStatus}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default TicketSuccess;