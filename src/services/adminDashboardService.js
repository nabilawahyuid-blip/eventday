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