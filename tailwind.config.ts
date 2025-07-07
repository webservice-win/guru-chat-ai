import type { Config } from "tailwindcss"
import plugin from "tailwindcss/plugin"
import { fontFamily } from "tailwindcss/defaultTheme"
import defaultConfig from "shadcn/ui/tailwind.config"

const config: Config = {
  ...defaultConfig,
  content: [...defaultConfig.content, "./lib/**/*.{ts,tsx}", "*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    ...defaultConfig.theme,
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      ...defaultConfig.theme.extend,
      fontFamily: {
        sans: ["var(--font-adorsholipi)", ...fontFamily.sans],
      },
      keyframes: {
        // subtle breathing glow for active mic button
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(59,130,246,0.6)" },
          "50%": { boxShadow: "0 0 0 8px rgba(59,130,246,0)" },
        },
        // moving bars for voice waveform
        "voice-wave": {
          "0%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
          "100%": { transform: "scaleY(0.3)" },
        },
        // shimmer for skeleton loaders
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        // simple fade-in
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        ...defaultConfig.theme.extend.animation,
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "voice-wave": "voice-wave 1.2s ease-in-out infinite",
        shimmer: "shimmer 1.5s linear infinite",
        "fade-in": "fade-in 0.4s ease-out both",
      },
    },
  },
  plugins: [
    ...defaultConfig.plugins,
    plugin(({ addUtilities }) => {
      // utility to disable tap-highlight on mobile
      addUtilities({
        ".no-tap-highlight": {
          "-webkit-tap-highlight-color": "transparent",
        },
      })
    }),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio"),
  ],
}

export default config
