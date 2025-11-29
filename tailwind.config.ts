import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        crimson: ['"Crimson Pro"', "serif"],
        inter: ["Inter", "sans-serif"],
      },
      fontSize: {
        // Title styles (Crimson Pro)
        "title-h0": ["44px", { lineHeight: "100%", fontWeight: "400" }],
        "title-h1": ["36px", { lineHeight: "100%", fontWeight: "400" }],
        "title-h2": ["24px", { lineHeight: "100%", fontWeight: "400" }],
        "title-h3": ["20px", { lineHeight: "100%", fontWeight: "400" }],

        // Body styles (Inter)
        "body-1": ["16px", { lineHeight: "100%", fontWeight: "400" }],
        "body-2": ["14px", { lineHeight: "100%", fontWeight: "400" }],

        // Caption styles (Inter)
        "caption-1": ["10px", { lineHeight: "100%", fontWeight: "600" }],
        "caption-2": ["12px", { lineHeight: "100%", fontWeight: "500" }],
      },
      letterSpacing: {
        "caption-wide": "2px",
      },
      colors: {
        primary: "#C9A961",
        neutral: {
          dark: "#101828",
          white: "#FFFFFF",
          gray: "#6A7282",
          "gray-200": "#D9DBE1",
        },
        surface: {
          light: "#F9FAFB",
        },
        feedback: {
          success: "#0E9F6E",
          error: "#E5484D",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
