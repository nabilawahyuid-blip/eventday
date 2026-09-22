// src/services/adminSettingsService.js
// Admin Settings — GET/PUT /api/admin/settings/general + POST /api/admin/settings/upload-logo
// Audit log terpisah di adminAuditService.js (rev.14: /api/admin/audit-logs)
import { apiFetch } from './api';

// 1. Mengambil pengaturan umum sistem — GET /api/admin/settings/general
export const getAdminGeneralSettings = async () => {
  return await apiFetch('/api/admin/settings/general');
};

// 2. Memperbarui pengaturan umum sistem (nama app, admin fee, kedaluwarsa order)
export const updateAdminGeneralSettings = async (settingsData) => {
  return await apiFetch('/api/admin/settings/general', {
    method: 'PUT',
    body: JSON.stringify(settingsData),
  });
};

// 3. Mengunggah logo resmi platform (maksimal 5MB) — POST /api/admin/settings/upload-logo
export const uploadAdminPlatformLogo = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return await apiFetch('/api/admin/settings/upload-logo', {
    method: 'POST',
    body: formData, // Menggunakan FormData untuk unggah file multipart
  });
};

export const adminSettingsService = {
  getAdminGeneralSettings,
  updateAdminGeneralSettings,
  uploadAdminPlatformLogo,
};