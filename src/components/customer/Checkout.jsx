import React, { useEffect, useMemo, useState, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Swal from "sweetalert2";
import NavbarCustomer from "../shared/NavbarCustomer";
import {
  calcCheckout,
  getCheckoutSummary,
  initiateCheckout,
  saveAttendees,
} from "../../services/checkoutService";
import {
  chargePayment,
  openMidtransPayment,
  verifyPayment,
} from "../../services/paymentService";
import { getProfile } from "../../services/profileService";
import { getEventDetail } from "../../services/eventService";
import "./Checkout.css";

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();

  const checkoutData = location.state || {};

  const tierId =
    checkoutData.ticketId ||
    checkoutData.tierId ||
    checkoutData.ticket?.id ||
    null;
  const initialQuantity =
    Number(checkoutData.quantity) || Number(checkoutData.event?.quantity) || 1;

  const [timeLeft, setTimeLeft] = useState(14 * 60 + 57);
  const [orderId, setOrderId] = useState(checkoutData.orderId || null);
  const [calc, setCalc] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref pengunci untuk mencegah initiateCheckout dipanggil berulang kali
  const hasInitiatedRef = useRef(false);

  const createEmptyBuyer = () => ({
    name: "",
    email: "",
    nik: "",
    phoneNumber: "",
    isLocked: false,
  });

  const createLockedBuyer = (name, email, nik, phoneNumber = "") => ({
    name,
    email,
    nik,
    phoneNumber,
    isLocked: true,
  });

  const [buyers, setBuyers] = useState(() =>
    Array.from({ length: Math.max(1, initialQuantity) }, (_, index) =>
      index === 0 ? createLockedBuyer("", "", "", "") : createEmptyBuyer(),
    ),
  );

  useEffect(() => {
    let cancelled = false;
    const loadProfile = async () => {
      try {
        const res = await getProfile();
        const data = res?.data || {};
        if (cancelled) return;
        const hasNik = !!(data.nik || data.identityNumber);
        setBuyers((prev) =>
          prev.map((b, i) =>
            i === 0
              ? {
                  name: data.name || localStorage.getItem("name") || "",
                  email: data.email || localStorage.getItem("email") || "",
                  nik: data.nik || data.identityNumber || "",
                  phoneNumber: data.phoneNumber || data.phone || "",
                  isLocked: hasNik,
                }
              : b,
          ),
        );
      } catch {
        if (cancelled) return;
        setBuyers((prev) =>
          prev.map((b, i) =>
            i === 0
              ? createLockedBuyer(
                  localStorage.getItem("name") || "",
                  localStorage.getItem("email") || "",
                  "",
                  "",
                )
              : b,
          ),
        );
      }
    };
    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const [openForms, setOpenForms] = useState({
    1: true,
  });

  const isResume = !tierId && orderId;
  const [resumeEvent, setResumeEvent] = useState(null);
  const resumeTicketTierName = checkoutData?.ticketTierName || null;

  useEffect(() => {
    if (!isResume || !id) return;
    let cancelled = false;
    const load = async () => {
      try {
        const res = await getEventDetail(id);
        if (!cancelled) setResumeEvent(res?.data || null);
      } catch (err) {
        console.error("[Checkout] Gagal load event detail untuk resume:", err);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [isResume, id]);

  const event = useMemo(() => {
    if (isResume && resumeEvent) {
      const tickets = resumeEvent.tickets || [];
      // Cari ticket yang match ticketTierName dari order
      const selectedTicket = resumeTicketTierName
        ? tickets.find(t => (t.label || t.name) === resumeTicketTierName) || tickets[0]
        : tickets[0];
      return {
        id: resumeEvent.id || id,
        title: resumeEvent.title || "Event",
        date: resumeEvent.dateDisplay || resumeEvent.date || "-",
        location: resumeEvent.location || "-",
        ticketName: selectedTicket?.label || selectedTicket?.name || "Regular",
        quantity: Number(checkoutData.quantity) || 1,
        price: Number(selectedTicket?.price) || 0,
      };
    }

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
        selectedTicket.name || checkoutData.ticketName || "Early Bird",
      quantity:
        Number(checkoutData.quantity) || Number(selectedEvent.quantity) || 1,
      price:
        Number(selectedTicket.price) || Number(checkoutData.price) || 200000,
    };
  }, [checkoutData, id, isResume, resumeEvent, resumeTicketTierName]);

  useEffect(() => {
    const count = Math.max(1, event.quantity);
    setBuyers((previous) => {
      if (previous.length === count) return previous;
      return Array.from(
        { length: count },
        (_, index) => previous[index] || createEmptyBuyer(),
      );
    });
    setOpenForms((previous) => {
      const next = { ...previous };
      for (let number = 1; number <= count; number++) {
        if (!(number in next)) next[number] = true;
      }
      return next;
    });
  }, [event.quantity]);

  const ticketTotal = useMemo(() => {
    if (calc?.subtotal != null) return Number(calc.subtotal);
    return event.price * event.quantity;
  }, [calc, event.price, event.quantity]);

  const adminFee = calc?.adminFee != null ? Number(calc.adminFee) : 5000;
  const tax =
    calc?.tax != null ? Number(calc.tax) : Math.round(ticketTotal * 0.1);
  const discount = calc?.discount != null ? Number(calc.discount) : 0;

  const totalPayment = useMemo(() => {
    if (calc?.totalAmount != null) return Number(calc.totalAmount);
    return ticketTotal + adminFee + tax - discount;
  }, [calc, ticketTotal, adminFee, tax, discount]);

  useEffect(() => {
    if (!tierId) return;
    let cancelled = false;
    const loadCalc = async () => {
      try {
        const res = await calcCheckout(tierId, event.quantity);
        if (!cancelled) setCalc(res?.data || null);
      } catch (err) {
        console.error("Gagal memuat kalkulasi checkout:", err);
      }
    };
    loadCalc();
    return () => {
      cancelled = true;
    };
  }, [tierId, event.quantity]);

  // ===== PERBAIKAN: useEffect initiateCheckout Aman dari Bug React 18 Strict Mode =====
  useEffect(() => {
    if (!tierId || orderId || hasInitiatedRef.current) return;

    hasInitiatedRef.current = true;

    const init = async () => {
      try {
        const res = await initiateCheckout(tierId, initialQuantity);

        // Ekstraksi fleksibel untuk Axios Interceptor / Response standar
        const raw = res?.data?.data || res?.data || res || {};
        const newOrderId =
          raw.orderId ||
          raw.id ||
          raw.order_id ||
          res?.data?.orderId ||
          res?.data?.id ||
          null;
        const expiredAt = raw.expiredAt || raw.expired_at || null;

        if (newOrderId) {
          setOrderId(newOrderId);
        } else {
          hasInitiatedRef.current = false;
          console.error(
            "[Checkout] Response API initiateCheckout tidak memiliki orderId:",
            res,
          );
          Swal.fire({
            icon: "error",
            title: "Gagal Menyiapkan Order",
            text: "ID Order tidak ditemukan dari server. Silakan coba lagi.",
            confirmButtonColor: "#5548dc",
          });
        }

        if (expiredAt) {
          const diff = Math.max(
            0,
            Math.floor((new Date(expiredAt).getTime() - Date.now()) / 1000),
          );
          if (diff > 0) setTimeLeft(diff);
        }
      } catch (err) {
        hasInitiatedRef.current = false; // Lepas kunci ref jika request error
        Swal.fire({
          icon: "error",
          title: "Gagal Menyiapkan Order",
          text:
            err?.response?.data?.message ||
            err?.message ||
            "Tidak dapat menghubungi server. Silakan coba lagi.",
          confirmButtonColor: "#5548dc",
        });
      }
    };

    init();
  }, [tierId, orderId, initialQuantity]);

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
        if (buyerIndex !== index) return buyer;
        return {
          ...buyer,
          [field]: value,
        };
      }),
    );
  };

  const openBuyerForm = (number) => {
    setOpenForms((previous) => ({
      ...previous,
      [number]: true,
    }));

    setTimeout(() => {
      const element = document.getElementById(`buyer-card-${number}`);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  };

  const validateBuyers = () => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    for (let index = 0; index < buyers.length; index++) {
      const buyer = buyers[index];
      const number = index + 1;

      if (buyer.isLocked) continue;

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

      if (!buyer.phoneNumber.trim()) {
        Swal.fire({
          icon: "warning",
          title: "Data Belum Lengkap",
          text: `Nomor telepon Pemesan ${number} wajib diisi.`,
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

  const handleCheckout = async () => {
    if (timeLeft <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Waktu Habis",
        text: "Waktu pemesanan telah habis. Silakan ulangi dari awal.",
        confirmButtonColor: "#5548dc",
      }).then(() => navigate("/customer/dashboard"));
      return;
    }

    if (!validateBuyers()) return;

    if (buyers.length !== event.quantity) {
      Swal.fire({
        icon: "warning",
        title: "Jumlah Pemesan Tidak Sesuai",
        text: `Jumlah data pemesan (${buyers.length}) harus sama dengan jumlah tiket (${event.quantity}).`,
        confirmButtonColor: "#5548dc",
      });
      return;
    }

    if (tierId && !orderId) {
      Swal.fire({
        icon: "info",
        title: "Menyiapkan Order",
        text: "Order sedang disiapkan oleh server. Silakan tunggu sebentar atau muat ulang halaman.",
        confirmButtonColor: "#5548dc",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const attendees = buyers.map((buyer) => ({
        fullName: buyer.name.trim(),
        email: buyer.email.trim(),
        phoneNumber: buyer.phoneNumber || buyer.phone || "",
        identityNumber: buyer.nik.trim(),
      }));
      await saveAttendees(orderId, attendees);

      let summary = null;
      try {
        const summaryRes = await getCheckoutSummary(orderId);
        summary = summaryRes?.data || null;
      } catch (err) {
        console.error("Gagal memuat ringkasan checkout:", err);
      }

      let grossAmount = 0;
      if (summary?.totalAmount != null) {
        grossAmount = Number(summary.totalAmount);
      } else if (calc?.totalAmount != null) {
        grossAmount = Number(calc.totalAmount);
      } else {
        grossAmount = totalPayment;
      }

      const customerName = buyers[0]?.name || "";
      const customerEmail = buyers[0]?.email || "";

      const chargeRes = await chargePayment(
        orderId,
        grossAmount,
        customerName,
        customerEmail,
      );

      const snapToken =
        chargeRes?.data?.snapToken ||
        chargeRes?.snapToken ||
        chargeRes?.data?.data?.snapToken ||
        null;

      if (!snapToken) {
        throw new Error("Gagal mendapatkan token pembayaran dari server.");
      }

      const paymentResult = await openMidtransPayment(snapToken);

      if (
        paymentResult.status === "success" ||
        paymentResult.status === "pending"
      ) {
        if (paymentResult.status === "success") {
          try {
            const transactionId =
              paymentResult.transactionId ||
              paymentResult.response?.transaction_id ||
              "";
            await verifyPayment(orderId, transactionId);
          } catch (verifyErr) {
            console.error(
              "[Checkout] Gagal verifikasi pembayaran otomatis:",
              verifyErr,
            );
          }
        }

        navigate("/customer/ticket-success", {
          state: {
            event,
            buyers,
            ticketTotal: summary?.subtotal ?? ticketTotal,
            adminFee: summary?.adminFee ?? adminFee,
            tax: summary?.tax ?? tax,
            discountAmount: summary?.discountAmount ?? discount,
            totalPayment: grossAmount,
            orderId,
            orderNumber: summary?.orderNumber,
            expiredAt: summary?.expiredAt,
          },
        });
      } else if (paymentResult.status === "closed") {
        Swal.fire({
          icon: "info",
          title: "Pembayaran Dibatalkan",
          text: "Anda menutup halaman pembayaran. Order tetap tersedia di 'Menunggu Pembayaran' untuk dilanjutkan.",
          confirmButtonText: "Oke",
          confirmButtonColor: "#5548dc",
        });
      }
    } catch (err) {
      console.error("Checkout gagal:", err);
      const message = err?.message || "Checkout gagal. Silakan coba lagi.";
      if (message === "401 Unauthorized" || /^401\b/.test(message)) {
        Swal.fire({
          icon: "warning",
          title: "Sesi Habis",
          text: "Silakan login kembali.",
          confirmButtonColor: "#5548dc",
        }).then(() => navigate("/"));
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Checkout Gagal",
        text: message,
        confirmButtonColor: "#5548dc",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="checkout-page">
      <NavbarCustomer />

      <main className="checkout-container">
        <section className="checkout-heading">
          <div>
            <h1>Checkout</h1>
            <p>
              Lengkapi informasi pengunjung untuk menerbitkan e-tiket resmi.
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
                  {buyers.length} Data Pemesan — sesuai {event.quantity}x tiket
                  yang dipesan
                </span>
              </div>
            </div>

            <div className="buyer-form-list">
              {buyers.map((buyer, index) => {
                const formNumber = index + 1;
                const isOpen = openForms[formNumber] !== false;
                const isLocked = buyer.isLocked;

                return (
                  <div
                    className={`buyer-card ${isOpen ? "buyer-card-open" : ""} ${isLocked ? "buyer-card-locked" : ""}`}
                    id={`buyer-card-${formNumber}`}
                    key={formNumber}
                  >
                    <div className="buyer-card-header">
                      <button
                        type="button"
                        className="buyer-card-toggle"
                        onClick={() => !isLocked && toggleForm(formNumber)}
                      >
                        <div className="buyer-title">
                          <span className="buyer-number">{formNumber}</span>
                          <strong>
                            {isLocked
                              ? "Data Diri Anda (Pemesan 1)"
                              : `Data Diri Pemesan ${formNumber}`}
                          </strong>
                        </div>

                        {!isLocked && (
                          <span
                            className={`accordion-icon ${isOpen ? "open" : ""}`}
                          >
                            <svg viewBox="0 0 24 24">
                              <path d="m7 14 5-5 5 5" />
                            </svg>
                          </span>
                        )}
                      </button>
                    </div>

                    {isOpen && (
                      <div className="buyer-form">
                        <div className="input-group">
                          <label>
                            Nama Lengkap <span>*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="Masukan Nama Lengkap"
                            value={buyer.name}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleBuyerChange(index, "name", e.target.value)
                            }
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            Email {isLocked ? "" : formNumber} <span>*</span>
                          </label>
                          <input
                            type="email"
                            placeholder="Masukan Email"
                            value={buyer.email}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleBuyerChange(index, "email", e.target.value)
                            }
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            No. Telepon / WhatsApp <span>*</span>
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            placeholder="Masukan No. Telepon"
                            value={buyer.phoneNumber}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleBuyerChange(
                                index,
                                "phoneNumber",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                          />
                        </div>

                        <div className="input-group">
                          <label>
                            NIK {isLocked ? "" : formNumber} <span>*</span>
                          </label>
                          <input
                            type="text"
                            inputMode="numeric"
                            maxLength={16}
                            placeholder="Masukan NIK"
                            value={buyer.nik}
                            disabled={isLocked}
                            onChange={(e) =>
                              handleBuyerChange(
                                index,
                                "nik",
                                e.target.value.replace(/\D/g, ""),
                              )
                            }
                          />
                        </div>

                        {isLocked && (
                          <p className="buyer-locked-note">
                            Data ini diambil dari profil Anda dan tidak dapat
                            diubah.
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
              tax={tax}
              discount={discount}
              totalPayment={totalPayment}
              formatRupiah={formatRupiah}
              onCheckout={handleCheckout}
              isSubmitting={isSubmitting}
              waitingForOrder={tierId && !orderId}
            />
          </aside>
        </div>
      </main>

      <div className="mobile-payment-summary">
        <PaymentSummary
          event={event}
          ticketTotal={ticketTotal}
          adminFee={adminFee}
          tax={tax}
          discount={discount}
          totalPayment={totalPayment}
          formatRupiah={formatRupiah}
          onCheckout={handleCheckout}
          isSubmitting={isSubmitting}
          waitingForOrder={tierId && !orderId}
        />
      </div>

      <footer className="checkout-footer">
        © 2027 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}

function EventSummary({ event, ticketTotal, formatRupiah }) {
  return (
    <div className="event-summary-card">
      <div className="event-summary-decoration"></div>
      <div className="event-summary-content">
        <h2>Judul Event</h2>
        <h3>{event.title}</h3>

        <div className="event-summary-info">
          <div>
            <svg viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            <span>{event.date}</span>
          </div>

          <div>
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
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
            {event.quantity}x Tiket {event.ticketName}
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
  tax = 0,
  discount = 0,
  totalPayment,
  formatRupiah,
  onCheckout,
  isSubmitting = false,
  waitingForOrder = false,
}) {
  return (
    <div className="payment-summary-card">
      <h2>RINCIAN PEMBAYARAN</h2>

      <div className="payment-row">
        <span>
          Tiket {event.ticketName} {event.quantity}x
        </span>
        <strong>{formatRupiah(ticketTotal)}</strong>
      </div>

      <div className="payment-row">
        <span>Biaya Admin</span>
        <strong>{formatRupiah(adminFee)}</strong>
      </div>

      {tax > 0 && (
        <div className="payment-row">
          <span>Pajak (10%)</span>
          <strong>{formatRupiah(tax)}</strong>
        </div>
      )}

      {discount > 0 && (
        <div className="payment-row">
          <span>Diskon</span>
          <strong>-{formatRupiah(discount)}</strong>
        </div>
      )}

      <div className="payment-divider"></div>

      <div className="payment-total">
        <strong>Total Biaya</strong>
        <span>{formatRupiah(totalPayment)}</span>
      </div>

      <button
        type="button"
        className="checkout-submit-button"
        onClick={onCheckout}
        disabled={isSubmitting || waitingForOrder}
      >
        <span>
          {isSubmitting
            ? "Memproses..."
            : waitingForOrder
              ? "Menyiapkan Order..."
              : "Checkout"}
        </span>
        <svg viewBox="0 0 24 24">
          <path d="M5 12h13" />
          <path d="m13 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

export default Checkout;
