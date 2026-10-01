/**
 * Shared handlers for the E-Ticket actions.
 *
 * Two entry points:
 *  - downloadAndEmailEticket() — user-initiated, prints the PDF and re-sends.
 *  - autoSendEticket()         — run once on mount after a successful payment,
 *                                 silent unless something needs reporting.
 *
 * The "sent" wording is never shown optimistically. If the backend has no
 * e-mail endpoint yet, the user is told plainly instead of being told a
 * message was delivered.
 */

import { sendTicketEmail } from "../services/ticketService";
import { showError, showSuccess, showWarning } from "./alert";
import { printEticketPdf, resolveEticketEmail, resolveTicketCode } from "./eticketPdf";

function describeFailure(error) {
  const status = error?.status;
  if (status === 404 || status === 405) {
    return "Endpoint kirim email belum tersedia di server.";
  }
  if (status === 401 || status === 403) {
    return "Sesi Anda tidak valid. Silakan masuk kembali.";
  }
  if (!status || status === 429) {
    return "Server tidak dapat dihubungi. Coba beberapa saat lagi.";
  }
  if (error?.message) return error.message;
  return "Terjadi kesalahan yang tidak diketahui.";
}

function buildPayload(ticket, order, email) {
  const ticketIds = Array.isArray(ticket?.ticketIds)
    ? ticket.ticketIds
    : ticket?.ticketItemId
    ? [ticket.ticketItemId]
    : undefined;

  return {
    email,
    ticketCode: resolveTicketCode(ticket),
    orderId: ticket?.orderId || order?.orderId,
    ticketIds,
  };
}

/** "Unduh PDF E-Ticket": print, then re-send the e-mail to the customer. */
export async function downloadAndEmailEticket({
  ticket,
  order,
  navState,
  target,
} = {}) {
  const ticketCode = resolveTicketCode(ticket);
  if (!ticketCode) {
    showWarning(
      "Tiket Belum Terbit",
      "Kode tiket belum tersedia dari server, jadi e-ticket belum bisa diunduh."
    );
    return { printed: false, emailed: false };
  }

  const email = resolveEticketEmail(ticket, order, navState);

  const printResult = await printEticketPdf({ target, ticket, email });
  if (!printResult.ok) {
    showError(
      "Gagal Menyiapkan E-Ticket",
      "Browser tidak bisa membuka dialog cetak. Periksa pengaturan cetak, lalu coba lagi."
    );
    return { printed: false, emailed: false };
  }

  if (!email) {
    showWarning(
      "E-Ticket Disiapkan, Email Gagal Dikirim",
      `Simpan PDF sebagai "${printResult.fileName}". Alamat email customer tidak ditemukan, jadi email tidak bisa dikirim.`
    );
    return { printed: true, emailed: false };
  }

  try {
    await sendTicketEmail(buildPayload(ticket, order, email));
    showSuccess(
      "E-Ticket Berhasil",
      "E-Ticket PDF berhasil diunduh dan telah dikirimkan ke email Anda!"
    );
    return { printed: true, emailed: true, email };
  } catch (error) {
    showWarning(
      "E-Ticket Disiapkan, Email Belum Terkirim",
      `Simpan PDF sebagai "${printResult.fileName}". Email ke ${email} gagal: ${describeFailure(error)}`
    );
    return { printed: true, emailed: false, email, error };
  }
}

/**
 * Fire-and-forget e-mail dispatch, used once right after a successful payment.
 *
 * Deliberately silent on success-because-it-worked: the page shows a small
 * green badge instead of a modal, so the customer is not interrupted.
 * Failures are surfaced once, because a silently dropped ticket e-mail is a
 * support ticket waiting to happen.
 */
export async function autoSendEticket({
  ticket,
  order,
  navState,
  silent = false,
} = {}) {
  const ticketCode = resolveTicketCode(ticket);
  if (!ticketCode) {
    return { emailed: false, reason: "no-ticket-code" };
  }

  const email = resolveEticketEmail(ticket, order, navState);
  if (!email) {
    if (!silent) {
      showWarning(
        "E-Ticket Belum Dikirim",
        "Alamat email customer tidak ditemukan, jadi e-ticket tidak bisa dikirim otomatis. Anda tetap bisa mengunduhnya sebagai PDF."
      );
    }
    return { emailed: false, reason: "no-email" };
  }

  try {
    await sendTicketEmail(buildPayload(ticket, order, email));
    return { emailed: true, email };
  } catch (error) {
    if (!silent) {
      showWarning(
        "E-Ticket Belum Terkirim ke Email",
        `Tidak bisa mengirim ke ${email}: ${describeFailure(error)}. PDF e-ticket tetap bisa Anda unduh dari halaman ini.`
      );
    }
    return { emailed: false, email, error, reason: "send-failed" };
  }
}
