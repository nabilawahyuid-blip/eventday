// src/services/adminEventService.js
// Admin Event Management — API.md §17.11 (AdminEventController `/api/admin/events`)
// Auth: ADMIN (cookie access_token via credentials:include + Bearer fallback di api.js)
// Response dibungkus ApiResponse {msg, status, data}
// List/detail: data = Page {content, page, size, totalElements, totalPages} / AdminEventResponse
import { apiFetch, toQueryString } from "./api";

// ==========================================
// LIST EVENTS (paginated + filter)
// GET /api/admin/events?status=&category=&organizerId=&dateFrom=&dateTo=&search=&page=0&size=20
// status: DRAFT/PUBLISHED/CANCELLED/DELETED — kosong = semua
// category: MUSIC_FESTIVAL/SEMINAR/dll (BE pakai underscore)
// ==========================================
export const getAdminEvents = async (params = {}) => {
  const {
    status = "",
    category = "",
    organizerId = "",
    dateFrom = "",
    dateTo = "",
    search = "",
    page = 0,
    size = 20,
  } = params;

  return apiFetch(`/api/admin/events${toQueryString({ status, category, organizerId, dateFrom, dateTo, search, page, size })}`);
};

// ==========================================
// DETAIL EVENT
// GET /api/admin/events/{id} → AdminEventResponse + ticketTiers[] + salesSummary
// ==========================================
export const getAdminEventDetail = async (id) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}`);
};

// ==========================================
// CREATE EVENT
// POST /api/admin/events → 201 AdminEventResponse + audit CREATE_EVENT
// Body CreateEventRequest: {title, description, category, location, venueName,
//   eventDate (ISO datetime), bannerUrl?, facilities?[], ticketTiers?[{name,price,quota}]}
// ==========================================
export const createAdminEvent = async (payload) => {
  if (!payload?.title) throw new Error("Judul event wajib diisi.");
  return apiFetch("/api/admin/events", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

// ==========================================
// UPDATE EVENT
// PUT /api/admin/events/{id} → 200 AdminEventResponse + audit UPDATE_EVENT
// Body sama dengan create
// ==========================================
export const updateAdminEvent = async (id, payload) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

// ==========================================
// UPDATE STATUS EVENT
// PATCH /api/admin/events/{id}/status
// Body: {status: DRAFT/PUBLISHED/CANCELLED/DELETED, rejectionReason?}
// ==========================================
export const updateAdminEventStatus = async (id, status, rejectionReason = null) => {
  if (!id) throw new Error("ID event wajib diisi.");
  if (!status) throw new Error("Status event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, rejectionReason }),
  });
};

// ==========================================
// DELETE EVENT (soft delete → status DELETED)
// DELETE /api/admin/events/{id} + audit DELETE_EVENT
// ==========================================
export const deleteAdminEvent = async (id) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
};

// ==========================================
// SALES SUMMARY PER EVENT
// GET /api/admin/events/{id}/sales → AdminEventSalesResponse
// {totalOrders, totalTicketsSold, totalRevenuePaid, totalRevenuePending, salesByTier}
// ==========================================
export const getAdminEventSales = async (id) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}/sales`);
};

// ==========================================
// EXPORT CSV (binary download, bukan JSON!)
// GET /api/admin/events/export?status=&category=&... → text/csv attachment
// Backend: Content-Type text/plain + Content-Disposition attachment events.csv
// Wajib pakai blob — apiFetch (JSON) tidak cocok, jadi fetch manual.
// ==========================================
export const exportAdminEvents = async (params = {}) => {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/events/export${toQueryString(params)}`, {
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
  a.download = "events.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const adminEventService = {
  getAdminEvents,
  getAdminEventDetail,
  createAdminEvent,
  updateAdminEvent,
  updateAdminEventStatus,
  deleteAdminEvent,
  getAdminEventSales,
  exportAdminEvents,
};
