import { ref, computed, watch } from 'vue';

export interface Location {
  name: string;
  country?: string;
  state?: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
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
}

export interface Hourly {
  time: string;
  tempC: number;
}

export interface Daily {
  date: string;
  minC: number;
  maxC: number;
  icon?: string;
  iconUrl?: string;
}

export interface ForecastResponse {
  hourly: Hourly[];
  daily: Daily[];
}

/**
 * Weather state and actions composable.
 *
 * PUBLIC_INTERFACE
 */
export function useWeather() {
  /** Saved locations persisted in localStorage */
  const savedLocations = ref<Location[]>([]);
  /** The currently selected location */
  const currentLocation = ref<Location | null>(null);
  /** Current weather object */
  const current = ref<CurrentWeather | null>(null);
  /** Hourly forecast array */
  const hourly = ref<Hourly[]>([]);
  /** Daily forecast array */
  const daily = ref<Daily[]>([]);
  /** Loading and error states */
  const loading = ref(false);
  const error = ref<string | null>(null);

  /** Search results */
  const searchResults = ref<Location[]>([]);
  const searching = ref(false);

  // Initialize from localStorage
  if (process.client) {
    try {
      const raw = localStorage.getItem('weather:savedLocations');
      if (raw) savedLocations.value = JSON.parse(raw);
      const last = localStorage.getItem('weather:lastLocation');
      if (last) currentLocation.value = JSON.parse(last);
    } catch {
      // ignore
    }
  }

  watch(savedLocations, (locs) => {
    if (process.client) localStorage.setItem('weather:savedLocations', JSON.stringify(locs));
  }, { deep: true });

  watch(currentLocation, (loc) => {
    if (process.client && loc) localStorage.setItem('weather:lastLocation', JSON.stringify(loc));
    if (loc) {
      // Fetch weather when location changes
      fetchAll(loc);
    }
  }, { immediate: true });

  // PUBLIC_INTERFACE
  async function searchCity(query: string) {
    searching.value = true;
    try {
      const { data, error: e } = await useFetch<Location[]>('/api/geocode', {
        query: { q: query, limit: 5 },
      });
      if (e.value) throw e.value;
      searchResults.value = data.value || [];
    } catch (e: any) {
      // swallow
    } finally {
      // keep searching open until blur to allow result selection
      // searching.value set from HeaderBar focus/blur events
    }
  }

  // PUBLIC_INTERFACE
  function addLocation(loc: Location) {
    const exists = savedLocations.value.some(
      (l) => l.name === loc.name && Math.abs(l.lat - loc.lat) < 0.0001 && Math.abs(l.lon - loc.lon) < 0.0001,
    );
    if (!exists) savedLocations.value.unshift(loc);
    currentLocation.value = loc;
  }

  // PUBLIC_INTERFACE
  function removeLocation(loc: Location) {
    savedLocations.value = savedLocations.value.filter(
      (l) => !(l.name === loc.name && Math.abs(l.lat - loc.lat) < 0.0001 && Math.abs(l.lon - loc.lon) < 0.0001),
    );
    if (currentLocation.value && Math.abs(currentLocation.value.lat - loc.lat) < 0.0001 && Math.abs(currentLocation.value.lon - loc.lon) < 0.0001) {
      currentLocation.value = savedLocations.value[0] || null;
    }
  }

  // PUBLIC_INTERFACE
  function clearLocations() {
    savedLocations.value = [];
    currentLocation.value = null;
    current.value = null;
    hourly.value = [];
    daily.value = [];
  }

  // PUBLIC_INTERFACE
  function setLocation(loc: Location) {
    currentLocation.value = loc;
  }

  async function fetchAll(loc: Location) {
    loading.value = true;
    error.value = null;
    try {
      const [cw, fc] = await Promise.all([
        fetchCurrent(loc),
        fetchForecast(loc),
      ]);
      current.value = cw;
      hourly.value = fc.hourly;
      daily.value = fc.daily;
    } catch (e: any) {
      error.value = e?.message || 'Failed to load weather';
    } finally {
      loading.value = false;
    }
  }

  async function fetchCurrent(loc: Location): Promise<CurrentWeather> {
    const { data, error: e } = await useFetch<CurrentWeather>('/api/weather/current', {
      query: { lat: loc.lat, lon: loc.lon, name: loc.name, country: loc.country },
    });
    if (e.value) throw e.value;
    return data.value as CurrentWeather;
  }

  async function fetchForecast(loc: Location): Promise<ForecastResponse> {
    const { data, error: e } = await useFetch<ForecastResponse>('/api/weather/forecast', {
      query: { lat: loc.lat, lon: loc.lon },
    });
    if (e.value) throw e.value;
    return data.value as ForecastResponse;
  }

  return {
    savedLocations,
    currentLocation,
    current,
    hourly,
    daily,
    loading,
    error,
    searchResults,
    searching,
    searchCity,
    addLocation,
    removeLocation,
    clearLocations,
    setLocation,
  };
}
