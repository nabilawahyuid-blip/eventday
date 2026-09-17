// src/services/adminPayoutService.js
import { apiFetch } from './api';

// 1. Mengambil daftar permohonan pencairan dana (bisa difilter berdasarkan status)[cite: 2]
export const getAdminPayouts = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  return await apiFetch(`/admin/payouts${query}`);
};

// 2. Mengambil rincian lengkap detail payout[cite: 2]
export const getAdminPayoutDetail = async (id) => {
  return await apiFetch(`/admin/payouts/${id}`);
};

// 3. Menyetujui atau menolak payout (Approve/Reject) + catatan admin[cite: 2]
export const updateAdminPayoutStatus = async (id, statusData) => {
  // Format body: { status: "APPROVED" / "REJECTED", adminNote: "..." }[cite: 2]
  return await apiFetch(`/admin/payouts/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

// 4. Mengambil tautan dokumen bukti rekonsiliasi transfer[cite: 2]
export const getAdminPayoutReconciliationDoc = async (id) => {
  return await apiFetch(`/admin/payouts/${id}/documents/reconciliation`);
};