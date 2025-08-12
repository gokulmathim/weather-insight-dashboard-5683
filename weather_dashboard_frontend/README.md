# Weather Insight Dashboard (Nuxt 3)

A modern, minimalistic weather dashboard built with Nuxt 3. Features include:
- Display current weather for user-selected locations
- Hourly and weekly (7-day) forecast views
- City search bar with geocoding
- Weather visualization via charts (Chart.js)
- Responsive light theme with clean, accessible UI

## Tech
- Nuxt 3, Vue 3
- Chart.js + vue-chartjs
- Server routes proxying OpenWeatherMap APIs (secure env usage)
- TypeScript, Vite

## Environment Variables
Create a `.env` file based on `.env.example`:

```
WEATHER_API_KEY=your_openweathermap_api_key_here
# WEATHER_API_BASE_URL=https://api.openweathermap.org
```

If `WEATHER_API_KEY` is not set, the app runs in demo mode with mock data.

## Install

```bash
# npm
npm install
```

## Run

```bash
npm run dev
# http://localhost:3000
```

## Build

```bash
npm run build
npm run preview
```

## Notes
- All external API communication happens server-side via `/api` routes using runtimeConfig. Keys are never exposed to the client.
- Saved locations are persisted in localStorage.
