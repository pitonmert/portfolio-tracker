/// <reference types="vitest" />
import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const targetUrl =
    env.VITE_DEV_PROXY_TARGET || env.VITE_API_URL || "http://localhost:5220";

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
      tsconfigPaths: true,
    },
    server: {
      port: 5174,
      strictPort: true,
      host: "0.0.0.0",
      proxy: {
        "/api": {
          target: targetUrl,
          changeOrigin: true,
        },
      },
    },
    test: {
      environment: "jsdom",
      environmentOptions: {
        jsdom: {
          url: "http://localhost/",
        },
      },
      setupFiles: "./src/test/setup.ts",
      globals: true,
    },
  };
});
