// src/services/eventService.js
// GET /api/events, /api/events/featured, /api/events/{id} — butuh JWT (Cookie access_token via credentials:'include')
import { apiFetch, toQueryString } from "./api";

// List Event Customer dengan Filter (Paginated)
export const getEvents = (params = {}) =>
  apiFetch(`/api/events${toQueryString(params)}`);

// Event Featured — hero slider (max 3)
export const getFeaturedEvents = () => apiFetch("/api/events/featured");

// Detail Event Berdasarkan ID — termasuk tickets, lineup, facilities
export const getEventDetail = (id) => apiFetch(`/api/events/${id}`);

export const eventService = {
  getEvents,
  getFeaturedEvents,
  getEventDetail,
};
