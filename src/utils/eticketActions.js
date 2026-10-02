/**
 * Shared handler for the E-Ticket download action.
 *
 *  - downloadEticketPdf() — user-initiated, prints the e-ticket to PDF.
 *
 * Backend tidak punya endpoint kirim email e-ticket, jadi tidak ada lagi
 * jargon "email terkirim" di sini: satu-satunya hasil aksi ini adalah PDF
 * yang dicetak ke dialog cetak browser. Alamat email tetap diteruskan ke
 * printEticketPdf karena dicetak sebagai bagian dari isi e-ticket.
 */

import { showError, showSuccess, showWarning } from "./alert";
import { printEticketPdf, resolveEticketEmail, resolveTicketCode } from "./eticketPdf";

/** "Unduh PDF E-Ticket": cetak e-ticket ke dialog cetak browser. */
export async function downloadEticketPdf({
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
    return { printed: false };
  }

  const email = resolveEticketEmail(ticket, order, navState);

  const printResult = await printEticketPdf({ target, ticket, email });
  if (!printResult.ok) {
    showError(
      "Gagal Menyiapkan E-Ticket",
      "Browser tidak bisa membuka dialog cetak. Periksa pengaturan cetak, lalu coba lagi."
    );
    return { printed: false };
  }

  showSuccess(
    "E-Ticket Berhasil Disiapkan",
    `Simpan PDF sebagai "${printResult.fileName}", atau cetak langsung dari dialog browser.`
  );

  return { printed: true, fileName: printResult.fileName, email };
}
