// src/services/adminTicketService.js
// Admin Ticket Management — API.md §17.11 (AdminTicketController `/api/admin/tickets`)
// Auth: ADMIN. Response ApiResponse {msg, status, data}.
// List: data = Page {content, page, size, totalElements, totalPages}
import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// ==========================================
// LIST TICKETS (paginated + filter)
// GET /api/admin/tickets?eventId=&status=&userId=&dateFrom=&dateTo=&page=0&size=20
// status: UNREDEEMED/USED/EXPIRED/REFUNDED
// ==========================================
export const getAdminTickets = async (params = {}) => {
  const {
    eventId = "",
    status = "",
    userId = "",
    dateFrom = "",
    dateTo = "",
    page = 0,
    size = 20,
  } = params;

  return apiFetch(`/api/admin/tickets${toQueryString({ eventId, status, userId, dateFrom, dateTo, page, size })}`);
};

// ==========================================
// DETAIL TICKET
// GET /api/admin/tickets/{id} → AdminTicketResponse
// ==========================================
export const getAdminTicketDetail = async (id) => {
  if (!id) throw new Error("ID tiket wajib diisi.");
  return apiFetch(`/api/admin/tickets/${encodeURIComponent(id)}`);
};

// ==========================================
// GENERATE TIKETS DARI ORDER
// POST /api/admin/tickets → 201 List<AdminTicketResponse> + audit
// Body: {orderId: uuid} — generate dari order_attendees terkait
// ==========================================
export const generateAdminTickets = async (orderId) => {
  if (!orderId) throw new Error("orderId wajib diisi.");
  return apiFetch("/api/admin/tickets/generate", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
};

// ==========================================
// REVOKE TICKET (status → REVOKED)
// PATCH /api/admin/tickets/{id}/revoke + audit REVOKE_TICKET
// ==========================================
export const revokeAdminTicket = async (id) => {
  if (!id) throw new Error("ID tiket wajib diisi.");
  return apiFetch(`/api/admin/tickets/${encodeURIComponent(id)}/revoke`, {
    method: "PATCH",
  });
};

// ==========================================
// CHECK-IN TICKET (checkInStatus → USED, checkInAt = now)
// PATCH /api/admin/tickets/{id}/checkin + audit CHECKIN_TICKET
// ==========================================
export const checkinAdminTicket = async (id) => {
  if (!id) throw new Error("ID tiket wajib diisi.");
  return apiFetch(`/api/admin/tickets/${encodeURIComponent(id)}/checkin`, {
    method: "PATCH",
  });
};

// ==========================================
// INVENTORY PER EVENT (ringkasan kapasitas per tier)
// GET /api/admin/tickets/inventory?eventId= → daftar stok per event/tipe
// (rev.14: tanpa path param; filter eventId opsional via query)
// → {eventId, eventTitle, tiers:[{tierId,tierName,totalQuota,availableQuota,soldCount}], totalCapacity, totalSold}
// ==========================================
export const getAdminTicketInventory = async (eventId = "") => {
  const query = eventId
    ? toQueryString({ eventId })
    : "";
  return apiFetch(`/api/admin/tickets/inventory${query}`);
};

// ==========================================
// EXPORT CSV (binary download)
// GET /api/admin/tickets/export?eventId=&status=&dateFrom=&dateTo=
// ==========================================
export const exportAdminTickets = async (params = {}) => {
  return downloadFromEndpoint(
    "/api/admin/tickets/export",
    params,
    "tickets.csv"
  );
};

export const adminTicketService = {
  getAdminTickets,
  getAdminTicketDetail,
  generateAdminTickets,
  revokeAdminTicket,
  checkinAdminTicket,
  getAdminTicketInventory,
  exportAdminTickets,
};
