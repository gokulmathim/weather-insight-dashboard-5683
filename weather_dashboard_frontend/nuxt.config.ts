/**
 * Nuxt configuration for Weather Dashboard Frontend.
 * - Adds runtimeConfig for environment-based API configuration
 * - Registers global CSS with design tokens and light theme
 * - Configures dev server and minimal security headers
 */
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  app: {
    head: {
      title: "Weather Insight Dashboard",
      meta: [
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Modern weather dashboard with current, hourly and weekly forecasts." },
        { name: "theme-color", content: "#ffffff" },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        { rel: "preconnect", href: "https://fonts.gstatic.com", crossorigin: "" },
        { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" },
      ],
    },
  },

  css: ["@/assets/css/main.css"],

  runtimeConfig: {
    // Server-only keys
    weatherApiKey: process.env.WEATHER_API_KEY,
    weatherApiBaseUrl: process.env.WEATHER_API_BASE_URL || "https://api.openweathermap.org",
    // Public config available on client
    public: {
      appName: "Weather Insight Dashboard",
      hasWeatherApi: !!process.env.WEATHER_API_KEY,
      theme: {
        primary: "#2186eb",
        secondary: "#484848",
        accent: "#ffc107",
        background: "#f8fafc",
        surface: "#ffffff",
      },
    },
  },

  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
      },
    },
  },

  vite: {
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      port: 3000,
    },
  },
});
