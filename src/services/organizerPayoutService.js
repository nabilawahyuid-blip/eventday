import { apiFetch } from "./api";

// =========================================
// GET RIWAYAT PAYOUT
// =========================================

export const getOrganizerPayouts = async () => {
  return apiFetch("/api/organizer/payouts");
};


// =========================================
// GET DETAIL PAYOUT
// =========================================

export const getOrganizerPayoutDetail = async (payoutId) => {
  return apiFetch(
    `/api/organizer/payouts/detail?id=${encodeURIComponent(
      payoutId
    )}`
  );
};


// =========================================
// GET REKENING BANK EO
// =========================================

export const getOrganizerBankAccounts = async () => {
  return apiFetch("/api/organizer/bank-accounts");
};


// =========================================
// GET EVENT EO
// =========================================

export const getOrganizerEventsForPayout = async () => {
  return apiFetch("/api/organizer/events");
};


// =========================================
// GET SALDO PAYOUT PER EVENT
// =========================================

export const getOrganizerEventPayoutBalance = async (eventId) => {
  return apiFetch(
    `/api/organizer/events/${encodeURIComponent(
      eventId
    )}/payout-balance`
  );
};


// =========================================
// AJUKAN PAYOUT
// =========================================

export const createOrganizerPayout = async (data) => {
  return apiFetch("/api/organizer/payouts", {
    method: "POST",
    body: JSON.stringify(data),
  });
};