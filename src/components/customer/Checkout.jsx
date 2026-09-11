import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const checkoutData = location.state || {};

  const [timeLeft, setTimeLeft] = useState(14 * 60 + 57);

  const [buyers, setBuyers] = useState([
    {
      name: "",
      email: "",
      nik: "",
    },
  ]);

  const [openForms, setOpenForms] = useState({
    1: true,
  });

  const event = useMemo(() => {
    const selectedEvent = checkoutData.event || {};
    const selectedTicket = checkoutData.ticket || {};

    return {
      id: id || selectedEvent.id || checkoutData.eventId || "1",

      title:
        selectedEvent.title ||
        checkoutData.eventTitle ||
        "Konser Musik Akbar 2024",

      date:
        selectedEvent.date ||
        checkoutData.eventDate ||
        "02 Februari 2027, 20:00 WIB",

      location:
        selectedEvent.location ||
        checkoutData.eventLocation ||
        "Stadion Utama GBK, Senayan, Jakarta",

      ticketName:
        selectedTicket.name ||
        checkoutData.ticketName ||
        "Early Bird",

      quantity:
        Number(checkoutData.quantity) ||
        Number(selectedEvent.quantity) ||
        1,

      price:
        Number(selectedTicket.price) ||
        Number(checkoutData.price) ||
        200000,
    };
  }, [checkoutData, id]);

  const ticketTotal = useMemo(() => {
    return event.price * event.quantity;
  }, [event.price, event.quantity]);

  const adminFee = 5000;

  const totalPayment = ticketTotal + adminFee;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        if (previous <= 0) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");

  const formatRupiah = (number) => {
    return `Rp. ${Number(number).toLocaleString("id-ID")}`;
  };

  const toggleForm = (number) => {
    setOpenForms((previous) => ({
      ...previous,
      [number]: !previous[number],
    }));
  };

  const handleBuyerChange = (index, field, value) => {
    setBuyers((previous) =>
      previous.map((buyer, buyerIndex) => {
        if (buyerIndex !== index) {
          return buyer;
        }

        return {
          ...buyer,
          [field]: value,
        };
      })
    );
  };

  const addBuyer = () => {
    const newBuyer = {
      name: "",
      email: "",
      nik: "",
    };

    setBuyers((previous) => [...previous, newBuyer]);

    const newNumber = buyers.length + 1;

    setOpenForms((previous) => ({
      ...previous,
      [newNumber]: true,
    }));

    setTimeout(() => {
      const element = document.getElementById(
        `buyer-card-${newNumber}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const removeBuyer = (index) => {
    if (buyers.length <= 1) {
      return;
    }

    const number = index + 1;

    Swal.fire({
      title: "Hapus data pemesan?",
      text: `Data Pemesan ${number} akan dihapus.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      reverseButtons: true,
      confirmButtonColor: "#5548dc",
      cancelButtonColor: "#9aa1ae",
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      setBuyers((previous) =>
        previous.filter(
          (_, buyerIndex) => buyerIndex !== index
        )
      );

      setOpenForms((previous) => {
        const updatedForms = {};

        Object.keys(previous).forEach((key) => {
          const currentNumber = Number(key);

          if (currentNumber === number) {
            return;
          }

          if (currentNumber > number) {
            updatedForms[currentNumber - 1] =
              previous[key];
          } else {
            updatedForms[currentNumber] =
              previous[key];
          }
        });

        return updatedForms;
      });
    });
  };

  const openBuyerForm = (number) => {
    setOpenForms((previous) => ({
      ...previous,
      [number]: true,
    }));

    setTimeout(() => {
      const element = document.getElementById(
        `buyer-card-${number}`
      );

      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  const validateBuyers = () => {
    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let index = 0; index < buyers.length; index++) {
      const buyer = buyers[index];
      const number = index + 1;

      if (!buyer.name.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Data Belum Lengkap",
          text: `Nama lengkap Pemesan ${number} wajib diisi.`,
          confirmButtonColor: "#5548dc",
        });

        openBuyerForm(number);

        return false;
      }

      if (!buyer.email.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Data Belum Lengkap",
          text: `Email Pemesan ${number} wajib diisi.`,
          confirmButtonColor: "#5548dc",
        });

        openBuyerForm(number);

        return false;
      }

      if (!emailPattern.test(buyer.email)) {
        Swal.fire({
          icon: "warning",
          title: "Email Tidak Valid",
          text: `Format email Pemesan ${number} belum benar.`,
          confirmButtonColor: "#5548dc",
        });

        openBuyerForm(number);

        return false;
      }

      if (!buyer.nik.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Data Belum Lengkap",
          text: `NIK Pemesan ${number} wajib diisi.`,
          confirmButtonColor: "#5548dc",
        });

        openBuyerForm(number);

        return false;
      }

      if (!/^\d{16}$/.test(buyer.nik)) {
        Swal.fire({
          icon: "warning",
          title: "NIK Tidak Valid",
          text: `NIK Pemesan ${number} harus terdiri dari 16 digit.`,
          confirmButtonColor: "#5548dc",
        });

        openBuyerForm(number);

        return false;
      }
    }

    return true;
  };

  const handleCheckout = () => {
    if (!validateBuyers()) {
      return;
    }

    Swal.fire({
      icon: "success",
      title: "Data Pemesan Siap",
      text: `${buyers.length} data pemesan berhasil disiapkan.`,
      confirmButtonText: "Lanjut Pembayaran",
      confirmButtonColor: "#5548dc",
    }).then((result) => {
      if (result.isConfirmed) {
        navigate("/customer/ticket-success", {
          state: {
            event,
            buyers,
            ticketTotal,
            adminFee,
            totalPayment,
          },
        });
      }
    });
  };

  return (
    <div className="checkout-page">
      <NavbarCustomer />

      <main className="checkout-container">
        <section className="checkout-heading">
          <div>
            <h1>Checkout</h1>

            <p>
              Lengkapi informasi pengunjung untuk
              menerbitkan e-tiket resmi.
            </p>
          </div>

          <div className="checkout-timer">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="13" r="7" />

              <path d="M12 9v4l2.5 1.5" />

              <path d="M9 3h6" />

              <path d="M12 3v3" />
            </svg>

            <span>
              Selesaikan dalam {minutes}:{seconds}
            </span>
          </div>
        </section>

        <div className="mobile-event-summary">
          <EventSummary
            event={event}
            ticketTotal={ticketTotal}
            formatRupiah={formatRupiah}
          />
        </div>

        <div className="checkout-content">
          <section className="buyer-section">
            <div className="section-heading">
              <div>
                <h2>Data Pemesan</h2>

                <span>
                  {buyers.length} Data Pemesan
                </span>
              </div>

              <button
                type="button"
                className="add-buyer-button"
                onClick={addBuyer}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 5V19" />
                  <path d="M5 12H19" />
                </svg>

                <span>Tambah Data Pemesan</span>
              </button>
            </div>

            <div className="buyer-form-list">
              {buyers.map((buyer, index) => {
                const formNumber = index + 1;
                const isOpen =
                  openForms[formNumber] !== false;

                return (
                  <div
                    className={`buyer-card ${
                      isOpen ? "buyer-card-open" : ""
                    }`}
                    id={`buyer-card-${formNumber}`}
                    key={formNumber}
                  >
                    <div className="buyer-card-header">
                      <button
                        type="button"
                        className="buyer-card-toggle"
                        onClick={() =>
                          toggleForm(formNumber)
                        }
                      >
                        <div className="buyer-title">
                          <span className="buyer-number">
                            {formNumber}
                          </span>

                          <strong>
                            Data Diri Pemesan {formNumber}
                          </strong>
                        </div>

                        <span
                          className={`accordion-icon ${
                            isOpen ? "open" : ""
                          }`}
                        >
                          <svg viewBox="0 0 24 24">
                            <path d="m7 14 5-5 5 5" />
                          </svg>
                        </span>
                      </button>

                      {buyers.length > 1 && (
                        <button
                          type="button"
                          className="delete-buyer-button"
                          onClick={() =>
                            removeBuyer(index)
                          }
                          aria-label={`Hapus Pemesan ${formNumber}`}
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M4 7H20"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M10 11V17"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M14 11V17"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />

                            <path
                              d="M6 7L7 19C7.1 20.1 8 21 9.1 21H14.9C16 21 16.9 20.1 17 19L18 7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />

                            <path
                              d="M9 7V4C9 3.45 9.45 3 10 3H14C14.55 3 15 3.45 15 4V7"
                              stroke="currentColor"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>

                    {isOpen && (
                      <div className="buyer-form">
                        <div className="input-group">
                          <label>
                            Nama Lengkap
                            <span>*</span>
                          </label>

                          <input
                            type="text"
                            placeholder="Masukan Nama Lengkap"
                            value={buyer.name}
                            onChange={(e) =>
                              handleBuyerChange(
                                index,
                                "name",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            Email {formNumber}
                            <span>*</span>
                          </label>

                          <input
                            type="email"
                            placeholder="Masukan Email"
                            value={buyer.email}
                            onChange={(e) =>
                              handleBuyerChange(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            NIK {formNumber}
                            <span>*</span>
                          </label>

                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={16}
                            placeholder="Masukan NIK"
                            value={buyer.nik}
                            onChange={(e) =>
                              handleBuyerChange(
                                index,
                                "nik",
                                e.target.value.replace(
                                  /\D/g,
                                  ""
                                )
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="add-buyer-button-bottom"
              onClick={addBuyer}
            >
              <svg viewBox="0 0 24 24">
                <path d="M12 5V19" />
                <path d="M5 12H19" />
              </svg>

              <span>Tambah Data Pemesan</span>
            </button>
          </section>

          <aside className="checkout-sidebar">
            <div className="desktop-event-summary">
              <EventSummary
                event={event}
                ticketTotal={ticketTotal}
                formatRupiah={formatRupiah}
              />
            </div>

            <PaymentSummary
              event={event}
              ticketTotal={ticketTotal}
              adminFee={adminFee}
              totalPayment={totalPayment}
              formatRupiah={formatRupiah}
              onCheckout={handleCheckout}
            />
          </aside>
        </div>
      </main>

      <div className="mobile-payment-summary">
        <PaymentSummary
          event={event}
          ticketTotal={ticketTotal}
          adminFee={adminFee}
          totalPayment={totalPayment}
          formatRupiah={formatRupiah}
          onCheckout={handleCheckout}
        />
      </div>

      <footer className="checkout-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi
        undang-undang.
      </footer>
    </div>
  );
}


function EventSummary({
  event,
  ticketTotal,
  formatRupiah,
}) {
  return (
    <div className="event-summary-card">
      <div className="event-summary-decoration"></div>

      <div className="event-summary-content">
        <h2>Judul Event</h2>

        <h3>{event.title}</h3>

        <div className="event-summary-info">
          <div>
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

          <div>
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />

              <circle
                cx="12"
                cy="9"
                r="2.3"
              />
            </svg>

            <span>{event.location}</span>
          </div>
        </div>

        <div className="selected-ticket">
          <div className="selected-ticket-icon">
            <svg viewBox="0 0 24 24">
              <path d="M5 7h14v4a2 2 0 0 0 0 4v4H5v-4a2 2 0 0 0 0-4V7Z" />
            </svg>
          </div>

          <strong>
            {event.quantity}x Tiket{" "}
            {event.ticketName}
          </strong>

          <span>{formatRupiah(ticketTotal)}</span>
        </div>
      </div>
    </div>
  );
}


function PaymentSummary({
  event,
  ticketTotal,
  adminFee,
  totalPayment,
  formatRupiah,
  onCheckout,
}) {
  return (
    <div className="payment-summary-card">
      <h2>RINCIAN PEMBAYARAN</h2>

      <div className="payment-row">
        <span>
          Tiket {event.ticketName} {event.quantity}x
        </span>

        <strong>
          {formatRupiah(ticketTotal)}
        </strong>
      </div>

      <div className="payment-row">
        <span>Biaya Admin</span>

        <strong>
          {formatRupiah(adminFee)}
        </strong>
      </div>

      <div className="payment-divider"></div>

      <div className="payment-total">
        <strong>Total Biaya</strong>

        <span>
          {formatRupiah(totalPayment)}
        </span>
      </div>

      <button
        type="button"
        className="checkout-submit-button"
        onClick={onCheckout}
      >
        <span>Checkout</span>

        <svg viewBox="0 0 24 24">
          <path d="M5 12h13" />

          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default Checkout;