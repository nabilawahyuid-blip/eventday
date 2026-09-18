// src/services/organizerDashboardService.js

import { apiFetch } from "./api";

// =====================================================
// GET DASHBOARD ORGANIZER
// GET /api/organizer/dashboard
// =====================================================

export const getOrganizerDashboard = async () => {
  return apiFetch("/api/organizer/dashboard");
};

// =====================================================
// GET DASHBOARD METRICS
// GET /api/organizer/dashboard/metrics
// =====================================================

export const getOrganizerDashboardMetrics = async () => {
  return apiFetch(
    "/api/organizer/dashboard/metrics"
  );
};

// =====================================================
// GET EVENT TERBARU
// GET /api/organizer/dashboard/recent-events
// =====================================================

export const getOrganizerRecentEvents = async () => {
  return apiFetch(
    "/api/organizer/dashboard/recent-events"
  );
};

// =====================================================
// GET TRANSAKSI TERBARU
// GET /api/organizer/dashboard/recent-transactions
// =====================================================

export const getOrganizerRecentTransactions =
  async () => {
    return apiFetch(
      "/api/organizer/dashboard/recent-transactions"
    );
  };