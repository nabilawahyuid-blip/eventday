// src/services/profileService.js
// User Profile, Change Password, Logout, Transaction History
// Backend: /api/user/* + /api/account/* + /api/transactions/*
import { apiFetch } from "./api";

export const getProfile = () => apiFetch("/api/user/profile");

export const updateProfile = (payload) =>
  apiFetch("/api/user/profile/save", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const changePassword = (oldPassword, newPassword) =>
  apiFetch("/api/account/change-password", {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });

export const logoutUser = () =>
  apiFetch("/api/user/logout", { method: "POST" });

export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/api/user/avatar", {
    method: "POST",
    body: fd,
  });
};

export const getTransactionHistory = () =>
  apiFetch("/api/transactions/history");

export const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
  uploadAvatar,
  getTransactionHistory,
};
