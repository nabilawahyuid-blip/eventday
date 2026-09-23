import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// GET /api/admin/audit-logs?page=0&size=20 → Page<AuditLog>
export const getAdminAuditLogs = async (page = 0, size = 20) => {
  return apiFetch(`/api/admin/audit-logs${toQueryString({ page, size })}`);
};

// GET /api/admin/audit-logs/export → List<AuditLogExportResponse> (JSON)
export const exportAdminAuditLogs = async () => {
  return apiFetch("/api/admin/audit-logs/export");
};

// GET /api/admin/audit-logs/export/csv → string CSV dibungkus ApiResponse
// (BUKAN binary download — helper mengekstrak data string + memicu download)
export const exportAdminAuditLogsCSV = async () => {
  return downloadFromEndpoint(
    "/api/admin/audit-logs/export/csv",
    {},
    "audit-log.csv"
  );
};