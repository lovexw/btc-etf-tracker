import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    target: "es2020",
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5173",
        rewrite: (path) => path,
      },
    },
  },
});
