/**
 * GET /api/weather/current
 * Query: lat (number, required), lon (number, required)
 *        name (string, optional), country (string, optional)
 *
 * Returns normalized current weather data for the given location.
 * Uses OpenWeatherMap if WEATHER_API_KEY is configured, else returns demo mock.
 */
import { H3Event, getQuery, createError } from 'h3';

type Location = { name: string; country?: string; lat: number; lon: number }
type CurrentWeather = {
  location: Location;
  tempC: number;
  tempF?: number;
  condition: string;
  description?: string;
  icon?: string;
  iconUrl?: string;
  humidity?: number;
  windKph?: number;
  pressureHpa?: number;
  sunrise?: string;
  sunset?: string;
  feelsLikeC?: number;
};

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const lat = Number(query.lat);
  const lon = Number(query.lon);
  const name = (query.name as string) || 'Unknown';
  const country = query.country as string | undefined;

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw createError({ statusCode: 400, statusMessage: 'lat and lon are required' });
  }

  const config = useRuntimeConfig();
  const apiKey = config.weatherApiKey as string | undefined;
  const base = (config.weatherApiBaseUrl as string) || 'https://api.openweathermap.org';

  if (!apiKey) {
    // Demo mock
    const now = new Date();
    const mock: CurrentWeather = {
      location: { name, country, lat, lon },
      tempC: 21,
      tempF: 69.8,
      condition: 'Partly Cloudy',
      description: 'Scattered clouds',
      icon: '03d',
      iconUrl: `https://openweathermap.org/img/wn/03d@2x.png`,
      humidity: 62,
      windKph: 13,
      pressureHpa: 1014,
      sunrise: new Date(now.setHours(6, 12)).toISOString(),
      sunset: new Date(now.setHours(19, 42)).toISOString(),
      feelsLikeC: 21,
    };
    return mock;
  }

  const url = `${base}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${encodeURIComponent(apiKey)}`;
  const raw = await $fetch<any>(url);

  const cw: CurrentWeather = {
    location: { name, country, lat, lon },
    tempC: raw?.main?.temp,
    tempF: raw?.main?.temp ? (raw.main.temp * 9) / 5 + 32 : undefined,
    condition: raw?.weather?.[0]?.main || 'N/A',
    description: raw?.weather?.[0]?.description,
    icon: raw?.weather?.[0]?.icon,
    iconUrl: raw?.weather?.[0]?.icon ? `https://openweathermap.org/img/wn/${raw.weather[0].icon}@2x.png` : undefined,
    humidity: raw?.main?.humidity,
    windKph: raw?.wind?.speed !== undefined ? Math.round(raw.wind.speed * 3.6) : undefined,
    pressureHpa: raw?.main?.pressure,
    sunrise: raw?.sys?.sunrise ? new Date(raw.sys.sunrise * 1000).toISOString() : undefined,
    sunset: raw?.sys?.sunset ? new Date(raw.sys.sunset * 1000).toISOString() : undefined,
    feelsLikeC: raw?.main?.feels_like,
  };

  return cw;
});
