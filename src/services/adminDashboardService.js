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