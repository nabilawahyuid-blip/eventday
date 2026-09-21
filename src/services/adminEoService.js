import { apiFetch } from "./api";

// ==========================================
// GET SEMUA PENGAJUAN EO
// ==========================================
export const getEoApplications = async (status = "") => {
  const query = status
    ? `?status=${encodeURIComponent(status)}`
    : "";

  return apiFetch(`/api/admin/eo-applications${query}`);
};

// ==========================================
// GET DETAIL PENGAJUAN EO
// ==========================================
export const getEoApplicationDetail = async (id) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(id)}`
  );
};

// ==========================================
// UPDATE STATUS EO
// VERIFIED / REJECTED
// ==========================================
export const updateEoApplicationStatus = async (
  id,
  status,
  rejectionReason = null
) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
        rejectionReason,
      }),
    }
  );
};

// ==========================================
// GET DOKUMEN AKTA PERUSAHAAN
// ==========================================
export const getCompanyDeedDocument = async (id) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(
      id
    )}/documents/company-deed`
  );
};