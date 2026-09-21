import { apiFetch, toQueryString } from "./api";

// ==========================================
// GET SEMUA PAYOUT
// GET /api/admin/payouts?status= (opsional; tanpa filter = semua)
// Catatan BE: sharing tabel refund_requests — refund customer ikut muncul
// ==========================================
export const getAdminPayouts = async (status = "") => {
  return apiFetch(`/api/admin/payouts${toQueryString({ status })}`);
};

export const getAdminPayoutDetail = async (id) => {
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}`
  );
};

export const updateAdminPayoutStatus = async (id, status, adminNote = null) => {
  if (!id) throw new Error("ID payout wajib diisi.");
  if (!status) throw new Error("Status payout wajib diisi.");
  // BE: PATCH /api/admin/payouts/{id}/status {status, adminNote}
  // APPROVED → processedAt=now + audit UPDATE_PAYOUT_STATUS
  const body = typeof status === "object" ? status : { status, adminNote };
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(body),
    }
  );
};

export const getPayoutReconciliation = async (id) => {
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}/documents/reconciliation`
  );
};