import React, { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import "./DetailEventCustomer.css";

function DetailEventCustomer() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [earlyBirdOpen, setEarlyBirdOpen] = useState(true);
  const [regularOpen, setRegularOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);

  const event = {
    id: id || 1,
    title: "Judul Event",
    category: "Kategori Event",
    date: "02 Februari 2027",
    location: "Lokasi/Venue Event",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    image:
      "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=85",
    status: "Tersedia",
    lineup: [
      {
        name: "Bintang Tamu",
        image: "",
      },
      {
        name: "Bintang Tamu",
        image: "",
      },
      {
        name: "Bintang Tamu",
        image: "",
      },
    ],
    tickets: {
      earlyBird: {
        name: "Presale",
        price: 200000,
      },
      regular: {
        name: "Regular",
        price: 300000,
      },
    },
  };

  const selectedTicketPrice = event.tickets.earlyBird.price;

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

  const increaseQuantity = () => {
    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => (prev > 0 ? prev - 1 : 0));
  };

  const handleBuyTicket = () => {
    if (quantity === 0) {
      alert("Silakan pilih jumlah tiket terlebih dahulu.");
      return;
    }

    alert(
      `Kamu memilih ${quantity} tiket dengan total ${formatPrice(
        totalPrice
      )}.`
    );
  };

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
              <span className="event-status">{event.status}</span>
            </div>

            <div className="event-basic-info">
              <div className="basic-info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <path d="M5 6h14v13H5z" />
                    <path d="M8 4v4M16 4v4M5 10h14" />
                  </svg>
                </span>

                <span>{event.category}</span>
              </div>

              <div className="basic-info-item">
                <span className="info-icon">
                  <svg viewBox="0 0 24 24">
                    <rect x="4" y="5" width="16" height="15" rx="2" />
                    <path d="M8 3v4M16 3v4M4 10h16" />
                  </svg>
                </span>

                <span>{event.date}</span>
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

            <p className="description-second">
              Duis aute irure dolor in reprehenderit in voluptate velit esse
              cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat
              cupidatat non proident, sunt in culpa qui officia deserunt
              mollit anim id est laborum.
            </p>
          </section>

          <div className="mobile-divider"></div>

          <section className="event-lineup-card">
            <h2>LineUp</h2>

            <div className="lineup-list">
              {event.lineup.map((person, index) => (
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

          <div className="mobile-divider"></div>

          <section className="mobile-ticket-section">
            <TicketBox
              event={event}
              earlyBirdOpen={earlyBirdOpen}
              setEarlyBirdOpen={setEarlyBirdOpen}
              regularOpen={regularOpen}
              setRegularOpen={setRegularOpen}
              quantity={quantity}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              formatPrice={formatPrice}
            />
          </section>
        </div>

        <aside className="desktop-ticket-section">
          <TicketBox
            event={event}
            earlyBirdOpen={earlyBirdOpen}
            setEarlyBirdOpen={setEarlyBirdOpen}
            regularOpen={regularOpen}
            setRegularOpen={setRegularOpen}
            quantity={quantity}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            formatPrice={formatPrice}
          />
        </aside>
      </main>

      <div className="mobile-buy-bar">
        <div className="mobile-total">
          <span>Mulai Dari</span>
          <strong>
            {formatPrice(
              quantity > 0 ? totalPrice : selectedTicketPrice
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
  event,
  earlyBirdOpen,
  setEarlyBirdOpen,
  regularOpen,
  setRegularOpen,
  quantity,
  increaseQuantity,
  decreaseQuantity,
  formatPrice,
}) {
  const navigate = useNavigate();

  const totalPrice = event.tickets.earlyBird.price * quantity;

  const handleBuy = () => {
    if (quantity === 0) {
      alert("Silakan pilih jumlah tiket terlebih dahulu.");
      return;
    }

    navigate(`/checkout/${event.id}`);
  };

  return (
    <div className="ticket-card">
      <h2>Tiket</h2>

      <div className="ticket-divider"></div>

      <div
        className={`ticket-type ${
          earlyBirdOpen ? "ticket-type-open" : ""
        }`}
      >
        <button
          className="ticket-type-header"
          onClick={() => setEarlyBirdOpen(!earlyBirdOpen)}
        >
          <strong>Early Bird</strong>

          <svg
            className={earlyBirdOpen ? "rotate" : ""}
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {earlyBirdOpen && (
          <div className="ticket-option">
            <div className="ticket-option-info">
              <strong>{event.tickets.earlyBird.name}</strong>

              <span>
                {formatPrice(event.tickets.earlyBird.price)}
              </span>
            </div>

            <div className="quantity-control">
              <button
                onClick={decreaseQuantity}
                aria-label="Kurangi tiket"
              >
                −
              </button>

              <span>{quantity}</span>

              <button
                onClick={increaseQuantity}
                aria-label="Tambah tiket"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        className={`ticket-type ${
          regularOpen ? "ticket-type-open" : ""
        }`}
      >
        <button
          className="ticket-type-header"
          onClick={() => setRegularOpen(!regularOpen)}
        >
          <strong>Regular</strong>

          <svg
            className={regularOpen ? "rotate" : ""}
            viewBox="0 0 24 24"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {regularOpen && (
          <div className="ticket-option">
            <div className="ticket-option-info">
              <strong>{event.tickets.regular.name}</strong>

              <span>
                {formatPrice(event.tickets.regular.price)}
              </span>
            </div>

            <div className="quantity-control">
              <button>−</button>
              <span>0</span>
              <button>+</button>
            </div>
          </div>
        )}
      </div>

      <div className="desktop-ticket-summary">
        <div>
          <span>Mulai Dari</span>

          <strong>
            {formatPrice(
              quantity > 0
                ? totalPrice
                : event.tickets.earlyBird.price
            )}
          </strong>
        </div>

        <button onClick={handleBuy}>Beli Tiket</button>
      </div>
    </div>
  );
}

export default DetailEventCustomer;