/**
 * "Unduh PDF E-Ticket" — prints the concert boarding pass.
 *
 * PDF ENGINE
 * ----------
 * package.json has no PDF library (no jspdf / html2canvas) and node_modules is
 * not installed, so the native print pipeline is used: the print stylesheet
 * reveals a dedicated container, then window.print(), and the user picks
 * "Save as PDF".
 *
 * SCREEN vs PRINT
 * ---------------
 * The on-screen ticket card is never printed. Each page renders a separate,
 * hidden `.eticket-print-root` containing one <ConcertPass> per ticket; all
 * concert-pass and @media print styles live in ./eticketPdf.css, imported once
 * here.
 *
 * TARGET
 * ------
 * `target` is a CSS selector, so both pages can share this helper:
 *   TicketSuccess -> "#concert-ticket-print"
 *   OrderDetail   -> ".eticket-print-root"
 * When omitted, PRINT_ROOT_ID is used.
 *
 * FILENAME
 * --------
 * The browser, not us, names the file. Browsers derive the default from
 * document.title, so it is set to "E-Ticket-<code>" for the duration of the
 * print call and restored right after.
 *
 * QR PRELOADING
 * -------------
 * The container is display:none on screen, so its <img> elements have no layout
 * box and would never load, printing as an empty square. `.is-printing` briefly
 * moves it off-screen (not display:none) so the browser fetches and decodes the
 * QR before window.print() runs.
 */

import "./eticketPdf.css";

export const PRINT_ROOT_ID = "concert-ticket-print";

const IMAGE_TIMEOUT_MS = 2500;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isBlank(value) {
  return (
    value === null ||
    value === undefined ||
    String(value).trim() === "" ||
    String(value).trim() === "-"
  );
}

/** First non-blank value wins; returns null when nothing usable is found. */
function pick(...values) {
  for (const value of values) {
    if (!isBlank(value)) return value;
  }
  return null;
}

/**
 * Resolve the customer email without trusting a single source.
 * location.state is lost on refresh, so the order/ticket payload and
 * localStorage act as backups.
 */
export function resolveEticketEmail(ticket, order, navState) {
  let stored = null;
  try {
    stored = window.localStorage.getItem("email");
  } catch {
    stored = null;
  }

  const candidate = pick(
    ticket?.holderEmail,
    ticket?.customerEmail,
    ticket?.email,
    ticket?.buyerEmail,
    order?.customerEmail,
    order?.email,
    order?.buyerEmail,
    navState?.customerEmail,
    navState?.email,
    stored
  );

  if (isBlank(candidate)) return null;
  const email = String(candidate).trim();
  return EMAIL_RE.test(email) ? email : null;
}

/** The one and only source of the ticket code shown, scanned, and printed. */
export function resolveTicketCode(ticket) {
  const code = pick(ticket?.ticketCode, ticket?.ticketItemId);
  return isBlank(code) ? null : String(code).trim();
}

/**
 * Wait for the QR bitmap to settle so it never prints as an empty box.
 * Resolves on load, on error, or on timeout — never rejects.
 */
async function waitForImages(root) {
  const images = Array.from(root.querySelectorAll("img"));
  if (images.length === 0) return;

  const settled = images.map((img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    return new Promise((resolve) => {
      const done = () => resolve();
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  });

  await Promise.race([
    Promise.all(settled),
    new Promise((resolve) => setTimeout(resolve, IMAGE_TIMEOUT_MS)),
  ]);
}

/**
 * Narrow a multi-ticket print container down to a single pass.
 *
 * An order can hold several tickets and the container renders one <ConcertPass>
 * per ticket, but the "Unduh PDF E-Ticket" button lives on each card and the
 * filename/email follow the clicked ticket. So the siblings are hidden and only
 * the matching `data-code` is kept. If nothing matches (stale DOM, code renamed
 * server-side) every pass stays visible rather than printing a blank sheet.
 */
function focusSinglePass(root, ticketCode) {
  const passes = Array.from(root.querySelectorAll(".concert-pass"));
  if (passes.length <= 1) return null;

  let matched = null;
  for (const pass of passes) {
    if (pass.dataset.code === ticketCode) matched = pass;
  }
  if (!matched) return null;

  for (const pass of passes) {
    pass.classList.toggle("is-print-target", pass === matched);
  }
  root.classList.add("is-printing-single");
  return matched;
}

/**
 * Print one e-ticket PDF.
 *
 * @param {object}   options
 * @param {string}   [options.target]  CSS selector for the print container.
 *                                   TicketSuccess points this at
 *                                   "#concert-ticket-print" so the printed
 *                                   layout is the concert pass, not the card
 *                                   the user sees on screen. OrderDetail uses
 *                                   ".eticket-print-root".
 * @param {object}   options.ticket    Ticket payload (source of the code).
 * @param {string}   [options.email]   Resolved recipient, for the message.
 * @returns {Promise<{ok: boolean, fileName: string|null, email: string|null, reason?: string}>}
 */
export async function printEticketPdf({ target, ticket, email } = {}) {
  const ticketCode = resolveTicketCode(ticket);
  if (!ticketCode) {
    return { ok: false, fileName: null, email: null, reason: "no-ticket-code" };
  }

  const root = target
    ? document.querySelector(target)
    : document.getElementById(PRINT_ROOT_ID);

  if (!root) {
    return { ok: false, fileName: null, email: null, reason: "no-print-root" };
  }

  const fileName = `E-Ticket-${ticketCode}.pdf`;
  const previousTitle = document.title;

  try {
    // The container is display:none on screen, so its <img> elements have no
    // layout box and never load. .is-printing moves it off-screen (not
    // display:none) so the browser fetches and decodes the QR, then the
    // @media print rules take over for the actual dialog.
    root.classList.add("is-printing");
    focusSinglePass(root, ticketCode);

    await waitForImages(root);
    document.title = `E-Ticket-${ticketCode}`;
    window.print();
    return { ok: true, fileName, email: email || null };
  } catch (error) {
    return {
      ok: false,
      fileName: null,
      email: email || null,
      reason: "print-failed",
      error,
    };
  } finally {
    document.title = previousTitle;
    setTimeout(() => {
      root.classList.remove("is-printing", "is-printing-single");
      for (const pass of root.querySelectorAll(".concert-pass")) {
        pass.classList.remove("is-print-target");
      }
    }, 400);
  }
}
