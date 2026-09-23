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
  getTransactionHistory,
  scanTicket,
};
