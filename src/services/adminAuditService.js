import { apiFetch, toQueryString } from "./api";

// GET /api/admin/audit-logs?page=0&size=20 → Page<AuditLog>
export const getAdminAuditLogs = async (page = 0, size = 20) => {
  return apiFetch(`/api/admin/audit-logs${toQueryString({ page, size })}`);
};

export const exportAdminAuditLogs = async () => {
  return apiFetch("/api/admin/audit-logs/export");
};

export const exportAdminAuditLogsCSV = async () => {
  return apiFetch("/api/admin/audit-logs/export/csv");
};