// src/services/ticketService.js
// Tiket — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Backend: /api/tickets/* (tanpa /v1, Vite proxy skip rewrite untuk /api/tickets)
import { apiFetch } from "./api";

// Daftar tiket saya → data: [TicketItem...]
// GET /api/tickets/my-tickets?userEmail=<email>
export const getMyTickets = (userEmail) =>
  apiFetch(`/api/tickets/my-tickets?userEmail=${encodeURIComponent(userEmail)}`);

// Detail E-Ticket → data: TicketDetailResponse
// GET /api/tickets/issued-detail?ticketCode=<uuid>
export const getTicketDetail = (ticketCode) =>
  apiFetch(`/api/tickets/issued-detail?ticketCode=${encodeURIComponent(ticketCode)}`);

// Scan tiket (untuk admin/EO) → data: {status: "TIKET_VALID"|"TIKET_SUDAH_DIPAKAI", message}
// POST /api/tickets/scan  body: { ticketCode: "<uuid>" }
export const scanTicket = (ticketCode) =>
  apiFetch("/api/tickets/scan", {
    method: "POST",
    body: JSON.stringify({ ticketCode }),
  });

export const ticketService = {
  getMyTickets,
  getTicketDetail,
  scanTicket,
};
