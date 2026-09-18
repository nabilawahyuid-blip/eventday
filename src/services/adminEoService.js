import { apiFetch } from "./api";

export const getEOApplications = async () => {
  return apiFetch("/api/admin/eo-applications");
};

export const getEOApplicationDetail = async (id) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(id)}`
  );
};

export const updateEOApplicationStatus = async (id, data) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

export const getEOCompanyDeed = async (id) => {
  return apiFetch(
    `/api/admin/eo-applications/${encodeURIComponent(id)}/documents/company-deed`
  );
};