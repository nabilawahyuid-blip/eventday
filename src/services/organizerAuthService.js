import { apiFetch } from "./api";

export const logoutOrganizer = async () => {
  return apiFetch("/api/organizer/auth/logout", {
    method: "POST",
  });
};