// src/services/adminService.js

const API_URL = import.meta.env.VITE_API_URL;

// 1. Mengambil metrik dashboard admin
export async function getAdminMetrics() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard/metrics`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // PENTING: Agar cookie HttpOnly / token autentikasi ikut terkirim
    });

    if (!response.ok) throw new Error('Gagal mengambil data metrics');
    return await response.json();
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return null;
  }
}

// 2. Mengambil 10 transaksi pesanan tiket terkini (Aktivitas Terbaru)
export async function getRecentTransactions() {
  try {
    const response = await fetch(`${API_URL}/admin/dashboard/recent-transactions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // PENTING untuk otorisasi admin[cite: 1]
    });

    if (!response.ok) throw new Error('Gagal mengambil transaksi terbaru');
    return await response.json();
  } catch (error) {
    console.error('Error fetching recent transactions:', error);
    return [];
  }
}