// src/services/paymentService.js
// Payment — perlu login (Cookie access_token via credentials:'include')
// Backend: POST /api/payments/charge → Midtrans Snap → {snapToken, redirectUrl}
import { apiFetch } from "./api";

// Charge pembayaran → Midtrans Snap → return { snapToken, redirectUrl }
// body: { orderId, grossAmount, customerName, customerEmail }
export const chargePayment = (orderId, grossAmount, customerName, customerEmail) =>
  apiFetch("/payments/charge", {
    method: "POST",
    body: JSON.stringify({ orderId, grossAmount, customerName, customerEmail }),
  });

// Tampilkan Midtrans Snap payment UI
// Snap JS SDK harus di-load di index.html: <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key="..."></script>
export const openMidtransPayment = (snapToken) => {
  return new Promise((resolve, reject) => {
    if (!window.snap) {
      reject(new Error("Midtrans Snap SDK belum ter-load"));
      return;
    }

    window.snap.pay(snapToken, {
      onSuccess: (result) => resolve({ status: "success", result }),
      onPending: (result) => resolve({ status: "pending", result }),
      onError: (error) => reject({ status: "error", error }),
      onClose: () => resolve({ status: "closed" }),
    });
  });
};

export const paymentService = {
  chargePayment,
  openMidtransPayment,
};
