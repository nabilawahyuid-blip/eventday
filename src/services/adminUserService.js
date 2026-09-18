import { apiFetch } from "./api";

export const getAdminUsers = async () => {
  return apiFetch("/api/admin/users");
};

export const getAdminUserDetail = async (id) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}`
  );
};

export const updateAdminUserStatus = async (id, data) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};

export const suspendAdminUser = async (id, data = {}) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}/suspend`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    }
  );
};