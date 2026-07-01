import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetUrl =
    env.VITE_DEV_PROXY_TARGET || env.VITE_API_URL || "http://localhost:5219";

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 5173,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: targetUrl,
          changeOrigin: true,
        },
      },
    },
  };
});
