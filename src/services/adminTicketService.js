// src/services/adminTicketService.js
// Admin Ticket Management — API.md §17.11 (AdminTicketController `/api/admin/tickets`)
// Auth: ADMIN. Response ApiResponse {msg, status, data}.
// List: data = Page {content, page, size, totalElements, totalPages}
import { apiFetch, toQueryString } from "./api";

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
// GENERATE TICKETS DARI ORDER
// POST /api/admin/tickets/generate → 201 List<AdminTicketResponse> + audit
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
// REVOKE TICKET (status → CANCELLED)
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
// GET /api/admin/tickets/inventory/{eventId}
// → {eventId, eventTitle, tiers:[{tierId,tierName,totalQuota,availableQuota,soldCount}], totalCapacity, totalSold}
// ==========================================
export const getAdminTicketInventory = async (eventId) => {
  if (!eventId) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/tickets/inventory/${encodeURIComponent(eventId)}`);
};

// ==========================================
// EXPORT CSV (binary download)
// GET /api/admin/tickets/export?eventId=&status=&dateFrom=&dateTo=
// ==========================================
export const exportAdminTickets = async (params = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/tickets/export${toQueryString(params)}`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Export gagal (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "tickets.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
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
