import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      "/api/fluentscan-lines": {
        target: "https://fluentscan.xyz",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fluentscan-lines/, "/api/v1/lines"),
      },
      "/api/fluentscan": {
        target: "https://fluentscan.xyz/api/v2",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fluentscan/, ""),
      },
      "/api/llama-coins": {
        target: "https://coins.llama.fi",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llama-coins/, ""),
      },
      "/api/llama": {
        target: "https://api.llama.fi",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/llama/, ""),
      },
    },
  },
});
