// src/services/ticketService.js
// Tiket — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Backend: /api/tickets/* (tanpa /v1, Vite proxy skip rewrite untuk /api/tickets)
import { apiFetch } from "./api";

// Daftar tiket saya → data: [TicketItem...]
// GET /api/tickets/my-tickets?userEmail=<email>
// Cookie access_token terkirim otomatis via apiFetch (credentials:'include').
export const getMyTickets = (userEmail) => {
  const email = (userEmail || "").trim();
  if (!email) {
    return Promise.reject(
      Object.assign(new Error("Email pengguna wajib diisi."), { status: 400 }),
    );
  }
  return apiFetch(
    `/api/tickets/my-tickets?userEmail=${encodeURIComponent(email)}`,
  );
};

// Daftar tiket saya (auth-based, tanpa param) → data: [TicketItem...]
// GET /api/tickets/my-tickets
export const getMyTicketsAuth = () =>
  apiFetch("/api/tickets/my-tickets");

// Detail E-Ticket → data: TicketDetailResponse
// GET /api/tickets/issued-detail?ticketCode=<uuid>&userEmail=<email>
export const getTicketDetail = (ticketCode, userEmail) => {
  const code = (ticketCode || "").trim();
  if (!code) {
    return Promise.reject(
      Object.assign(new Error("ticketCode wajib diisi."), { status: 400 }),
    );
  }
  const email = (
    userEmail ||
    localStorage.getItem("email") ||
    localStorage.getItem("userEmail") ||
    ""
  ).trim();

  const queryParams = new URLSearchParams({ ticketCode: code });
  // Jangan kirim userEmail kosong/null — backend bisa balas 400.
  if (email && email !== "null" && email !== "undefined") {
    queryParams.append("userEmail", email);
  }

  return apiFetch(`/api/tickets/issued-detail?${queryParams.toString()}`);
};

// Daftar tiket per order (eliminasi N+1 calls)
// GET /api/tickets/by-order/<orderId>
export const getTicketsByOrder = (orderId) => {
  const id = (orderId || "").trim();
  if (!id) {
    return Promise.reject(
      Object.assign(new Error("orderId wajib diisi."), { status: 400 }),
    );
  }
  return apiFetch(`/api/tickets/by-order/${encodeURIComponent(id)}`);
};

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

export const ticketService = {
  getMyTickets,
  getMyTicketsAuth,
  getTicketDetail,
  getTicketsByOrder,
  getTransactionHistory,
  scanTicket,
};
