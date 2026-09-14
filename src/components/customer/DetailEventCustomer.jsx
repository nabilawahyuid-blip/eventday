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
  description:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  image: "",
  statusLabel: "Tersedia",
  lineup: [
    { name: "Bintang Tamu" },
    { name: "Bintang Tamu" },
    { name: "Bintang Tamu" },
  ],
  facilities: [
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
  ],
  tickets: [
    { name: "Early Bird", price: 200000, remaining: 10 },
    { name: "Regular", price: 250000, remaining: 50 },
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
          setEvent(res?.data || FALLBACK_EVENT);
        }
      } catch (err) {
        console.error("Gagal memuat detail event:", err);
        if (!cancelled) {
          setEvent(FALLBACK_EVENT);
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
      event?.tickets && Array.isArray(event.tickets) && event.tickets.length > 0
        ? event.tickets
        : FALLBACK_EVENT.tickets;

    return list.map((t, i) => ({
      id: t?.id,
      name: t?.label || t?.name || (i === 0 ? "Early Bird" : "Regular"),
      price: Number(t?.price) || 200000,
      remaining: t?.remaining,
    }));
  }, [event]);

  const selectedTicketPrice = tickets[selectedTierIndex]?.price || 0;
  const totalPrice = selectedTicketPrice * quantity;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    })
      .format(price)
      .replace("Rp", "Rp. ");
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

  if (error) {
    return (
      <div className="detail-event-page">
        <NavbarCustomer />
        <main className="detail-event-error">
          <h1>Event Tidak Ditemukan</h1>
          <p>{error}</p>
        </main>
      </div>
    );
  }

  const currentEvent = event || FALLBACK_EVENT;

  // SAFE CHECKING: Memastikan tipe data berupa Array sebelum di-render
  const lineup = Array.isArray(currentEvent.lineup)
    ? currentEvent.lineup
    : typeof currentEvent.lineup === "string"
      ? [{ name: currentEvent.lineup }]
      : [];

  const facilities = Array.isArray(currentEvent.facilities)
    ? currentEvent.facilities
    : typeof currentEvent.facilities === "string"
      ? [currentEvent.facilities]
      : [];

  const rawDescription = currentEvent.description || "";
  const descriptionParagraphs =
    typeof rawDescription === "string" ? rawDescription.split("\n\n") : [];

  return (
    <div className="detail-event-page">
      <NavbarCustomer />

      <main className="detail-event-container">
        <div className="detail-event-left">
          {/* POSTER */}
          <div className="event-poster-card">
            {currentEvent.image ? (
              <img src={currentEvent.image} alt={currentEvent.title} />
            ) : (
              <div className="poster-placeholder">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <path d="M21 15l-5-5L5 21" />
                </svg>
                <span>Contoh Poster Event</span>
              </div>
            )}
          </div>

          {/* EVENT BASIC INFO */}
          <section className="event-basic-card">
            <div className="event-title-row">
              <h1>{currentEvent.title}</h1>
              <span className="event-status">
                {currentEvent.statusLabel || currentEvent.status || "Tersedia"}
              </span>
            </div>

            <div className="event-info-list">
              <div className="event-info-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                  <line x1="7" y1="7" x2="7.01" y2="7" />
                </svg>
                <span>
                  {currentEvent.categoryLabel ||
                    currentEvent.category ||
                    "Kategori Event"}
                </span>
              </div>

              <div className="event-info-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>
                  {currentEvent.dateDisplay ||
                    currentEvent.date ||
                    "02 Februari 2027"}
                </span>
              </div>

              <div className="event-info-item">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span>{currentEvent.location || "Lokasi/Venue Event"}</span>
              </div>
            </div>
          </section>

          {/* DESKRIPSI EVENT */}
          <section className="event-description-card">
            <h2>Deskripsi Event</h2>
            {descriptionParagraphs.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </section>

          {/* FASILITAS */}
          {facilities.length > 0 && (
            <section className="event-facilities-card">
              <h2>Fasilitas</h2>
              {facilities.map((fac, idx) => (
                <p key={idx}>
                  {typeof fac === "object"
                    ? fac?.name || JSON.stringify(fac)
                    : fac}
                </p>
              ))}
            </section>
          )}

          {/* LINEUP */}
          {lineup.length > 0 && (
            <section className="event-lineup-card">
              <h2>LineUp</h2>
              <div className="lineup-list-horizontal">
                {lineup.map((person, index) => (
                  <div className="lineup-item" key={index}>
                    <div className="lineup-avatar">
                      {person?.image ? (
                        <img
                          src={person.image}
                          alt={person?.name || "Lineup"}
                        />
                      ) : (
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      )}
                    </div>
                    <span>
                      {typeof person === "string"
                        ? person
                        : person?.name || "Bintang Tamu"}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* TIKET UNTUK MOBILE */}
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
              isMobile={true}
            />
          </section>
        </div>

        {/* TIKET SIDEBAR DESKTOP */}
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

      {/* MOBILE BOTTOM BUY BAR */}
      <div className="mobile-buy-bar">
        <div className="mobile-buy-info">
          <span>Mulai Dari</span>
          <strong>
            {formatPrice(quantity > 0 ? totalPrice : selectedTicketPrice)}
          </strong>
        </div>
        <button className="mobile-buy-button" onClick={handleBuyTicket}>
          Beli Tiket
        </button>
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
  isMobile = false,
}) {
  const selectedTicketPrice = tickets[selectedTierIndex]?.price || 0;
  const totalPrice = selectedTicketPrice * quantity;

  return (
    <div className="ticket-card">
      <h2>Tiket</h2>

      {tickets.length === 0 && (
        <div className="ticket-empty">
          Tiket untuk event ini belum tersedia.
        </div>
      )}

      <div className="ticket-accordion-list">
        {tickets.map((ticket, index) => {
          const isOpen = openTierIndex === index;

          return (
            <div
              key={index}
              className={`ticket-accordion-item ${isOpen ? "open" : ""}`}
            >
              <button
                className="ticket-accordion-header"
                onClick={() => setOpenTierIndex(isOpen ? null : index)}
              >
                <strong>{ticket.name}</strong>
                <svg
                  className={`arrow-icon ${isOpen ? "rotate" : ""}`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {isOpen && (
                <div className="ticket-accordion-body">
                  <div className="ticket-sub-row">
                    <div className="ticket-sub-info">
                      <span className="ticket-sub-name">Presale</span>
                      <strong className="ticket-sub-price">
                        {formatPrice(ticket.price)}
                      </strong>
                    </div>

                    <div className="quantity-control">
                      <button
                        onClick={() => decreaseQuantity(index)}
                        aria-label="Kurangi tiket"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </button>
                      <span>{selectedTierIndex === index ? quantity : 0}</span>
                      <button
                        onClick={() => increaseQuantity(index)}
                        aria-label="Tambah tiket"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="16" />
                          <line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!isMobile && (
        <div className="ticket-summary-footer">
          <div className="ticket-summary-price">
            <span>Mulai Dari</span>
            <strong>
              {formatPrice(quantity > 0 ? totalPrice : selectedTicketPrice)}
            </strong>
          </div>
          <button className="buy-ticket-button" onClick={onBuy}>
            Beli Tiket
          </button>
        </div>
      )}
    </div>
  );
}

export default DetailEventCustomer;
