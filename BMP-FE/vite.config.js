import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],

   server: {
    port: 5173,
    proxy: {
      "/uploads": {
        target: "http://localhost:3000",
        changeOrigin: true,
      },
    },
  },

  build: {
    // Raise the warning threshold — we split aggressively below
    chunkSizeWarningLimit: 600,

    // Disable source maps in production — prevents exposing source code
    // via browser DevTools on the live site
    sourcemap: false,

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

          // Leaflet — only loaded on pages that use OpenStreetMap
          "vendor-leaflet": [
            "leaflet",
            "react-leaflet",
            "leaflet-defaulticon-compatibility",
          ],

          // Charts — only loaded on analytics/dashboard pages
          "vendor-charts": ["chart.js", "react-chartjs-2", "recharts"],

          // PDF generation — only loaded when generating reports
          "vendor-pdf": ["jspdf"],

          // Animation
          "vendor-animation": ["framer-motion"],

          // WebSocket client
          "vendor-socket": ["socket.io-client"],

          // Data table
          "vendor-table": ["material-react-table"],

          // Misc utilities
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
