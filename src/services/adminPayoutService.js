import { apiFetch } from "./api";

export const getAdminPayouts = async () => {
  return apiFetch("/api/admin/payouts");
};

export const getAdminPayoutDetail = async (id) => {
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}`
  );
};

export const updateAdminPayoutStatus = async (id, data) => {
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

export const getPayoutReconciliation = async (id) => {
  return apiFetch(
    `/api/admin/payouts/${encodeURIComponent(id)}/documents/reconciliation`
  );
};