// src/services/homeSearchService.js
// MODUL 01 Home & Search — publik, tanpa JWT (tetap kirim credentials:'include' aman)
import { apiFetch, toQueryString } from "./api";

// Hero Banner Slider — max 5 featured event
export const getHeroBanners = () => apiFetch("/home/hero-banner");

// Event Cards Utama (Paginated) — size = jumlah data per halaman
export const getHomeEventCards = (page = 0, size = 12) =>
  apiFetch(`/home/event-card?page=${page}&size=${size}`);

// List Lokasi Unik (opsi filter)
export const getLocations = () => apiFetch("/home/locations");

// Pencarian Event Multi-Filter
export const searchEvents = (params = {}) =>
  apiFetch(`/search/results${toQueryString(params)}`);

// List Lokasi Unik untuk filter search
export const getSearchLocations = () => apiFetch("/search/locations");

// List Kategori Unik untuk filter search
export const getSearchCategories = () => apiFetch("/search/categories");
export const getCategories = getSearchCategories;

export const homeSearchService = {
  getHeroBanners,
  getHomeEventCards,
  getLocations,
  searchEvents,
  getSearchLocations,
  getSearchCategories,
  getCategories,
};