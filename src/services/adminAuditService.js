import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// GET /api/admin/audit-logs?page=0&size=20&search=&category=&startDate=&endDate=&status=
// → Page<AuditLog>
// Filter dikirim apa adanya; toQueryString membuang string kosong sehingga
// backend yang belum mendukung param baru tetap menerima request valid.
// Nilai category yang didukung (harus cocok dengan enum backend):
// AUTH | EVENT | TRANSACTION | ORDER | EO_APPROVAL | PAYOUT | SYSTEM | GATE_SCAN
// Nilai status: SUCCESS | FAILED
export const getAdminAuditLogs = async (page = 0, size = 20, filters = {}) => {
  const {
    search = "",
    category = "",
    startDate = "",
    endDate = "",
    status = "",
  } = filters;

  return apiFetch(
    `/api/admin/audit-logs${toQueryString({
      page,
      size,
      search,
      category,
      startDate,
      endDate,
      status,
    })}`
  );
};

// GET /api/admin/audit-logs/export → List<AuditLogExportResponse> (JSON)
export const exportAdminAuditLogs = async () => {
  return apiFetch("/api/admin/audit-logs/export");
};

// GET /api/admin/audit-logs/export/csv → string CSV dibungkus ApiResponse
// (BUKAN binary download — helper mengekstrak data string + memicu download)
// Filter yang sama dengan list diteruskan supaya file yang diunduh konsisten
// dengan data yang tampil di layar.
export const exportAdminAuditLogsCSV = async (filters = {}) => {
  const {
    search = "",
    category = "",
    startDate = "",
    endDate = "",
    status = "",
  } = filters;

  return downloadFromEndpoint(
    "/api/admin/audit-logs/export/csv",
    { search, category, startDate, endDate, status },
    "audit-log.csv"
  );
};