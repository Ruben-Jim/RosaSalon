import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from "fs";

// Get base path from package.json homepage if it exists
function getBasePath() {
  if (!process.env.GITHUB_PAGES) return "/";
  
  try {
    const pkg = JSON.parse(readFileSync("package.json", "utf-8"));
    if (pkg.homepage) {
      const url = new URL(pkg.homepage);
      const pathname = url.pathname;
      // Extract repo name from path like /RosaSalon/ or /username/repo/
      return pathname.endsWith("/") ? pathname : pathname + "/";
    }
  } catch {
    // Fallback if package.json can't be read
  }
  
  return "/";
}

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
    outDir: process.env.GITHUB_PAGES 
      ? path.resolve(import.meta.dirname, "gh-pages")
      : path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
