import { apiFetch } from "./api";

// =========================================
// GET SEMUA REFUND EO
// =========================================

export const getOrganizerRefunds = async () => {
  return apiFetch("/api/organizer/refunds");
};


// =========================================
// GET DETAIL REFUND
// =========================================

export const getOrganizerRefundDetail = async (refundId) => {
  return apiFetch(
    `/api/organizer/refunds/detail?id=${encodeURIComponent(
      refundId
    )}`
  );
};


// =========================================
// UPDATE STATUS REFUND
// =========================================

export const updateOrganizerRefundStatus = async (
  refundId,
  status
) => {
  return apiFetch(
    `/api/organizer/refunds/${encodeURIComponent(
      refundId
    )}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
};