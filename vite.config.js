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

  return {
    plugins: [react()],

    server: {
      proxy: {
        "/api": {
          // ==================================
          // BACKEND NGROK
          // ==================================

          target: env.VITE_NGROK_URL,

          // ==================================
          // PROXY CONFIG
          // ==================================

          changeOrigin: true,

          secure: false,

          // ==================================
          // NGROK
          // ==================================

          headers: {
            "ngrok-skip-browser-warning":
              "true",
          },

          // ==================================
          // DEBUG PROXY
          // ==================================

          configure: (proxy) => {
            // --------------------------------
            // ERROR
            // --------------------------------

            proxy.on(
              "error",
              (err, req, res) => {
                console.error(
                  "❌ Proxy error:",
                  err
                );
              }
            );

            // --------------------------------
            // REQUEST
            // --------------------------------

            proxy.on(
              "proxyReq",
              (
                proxyReq,
                req,
                res
              ) => {
                console.log(
                  "➡️ Sending Request:",
                  req.method,
                  req.url
                );
              }
            );

            // --------------------------------
            // RESPONSE
            // --------------------------------

            proxy.on(
              "proxyRes",
              (
                proxyRes,
                req,
                res
              ) => {
                console.log(
                  "⬅️ Received Response:",
                  proxyRes.statusCode,
                  req.url
                );
              }
            );
          },
        },
      },
    },
  };
});