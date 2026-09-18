// src/services/adminEventService.js

import { apiFetch } from "./api";

// ==========================================
// GET EVENT ADMIN
// ==========================================

export const getAdminEvents = async () => {
  return apiFetch("/api/admin/dashboard/recent-events");
};