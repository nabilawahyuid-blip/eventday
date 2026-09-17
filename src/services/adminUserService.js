// src/services/adminUserService.js
import { apiFetch } from './api';

// 1. Mengambil daftar master user platform (bisa difilter berdasarkan role: CUSTOMER/ORGANIZER/ADMIN)[cite: 2]
export const getAdminUsers = async (role = '') => {
  const query = role ? `?role=${role}` : '';
  return await apiFetch(`/admin/users${query}`);
};

// 2. Mengambil rincian biodata profil & status akun user berdasarkan ID[cite: 2]
export const getAdminUserDetail = async (id) => {
  return await apiFetch(`/admin/users/${id}`);
};

// 3. Memperbarui status akun pengguna (ACTIVE / INACTIVE / SUSPENDED)[cite: 2]
export const updateAdminUserStatus = async (id, status) => {
  return await apiFetch(`/admin/users/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
};

// 4. Menangguhkan akun pengguna secara langsung menjadi SUSPENDED[cite: 2]
export const suspendAdminUser = async (id) => {
  return await apiFetch(`/admin/users/${id}/suspend`, {
    method: 'PATCH',
  });
};