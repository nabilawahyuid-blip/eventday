// src/services/adminTransactionService.js
// Admin Transaction Management — API.md §17.11 (AdminTransactionController `/api/admin/transactions`)
// Auth: ADMIN. Response ApiResponse {msg, status, data}.
// List: data = Page {content, page, size, totalElements, totalPages}
import { apiFetch, toQueryString } from "./api";

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
  const token = localStorage.getItem("token");
  const res = await fetch(`/api/admin/transactions/export${toQueryString(params)}`, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Export gagal (${res.status})`);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

export const adminTransactionService = {
  getAdminTransactions,
  getAdminTransactionDetail,
  updateAdminTransactionStatus,
  exportAdminTransactions,
};
