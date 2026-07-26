import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "pwa",
  publicDir: "../public",
  base: "./",
  plugins: [react()],
  build: {
    outDir: "../desktop-dist",
    emptyOutDir: true,
  },
});
