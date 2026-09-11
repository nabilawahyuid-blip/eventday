import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import { getEventDetail } from "../../services/eventService";
import "./DetailEventCustomer.css";

const FALLBACK_EVENT = {
  id: "",
  title: "Judul Event",
  categoryLabel: "Kategori Event",
  dateDisplay: "02 Februari 2027",
  location: "Lokasi/Venue Event",
  description: "Deskripsi event belum tersedia.",
  image:
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
  statusLabel: "Tersedia",
  lineup: [],
  facilities: [],
  tickets: [
    { name: "Presale", price: 0, remaining: 0 },
    { name: "Regular", price: 0, remaining: 0 },
  ],
};

function DetailEventCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [openTierIndex, setOpenTierIndex] = useState(0);
  const [selectedTierIndex, setSelectedTierIndex] = useState(0);
  const [quantity, setQuantity] = useState(0);

  useEffect(() => {
    let cancelled = false;

    setLoading(true);
    setError("");

    const load = async () => {
      try {
        const res = await getEventDetail(id);

        if (!cancelled) {
          setEvent(res?.data || null);
        }
      } catch (err) {
        console.error("Gagal memuat detail event:", err);

        if (!cancelled) {
          setError(err?.message || "Event tidak ditemukan.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const tickets = useMemo(() => {
    const list =
      event?.tickets && Array.isArray(event.tickets)
        ? event.tickets
        : FALLBACK_EVENT.tickets;

    return list.map((t, i) => ({
      id: t?.id,
      name: t?.label || t?.name || (i === 0 ? "Presale" : "Regular"),
      price: Number(t?.price) || 0,
      remaining: t?.remaining,
    }));
  }, [event]);

  const selectedTicketPrice = tickets[selectedTierIndex]?.price || 0;

  const totalPrice = useMemo(() => {
    return selectedTicketPrice * quantity;
  }, [selectedTicketPrice, quantity]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const increaseQuantity = (index) => {
    setSelectedTierIndex(index);
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = (index) => {
    setSelectedTierIndex(index);
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleBuyTicket = () => {
    if (quantity === 0) {
      alert("Silakan pilih jumlah tiket terlebih dahulu.");
      return;
    }

    const ticket = tickets[selectedTierIndex];

    navigate(`/checkout/${event?.id || id}`, {
      state: {
        eventId: event?.id || id,
        eventTitle: event?.title,
        eventDate: event?.dateDisplay || event?.date,
        eventLocation: event?.location,
        ticketName: ticket?.name,
        ticketId: ticket?.id,
        quantity,
        price: ticket?.price,
      },
    });
  };

  if (loading) {
    return (
      <div className="detail-event-page">
        <NavbarCustomer />
        <main className="detail-event-loading">Memuat detail event...</main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="detail-event-page">
        <NavbarCustomer />
        <main className="detail-event-error">
          <h1>Event Tidak Ditemukan</h1>
          <p>{error || "Event yang kamu cari tidak tersedia."}</p>
        </main>
      </div>
    );
  }

  const lineup = event.lineup || [];
  const facilities = event.facilities || [];

  return (
    <div className="detail-event-page">
      <NavbarCustomer />

      <main className="detail-event-container">
        <div className="detail-event-main">
          <section className="event-poster-section">
            <img
              src={event.image}
              alt={event.title}
              className="event-poster"
            />
          </section>

          <section className="event-basic-card">
            <div className="event-title-row">
              <h1>{event.title}</h1>
              <span className="event-status">
                {event.statusLabel || event.status || "Tersedia"}
              </span>
            </div>

            <div className="event-basic-info">
              <div className="basic-info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 6h14v13H5z" />
                    <path d="M8 4v4M16 4v4M5 10h14" />
                  </svg>
                </span>

                <span>{event.categoryLabel || event.category}</span>
              </div>

              <div className="basic-info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="5" width="16" height="15" rx="2" />
                    <path d="M8 3v4M16 3v4M4 10h16" />
                  </svg>
                </span>

                <span>{event.dateDisplay || event.date}</span>
              </div>

              <div className="basic-info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
                    <circle cx="12" cy="10" r="2.5" />
                  </svg>
                </span>

                <span>{event.location}</span>
              </div>
            </div>
          </section>

          <div className="mobile-divider"></div>

          <section className="event-description-card">
            <h2>Deskripsi Event</h2>
            <p>{event.description}</p>
          </section>

          {facilities.length > 0 && (
            <>
              <div className="mobile-divider"></div>

              <section className="event-facilities-card">
                <h2>Fasilitas</h2>

                <ul className="facilities-list">
                  {facilities.map((facility, index) => (
                    <li className="facility-item" key={index}>
                      {facility}
                    </li>
                  ))}
                </ul>
              </section>
            </>
          )}

          {lineup.length > 0 && (
            <>
              <div className="mobile-divider"></div>

              <section className="event-lineup-card">
                <h2>LineUp</h2>

                <div className="lineup-list">
                  {lineup.map((person, index) => (
                    <div className="lineup-item" key={index}>
                      <div className="lineup-avatar">
                        {person.image ? (
                          <img src={person.image} alt={person.name} />
                        ) : (
                          <svg viewBox="0 0 24 24">
                            <circle cx="12" cy="8" r="3" />
                            <path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5" />
                          </svg>
                        )}
                      </div>

                      <span>
                        {person.name.split(" ").map((word, i) => (
                          <React.Fragment key={i}>
                            {word}
                            {i < person.name.split(" ").length - 1 && <br />}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          <div className="mobile-divider"></div>

          <section className="mobile-ticket-section">
            <TicketBox
              tickets={tickets}
              openTierIndex={openTierIndex}
              setOpenTierIndex={setOpenTierIndex}
              selectedTierIndex={selectedTierIndex}
              quantity={quantity}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              formatPrice={formatPrice}
              onBuy={handleBuyTicket}
            />
          </section>
        </div>

        <aside className="desktop-ticket-section">
          <TicketBox
            tickets={tickets}
            openTierIndex={openTierIndex}
            setOpenTierIndex={setOpenTierIndex}
            selectedTierIndex={selectedTierIndex}
            quantity={quantity}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            formatPrice={formatPrice}
            onBuy={handleBuyTicket}
          />
        </aside>
      </main>

      <div className="mobile-buy-bar">
        <div className="mobile-total">
          <span>Mulai Dari</span>
          <strong>
            {formatPrice(
              quantity > 0 ? totalPrice : selectedTicketPrice,
            )}
          </strong>
        </div>

        <button onClick={handleBuyTicket}>Beli Tiket</button>
      </div>

      <footer className="detail-event-footer">
        <p>© 2027 EVENTDAY. Hak cipta dilindungi undang-undang.</p>
      </footer>
    </div>
  );
}

function TicketBox({
  tickets = [],
  openTierIndex,
  setOpenTierIndex,
  selectedTierIndex,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  formatPrice,
  onBuy,
}) {
  const selectedTicketPrice = tickets[selectedTierIndex]?.price || 0;
  const totalPrice = selectedTicketPrice * quantity;

  return (
    <div className="ticket-card">
      <h2>Tiket</h2>

      <div className="ticket-divider"></div>

      {tickets.length === 0 && (
        <div className="ticket-empty">
          Tiket untuk event ini belum tersedia.
        </div>
      )}

      {tickets.map((ticket, index) => {
        const isOpen = openTierIndex === index;

        return (
          <div
            key={index}
            className={`ticket-type ${isOpen ? "ticket-type-open" : ""}`}
          >
            <button
              className="ticket-type-header"
              onClick={() => setOpenTierIndex(isOpen ? null : index)}
            >
              <strong>{ticket.name}</strong>

              {typeof ticket.remaining === "number" && (
                <span className="ticket-remaining">
                  Sisa {ticket.remaining}
                </span>
              )}

              <svg
                className={isOpen ? "rotate" : ""}
                viewBox="0 0 24 24"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {isOpen && (
              <div className="ticket-option">
                <div className="ticket-option-info">
                  <strong>{ticket.name}</strong>

                  <span>{formatPrice(ticket.price)}</span>
                </div>

                <div className="quantity-control">
                  <button
                    onClick={() => decreaseQuantity(index)}
                    aria-label="Kurangi tiket"
                  >
                    −
                  </button>

                  <span>{selectedTierIndex === index ? quantity : 0}</span>

                  <button
                    onClick={() => increaseQuantity(index)}
                    aria-label="Tambah tiket"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="desktop-ticket-summary">
        <div>
          <span>Mulai Dari</span>

          <strong>
            {formatPrice(
              quantity > 0 ? totalPrice : selectedTicketPrice,
            )}
          </strong>
        </div>

        <button onClick={onBuy}>Beli Tiket</button>
      </div>
    </div>
  );
}

export default DetailEventCustomer;