import { apiFetch } from "./api";

// ===============================
// GET ALL USERS
// ===============================
export const getAdminUsers = async (role = "") => {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";

  return apiFetch(`/api/admin/users${query}`);
};

// ===============================
// GET USER DETAIL
// ===============================
export const getAdminUserDetail = async (id) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}`
  );
};

// ===============================
// UPDATE USER STATUS
// ACTIVE / INACTIVE / SUSPENDED
// ===============================
export const updateAdminUserStatus = async (id, status) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({
        status,
      }),
    }
  );
};

// ===============================
// SUSPEND USER
// ===============================
export const suspendAdminUser = async (id) => {
  return apiFetch(
    `/api/admin/users/${encodeURIComponent(id)}/suspend`,
    {
      method: "PATCH",
    }
  );
};