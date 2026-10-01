import React from "react";

/**
 * Eventday mark, drawn inline as SVG.
 *
 * Why inline and not an <img>: the repository contains no image assets at all
 * (no src/assets, no public/), so importing a PNG would fail the Vite build and
 * referencing "/logo.png" would render a broken image inside the printed PDF.
 * Inline SVG also stays crisp at printer DPI and needs no network round-trip,
 * which matters because the print path already waits on <img> elements.
 *
 * The mark echoes the ticket shape: a stubbed ticket with a dashed perforation.
 * Colour follows `currentColor`, so the host decides whether it renders white
 * on the gradient header or dark on a light surface. Import the matching CSS
 * (see the CONCERT PASS block in TicketSuccess.css) to restyle it.
 */
function EventdayLogo({ size = 34, showWordmark = true, className = "" }) {
  return (
    <span className={`eventday-logo ${className}`.trim()}>
      <svg
        className="eventday-logo-mark"
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M3.6 8.7A2.6 2.6 0 0 1 6.2 6.1h11.6a2.6 2.6 0 0 1 2.6 2.6v1a2.4 2.4 0 0 0 0 4.8v1a2.6 2.6 0 0 1-2.6 2.6H6.2a2.6 2.6 0 0 1-2.6-2.6v-1a2.4 2.4 0 0 0 0-4.8v-1Z" />
        <path d="M14.2 6.1v11.8" strokeDasharray="1.9 2.3" />
      </svg>

      {showWordmark && (
        <span className="eventday-logo-text">
          <span className="eventday-logo-name">Eventday</span>
          <span className="eventday-logo-sub">Official E-Ticket</span>
        </span>
      )}
    </span>
  );
}

export default EventdayLogo;
