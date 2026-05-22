import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
