import { apiFetch } from "./api";

// =====================================================
// GET SEMUA EVENT ORGANIZER
// GET /api/organizer/events
// =====================================================

export const getOrganizerEvents = async () => {
  return apiFetch("/api/organizer/events");
};

// =====================================================
// GET DRAFT EVENT ORGANIZER
// GET /api/organizer/events/draft
// =====================================================

export const getOrganizerDraftEvents = async () => {
  return apiFetch("/api/organizer/events/draft");
};

// =====================================================
// CREATE EVENT
// POST /api/organizer/events
// =====================================================

export const createOrganizerEvent = async (data) => {
  return apiFetch("/api/organizer/events", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// =====================================================
// UPDATE EVENT
// PUT /api/organizer/events/update
// =====================================================

export const updateOrganizerEvent = async (data) => {
  return apiFetch("/api/organizer/events/update", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

// =====================================================
// PUBLISH EVENT
// POST /api/organizer/events/publish
// =====================================================

export const publishOrganizerEvent = async (data) => {
  return apiFetch("/api/organizer/events/publish", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

// =====================================================
// UPLOAD BANNER EVENT
// POST /api/organizer/events/banner
// Content-Type: multipart/form-data
// =====================================================

export const uploadOrganizerEventBanner = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch("/api/organizer/events/banner", {
    method: "POST",
    body: formData,
  });
};

// =====================================================
// GET SALES SUMMARY EVENT
// GET /api/organizer/events/{eventId}/sales-summary
// =====================================================

export const getOrganizerEventSalesSummary = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID wajib diisi");
  }

  return apiFetch(
    `/api/organizer/events/${encodeURIComponent(
      eventId
    )}/sales-summary`
  );
};

// =====================================================
// GET PUBLIC EVENT DETAIL
// GET /api/events/{eventId}
// =====================================================

export const getPublicEventDetail = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID wajib diisi");
  }

  return apiFetch(
    `/api/events/${encodeURIComponent(eventId)}`
  );
};

// =====================================================
// GET EVENT DETAIL
// Alias untuk getPublicEventDetail
// Bisa digunakan di halaman Detail Event Organizer
// =====================================================

export const getOrganizerEventDetail = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID wajib diisi");
  }

  return getPublicEventDetail(eventId);
};