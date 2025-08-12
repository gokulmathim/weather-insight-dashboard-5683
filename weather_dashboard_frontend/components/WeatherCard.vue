<template>
  <div style="display:flex;align-items:center;gap:16px;width:100%;">
    <div style="display:flex;align-items:center;gap:8px;">
      <img v-if="data.iconUrl" :src="data.iconUrl" :alt="data.condition" width="64" height="64" />
      <div class="badge">{{ data.condition }}</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:2px;">
      <div style="font-size:40px;font-weight:800;line-height:1;">
        {{ Math.round(data.tempC) }}°C
      </div>
      <div class="muted">
        {{ data.location.name }}
        <span v-if="data.location.country"> · {{ data.location.country }}</span>
      </div>
    </div>
    <div style="margin-left:auto;text-align:right;">
      <div class="muted">Feels like</div>
      <div style="font-weight:700;">{{ data.feelsLikeC !== undefined ? Math.round(data.feelsLikeC) : Math.round(data.tempC) }}°C</div>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface Location { name: string; country?: string; lat: number; lon: number }
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

const props = defineProps<{ data: CurrentWeather }>();
</script>
