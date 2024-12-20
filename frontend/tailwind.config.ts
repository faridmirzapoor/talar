import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
	container: {
		center: true,
		// padding: "rem",
	  },
	fontFamily: {
		"iransansL": "iransansL",
		"iransans": "iransans",
		"iransansB": "iransansB",
		"estedadL": "estedadL",
		"estedad": "estedad",
		"estedadM": "estedadM",
		"estedadSB": "estedadSB",
		"yekanbakh": "yekanbakh",
	  },
    extend: {
      animation: {
        blurBackground: "blurBackground 4s ease-in-out infinite",
        fadeInOut: "fadeInOut 4s ease-in-out infinite",
      },
      keyframes: {
        blurBackground: {
          "0%": { filter: "blur(0)" },
          "50%": { filter: "blur(8px)" },
        },
        fadeInOut: {
          "0%": { opacity: 0 },
          "50%": { opacity: 1 },
        },
      },
      colors: {
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
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
    screens: {
      vmini: "393px",
      mobile: "500px",
      tablet: "768px",
      laptop: "992px",
      desktop: "1200px",
      large: "1400px",
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
