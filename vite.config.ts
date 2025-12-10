import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Determine base path
// For GitHub Pages with repo name "RosaSalon": use "/RosaSalon/"
// For local development or custom domain: use "/"
const getBasePath = () => {
  if (process.env.GITHUB_PAGES === "true") {
    return "/RosaSalon/";
  }
  if (process.env.VITE_BASE_PATH) {
    return process.env.VITE_BASE_PATH;
  }
  return "/";
};

export default defineConfig({
  base: getBasePath(),
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
