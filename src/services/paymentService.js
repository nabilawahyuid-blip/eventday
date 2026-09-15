// src/services/paymentService.js
// Payment — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Kontrak: d:\md\terabru\API.md §13 (3 endpoint, base /api/v1)
import { apiFetch } from "./api";

// Daftar metode pembayaran: VIRTUAL_ACCOUNT, E_WALLET, CREDIT_CARD
export const getPaymentMethods = () => apiFetch("/payments/methods");

// Channel Virtual Account: BCA, MANDIRI, BRI
export const getVirtualAccountChannels = () =>
  apiFetch("/payments/methods/virtual-account");

// Charge pembayaran → generate VA number, status WAITING_PAYMENT
// body: { orderId, paymentMethod: "VIRTUAL_ACCOUNT", bankCode: "BCA" }
export const chargePayment = (orderId, paymentMethod, bankCode) =>
  apiFetch("/payments/charge", {
    method: "POST",
    body: JSON.stringify({ orderId, paymentMethod, bankCode }),
  });

export const paymentService = {
  getPaymentMethods,
  getVirtualAccountChannels,
  chargePayment,
};