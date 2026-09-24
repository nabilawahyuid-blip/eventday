// src/services/adminTransactionService.js
// Admin Transaction Management — API.md §17.11 (AdminTransactionController `/api/admin/transactions`)
// Auth: ADMIN. Response ApiResponse {msg, status, data}.
// List: data = Page {content, page, size, totalElements, totalPages}
import { apiFetch, toQueryString } from "./api";
import { downloadFromEndpoint } from "./downloadExport";

// ==========================================
// LIST TRANSACTIONS (paginated + filter)
// GET /api/admin/transactions?status=&eventId=&userId=&dateFrom=&dateTo=&minAmount=&maxAmount=&page=0&size=20
// status: PENDING/WAITING_PAYMENT/PAID/EXPIRED/CANCELLED/REFUNDED
// ==========================================
export const getAdminTransactions = async (params = {}) => {
  const {
    status = "",
    eventId = "",
    userId = "",
    dateFrom = "",
    dateTo = "",
    minAmount = "",
    maxAmount = "",
    page = 0,
    size = 20,
  } = params;

  return apiFetch(
    `/api/admin/transactions${toQueryString({ status, eventId, userId, dateFrom, dateTo, minAmount, maxAmount, page, size })}`
  );
};

// ==========================================
// DETAIL TRANSACTION
// GET /api/admin/transactions/{id} → AdminTransactionResponse
// ==========================================
export const getAdminTransactionDetail = async (id) => {
  if (!id) throw new Error("ID transaksi wajib diisi.");
  return apiFetch(`/api/admin/transactions/${encodeURIComponent(id)}`);
};

// ==========================================
// UPDATE STATUS TRANSACTION
// PATCH /api/admin/transactions/{id}/status + audit UPDATE_TRANSACTION_STATUS
// Body: {status: PAID/REFUNDED/CANCELLED/WAITING_PAYMENT, adminNote?}
// Aturan transisi BE:
//  - PENDING/WAITING_PAYMENT → boleh ubah
//  - PAID → hanya bisa ke REFUNDED
//  - REFUNDED/CANCELLED → 400 tidak bisa diubah
// ==========================================
export const updateAdminTransactionStatus = async (id, status, adminNote = null) => {
  if (!id) throw new Error("ID transaksi wajib diisi.");
  if (!status) throw new Error("Status transaksi wajib diisi.");
  return apiFetch(`/api/admin/transactions/${encodeURIComponent(id)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status, adminNote }),
  });
};

// ==========================================
// EXPORT CSV (binary download)
// GET /api/admin/transactions/export?status=&eventId=&userId=&...
// ==========================================
export const exportAdminTransactions = async (params = {}) => {
  return downloadFromEndpoint(
    "/api/admin/transactions/export",
    params,
    "transactions.csv"
  );
};

export const adminTransactionService = {
  getAdminTransactions,
  getAdminTransactionDetail,
  updateAdminTransactionStatus,
  exportAdminTransactions,
};
