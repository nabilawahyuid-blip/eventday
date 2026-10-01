// src/services/ticketService.js
// Tiket — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Backend: /api/tickets/* (tanpa /v1, Vite proxy skip rewrite untuk /api/tickets)
import { apiFetch } from "./api";

// Daftar tiket saya → data: [TicketItem...]
// GET /api/tickets/my-tickets?userEmail=<email>
export const getMyTickets = (userEmail) =>
  apiFetch(
    `/api/tickets/my-tickets?userEmail=${encodeURIComponent(userEmail)}`,
  );

// Daftar tiket saya (auth-based, tanpa param) → data: [TicketItem...]
// GET /api/tickets/my-tickets
export const getMyTicketsAuth = () =>
  apiFetch("/api/tickets/my-tickets");

// Detail E-Ticket → data: TicketDetailResponse
// GET /api/tickets/issued-detail?ticketCode=<uuid>&userEmail=<email>
export const getTicketDetail = (ticketCode, userEmail) => {
  const email =
    userEmail ||
    localStorage.getItem("email") ||
    localStorage.getItem("userEmail");

  const queryParams = new URLSearchParams({ ticketCode });
  if (email) {
    queryParams.append("userEmail", email);
  }

  return apiFetch(`/api/tickets/issued-detail?${queryParams.toString()}`);
};

// Daftar tiket per order (eliminasi N+1 calls)
// GET /api/tickets/by-order/<orderId>
export const getTicketsByOrder = (orderId) =>
  apiFetch(`/api/tickets/by-order/${orderId}`);

// Riwayat transaksi → data: [{orderId,orderNumber,eventTitle,ticketTierName,quantity,totalAmount,status,createdAt,expiredAt}]
// GET /api/transactions/history
export const getTransactionHistory = () =>
  apiFetch("/api/transactions/history");

// Scan tiket (untuk admin/EO) → data: {status: "TIKET_VALID"|"TIKET_SUDAH_DIPAKAI", message}
// POST /api/tickets/scan  body: { ticketCode: "<uuid>" }
export const scanTicket = (ticketCode) =>
  apiFetch("/api/tickets/scan", {
    method: "POST",
    body: JSON.stringify({ ticketCode }),
  });

// Kirim ulang e-ticket ke email customer.
// Endpoint ini BELUM terkonfirmasi ada di backend (tidak ada di API.md), jadi
// fungsi ini mencoba dua path lalu melempar error kalau keduanya gagal —
// pemanggil wajib menampilkan kegagalan, bukan mengklaim email terkirim.
export const sendTicketEmail = async ({
  email,
  ticketCode,
  orderId,
  ticketIds,
} = {}) => {
  if (!email || !ticketCode) {
    const err = new Error("Email atau kode tiket tidak tersedia");
    err.status = 0;
    throw err;
  }

  const payload = { email, ticketCode };
  if (orderId) payload.orderId = orderId;
  if (Array.isArray(ticketIds) && ticketIds.length > 0) {
    payload.ticketIds = ticketIds;
  }

  const attempts = ["/api/tickets/send-email"];
  if (orderId) {
    attempts.push(`/api/orders/${encodeURIComponent(orderId)}/resend-ticket`);
  }

  let lastError = null;

  for (const path of attempts) {
    try {
      const res = await apiFetch(path, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      return { ...res, _endpoint: path };
    } catch (error) {
      lastError = error;
      // Hanya coba endpoint berikutnya kalau path ini memang tidak ada.
      const notFound = error?.status === 404 || error?.status === 405;
      if (!notFound) break;
    }
  }

  throw lastError || new Error("Gagal mengirim e-ticket");
};

export const ticketService = {
  getMyTickets,
  getMyTicketsAuth,
  getTicketDetail,
  getTicketsByOrder,
  getTransactionHistory,
  scanTicket,
  sendTicketEmail,
};
