<template>
  <div class="container" style="display:flex;flex-direction:column;gap:16px;">
    <div v-if="!hasApiKey" class="notice">
      Using demo mode. To enable live weather, create a .env file and set WEATHER_API_KEY and (optionally) WEATHER_API_BASE_URL.
    </div>

    <div v-if="searching && searchResults.length" style="background:#fff;border:1px solid rgba(0,0,0,0.08);border-radius:12px;box-shadow:var(--shadow-md);padding:8px;">
      <div class="muted" style="padding:6px 8px;font-weight:600;">Search results</div>
      <ul style="list-style:none;margin:0;padding:4px 6px;">
        <li
          v-for="r in searchResults"
          :key="`${r.name}-${r.lat}-${r.lon}`"
          class="sidebar-item"
          @click="selectAndCloseResults(r)"
        >
          <div>
            <strong>{{ r.name }}</strong>
            <span class="muted" v-if="r.state">, {{ r.state }}</span>
            <span class="muted" v-if="r.country"> ({{ r.country }})</span>
          </div>
        </li>
      </ul>
    </div>

    <section class="cards">
      <div class="card">
        <div class="card-title">
          {{ weather.currentLocation?.value?.name || 'Select a location' }}
        </div>
        <div v-if="weather.loading.value" class="card-content muted">Loading weather...</div>
        <div v-else-if="weather.current.value" class="card-content">
          <WeatherCard :data="weather.current.value" />
        </div>
        <div v-else class="muted">Search for a city to view current conditions.</div>
      </div>

      <div class="card">
        <div class="card-title">Temperature Trend</div>
        <ClientOnly>
          <ForecastChart
            v-if="weather.hourly.value && weather.hourly.value.length"
            :hourly="weather.hourly.value"
            :daily="weather.daily.value"
            :mode="chartMode"
            @changeMode="mode => chartMode = mode"
          />
          <div v-else class="muted">No forecast yet. Select a location.</div>
        </ClientOnly>
      </div>
    </section>

    <section class="kpis">
      <WeatherMetric
        title="Humidity"
        :value="weather.current.value?.humidity !== undefined ? `${weather.current.value?.humidity}%` : '--'"
        icon="💧"
      />
      <WeatherMetric
        title="Wind"
        :value="weather.current.value?.windKph !== undefined ? `${weather.current.value?.windKph} km/h` : '--'"
        icon="🌬️"
      />
      <WeatherMetric
        title="Pressure"
        :value="weather.current.value?.pressureHpa !== undefined ? `${weather.current.value?.pressureHpa} hPa` : '--'"
        icon="🔽"
      />
      <WeatherMetric
        title="Sunrise/Sunset"
        :value="sunTimes"
        icon="🌅"
      />
    </section>

    <section class="card">
      <div class="card-title">7 Day Outlook</div>
      <ForecastList v-if="weather.daily.value?.length" :items="weather.daily.value" />
      <div v-else class="muted">No daily forecast available.</div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import WeatherCard from '@/components/WeatherCard.vue';
import ForecastChart from '@/components/ForecastChart.vue';
import WeatherMetric from '@/components/WeatherMetric.vue';
import ForecastList from '@/components/ForecastList.vue';
import { useWeather } from '@/composables/useWeather';

const runtimeConfig = useRuntimeConfig();
const hasApiKey = computed(() => Boolean(runtimeConfig.public?.hasWeatherApi));
const weather = useWeather();
const chartMode = ref<'hourly' | 'daily'>('hourly');

const searching = ref(false);
const searchResults = weather.searchResults;

function selectAndCloseResults(r: any) {
  weather.setLocation(r);
  searching.value = false;
}

watch(() => weather.searching.value, v => { searching.value = v; });

const sunTimes = computed(() => {
  const c = weather.current.value;
  if (!c?.sunrise || !c?.sunset) return '--';
  const sr = new Date(c.sunrise).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const ss = new Date(c.sunset).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${sr} / ${ss}`;
});
</script>
