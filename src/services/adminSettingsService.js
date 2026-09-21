// src/services/adminSettingsService.js
import { apiFetch } from './api';

// 1. Mengambil jejak log aktivitas admin — GET /api/admin/audit-logs?page&size
export const getAdminAuditLogs = async (page = 0, size = 20) => {
  return await apiFetch(`/api/admin/audit-logs?page=${page}&size=${size}`);
};

// 2. Mengambil pengaturan umum sistem — GET /api/admin/settings/general
export const getAdminGeneralSettings = async () => {
  return await apiFetch('/api/admin/settings/general');
};

// 3. Memperbarui pengaturan umum sistem (nama app, admin fee, kedaluwarsa order)
export const updateAdminGeneralSettings = async (settingsData) => {
  return await apiFetch('/api/admin/settings/general', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
};

// 4. Ekspor data log audit format JSON — GET /api/admin/audit-logs/export
export const exportAdminAuditLogsJson = async () => {
  return await apiFetch('/api/admin/audit-logs/export');
};

// 5. Ekspor data audit trail format string CSV — GET /api/admin/audit-logs/export/csv
export const exportAdminAuditLogsCsv = async () => {
  return await apiFetch('/api/admin/audit-logs/export/csv');
};

// 6. Mengunggah logo resmi platform (maksimal 5MB) — POST /api/admin/settings/upload-logo
export const uploadAdminPlatformLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await apiFetch('/api/admin/settings/upload-logo', {
    method: 'POST',
    body: formData, // Menggunakan FormData untuk unggah file multipart
  });
};