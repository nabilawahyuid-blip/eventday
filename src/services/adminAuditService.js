import { apiFetch } from "./api";

export const getAdminAuditLogs = async () => {
  return apiFetch("/api/admin/audit-logs");
};

export const exportAdminAuditLogs = async () => {
  return apiFetch("/api/admin/audit-logs/export");
};

export const exportAdminAuditLogsCSV = async () => {
  return apiFetch("/api/admin/audit-logs/export/csv");
};