import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import FooterCustomer from "../shared/FooterCustomer";
import "./DetailEventCustomer.css";

function DetailEventCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [selectedTicket, setSelectedTicket] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const event = useMemo(
    () => ({
      id: id || "event-1",

      title: "Neon Nights 2024",

      category: "MUSIC FESTIVAL",

      date: "Sabtu, 15 Agustus 2024",

      time: "19:00 - 23:00 WIB",

      location: "Stadium Utama Gelora Bung Karno",

      address: "Jl. Pintu Satu Senayan, Jakarta Pusat",

      image:
        "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85",

      description:
        "Neon Nights 2024 adalah festival musik yang menghadirkan pengalaman musik malam yang penuh warna dan energi. Nikmati penampilan dari berbagai musisi pilihan dengan suasana festival yang seru dan meriah.",

      facilities:
        "Event ini menyediakan berbagai fasilitas untuk menunjang kenyamanan dan kebutuhan peserta selama acara berlangsung. Tersedia area parkir, toilet, mushola, food and beverage, serta fasilitas keamanan dan P3K.",

      lineup: [
        {
          name: "Hindia",
          image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80",
        },

        {
          name: "Tulus",
          image:
            "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=300&q=80",
        },

        {
          name: "Nadin Amizah",
          image:
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=300&q=80",
        },

        {
          name: "Pamungkas",
          image:
            "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=300&q=80",
        },
      ],

      tickets: [
        {
          name: "Regular",
          price: 350000,
          description: "Akses masuk festival",
          stock: 100,
        },

        {
          name: "VIP",
          price: 750000,
          description: "Akses VIP dan fasilitas khusus",
          stock: 50,
        },
      ],
    }),
    [id]
  );

  const selectedTicketData = event.tickets[selectedTicket];

  const subtotal = selectedTicketData.price * quantity;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectTicket = (index) => {
    setSelectedTicket(index);
    setQuantity(1);
  };

  const decreaseQuantity = () => {
    setQuantity((current) => {
      if (current <= 1) {
        return 1;
      }

      return current - 1;
    });
  };

  const increaseQuantity = () => {
    setQuantity((current) => {
      if (current >= selectedTicketData.stock) {
        return selectedTicketData.stock;
      }

      return current + 1;
    });
  };

  const handleBuy = () => {
    navigate(`/checkout/${event.id}`, {
      state: {
        event,
        ticket: selectedTicketData,
        quantity,
        subtotal,
      },
    });
  };

  return (
    <div className="detail-event-page">
      <NavbarCustomer />

      <main className="detail-event-container">
        <div className="detail-event-left">
          {/* POSTER */}

          <div className="event-poster-card">
            <img src={event.image} alt={event.title} />
          </div>

          {/* EVENT INFORMATION */}

          <section className="event-basic-card">
            <span className="event-category">{event.category}</span>

            <h1>{event.title}</h1>

            <div className="event-info-list">
              <div className="event-info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect
                    x="3"
                    y="4"
                    width="18"
                    height="17"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M8 2V6M16 2V6M3 9H21"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>

                <div>
                  <span className="event-info-label">Tanggal</span>

                  <strong>{event.date}</strong>
                </div>
              </div>

              <div className="event-info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <path
                    d="M12 7V12L15 14"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>

                <div>
                  <span className="event-info-label">Waktu</span>

                  <strong>{event.time}</strong>
                </div>
              </div>

              <div className="event-info-item">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 10C20 15.5 12 21 12 21C12 21 4 15.5 4 10C4 5.58 7.58 2 12 2C16.42 2 20 5.58 20 10Z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />

                  <circle
                    cx="12"
                    cy="10"
                    r="2.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                </svg>

                <div>
                  <span className="event-info-label">Lokasi</span>

                  <strong>{event.location}</strong>

                  <small>{event.address}</small>
                </div>
              </div>
            </div>
          </section>

          {/* DESCRIPTION */}

          <section className="event-description-card">
            <h2>Deskripsi Event</h2>

            <p>{event.description}</p>
          </section>

          {/* LINE UP */}

          <section className="event-lineup-card">
            <h2>Line Up</h2>

            <div className="lineup-list">
              {event.lineup.map((artist, index) => (
                <div className="lineup-item" key={index}>
                  <div className="lineup-image">
                    <img src={artist.image} alt={artist.name} />
                  </div>

                  <span>{artist.name}</span>
                </div>
              ))}
            </div>
          </section>

          {/* FACILITIES */}

          <section className="event-facilities-card">
            <h2>Fasilitas</h2>

            <p>{event.facilities}</p>
          </section>
        </div>

        {/* TICKET SECTION */}

        <aside className="ticket-card">
          <div className="ticket-card-heading">
            <div>
              <h2>Pilih Tiket</h2>

              <p>Pesan tiket sesuai kebutuhanmu</p>
            </div>
          </div>

          <div className="ticket-options">
            {event.tickets.map((ticket, index) => {
              const isSelected = selectedTicket === index;

              const currentQuantity = isSelected ? quantity : 0;

              const remainingStock = ticket.stock - currentQuantity;

              return (
                <div
                  key={index}
                  className={`ticket-option ${
                    isSelected ? "selected" : ""
                  }`}
                  onClick={() => handleSelectTicket(index)}
                >
                  <div className="ticket-option-main">
                    <div className="ticket-option-text">
                      <div className="ticket-name-row">
                        <h3>{ticket.name}</h3>

                        {isSelected && (
                          <span className="ticket-selected-label">
                            Dipilih
                          </span>
                        )}
                      </div>

                      <p>{ticket.description}</p>
                    </div>

                    <div
                      className="ticket-quantity-control"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={decreaseQuantity}
                        disabled={
                          !isSelected || currentQuantity <= 1
                        }
                        aria-label={`Kurangi ${ticket.name}`}
                      >
                        −
                      </button>

                      <span>{currentQuantity}</span>

                      <button
                        type="button"
                        onClick={increaseQuantity}
                        disabled={
                          !isSelected ||
                          currentQuantity >= ticket.stock
                        }
                        aria-label={`Tambah ${ticket.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="ticket-option-bottom">
                    <strong>{formatPrice(ticket.price)}</strong>

                    <span>
                      {remainingStock} tiket tersedia
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAYMENT SUMMARY */}

          <div className="ticket-purchase-section">
            <div className="ticket-summary-top">
              <span>Ringkasan Pesanan</span>

              <span>
                {quantity} {quantity > 1 ? "tiket" : "tiket"}
              </span>
            </div>

            <div className="ticket-summary-line">
              <span>
                {selectedTicketData.name} × {quantity}
              </span>

              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <div className="price-divider"></div>

            <div className="total-row">
              <span>Total Pembayaran</span>

              <strong>{formatPrice(subtotal)}</strong>
            </div>

            <button
              type="button"
              className="buy-ticket-button"
              onClick={handleBuy}
            >
              <span>
                Beli {quantity} {quantity > 1 ? "Tiket" : "Tiket"}
              </span>

              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 12H19M13 6L19 12L13 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </aside>
      </main>

      {/* MOBILE PURCHASE BAR */}

      <div className="mobile-buy-bar">
        <div className="mobile-buy-info">
          <span>Total Pembayaran</span>

          <strong>{formatPrice(subtotal)}</strong>
        </div>

        <div className="mobile-buy-quantity">
          <button
            type="button"
            onClick={decreaseQuantity}
            disabled={quantity <= 1}
            aria-label="Kurangi tiket"
          >
            −
          </button>

          <span>{quantity}</span>

          <button
            type="button"
            onClick={increaseQuantity}
            disabled={
              quantity >= selectedTicketData.stock
            }
            aria-label="Tambah tiket"
          >
            +
          </button>
        </div>

        <button
          type="button"
          className="mobile-buy-button"
          onClick={handleBuy}
        >
          Beli
        </button>
      </div>

      <FooterCustomer />
    </div>
  );
}

export default DetailEventCustomer;