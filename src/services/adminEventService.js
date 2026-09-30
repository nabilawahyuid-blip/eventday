// src/services/adminEventService.js
// Admin Event Management — API.md §17.11 (AdminEventController `/api/admin/events`)
// Auth: ADMIN (cookie access_token via credentials:include + Bearer fallback di api.js)
// Response dibungkus ApiResponse {msg, status, data}
// List/detail: data = Page {content, page, size, totalElements, totalPages} / AdminEventResponse
import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// ==========================================
// LIST EVENTS (paginated + filter)
// GET /api/admin/events?status=&category=&organizerId=&dateFrom=&dateTo=&search=&page=0&size=20
// status: DRAFT/PUBLISHED/CANCELLED/DELETED — kosong = semua
// category: hanya 4 enum valid BE (MUSIC_FESTIVAL/CONFERENCE/EXHIBITION/CULINARY)
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
// APPROVE EVENT
// PATCH /api/admin/events/{id}/approve
// Transisi: PENDING_APPROVAL → PUBLISHED
// ==========================================
export const approveAdminEvent = async (id) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}/approve`, {
    method: "PATCH",
  });
};

// ==========================================
// REJECT EVENT (dengan alasan opsional)
// PATCH /api/admin/events/{id}/reject
// Transisi: PENDING_APPROVAL → REJECTED
// ==========================================
export const rejectAdminEvent = async (id, rejectionReason = null) => {
  if (!id) throw new Error("ID event wajib diisi.");
  return apiFetch(`/api/admin/events/${encodeURIComponent(id)}/reject`, {
    method: "PATCH",
    body: JSON.stringify({ rejectionReason }),
  });
};

// ==========================================
// UPDATE STATUS EVENT (legacy — rev.14 memakai approve/reject)
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
  return downloadFromEndpoint(
    "/api/admin/events/export",
    params,
    "events.csv"
  );
};

// Backend kadang 400 "No enum constant ...Category.X" karena ada row
// events.category di DB yang tidak cocok enum Java (mis. "Musik",
// "ENTERTAINMENT"). Satu row busuk membuat satu halaman gagal total.
// Helper ini mendeteksi error tersebut agar service bisa fallback
// halaman-per-halaman dan melewati halaman yang busuk.
export const isCategoryEnumError = (err) => {
  const msg = String(err?.data?.msg || err?.message || "");
  return /no enum constant.*category\./i.test(msg);
};

const extractPageContent = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return { content: raw, totalPages: 1 };
  if (Array.isArray(raw?.content))
    return { content: raw.content, totalPages: raw.totalPages ?? 1 };
  return { content: [], totalPages: 1 };
};

// Versi toleran: coba bulk dulu, kalau gagal karena enum Category,
// ambil halaman kecil satu-per-satu dan lewati halaman yang busuk.
// Mengembalikan bentuk Page yang sama {content,...} + flag _partial.
export const getAdminEventsTolerant = async (params = {}) => {
  const { page = 0, size = 20, ...filters } = params;
  try {
    return await getAdminEvents({ ...filters, page, size });
  } catch (err) {
    if (!isCategoryEnumError(err)) throw err;
  }

  // Fallback: scan halaman kecil, kumpulkan yang berhasil.
  const CHUNK = 10;
  const MAX_PAGES = 20;
  const collected = [];
  let skippedPages = 0;
  for (let p = 0; p < MAX_PAGES; p++) {
    try {
      const res = await getAdminEvents({ ...filters, page: p, size: CHUNK });
      const { content, totalPages } = extractPageContent(res);
      collected.push(...content);
      if (p + 1 >= (totalPages || 1)) break;
      if (content.length === 0) break;
    } catch (err) {
      if (isCategoryEnumError(err)) {
        skippedPages += 1;
        continue;
      }
      throw err;
    }
  }
  return {
    msg: "Data sebagian (beberapa halaman dilewati karena kategori tidak valid di DB)",
    status: 200,
    data: { content: collected, page: 0, size: collected.length, totalElements: collected.length, totalPages: 1 },
    _partial: true,
    _skippedPages: skippedPages,
  };
};

export const adminEventService = {
  getAdminEvents,
  getAdminEventsTolerant,
  isCategoryEnumError,
  getAdminEventDetail,
  createAdminEvent,
  updateAdminEvent,
  updateAdminEventStatus,
  approveAdminEvent,
  rejectAdminEvent,
  deleteAdminEvent,
  getAdminEventSales,
  exportAdminEvents,
};
