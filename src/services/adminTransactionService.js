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

// Transaksi ikut 400 bila join event-nya kena enum Category busuk
// ("Musik"/"ENTERTAINMENT"). Deteksi + ambil toleran halaman-per-halaman.
export const isCategoryEnumError = (err) => {
  const msg = String(err?.data?.msg || err?.message || "");
  return /no enum constant.*category\./i.test(msg);
};

const extractTrxContent = (res) => {
  const raw = res?.data ?? res;
  if (Array.isArray(raw)) return { content: raw, totalPages: 1 };
  if (Array.isArray(raw?.content))
    return { content: raw.content, totalPages: raw.totalPages ?? 1 };
  return { content: [], totalPages: 1 };
};

export const getAdminTransactionsTolerant = async (params = {}) => {
  const { page = 0, size = 20, ...filters } = params;
  try {
    return await getAdminTransactions({ ...filters, page, size });
  } catch (err) {
    if (!isCategoryEnumError(err)) throw err;
  }

  const CHUNK = 10;
  const MAX_PAGES = 20;
  const collected = [];
  let skippedPages = 0;
  for (let p = 0; p < MAX_PAGES; p++) {
    try {
      const res = await getAdminTransactions({ ...filters, page: p, size: CHUNK });
      const { content, totalPages } = extractTrxContent(res);
      collected.push(...content);
      if (p + 1 >= (totalPages || 1)) break;
      if (content.length === 0) break;
    } catch (err) {
      if (isCategoryEnumError(err)) {
        skippedPages += 1;
        continue;
      }
      throw err;
    }
  }
  return {
    msg: "Data sebagian (beberapa halaman dilewati karena kategori tidak valid di DB)",
    status: 200,
    data: { content: collected, page: 0, size: collected.length, totalElements: collected.length, totalPages: 1 },
    _partial: true,
    _skippedPages: skippedPages,
  };
};

export const adminTransactionService = {
  getAdminTransactions,
  getAdminTransactionsTolerant,
  isCategoryEnumError,
  getAdminTransactionDetail,
  updateAdminTransactionStatus,
  exportAdminTransactions,
};
