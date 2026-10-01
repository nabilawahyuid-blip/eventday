import { apiFetch, toQueryString } from "./api";

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
// GET ORGANIZER TERVERIFIKASI UNTUK DROPDOWN
// ==========================================
// Tidak ada endpoint daftar organizer khusus di service FE, sehingga daftar
// EO yang dapat dipilih admin diambil dari pengajuan berstatus VERIFIED.
// Parameter page/size diminta eksplisit supaya dropdown tidak terpotong oleh
// pagination default backend.
export const getVerifiedOrganizers = async ({ page = 0, size = 100 } = {}) => {
  return apiFetch(
    `/api/admin/eo-applications${toQueryString({
      status: "VERIFIED",
      page,
      size,
    })}`
  );
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

// ==========================================
// DOWNLOAD AKTA PERUSAHAAN (binary)
// GET /api/admin/eo-applications/{id}/documents/company-deed/download
// ==========================================
export const downloadCompanyDeedDocument = async (id) => {
  if (!id) throw new Error("ID aplikasi EO wajib diisi.");
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(
      id
    )}/documents/company-deed/download`
  );
};