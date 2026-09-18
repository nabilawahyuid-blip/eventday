// src/services/organizerTransactionService.js

import { apiFetch } from "./api";

export const getOrganizerRecentTransactions = async () => {
  return apiFetch("/api/organizer/dashboard/recent-transactions");
};