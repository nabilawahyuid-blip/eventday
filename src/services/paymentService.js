// src/services/paymentService.js
// Payment — perlu login (Cookie access_token via credentials:'include')
import { apiFetch } from "./api";

// Charge pembayaran → Midtrans Snap → return { snapToken, redirectUrl }
// body: { orderId, grossAmount, customerName, customerEmail }
export const chargePayment = (
  orderId,
  grossAmount,
  customerName,
  customerEmail,
) =>
  apiFetch("/api/payments/charge", {
    method: "POST",
    body: JSON.stringify({ orderId, grossAmount, customerName, customerEmail }),
  });

// Verifikasi status pembayaran di backend setelah transaksi Midtrans selesai
export const verifyPayment = (orderId, transactionId = "") => {
  const queryParams = new URLSearchParams({
    orderId,
    ...(transactionId ? { transactionId } : {}),
  }).toString();

  return apiFetch(`/api/payments/verify?${queryParams}`, {
    method: "GET",
  });
};

// Tampilkan Midtrans Snap payment UI
// Snap JS SDK harus di-load di index.html: <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="..."></script>
export const openMidtransPayment = (snapToken) => {
  return new Promise((resolve, reject) => {
    if (!window.snap) {
      reject(new Error("Midtrans Snap SDK belum ter-load"));
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: (result) =>
        resolve({
          status: "success",
          transactionId: result?.transaction_id,
          result,
        }),
      onPending: (result) => resolve({ status: "pending", result }),
      onError: (error) => reject({ status: "error", error }),
      onClose: () => resolve({ status: "closed" }),
    });
  });
};

export const paymentService = {
  chargePayment,
  verifyPayment,
  openMidtransPayment,
};
