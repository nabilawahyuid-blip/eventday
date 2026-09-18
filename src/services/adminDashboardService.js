import { apiFetch } from "./api";

export const getAdminDashboardMetrics = async () => {
  return apiFetch("/api/admin/dashboard/metrics");
};

export const getAdminRecentEvents = async () => {
  return apiFetch("/api/admin/dashboard/recent-events");
};

export const getAdminRecentTransactions = async () => {
  return apiFetch("/api/admin/dashboard/recent-transactions");
};

// Alias untuk EventManagement
export const getAdminEvents = async () => {
  return apiFetch("/api/admin/dashboard/recent-events");
};

// Backward-compatible alias
export const getRecentTransactions =
  getAdminRecentTransactions;