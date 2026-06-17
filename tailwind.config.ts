import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Verde sálvia (asas do logo) — cor da marca
        sage: {
          50: "#f4f6f0",
          100: "#e6ebdc",
          200: "#cfd9bd",
          300: "#aec095",
          400: "#8fa473",
          500: "#728757",
          600: "#5a6c44",
          700: "#475537",
          800: "#3a4530",
          900: "#323b2a",
        },
        // Terracota / cobre (cabelo do logo) — cor de destaque/ação
        terracotta: {
          50: "#fbf2ec",
          100: "#f5ddcf",
          200: "#e9b89f",
          300: "#db8f6b",
          400: "#cc7049",
          500: "#b95a39",
          600: "#9c4830",
          700: "#7d3a29",
          800: "#663125",
          900: "#562b22",
        },
        // Creme / bege (fundo do logo) — fundo do site
        cream: {
          50: "#fdfbf6",
          100: "#f8f1e4",
          200: "#f1e6d1",
          300: "#e7d4b4",
          400: "#dabd91",
          500: "#cca572",
          600: "#b88a55",
          700: "#996f45",
          800: "#7c5a3c",
          900: "#664b34",
        },
        // Verde floresta profundo (contornos/texto do logo) — texto e seções escuras
        forest: {
          50: "#eef2ef",
          100: "#d7e0d9",
          200: "#b0c2b5",
          300: "#829c8a",
          400: "#5c7765",
          500: "#445d4c",
          600: "#34493c",
          700: "#2a3b31",
          800: "#233028",
          900: "#1c2620",
          950: "#121913",
        },
        // Mostarda dourada (detalhes do logo) — pequenos acentos
        mustard: {
          400: "#d9b24b",
          500: "#c69a35",
          600: "#a87f2a",
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
      },
      fontFamily: {
        heading: ["var(--font-fraunces)", "Georgia", "serif"],
        body: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "shimmer": "shimmer 2s linear infinite",
        "float": "float 3s ease-in-out infinite",
        "sparkle": "sparkle 1.5s ease-in-out infinite",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        sparkle: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.5", transform: "scale(0.8)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
