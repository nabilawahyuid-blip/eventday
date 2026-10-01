import React from "react";
import EventdayLogo from "./EventdayLogo";
import { formatEventWhen } from "../../utils/eticketDate";

/**
 * Print-only horizontal boarding pass ("concert pass").
 *
 * Deliberately NOT part of the on-screen UI: it is rendered inside a
 * `.eticket-print-root` container that is `display: none` on screen and only
 * becomes visible inside @media print (see src/utils/eticketPdf.css). Styles
 * live there too, so the printed layout is defined in exactly one place.
 *
 * Layout: 70% main pass (logo, event, schedule, buyer grid) + 30% gate stub
 * (status badge, QR, scannable code) split by a dashed perforation with
 * half-circle tear notches.
 */

const STATUS_LABEL = {
  UNREDEEMED: "Belum Digunakan",
  CHECKED_IN: "Sudah Digunakan",
  REDEEMED: "Sudah Digunakan",
  EXPIRED: "Kedaluwarsa",
};

const USED_STATUSES = new Set(["CHECKED_IN", "REDEEMED"]);

function firstOf(...values) {
  for (const value of values) {
    if (value !== null && value !== undefined && String(value).trim() !== "" && String(value).trim() !== "-") {
      return value;
    }
  }
  return null;
}

function formatOrderLabel(order) {
  if (!order) return "-";
  const orderNumber = firstOf(order.orderNumber, order.order_number, order.id, order.invoiceNumber);
  if (orderNumber) {
    const s = String(orderNumber).trim();
    return s.length > 8 ? s.slice(0, 8).toUpperCase() : s.toUpperCase();
  }
  const created = firstOf(order.createdAt, order.paidAt, order.orderDate, order.purchaseDate);
  if (created) {
    try {
      const d = new Date(created);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
      }
    } catch {}
    return String(created).replace("T", " ").slice(0, 10);
  }
  return "-";
}

function ConcertPass({ ticket, order }) {
  if (!ticket) return null;

  const realCode = firstOf(ticket.ticketCode, ticket.ticketItemId) || "";
  const hasRealCode = realCode !== "";

  const statusKey = ticket.checkInStatus || ticket.status || "UNREDEEMED";
  const statusLabel = STATUS_LABEL[statusKey] || statusKey;
  const isUsed = USED_STATUSES.has(statusKey);

  const eventTitle = firstOf(ticket.eventTitle, order?.eventTitle) || "Event";
  const eventWhen = formatEventWhen(
    firstOf(ticket.eventDate, ticket.eventStartDate, ticket.startDate)
  );
  const venue =
    firstOf(ticket.venueName, ticket.location, ticket.eventLocation, order?.venueName) || "-";
  const holderName =
    firstOf(ticket.attendeeName, ticket.holderName, ticket.customerName, ticket.buyerName) || "-";
  const ticketType =
    firstOf(ticket.categoryName, ticket.ticketType, ticket.tierName, order?.ticketTierName) || "-";
  const orderLabel = formatOrderLabel(order);

  return (
    <article className="concert-pass" data-code={realCode || undefined}>
      {/* ---- Main pass (kira-kira 70%) ---- */}
      <div className="concert-pass-main">
        <header className="concert-pass-head">
          <div className="concert-pass-brand">
            {/* showWordmark={false}: the wordmark is rendered by
                .concert-pass-brand-text next to the mark. Leaving it on would
                print "Eventday / Official E-Ticket" twice. */}
            <EventdayLogo className="concert-pass-logo" showWordmark={false} size={26} />
            <div className="concert-pass-brand-text">
              <span className="concert-pass-brand-name">EventDay</span>
              <span className="concert-pass-brand-sub">Official E-Ticket</span>
            </div>
          </div>
          <span className="concert-pass-eyebrow">Official Concert Pass</span>
        </header>

        <h1 className="concert-pass-title">{eventTitle}</h1>

        <div className="concert-pass-schedule">
          <div className="concert-pass-when">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <rect x="4" y="5" width="16" height="15" rx="2" />
              <path d="M8 3v4M16 3v4M4 10h16" />
            </svg>
            <span className="concert-pass-when-label">Date &amp; Time</span>
            <span className="concert-pass-when-value">{eventWhen}</span>
          </div>

          <div className="concert-pass-when">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
              <circle cx="12" cy="9" r="2.3" />
            </svg>
            <span className="concert-pass-when-label">Venue</span>
            <span className="concert-pass-when-value">{venue}</span>
          </div>
        </div>

        <dl className="concert-pass-buyer">
          <div className="concert-pass-cell">
            <dt>Nama Pemesan</dt>
            <dd>{holderName}</dd>
          </div>
          <div className="concert-pass-cell">
            <dt>Jenis Tiket</dt>
            <dd>{ticketType}</dd>
          </div>
          <div className="concert-pass-cell">
            <dt>No. Order</dt>
            <dd>{orderLabel}</dd>
          </div>
        </dl>
      </div>

      {/* ---- Gate stub (kira-kira 30%) ---- */}
      <div className="concert-pass-stub">
        <span className={`concert-pass-status ${isUsed ? "is-used" : "is-valid"}`}>
          {isUsed ? `USED / ${statusLabel}` : `VALID / ${statusLabel}`}
        </span>

        <div className="concert-pass-qr">
          {hasRealCode ? (
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                realCode
              )}`}
              width="140"
              height="140"
              alt={`QR Code ${realCode}`}
            />
          ) : (
            <span className="concert-pass-qr-empty">NO CODE</span>
          )}
        </div>

        <p className="concert-pass-code">{hasRealCode ? realCode : "-"}</p>

        <p className="concert-pass-hint">Scan at the entrance gate</p>
      </div>
    </article>
  );
}

export default ConcertPass;
