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
