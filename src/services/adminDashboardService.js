// src/services/adminDashboardService.js
import { apiFetch } from './api';
import { getAdminEventsTolerant } from './adminEventService';
import { getAdminTransactionsTolerant } from './adminTransactionService';

// 1. Mengambil metrik utama platform
export const getAdminDashboardMetrics = async () => {
  return await apiFetch('/api/admin/dashboard/metrics');
};

// 2. Mengambil daftar event terbaru di platform
// Fallback toleran: bila BE 400 "No enum constant Category.X" (row DB
// berkategori "Musik"/"ENTERTAINMENT"), ambil lewat list paginated
// yang melewati halaman busuk agar dashboard tetap tampil sebagian.
export const getAdminRecentEvents = async () => {
  try {
    return await apiFetch('/api/admin/dashboard/recent-events');
  } catch (err) {
    const msg = String(err?.data?.msg || err?.message || "");
    if (!/no enum constant.*category\./i.test(msg)) throw err;
    const tolerant = await getAdminEventsTolerant({ page: 0, size: 20 });
    const content = tolerant?.data?.content || [];
    return { msg: tolerant?.msg, status: 200, data: content.slice(0, 6), _partial: true };
  }
};

// 3. Alias untuk jaga-jaga
export const getAdminEvents = async () => {
  return await getAdminRecentEvents();
};

// 4. Mengambil daftar transaksi pesanan tiket global terkini
// Fallback sama: transaksi ikut 400 bila join event-nya kena enum busuk.
export const getAdminRecentTransactions = async () => {
  try {
    return await apiFetch('/api/admin/dashboard/recent-transactions');
  } catch (err) {
    const msg = String(err?.data?.msg || err?.message || "");
    if (!/no enum constant.*category\./i.test(msg)) throw err;
    const tolerant = await getAdminTransactionsTolerant({ page: 0, size: 20 });
    const content = tolerant?.data?.content || [];
    return { msg: tolerant?.msg, status: 200, data: content.slice(0, 20), _partial: true };
  }
};