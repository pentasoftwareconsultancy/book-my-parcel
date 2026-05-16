import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    // Raise the warning threshold slightly — we're splitting aggressively
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — always needed, cache-stable
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // Redux
          "vendor-redux": ["@reduxjs/toolkit", "react-redux"],

          // MUI — very large, isolate so it can be cached independently
          "vendor-mui": [
            "@mui/material",
            "@mui/x-date-pickers",
            "@emotion/react",
            "@emotion/styled",
          ],

          // Maps — only loaded on map pages
          "vendor-maps": [
            "@react-google-maps/api",
            "@googlemaps/js-api-loader",
          ],

          // Charts — only loaded on analytics/dashboard pages
          "vendor-charts": ["chart.js", "react-chartjs-2", "recharts"],

          // Misc utilities — split to keep chunks under 600 kB
          "vendor-animation": ["framer-motion"],
          "vendor-socket": ["socket.io-client"],
          "vendor-table": ["material-react-table"],
          "vendor-utils": [
            "axios",
            "react-hook-form",
            "@hookform/resolvers",
            "yup",
            "react-toastify",
            "lucide-react",
          ],
        },
      },
    },
  },
});
