// src/services/profileService.js
// User Profile, Change Password, Logout, Transaction History
// Backend: /api/v1/user/* + /api/v1/account/* + /api/v1/transactions/*
import { apiFetch } from "./api";

export const getProfile = () => apiFetch("/user/profile");

export const updateProfile = (payload) =>
  apiFetch("/user/profile/save", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const changePassword = (oldPassword, newPassword) =>
  apiFetch("/account/change-password", {
    method: "PUT",
    body: JSON.stringify({ oldPassword, newPassword }),
  });

export const logoutUser = () =>
  apiFetch("/user/logout", { method: "POST" });

export const uploadAvatar = (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return apiFetch("/user/avatar", {
    method: "POST",
    body: fd,
  });
};

export const getTransactionHistory = () =>
  apiFetch("/transactions/history");

export const profileService = {
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
  uploadAvatar,
  getTransactionHistory,
};
