// src/services/adminDashboardService.js
import { apiFetch } from './api';

// 1. Mengambil metrik utama platform (omzet, total event, user, tiket terjual)
export const getAdminDashboardMetrics = async () => {
  return await apiFetch('/admin/dashboard/metrics');
};

// 2. Mengambil daftar event terbaru di platform
export const getAdminRecentEvents = async () => {
  return await apiFetch('/admin/dashboard/recent-events');
};

// 3. Mengambil daftar transaksi pesanan tiket global terkini
export const getAdminRecentTransactions = async () => {
  return await apiFetch('/admin/dashboard/recent-transactions');
};

// 4. Alias untuk EventManagement (sama dengan recent-events, sementara sampai ada endpoint /admin/events)
export const getAdminEvents = async () => {
  return await apiFetch('/admin/dashboard/recent-events');
};

// Backward-compatible aliases (branch lain mungkin masih pakai nama lama)
export const getRecentTransactions = getAdminRecentTransactions;