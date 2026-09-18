// src/services/checkoutService.js
// Checkout & Order — perlu login (Cookie access_token via credentials:'include' + Bearer fallback)
import { apiFetch } from "./api";

// Buat order {tierId, quantity} → Order PENDING + expiredAt +15 mnt
export const initiateCheckout = (tierId, quantity) =>
  apiFetch("/api/checkout/initiate", {
    method: "POST",
    body: JSON.stringify({ tierId, quantity }),
  });

// Simpan peserta ke order_attendees — attendees:[{fullName,email,phoneNumber,identityNumber}]
export const saveAttendees = (orderId, attendees) =>
  apiFetch("/api/checkout/attendees", {
    method: "POST",
    body: JSON.stringify({ orderId, attendees }),
  });

// Hitung rincian — TIDAK menyimpan order → data:{subtotal,adminFee,tax,discount,totalAmount}
export const calcCheckout = (tierId, quantity, discountAmount = 0) =>
  apiFetch("/api/checkout/calculation", {
    method: "POST",
    body: JSON.stringify({ tierId, quantity, discountAmount }),
  });

// Kunci order → status WAITING_PAYMENT
export const processCheckout = (orderId) =>
  apiFetch("/api/checkout/process", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });

// Ringkasan checkout — data:{orderId,subtotal,adminFee,tax,discountAmount,totalAmount}
export const getCheckoutSummary = (orderId) =>
  apiFetch(`/api/checkout/summary?orderId=${orderId}`);

export const checkoutService = {
  initiateCheckout,
  saveAttendees,
  calcCheckout,
  processCheckout,
  getCheckoutSummary,
};
