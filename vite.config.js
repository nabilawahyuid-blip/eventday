import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: env.VITE_NGROK_URL,
          changeOrigin: true,
          secure: false,
          headers: {
            "ngrok-skip-browser-warning": "true",
          },
          rewrite: (path) => {
            // /api/payments/... dan /api/tickets/... → jangan tambah /v1 (backend base path tanpa /v1)
            if (
              path.startsWith("/api/payments") ||
              path.startsWith("/api/tickets")
            ) {
              return path;
            }
            // Lainnya → tambah /v1 (/api/events → /api/v1/events)
            return path.replace(/^\/api/, "/api/");
          },
          configure: (proxy, _options) => {
            proxy.on("error", (err, _req, _res) => {
              console.log("proxy error", err);
            });
            proxy.on("proxyReq", (proxyReq, req, _res) => {
              console.log(
                "Sending Request to the Target:",
                req.method,
                req.url,
              );
            });
            proxy.on("proxyRes", (proxyRes, req, _res) => {
              console.log(
                "Received Response from the Target:",
                proxyRes.statusCode,
                req.url,
              );
            });
          },
        },
      },
    },
  };
});
