import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams } from "react-router-dom";
import NavbarCustomer from "../shared/NavbarCustomer";
import ConcertPass from "../shared/ConcertPass";
import { getMyTickets, getTicketsByOrder, getTicketDetail } from "../../services/ticketService";
import { downloadEticketPdf } from "../../utils/eticketActions";
import "./TicketSuccess.css";

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

// PENTING: jangan pernah memalsukan kode tiket (mis. "TK-001") sebagai
// fallback. Kode yang terlihat sah padahal tidak ada di DB akan ditolak
// saat discan staff, dan lebih buruk dari menampilkan status "belum ada".
const PENDING_CODE_LABEL = "MENUNGGU PENERBITAN";
const LOADING_CODE_LABEL = "MEMUAT KODE...";

// Cache tiket yang pernah ditulis halaman Checkout / OrderDetail.
// Dua storage dipakai supaya kompatibel dengan versi halaman sebelumnya.
const readCachedTickets = (orderId) => {
  for (const store of ["localStorage", "sessionStorage"]) {
    try {
      const raw = window[store].getItem("issued_tickets");
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      const list = Array.isArray(parsed) ? parsed : [];
      if (list.length === 0) continue;

      const matched = orderId
        ? list.filter((t) => String(t?.orderId) === String(orderId))
        : list;

      if (matched.length > 0) return matched;
    } catch {
      // cache rusak / tidak bisa dibaca -> abaikan, lanjut ke sumber berikutnya
    }
  }

  return [];
};

// Backend bisa membalas array polos atau objek paginated. Samakan keduanya.
const toTicketList = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.content)) return payload.content;
  if (Array.isArray(payload?.tickets)) return payload.tickets;
  return [];
};

function TicketSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const fromMyTicket = location.state?.fromMyTicket || false;
  const singleTicket = location.state?.ticket || null;
  const stateEvent = location.state?.event || null;
  const stateBuyers = location.state?.buyers || [];
  const stateOrder = location.state?.order || null;

  // Query param adalah satu-satunya sumber yang selamat saat halaman
  // di-refresh atau dibuka langsung via URL (location.state ikut hilang).
  const queryOrderId = searchParams.get("orderId");
  const queryTicketCode = searchParams.get("ticketCode");

  const orderId =
    location.state?.orderId || stateOrder?.orderId || queryOrderId || null;

  const orderNumber =
    location.state?.orderNumber ||
    stateOrder?.orderNumber ||
    searchParams.get("orderNumber") ||
    null;

  // Kode tiket dari state navigasi (Checkout / MyTicket), lalu query URL.
  const routedTicketCode =
    location.state?.ticket?.ticketCode ||
    location.state?.ticketCode ||
    location.state?.tickets?.[0]?.ticketCode ||
    location.state?.order?.tickets?.[0]?.ticketCode ||
    queryTicketCode ||
    "";

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usedFallback, setUsedFallback] = useState(false);

  useEffect(() => {
    // Tiket dari MyTicket sudah lengkap di state, tidak perlu fetch.
    if (fromMyTicket || singleTicket) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const fetchTickets = async () => {
      setLoading(true);
      setUsedFallback(false);

      // 1) Source paling akurat: endpoint per-order (tanpa N+1).
      if (orderId) {
        try {
          const res = await getTicketsByOrder(orderId);
          const list = toTicketList(res?.data);

          if (!cancelled && list.length > 0) {
            setTickets(list);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("[TicketSuccess] by-order gagal:", err.message);
        }
      }

      // 2) Direct visit dengan ?ticketCode= tanpa orderId -> ambil detail.
      if (!orderId && routedTicketCode) {
        try {
          const res = await getTicketDetail(routedTicketCode);
          const ticket = res?.data;

          if (!cancelled && ticket && !Array.isArray(ticket)) {
            setTickets([ticket]);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.warn("[TicketSuccess] detail tiket gagal:", err.message);
        }
      }

      // 3) Fallback ke daftar tiket saya, filter per orderId.
      if (orderId) {
        const email = localStorage.getItem("email");

        if (email) {
          try {
            const res = await getMyTickets(email);
            const all = toTicketList(res?.data);
            const filtered = all.filter(
              (t) => String(t?.orderId) === String(orderId)
            );

            if (!cancelled && filtered.length > 0) {
              setTickets(filtered);
              setLoading(false);
              return;
            }
          } catch (err) {
            console.warn("[TicketSuccess] my-tickets gagal:", err.message);
          }
        }
      }

      // 4) Terakhir: cache lokal. Kode di sini masih kode asli dari
      //    payout sebelumnya, bukan kode buatan.
      const cached = readCachedTickets(orderId);

      if (!cancelled && cached.length > 0) {
        setTickets(cached);
        setUsedFallback(true);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setTickets([]);
        setUsedFallback(true);
        setLoading(false);
      }
    };

    fetchTickets();

    return () => {
      cancelled = true;
    };
  }, [orderId, routedTicketCode, fromMyTicket, singleTicket]);

  // Susun daftar yang dirender.
  //
  // Bila backend tidak mengembalikan tiket sama sekali, tetap tampilkan kartu
  // agar pengguna tahu statusnya — TAPI tanpa kode tiket palsu. Kartu seperti
  // ini akan menampilkan PENDING_CODE_LABEL dan tombol unduh nonaktif.
  const displayTickets =
    fromMyTicket && singleTicket
      ? [singleTicket]
      : tickets.length > 0
      ? tickets
      : usedFallback && stateBuyers.length > 0
      ? stateBuyers.map((buyer) => ({
          ticketCode: null,
          ticketItemId: null,
          attendeeName: buyer.name || buyer.fullName || "-",
          categoryName: stateEvent?.ticketName || stateEvent?.category || "-",
          checkInStatus: "UNREDEEMED",
          eventTitle: stateEvent?.title || "Event",
          eventDate: stateEvent?.date || "-",
          venueName: stateEvent?.location || stateEvent?.venue || "-",
          orderId: orderId || null,
          eventImageUrl: stateEvent?.image || null,
        }))
      : [];

  useEffect(() => {
    if (fromMyTicket || usedFallback || displayTickets.length === 0) return;

    const stored = JSON.parse(localStorage.getItem("issued_tickets") || "[]");
    const existingCodes = new Set(
      stored.map((t) => t.ticketCode || t.ticketItemId).filter(Boolean)
    );
    const newTickets = displayTickets.filter(
      (t) =>
        (t.ticketCode || t.ticketItemId) &&
        !existingCodes.has(t.ticketCode) &&
        !existingCodes.has(t.ticketItemId)
    );

    if (newTickets.length > 0) {
      localStorage.setItem(
        "issued_tickets",
        JSON.stringify([...stored, ...newTickets])
      );
    }
  }, [displayTickets, fromMyTicket, usedFallback]);

  // Dua tampilan terpisah:
  //  - Layar : kartu biasa seperti semula (TicketCard di bawah).
  //  - Cetak : wadah #concert-ticket-print, disembunyikan di layar.
  // Jadi layout konser tidak pernah bocor ke tampilan web.
  const [busyTicketId, setBusyTicketId] = useState(null);

  const handleDownloadPdf = async (ticket) => {
    const key = ticket.ticketCode || ticket.ticketItemId || null;
    setBusyTicketId(key);
    try {
      await downloadEticketPdf({
        ticket,
        order: stateOrder,
        navState: location.state,
        // Cetak wadah konser, bukan kartu di layar.
        target: "#concert-ticket-print",
      });
    } finally {
      setBusyTicketId(null);
    }
  };

  return (
    <div className="ticket-success-page">
      <NavbarCustomer />

      <main className="ticket-success-container">
        {!fromMyTicket && (
          <div className="success-message">
            <strong>Pembayaran Berhasil</strong>
            <span>Tiket Berhasil Diterbitkan</span>
            {orderNumber && (
              <span className="order-number">Nomor Pesanan: {orderNumber}</span>
            )}
          </div>
        )}

        {loading ? (
          <div className="ticket-loading">
            <div className="ticket-spinner" />
            <span>Memuat tiket...</span>
          </div>
        ) : displayTickets.length === 0 ? (
          <div className="ticket-empty">
            <p>Belum ada tiket yang diterbitkan.</p>
          </div>
        ) : (
          <div
            className={`ticket-list ${
              displayTickets.length > 1
                ? "ticket-list-multi"
                : "ticket-list-single"
            }`}
          >
            {displayTickets.map((ticket, index) => (
              <TicketCard
                key={
                  ticket.ticketCode ||
                  ticket.ticketItemId ||
                  `${orderId || "pending"}-${index}`
                }
                ticket={ticket}
                index={index}
                loading={loading}
                busy={busyTicketId === (ticket.ticketCode || ticket.ticketItemId || null)}
                onDownloadPdf={handleDownloadPdf}
              />
            ))}
          </div>
        )}

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

          {!fromMyTicket && (
            <button
              className="refund-button"
              onClick={() =>
                navigate("/customer/refund", {
                  state: { orderId },
                })
              }
            >
              Ajukan Refund
            </button>
          )}
        </div>
      </main>

      {/* ===================================================================
          WADAH KHUSUS CETAK.
          `display: none` di layar (.eticket-print-root), `display: flex` saat
          print. Isinya boarding pass konser — terpisah total dari tampilan web
          di atas, jadi desain konser tidak pernah bocor ke layar.
          Gaya ada di src/utils/eticketPdf.css.
          =================================================================== */}
      <div id="concert-ticket-print" className="eticket-print-root">
        {displayTickets.map((ticket, index) => (
          <ConcertPass
            key={
              ticket.ticketCode ||
              ticket.ticketItemId ||
              `pass-${orderId || "pending"}-${index}`
            }
            ticket={ticket}
            order={stateOrder}
          />
        ))}
      </div>

      <footer className="ticket-success-footer">
        © 2026 EVENTDAY. Hak cipta dilindungi undang-undang.
      </footer>
    </div>
  );
}


/* ==========================================================================
   SCREEN CARD — tampilan web biasa, sama seperti desain semula.
   ========================================================================== */
function TicketCard({ ticket, index, loading, busy, onDownloadPdf }) {
  // Kode asli dari database. Tidak pernah di-fallback ke string buatan.
  const realCode = ticket.ticketCode || ticket.ticketItemId || "";
  const hasRealCode = realCode !== "";
  const ticketCode = realCode || (loading ? LOADING_CODE_LABEL : PENDING_CODE_LABEL);
  const statusKey = ticket.checkInStatus || ticket.status || "UNREDEEMED";

  return (
    <article className={`ticket-result-card ticket-card-${index + 1}`}>
      <div className="ticket-event-header">
        <div className="ticket-event-info">
          <h2>{ticket.eventTitle || "Event"}</h2>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            <span>{ticket.eventDate || "-"}</span>
          </div>

          <div className="ticket-info-row">
            <svg viewBox="0 0 24 24">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>
            <span>{ticket.venueName || "-"}</span>
          </div>
        </div>

        <span className={`ticket-usage-badge ${STATUS_TYPE[statusKey] || "unused"}`}>
          {STATUS_LABEL[statusKey] || statusKey}
        </span>
      </div>

      <div className="ticket-qr-section">
        <div className="qr-wrapper">
          {hasRealCode ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                realCode
              )}`}
              width="300"
              height="300"
              alt={`QR Code ${realCode}`}
            />
          ) : (
            <div className="qr-pending">
              <span>{ticketCode}</span>
            </div>
          )}
        </div>

        <p className="qr-instruction">
          {hasRealCode
            ? "Tunjukkan kode ini ke Staff"
            : "Kode tiket belum diterbitkan. Silakan cek Tiket Saya beberapa saat lagi."}
        </p>

        <div className={`ticket-code ${hasRealCode ? "" : "ticket-code-pending"}`}>
          {ticketCode}
        </div>

        <div className="ticket-code-actions no-print">
          <button
            className="download-qr-button"
            disabled={!hasRealCode || busy}
            onClick={() => onDownloadPdf(ticket)}
          >
            <svg viewBox="0 0 24 24">
              <path d="M12 3v12" />
              <path d="m7 10 5 5 5-5" />
              <path d="M5 20h14" />
            </svg>
            <span>{busy ? "Memproses..." : "Unduh PDF E-Ticket"}</span>
          </button>
        </div>
      </div>

      <div className="ticket-detail-section">
        <div className="ticket-detail-row">
          <span>Jenis Tiket</span>
          <strong>{ticket.categoryName || "-"}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Nama</span>
          <strong>{ticket.attendeeName || "-"}</strong>
        </div>

        <div className="ticket-detail-row">
          <span>Status Penggunaan</span>
          <strong className="payment-status">
            {STATUS_LABEL[statusKey] || statusKey}
          </strong>
        </div>
      </div>
    </article>
  );
}

export default TicketSuccess;
