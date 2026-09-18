import { apiFetch } from "./api";

export const getAdminGeneralSettings = async () => {
  return apiFetch("/api/admin/settings/general");
};

export const updateAdminGeneralSettings = async (data) => {
  return apiFetch("/api/admin/settings/general", {
    method: "PUT",
    body: JSON.stringify(data),
  });
};

export const uploadAdminLogo = async (file) => {
  const formData = new FormData();

  formData.append("file", file);

  return apiFetch("/api/admin/settings/upload-logo", {
    method: "POST",
    body: formData,
  });
};