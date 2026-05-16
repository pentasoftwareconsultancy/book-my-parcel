// /** @type {import('tailwindcss').Config} */
// export default {
//   content: [
//     "./index.html",
//     "./src/**/*.{js,ts,jsx,tsx}",
//   ],
//   theme: {
//     extend: {},
//   },
//   plugins: [],
// }


/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      /* ================= COLORS ================= */
      colors: {
        primary: "#1F2AFF",
        primaryDark: "#0d14cc",
        success: "#10b981",
        error: "#ef4444",
        info: "#5C9DF2",
        infoLight: "#86B1F2",
        gray50: "#f9fafb",
        gray100: "#f3f4f6",
        gray200: "#e5e7eb",
        gray300: "#d1d5db",
        gray500: "#6b7280",
        gray600: "#4b5563",
        gray900: "#111827",
      },

      /* ================= TYPOGRAPHY ================= */
      fontFamily: {
        sans: ["Montserrat", "sans-serif"],
      },

      fontSize: {
        h1: ["64px", {
          lineHeight: "100%",
          // fontWeight: "700",
          letterSpacing: "0%"
        }], 
        h2: ["36px", { lineHeight: "44px", fontWeight: "600" }],
        h3: ["28px", { lineHeight: "36px", fontWeight: "600" }],
        bodyLg: ["18px", { lineHeight: "28px" }],
        body: ["16px", { lineHeight: "24px" }],
        small: ["14px", { lineHeight: "20px" }],
      },

      /* ================= BORDER RADIUS ================= */
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        "3xl": "32px",
        full: "9999px",
      },

      /* ================= SHADOW ================= */
      boxShadow: {
        card: "0 8px 24px rgba(0,0,0,0.08)",
      },
      /* ================= GRADIENTS ================= */
      backgroundImage: {
        "primary-gradient": "linear-gradient(to bottom right, #1F2AFF, #4D56FF)",
        "blue-gradient": "linear-gradient(to right, #3b82f6, #06b6d4)",       // Icon cards
        "success-gradient": "linear-gradient(to right, #34d399, #10b981)",    // Success states
      },
    },
  },
  plugins: [],
};
