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
            background: "#f3f1ff",
            foreground: "#2c0076",
            primary: {
              50: "#f3f1ff",
              100: "#ebe5ff",
              200: "#d9ceff",
              300: "#bea6ff",
              400: "#9f75ff",
              500: "#843dff",
              600: "#7916ff",
              700: "#6b04fd",
              800: "#5a03d5",
              900: "#4b05ad",
              950: "#2c0076",
              DEFAULT: "#843dff",
              foreground: "#f3f1ff",
            },

            secondary: {
              50: "#fef1f7",
              100: "#fee5f0",
              200: "#fecce3",
              300: "#ffa2cb",
              400: "#fe68a7",
              500: "#f83c86",
              600: "#e91f64",
              700: "#ca0c47",
              800: "#a70d3b",
              900: "#8b1034",
              950: "#55021a",
              DEFAULT: "#f83c86",
              foreground: "#fef1f7",
            },

            focus: "#7916ff",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "1px",
              medium: "2px",
              large: "4px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
          // // layout: {}, // light theme layout tokens
          // // colors: {}, // light theme colors
        },
        dark: {
          extend: "dark", // <- inherit default values from dark theme
          colors: {
            background: "#0D001A",
            foreground: "#ffffff",
            primary: {
              50: "#3B096C",
              100: "#520F83",
              200: "#7318A2",
              300: "#9823C2",
              400: "#c031e2",
              500: "#DD62ED",
              600: "#F182F6",
              700: "#FCADF9",
              800: "#FDD5F9",
              900: "#FEECFE",
              DEFAULT: "#DD62ED",
              foreground: "#ffffff",
            },
            focus: "#F182F6",
          },
          layout: {
            disabledOpacity: "0.3",
            radius: {
              small: "1px",
              medium: "2px",
              large: "4px",
            },
            borderWidth: {
              small: "1px",
              medium: "2px",
              large: "3px",
            },
          },
        },
      },
    }),
  ],
}

export default config
