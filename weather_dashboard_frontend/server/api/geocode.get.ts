/**
 * GET /api/geocode
 * Query: q (string, required) - the search query (city name)
 *        limit (number, optional) - number of results (default 5)
 *
 * Returns a list of locations with name, country, lat, lon.
 * Uses OpenWeatherMap Geocoding if WEATHER_API_KEY is configured.
 * Falls back to a small mock dataset when not configured.
 */
import { H3Event, getQuery, createError } from 'h3';

type Location = { name: string; country?: string; state?: string; lat: number; lon: number };

 // PUBLIC_INTERFACE
export default defineEventHandler(async (event: H3Event) => {
  const q = getQuery(event).q as string | undefined;
  const limit = parseInt((getQuery(event).limit as string) || '5', 10);

  if (!q || q.length < 2) {
    return [] as Location[];
  }

  const config = useRuntimeConfig();
  const apiKey = config.weatherApiKey as string | undefined;
  const base = (config.weatherApiBaseUrl as string) || 'https://api.openweathermap.org';

  if (!apiKey) {
    // Demo-mode mock geocoding (small sample)
    const mock = [
      { name: 'San Francisco', country: 'US', lat: 37.7749, lon: -122.4194, state: 'CA' },
      { name: 'London', country: 'GB', lat: 51.5072, lon: -0.1276 },
      { name: 'Tokyo', country: 'JP', lat: 35.6762, lon: 139.6503 },
      { name: 'New York', country: 'US', lat: 40.7128, lon: -74.0060, state: 'NY' },
      { name: 'Paris', country: 'FR', lat: 48.8566, lon: 2.3522 },
    ];
    return mock.filter((m) => m.name.toLowerCase().includes(q.toLowerCase())).slice(0, limit);
  }

  const url = `${base}/geo/1.0/direct?q=${encodeURIComponent(q)}&limit=${limit}&appid=${encodeURIComponent(apiKey)}`;
  const res = await $fetch<any[]>(url).catch((err) => {
    throw createError({ statusCode: 502, statusMessage: 'Geocoding service error', data: err?.data || err?.message });
  });

  const items: Location[] = (res || []).map((r) => ({
    name: r.name,
    country: r.country,
    state: r.state,
    lat: r.lat,
    lon: r.lon,
  }));

  return items;
});
