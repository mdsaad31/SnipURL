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
        background: "var(--background)",
        surface: "var(--surface)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        secondary: "var(--secondary)",
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        destructive: "var(--destructive)",
        border: {
          DEFAULT: "var(--border)",
          focus: "var(--border-focus)",
        },
      },
      fontFamily: {
        serif: ["var(--font-dm-serif)"],
        sans: ["var(--font-dm-sans)"],
        mono: ["var(--font-jetbrains-mono)"],
      },
      borderRadius: {
        card: "16px",
        btn: "10px",
        input: "10px",
      },
      boxShadow: {
        card: "0 1px 3px rgba(26,20,16,0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
