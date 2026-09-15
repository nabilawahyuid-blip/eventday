// src/services/checkoutService.js
// Checkout & Order — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
// Kontrak: d:\md\checkout\API.md §12 (8 endpoint, base /api/v1)
import { apiFetch } from "./api";

// Buat order {tierId, quantity} → Order PENDING + expiredAt +15 mnt
export const initiateCheckout = (tierId, quantity) =>
  apiFetch("/checkout/initiate", {
    method: "POST",
    body: JSON.stringify({ tierId, quantity }),
  });

// Simpan peserta ke order_attendees — attendees:[{fullName,email,phoneNumber,identityNumber}]
export const saveAttendees = (orderId, attendees) =>
  apiFetch("/checkout/attendees", {
    method: "POST",
    body: JSON.stringify({ orderId, attendees }),
  });

// Hitung rincian — TIDAK menyimpan order → data:{subtotal,adminFee,tax,discount,totalAmount}
export const calcCheckout = (tierId, quantity, discountAmount = 0) =>
  apiFetch("/checkout/calculation", {
    method: "POST",
    body: JSON.stringify({ tierId, quantity, discountAmount }),
  });

// Kunci order → status WAITING_PAYMENT
export const processCheckout = (orderId) =>
  apiFetch("/checkout/process", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

// Polling status order → data:{orderId,status}
export const getOrderStatus = (orderId) =>
  apiFetch(`/orders/status?orderId=${encodeURIComponent(orderId)}`);

// Ringkasan tagihan → CheckoutSummaryResponse
export const getCheckoutSummary = (orderId) =>
  apiFetch(`/checkout/summary?orderId=${encodeURIComponent(orderId)}`);

// Total nominal → {totalAmount}
export const getOrderTotalAmount = (orderId) =>
  apiFetch(`/orders/${encodeURIComponent(orderId)}/total-amount`);

// Batas waktu bayar → {expiredAt}
export const getOrderExpiredTime = (orderId) =>
  apiFetch(`/orders/${encodeURIComponent(orderId)}/expired-time`);

export const checkoutService = {
  initiateCheckout,
  saveAttendees,
  calcCheckout,
  processCheckout,
  getOrderStatus,
  getCheckoutSummary,
  getOrderTotalAmount,
  getOrderExpiredTime,
};
