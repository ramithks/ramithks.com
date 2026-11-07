import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "node:fs";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), {
    name: "approved-resume-asset",
    generateBundle() {
      const source = Buffer.from(readFileSync(new URL("./assets/approved-resume.pdf.b64", import.meta.url), "utf8"), "base64");
      this.emitFile({ type: "asset", fileName: "3-ramithks_cv.pdf", source });
      this.emitFile({ type: "asset", fileName: "ramithks_cv.pdf", source });
    },
  }],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Animation library
          "framer-motion": ["framer-motion"],
          // Analytics
          analytics: ["posthog-js"],
          // React and core dependencies
          "react-vendor": ["react", "react-dom", "react-helmet-async"],
          // UI utilities
          "ui-utils": ["lucide-react", "clsx", "tailwind-merge", "cmdk"],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
