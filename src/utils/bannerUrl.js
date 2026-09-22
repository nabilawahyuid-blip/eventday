// src/utils/bannerUrl.js
// Helper penyusun URL banner event.
//
// Kenapa relatif (bukan ngrok absolut)?
// ngrok free-tier mengecek header "ngrok-skip-browser-warning".
// API lewat Vite proxy yang menyisipkan header itu, tapi tag
// <img>/background-image TIDAK bisa mengirim header custom —
// request langsung ke URL ngrok dicegat halaman interstitial
// (ERR_NGROK_6024) sehingga gambar blank.
//
// Solusi: path relatif "/uploads/..." → browser meminta ke
// origin yang sama → Vite proxy meneruskan ke backend dengan
// header skip-warning (lihat vite.config.js, aturan "/uploads").
export const resolveBannerUrl = (url) => {
  if (!url) return null;

  const s = String(url).trim();
  if (!s) return null;

  // URL absolut dari host backend sendiri (mis. banner lama yang
  // tersimpan dengan prefix ngrok) → "relatif-kan" agar lewat proxy.
  const apiBase = (import.meta.env.VITE_NGROK_URL || "").replace(/\/$/, "");
  if (apiBase && s.startsWith(apiBase + "/")) {
    return s.slice(apiBase.length) || "/";
  }

  // URL absolut dari domain lain (mis. CDN) atau data-URI → biarkan apa adanya.
  if (/^(https?:|data:)/i.test(s)) return s;

  // Relatif (dengan atau tanpa leading slash) → pastikan dimulai "/",
  // nanti di-proxy ke backend oleh Vite.
  return s.startsWith("/") ? s : `/${s}`;
};