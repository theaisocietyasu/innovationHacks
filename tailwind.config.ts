import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        accent: "#E066FF",
        "accent-dim": "#7B61FF",
      },
      fontFamily: {
        logo: ["Space Grotesk", "serif"],
        content: ["Space Grotesk", "serif"],
        date: ["ShadedFont", "serif"],
        monte: ["Monteserrat", "sans-serif"],
        poppins: ["Poppins", "sans-serif"],
        nimbus: ["TAN-NIMBUS", "serif"],
        mancunia: ["Mancunia-Outline", "serif"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "gradient-accent": "linear-gradient(135deg, #E066FF, #7B61FF)",
      },
    },
    screens: {
      sm: "768px",
      md: "1024px",
      lg: "1440px",
      xl: "1920px",
    },
  },
  plugins: [],
};
export default config;
