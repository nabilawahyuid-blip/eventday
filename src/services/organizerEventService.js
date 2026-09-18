import { apiFetch } from "./api";

export const getOrganizerEvents = async () =>
  apiFetch("/api/organizer/events");

export const getOrganizerDraftEvents = async () =>
  apiFetch("/api/organizer/events/draft");

export const createOrganizerEvent = async (data) =>
  apiFetch("/api/organizer/events", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const updateOrganizerEvent = async (data) =>
  apiFetch("/api/organizer/events/update", {
    method: "PUT",
    body: JSON.stringify(data),
  });

export const publishOrganizerEvent = async (data) =>
  apiFetch("/api/organizer/events/publish", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const getOrganizerEventSalesSummary = async (eventId) =>
  apiFetch(
    `/api/organizer/events/${encodeURIComponent(eventId)}/sales-summary`
  );

export const getPublicEventDetail = async (eventId) =>
  apiFetch(
    `/api/events/${encodeURIComponent(eventId)}`
  );