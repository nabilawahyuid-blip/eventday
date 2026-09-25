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
// UPDATE EVENT (PERBAIKAN)
// PUT /api/organizer/events/update/{eventId}
// =====================================================

export const updateOrganizerEvent = async (eventId, data) => {
  if (!eventId) {
    throw new Error("Event ID wajib diisi untuk memperbarui event");
  }

  // Menggabungkan eventId ke dalam payload body
  const payload = {
    eventId,
    ...data,
  };

  return apiFetch(
    `/api/organizer/events/update/${encodeURIComponent(eventId)}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    }
  );
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
// =====================================================

export const getOrganizerEventDetail = async (eventId) => {
  if (!eventId) {
    throw new Error("Event ID wajib diisi");
  }

  return getPublicEventDetail(eventId);
};