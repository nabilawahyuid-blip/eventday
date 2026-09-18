// src/services/adminDashboardService.js
import { apiFetch } from './api';

// 1. Mengambil metrik utama platform
export const getAdminDashboardMetrics = async () => {
  return await apiFetch('/api/admin/dashboard/metrics');
};

// 2. Mengambil daftar event terbaru di platform
export const getAdminRecentEvents = async () => {
  return await apiFetch('/api/admin/dashboard/recent-events');
};

// 3. Alias untuk jaga-jaga
export const getAdminEvents = async () => {
  return await getAdminRecentEvents();
};

// 4. Mengambil daftar transaksi pesanan tiket global terkini
export const getAdminRecentTransactions = async () => {
  return await apiFetch('/api/admin/dashboard/recent-transactions');
};