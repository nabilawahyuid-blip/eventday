// src/services/refundService.js
// Refund — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Backend: /api/refund/*, /api/tickets/refund/* (tanpa /v1, Vite proxy skip rewrite untuk /api/tickets)
import { apiFetch } from "./api";

// Ajukan refund → data: RefundDetailResponse
// POST /api/refund/submit (alias: /api/tickets/refund/request)
// body: { orderId, reason, bankCode, accountNumber, accountHolderName }
export const submitRefund = ({ orderId, reason, bankCode, accountNumber, accountHolderName }) =>
  apiFetch("/api/refund/submit", {
    method: "POST",
    body: JSON.stringify({ orderId, reason, bankCode, accountNumber, accountHolderName }),
  });

// Daftar bank untuk refund → data: [{bankCode, bankName, logoUrl, active}] (MOCK, 8 bank)
// GET /api/refund/banks
export const getRefundBanks = () =>
  apiFetch("/api/refund/banks");

// Ringkasan order untuk form refund → data: {orderId, orderNumber, eventTitle, ticketTierName, ...}
// GET /api/refund/order-summary?orderId=<uuid>
export const getRefundOrderSummary = (orderId) =>
  apiFetch(`/api/refund/order-summary?orderId=${orderId}`);

// Detail refund → data: RefundDetailResponse
// GET /api/refund/refund-detail/info?refundId=<uuid>
export const getRefundDetail = (refundId) =>
  apiFetch(`/api/refund/refund-detail/info?refundId=${refundId}`);

// Download bukti refund → data: {proofUrl: "..."} (selalu kosong sampai backend isi)
// GET /api/refund/refund-detail/download-proof?refundId=<uuid>
export const getRefundProof = (refundId) =>
  apiFetch(`/api/refund/refund-detail/download-proof?refundId=${refundId}`);

// Riwayat refund saya → data: [RefundDetailResponse...] (real, customerId dari token)
// GET /api/tickets/refund/refund-history
export const getRefundHistory = () =>
  apiFetch("/api/tickets/refund/refund-history");

export const refundService = {
  submitRefund,
  getRefundBanks,
  getRefundOrderSummary,
  getRefundDetail,
  getRefundProof,
  getRefundHistory,
};
