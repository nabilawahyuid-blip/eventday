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

// Kontrak backend rev.14: create/update = MULTIPART (`event` JSON part +
// `file` banner opsional). JSON polos → 400/500.
// Kompatibilitas: backend lama (pra-rev.14) hanya terima JSON — bila
// multipart ditolak ("Content-Type ... not supported"), fallback ke JSON
// tanpa file (flag _bannerSkipped).
const toEventFormData = (payload, file = null) => {
  const formData = new FormData();
  formData.append(
    "event",
    new Blob([JSON.stringify(payload)], { type: "application/json" })
  );
  if (file) {
    formData.append("file", file);
  }
  return formData;
};

const isMultipartRejected = (err) => {
  const msg = err?.data?.msg || err?.message || "";
  return /content-type.*not supported/i.test(msg);
};

// ==========================================
// CREATE EVENT
// POST /api/admin/events → 201 AdminEventResponse + audit CREATE_EVENT
// payload = CreateEventRequest {title, description, category, location,
//   venueName, eventDate (ISO datetime), bannerUrl?, facilities?[],
//   ticketTiers?[{name,price,quota}]}, file = gambar banner opsional
// rev.14: admin create → status langsung PUBLISHED.
// ==========================================
export const createAdminEvent = async (payload, file = null) => {
  if (!payload?.title) throw new Error("Judul event wajib diisi.");
  try {
    // Selalu multipart (backend rev.14 wajib multipart; file opsional)
    return await apiFetch("/api/admin/events", {
      method: "POST",
      body: toEventFormData(payload, file),
    });
  } catch (err) {
    if (!isMultipartRejected(err)) throw err;
    // Backend lama hanya menerima JSON → fallback tanpa file
    console.warn("Backend menolak multipart, fallback ke JSON tanpa file.");
    const res = await apiFetch("/api/admin/events", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    res._bannerSkipped = true;
    return res;
  }
};

// ==========================================
// UPDATE EVENT
// PUT /api/admin/events/{id} → 200 AdminEventResponse + audit UPDATE_EVENT
// Param sama dengan create (multipart wajib; file opsional).
// ==========================================
export const updateAdminEvent = async (id, payload, file = null) => {
  if (!id) throw new Error("ID event wajib diisi.");
  const path = `/api/admin/events/${encodeURIComponent(id)}`;
  try {
    return await apiFetch(path, {
      method: "PUT",
      body: toEventFormData(payload, file),
    });
  } catch (err) {
    if (!isMultipartRejected(err)) throw err;
    console.warn("Backend menolak multipart, fallback ke JSON tanpa file.");
    const res = await apiFetch(path, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    if (file) res._bannerSkipped = true;
    return res;
  }
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
