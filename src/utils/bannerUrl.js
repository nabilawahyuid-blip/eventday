// src/utils/bannerUrl.js
// Helper penyusun URL banner event multienvironment (Dev, Ngrok, & VPS Production).

export const resolveBannerUrl = (url) => {
  if (!url) return null;

  let s = String(url).trim();
  if (!s) return null;

  // 1. Jika URL sudah berupa CDN / External Link / Data-URI, biarkan apa adanya.
  if (/^(data:)/i.test(s)) return s;

  // 2. Bersihkan path jika backend mengembalikan path disk server lokal (Linux/Windows)
  if (s.includes("/uploads/")) {
    s = "/uploads/" + s.split("/uploads/")[1];
  } else if (s.includes("\\uploads\\")) {
    s = "/uploads/" + s.split("\\uploads\\")[1].replace(/\\/g, "/");
  }

  // 3. Ambil Base URL API dari environment variable (Vite .env)
  const ngrokUrl = (import.meta.env.VITE_NGROK_URL || "").replace(/\/$/, "");
  const apiUrl = (import.meta.env.VITE_API_URL || "https://api-eventday.dnabisa.tech").replace(/\/$/, "");

  // Jika URL dari backend mengandung prefix Ngrok lama, bersihkan
  if (ngrokUrl && s.startsWith(ngrokUrl + "/")) {
    s = s.slice(ngrokUrl.length);
  }

  // 4. PENANGANAN ENVIRONMENT (LOKAL vs PRODUKSI/VPS)
  // Di mode Development (npm run dev), gunakan path relatif agar lewat Vite Proxy
  if (import.meta.env.DEV) {
    if (/^https?:\/\//i.test(s)) return s;
    return s.startsWith("/") ? s : `/${s}`;
  }

  // Di mode Production (VPS/Build), jika path relatif, WAJIB gabungkan dengan API_URL
  if (s.startsWith("/")) {
    return `${apiUrl}${s}`;
  }

  if (!/^https?:\/\//i.test(s)) {
    return `${apiUrl}/${s}`;
  }

  return s;
};