// vite.config.js

import {
  defineConfig,
  loadEnv,
} from "vite";

import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(
    mode,
    process.cwd(),
    ""
  );

  // ================================================
  // PROXY RULES
  // ================================================
  //
  // Dipakai bersama oleh dev server (server.proxy)
  // dan preview (preview.proxy) supaya `npm run
  // build` + `npm run preview` tetap berfungsi.
  //
  // Header "ngrok-skip-browser-warning" wajib ada:
  // tanpa header itu ngrok free-tier mengembalikan
  // halaman interstitial "You are about to visit..."
  // (ERR_NGROK_6024) — bukan konten asli. Tag
  // <img>/background-image tidak bisa mengirim
  // header custom, jadi SEMUA akses ke backend
  // (API dan gambar) harus lewat proxy ini.
  //
  const proxyRules = (target) => ({
    "/api": {
      target,
      changeOrigin: true,
      secure: false,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      // Backend sudah memakai prefix /api, path
      // diteruskan apa adanya TANPA diubah.
      rewrite: (path) => path,
    },
    // Banner/gambar event dari backend (upload/static).
    // Tanpa baris ini, <img src="/uploads/...">
    // akan di-request ke origin frontend → 404.
    "/uploads": {
      target,
      changeOrigin: true,
      secure: false,
      headers: {
        "ngrok-skip-browser-warning": "true",
      },
      rewrite: (path) => path,
    },
  });

  const proxyTarget = env.VITE_NGROK_URL;

  return {
    plugins: [react()],

    server: {
      proxy: proxyRules(proxyTarget),
    },

    preview: {
      proxy: proxyRules(proxyTarget),
    },
  };
});