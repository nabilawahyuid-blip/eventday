// src/services/organizerEventService.js

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
// GET SALES SUMMARY EVENT
// GET /api/organizer/events/{id}/sales-summary
// =====================================================

export const getOrganizerEventSalesSummary = async (
  eventId
) => {
  return apiFetch(
    `/api/organizer/events/${encodeURIComponent(
      eventId
    )}/sales-summary`
  );
};