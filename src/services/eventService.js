// src/services/eventService.js
// GET /api/v1/events, /events/featured, /events/{id} — butuh JWT (Cookie access_token via credentials:'include')
import { apiFetch, toQueryString } from "./api";

// List Event Customer dengan Filter (Paginated)
export const getEvents = (params = {}) =>
  apiFetch(`/events${toQueryString(params)}`);

// Event Featured — hero slider (max 3)
export const getFeaturedEvents = () => apiFetch("/events/featured");

// Detail Event Berdasarkan ID — termasuk tickets, lineup, facilities
export const getEventDetail = (id) => apiFetch(`/events/${id}`);

export const eventService = {
  getEvents,
  getFeaturedEvents,
  getEventDetail,
};