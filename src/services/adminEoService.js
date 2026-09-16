// src/services/adminEoService.js
import { apiFetch } from './api';

// 1. Mengambil daftar pengajuan akun EO (bisa difilter dengan status misal: UNVERIFIED)[cite: 2]
export const getAdminEoApplications = async (status = '') => {
  const query = status ? `?status=${status}` : '';
  return await apiFetch(`/admin/eo-applications${query}`);
};

// 2. Mengambil detail lengkap pengajuan EO berdasarkan ID (legalitas, NPWP, bank)[cite: 2]
export const getAdminEoDetail = async (id) => {
  return await apiFetch(`/admin/eo-applications/${id}`);
};

// 3. Menyetujui atau menolak pengajuan EO (Approve/Reject) + alasan penolakan[cite: 2]
export const updateAdminEoStatus = async (id, statusData) => {
  // Format body: { status: "VERIFIED" / "REJECTED", rejectionReason: "..." }[cite: 2]
  return await apiFetch(`/admin/eo-applications/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(statusData),
  });
};

// 4. Mengakses link dokumen akta perusahaan mitra organizer[cite: 2]
export const getAdminEoCompanyDeed = async (id) => {
  return await apiFetch(`/admin/eo-applications/${id}/documents/company-deed`);
};