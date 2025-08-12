/**
 * GET /api/weather/forecast
 * Query: lat (number, required), lon (number, required)
 *
 * Returns normalized forecast:
 *  - hourly: next data points (3-hour steps from OWM)
 *  - daily: aggregate from 3-hour data (min/max per day)
 */
import { H3Event, getQuery } from 'h3';

type Hourly = { time: string; tempC: number };
type Daily = { date: string; minC: number; maxC: number; icon?: string; iconUrl?: string };

export default defineEventHandler(async (event: H3Event) => {
  const query = getQuery(event);
  const lat = Number(query.lat);
  const lon = Number(query.lon);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    throw createError({ statusCode: 400, statusMessage: 'lat and lon are required' });
  }

  const config = useRuntimeConfig();
  const apiKey = config.weatherApiKey as string | undefined;
  const base = (config.weatherApiBaseUrl as string) || 'https://api.openweathermap.org';

  if (!apiKey) {
    // Demo-mode mock data (hourly next 12 and daily next 7)
    const now = Date.now();
    const hourly: Hourly[] = Array.from({ length: 12 }).map((_, i) => ({
      time: new Date(now + i * 3 * 60 * 60 * 1000).toISOString(),
      tempC: 16 + Math.sin(i / 2) * 6,
    }));
    const daily: Daily[] = Array.from({ length: 7 }).map((_, i) => ({
      date: new Date(now + i * 24 * 60 * 60 * 1000).toISOString(),
      minC: 12 + Math.sin(i / 3) * 3,
      maxC: 22 + Math.cos(i / 3) * 4,
      icon: '02d',
      iconUrl: 'https://openweathermap.org/img/wn/02d@2x.png',
    }));
    return { hourly, daily };
  }

  // 5 day / 3 hour forecast
  const url = `${base}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${encodeURIComponent(apiKey)}`;
  const raw = await $fetch<any>(url);

  const list: any[] = raw?.list || [];

  const hourly: Hourly[] = list.slice(0, 16).map((item) => ({
    time: new Date(item.dt * 1000).toISOString(),
    tempC: item?.main?.temp,
  }));

  // Aggregate by day
  const byDay: Record<string, { min: number; max: number; icon?: string }> = {};
  for (const item of list) {
    const d = new Date(item.dt * 1000);
    const dayKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString();
    const t = item?.main?.temp;
    if (t === undefined || t === null) continue;
    const icon = item?.weather?.[0]?.icon;
    if (!byDay[dayKey]) byDay[dayKey] = { min: t, max: t, icon };
    else {
      byDay[dayKey].min = Math.min(byDay[dayKey].min, t);
      byDay[dayKey].max = Math.max(byDay[dayKey].max, t);
    }
  }

  const daily: Daily[] = Object.entries(byDay)
    .slice(0, 7)
    .map(([date, v]) => ({
      date,
      minC: v.min,
      maxC: v.max,
      icon: v.icon,
      iconUrl: v.icon ? `https://openweathermap.org/img/wn/${v.icon}@2x.png` : undefined,
    }));

  return { hourly, daily };
});
