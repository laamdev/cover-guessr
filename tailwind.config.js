import { nextui } from "@nextui-org/react"

/** @type {import('tailwindcss').Config} */

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1rem",
        md: "1.5rem",
        lg: "2rem",
      },
    },
  },
  plugins: [
    nextui({
      themes: {
        light: {
          extend: "light", // <- inherit default values from dark theme
          colors: {
            background: "#fafafa",
            foreground: "#09090b",
            primary: {
              50: "#f2f9f9",
              100: "#ddeff0",
              200: "#bfe0e2",
              300: "#92cace",
              400: "#5faab1",
              500: "#438e96",
              600: "#3b757f",
              700: "#356169",
              800: "#325158",
              900: "#2d464c",
              950: "#1a2c32",
              DEFAULT: "#438e96",
              foreground: "#09090b",
            },

            focus: "#3b757f",
          },
        },
        dark: {
          extend: "dark", // <- inherit default values from dark theme
          colors: {
            background: "#09090b",
            foreground: "#fafafa",
            primary: {
              50: "#1a2c32",
              100: "#2d464c",
              200: "#325158",
              300: "#356169",
              400: "#3b757f",
              500: "#438e96",
              600: "#5faab1",
              700: "#92cace",
              800: "#bfe0e2",
              900: "#ddeff0",
              950: "#f2f9f9",
              DEFAULT: "#438e96",
              foreground: "#fafafa",
            },
            focus: "#5faab1",
          },
        },
      },
    }),
  ],
}

export default config
