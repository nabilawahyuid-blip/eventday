// src/services/adminSettingsService.js
import { apiFetch } from './api';

// 1. Mengambil jejak log aktivitas admin[cite: 2]
export const getAdminAuditLogs = async (page = 0, size = 20) => {
  return await apiFetch(`/admin/audit-logs?page=${page}&size=${size}`);
};

// 2. Mengambil pengaturan umum sistem[cite: 2]
export const getAdminGeneralSettings = async () => {
  return await apiFetch('/admin/settings/general');
};

// 3. Memperbarui pengaturan umum sistem (nama app, admin fee, kedaluwarsa order)[cite: 2]
export const updateAdminGeneralSettings = async (settingsData) => {
  return await apiFetch('/admin/settings/general', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
};

// 4. Ekspor data log audit format JSON[cite: 2]
export const exportAdminAuditLogsJson = async () => {
  return await apiFetch('/admin/audit-logs/export');
};

// 5. Ekspor data audit trail format string CSV[cite: 2]
export const exportAdminAuditLogsCsv = async () => {
  return await apiFetch('/admin/audit-logs/export/csv');
};

// 6. Mengunggah logo resmi platform (maksimal 5MB)[cite: 2]
export const uploadAdminPlatformLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await apiFetch('/admin/settings/upload-logo', {
    method: 'POST',
    body: formData, // Menggunakan FormData untuk unggah file multipart
  });
};