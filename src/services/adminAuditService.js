import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// GET /api/admin/audit-logs?page=0&size=10&search=&category=&startDate=&endDate=&status=
// → Page<AuditLog>
// Filter dikirim apa adanya; toQueryString membuang string kosong sehingga
// backend yang belum mendukung param baru tetap menerima request valid.
// Nilai category mengikuti enum backend: ALL | AUTH | EVENT | TRANSACTION |
// PAYOUT | EO_APPROVAL | SYSTEM ("ALL" dinormalisasi menjadi tanpa param).
// Nilai status: SUCCESS | FAILED
// Catatan: repo ini tidak memakai axios — pemanggilan lewat apiFetch.
export const getAdminAuditLogs = async (page = 0, size = 10, filters = {}) => {
  const {
    search = "",
    category = "",
    startDate = "",
    endDate = "",
    status = "",
  } = filters;

  const normalizedCategory =
    category && category !== "ALL" ? category : "";

  return apiFetch(
    `/api/admin/audit-logs${toQueryString({
      page,
      size,
      search: search.trim(),
      category: normalizedCategory,
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
    {
      search: search.trim(),
      category: category && category !== "ALL" ? category : "",
      startDate,
      endDate,
      status,
    },
    "audit-log.csv"
  );
};